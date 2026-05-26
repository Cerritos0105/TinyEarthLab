const pool = require('../config/db');

const reservasLaboratorio = async (req, res) => {

    try {
        const { idLaboratorio } = req.params;
        const { noControl } = req.query;

        const [rows] = await pool.query(
            `
            SELECT
                r.idReserva,
                r.fecha,
                r.hora,
                r.estado,
                eq.nombre AS equipoNombre,
                (SELECT COUNT(*) FROM alumno_equipo ae WHERE ae.idEquipo = r.idEquipo AND ae.idAlumno = ?) > 0 AS esMia
            FROM reservas r
            INNER JOIN estaciones e ON r.idEstacion = e.idEstacion
            INNER JOIN equipos eq ON r.idEquipo = eq.idEquipo
            WHERE e.idLaboratorio = ?
            AND r.estado = 'confirmada'
            `,
            [noControl || null, idLaboratorio]
        );

        res.json({
            ok: true,
            reservas: rows,
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            ok: false,
            mensaje: 'Error servidor'
        });
    }
};

const crearReserva = async (req, res) => {
    const { idEquipo, idLaboratorio, fecha, hora } = req.body;

    if (!idEquipo || !idLaboratorio || !fecha || !hora) {
        return res.status(400).json({ ok: false, mensaje: 'Faltan datos obligatorios' });
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // 1. Verificar que el laboratorio existe
        const [labRows] = await connection.query(
            'SELECT idLaboratorio FROM laboratorios WHERE idLaboratorio = ?',
            [idLaboratorio]
        );
        if (labRows.length === 0) {
            await connection.rollback();
            return res.status(404).json({ ok: false, mensaje: 'Laboratorio no encontrado' });
        }

        // 2. Verificar que el equipo existe
        const [equipoRows] = await connection.query(
            'SELECT idEquipo FROM equipos WHERE idEquipo = ?',
            [idEquipo]
        );
        if (equipoRows.length === 0) {
            await connection.rollback();
            return res.status(404).json({ ok: false, mensaje: 'Equipo no encontrado' });
        }

        // 3. Verificar que el equipo no tenga ya una reserva en esta fecha y hora
        const [reservaExistente] = await connection.query(
            `SELECT idReserva FROM reservas 
             WHERE idEquipo = ? AND fecha = ? AND hora = ? AND estado = 'confirmada'`,
            [idEquipo, fecha, hora]
        );

        if (reservaExistente.length > 0) {
            await connection.rollback();
            return res.status(400).json({ ok: false, mensaje: 'Este equipo ya cuenta con una reserva en este horario.' });
        }

        // 4. Encontrar una estación disponible en el laboratorio para esa fecha y hora
        const [estaciones] = await connection.query(
            `SELECT e.idEstacion, e.noEstacion
             FROM estaciones e
             WHERE e.idLaboratorio = ? AND e.estado = 'disponible'
             AND e.idEstacion NOT IN (
                 SELECT r.idEstacion FROM reservas r 
                 WHERE r.fecha = ? AND r.hora = ? AND r.estado = 'confirmada'
             )
             LIMIT 1`,
            [idLaboratorio, fecha, hora]
        );

        if (estaciones.length === 0) {
            await connection.rollback();
            return res.status(400).json({ ok: false, mensaje: 'No hay estaciones disponibles en este horario.' });
        }

        const idEstacion = estaciones[0].idEstacion;
        const noEstacion = estaciones[0].noEstacion;

        // 5. Crear la reserva
        await connection.query(
            `INSERT INTO reservas (idEquipo, idEstacion, fecha, hora, estado)
             VALUES (?, ?, ?, ?, 'confirmada')`,
            [idEquipo, idEstacion, fecha, hora]
        );

        await connection.commit();

        res.json({
            ok: true,
            mensaje: 'Reserva creada exitosamente',
            idEstacion,
            noEstacion
        });

    } catch (error) {
        await connection.rollback();
        console.error('Error al crear reserva:', error);
        res.status(500).json({ ok: false, mensaje: 'Error al procesar la reserva' });
    } finally {
        connection.release();
    }
};

const cancelarReserva = async (req, res) => {
    const { idReserva } = req.params;
    const { noControl, tipo } = req.body;

    if (!idReserva || !noControl || !tipo) {
        return res.status(400).json({ ok: false, mensaje: 'Faltan datos obligatorios para cancelar' });
    }

    if (tipo !== 'administrador' && tipo !== 'maestro' && tipo !== 'docente' && tipo !== 'alumno') {
        return res.status(403).json({ ok: false, mensaje: 'Tipo de usuario no válido' });
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // Si es maestro/docente, debemos verificar si tiene asignada una clase en el laboratorio de la reserva
        if (tipo === 'maestro' || tipo === 'docente') {
            const [reservaInfo] = await connection.query(
                `SELECT e.idLaboratorio 
                 FROM reservas r 
                 JOIN estaciones e ON r.idEstacion = e.idEstacion 
                 WHERE r.idReserva = ?`,
                [idReserva]
            );

            if (reservaInfo.length === 0) {
                await connection.rollback();
                return res.status(404).json({ ok: false, mensaje: 'Reserva no encontrada' });
            }

            const idLaboratorio = reservaInfo[0].idLaboratorio;

            // Verificar si el docente tiene alguna clase en ese laboratorio
            const [clasesInfo] = await connection.query(
                `SELECT 1 FROM clases WHERE idDocente = ? AND idLaboratorio = ? LIMIT 1`,
                [noControl, idLaboratorio]
            );

            if (clasesInfo.length === 0) {
                await connection.rollback();
                return res.status(403).json({ ok: false, mensaje: 'No impartes clases en este laboratorio, no puedes cancelar reservas aquí' });
            }
        }

        // Si es alumno, verificar si pertenece al equipo de la reserva
        if (tipo === 'alumno') {
            const [reservaInfo] = await connection.query(
                `SELECT idEquipo FROM reservas WHERE idReserva = ?`,
                [idReserva]
            );

            if (reservaInfo.length === 0) {
                await connection.rollback();
                return res.status(404).json({ ok: false, mensaje: 'Reserva no encontrada' });
            }

            const idEquipo = reservaInfo[0].idEquipo;

            const [perteneceInfo] = await connection.query(
                `SELECT 1 FROM alumno_equipo WHERE idEquipo = ? AND idAlumno = ? LIMIT 1`,
                [idEquipo, noControl]
            );

            if (perteneceInfo.length === 0) {
                await connection.rollback();
                return res.status(403).json({ ok: false, mensaje: 'No tienes permisos para cancelar esta reserva porque no perteneces al equipo' });
            }
        }

        // Si pasamos validaciones, cancelamos la reserva
        const [result] = await connection.query(
            `UPDATE reservas SET estado = 'cancelada' WHERE idReserva = ?`,
            [idReserva]
        );

        if (result.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({ ok: false, mensaje: 'Reserva no encontrada o ya cancelada' });
        }

        await connection.commit();

        res.json({
            ok: true,
            mensaje: 'Reserva cancelada exitosamente'
        });

    } catch (error) {
        await connection.rollback();
        console.error('Error al cancelar reserva:', error);
        res.status(500).json({ ok: false, mensaje: 'Error al cancelar la reserva' });
    } finally {
        connection.release();
    }
};

const cancelarHoraReserva = async (req, res) => {
    const { idLaboratorio, fecha, hora, noControl, tipo } = req.body;

    if (!idLaboratorio || !fecha || !hora || !noControl || !tipo) {
        return res.status(400).json({ ok: false, mensaje: 'Faltan datos obligatorios para cancelar la hora completa' });
    }

    if (tipo !== 'administrador' && tipo !== 'maestro' && tipo !== 'docente') {
        return res.status(403).json({ ok: false, mensaje: 'No tienes permisos para cancelar reservas' });
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // Validar si el maestro/docente imparte clase en este laboratorio
        if (tipo === 'maestro' || tipo === 'docente') {
            const [clasesInfo] = await connection.query(
                `SELECT 1 FROM clases WHERE idDocente = ? AND idLaboratorio = ? LIMIT 1`,
                [noControl, idLaboratorio]
            );

            if (clasesInfo.length === 0) {
                await connection.rollback();
                return res.status(403).json({ ok: false, mensaje: 'No impartes clases en este laboratorio' });
            }
        }

        // Obtener las estaciones del laboratorio
        const [estaciones] = await connection.query(
            `SELECT idEstacion FROM estaciones WHERE idLaboratorio = ?`,
            [idLaboratorio]
        );

        if (estaciones.length === 0) {
            await connection.rollback();
            return res.status(404).json({ ok: false, mensaje: 'No hay estaciones registradas para este laboratorio' });
        }

        const idsEstaciones = estaciones.map(e => e.idEstacion);

        // Cancelar todas las reservas que coincidan
        const [result] = await connection.query(
            `UPDATE reservas 
             SET estado = 'cancelada' 
             WHERE idEstacion IN (?) AND fecha = ? AND hora = ? AND estado = 'confirmada'`,
            [idsEstaciones, fecha, hora]
        );

        await connection.commit();

        res.json({
            ok: true,
            mensaje: 'Hora cancelada exitosamente',
            reservasCanceladas: result.affectedRows
        });

    } catch (error) {
        await connection.rollback();
        console.error('Error al cancelar hora:', error);
        res.status(500).json({ ok: false, mensaje: 'Error al cancelar la hora' });
    } finally {
        connection.release();
    }
};

const obtenerEstadisticasLab = async (req, res) => {
    try {
        const { idLaboratorio } = req.params;

        const [rows] = await pool.query(
            `
            SELECT 
                r.hora, 
                COUNT(*) as usos
            FROM reservas r
            INNER JOIN estaciones e ON r.idEstacion = e.idEstacion
            WHERE e.idLaboratorio = ? AND r.estado = 'confirmada'
            GROUP BY r.hora
            ORDER BY r.hora ASC
            `,
            [idLaboratorio]
        );

        // Transformamos el formato de hora (e.g. "08:00:00" -> "08:00")
        const stats = rows.map(r => ({
            hora: r.hora.substring(0, 5),
            usos: r.usos
        }));

        res.json({
            ok: true,
            estadisticas: stats
        });

    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        res.status(500).json({
            ok: false,
            mensaje: 'Error al obtener estadísticas'
        });
    }
};

const bloquearDia = async (req, res) => {
    const { fecha, idLaboratorio } = req.body;

    if (!fecha || !idLaboratorio) {
        return res.status(400).json({ ok: false, mensaje: 'Faltan datos obligatorios' });
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // 1. Eliminar reservas existentes en esa fecha para todas las estaciones del laboratorio
        await connection.query(
            `DELETE r FROM reservas r
             JOIN estaciones e ON r.idEstacion = e.idEstacion
             WHERE e.idLaboratorio = ? AND r.fecha = ?`,
            [idLaboratorio, fecha]
        );

        await connection.commit();

        res.json({ ok: true, mensaje: 'Día bloqueado y reservas canceladas exitosamente' });
    } catch (error) {
        await connection.rollback();
        console.error('Error al bloquear día:', error);
        res.status(500).json({ ok: false, mensaje: 'Error al bloquear el día' });
    } finally {
        connection.release();
    }
};

module.exports = {
    reservasLaboratorio,
    crearReserva,
    cancelarReserva,
    cancelarHoraReserva,
    obtenerEstadisticasLab,
    bloquearDia,
};