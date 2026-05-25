const pool = require('../config/db');

const reservasLaboratorio = async (req, res) => {

    try {

        const { idLaboratorio } = req.params;

        const [rows] = await pool.query(
            `
            SELECT
                r.idReserva,
                r.fecha,
                r.hora,
                r.estado
            FROM RESERVAS r
            INNER JOIN ESTACIONES e
                ON r.idEstacion = e.idEstacion
            WHERE e.idLaboratorio = ?
            AND r.estado = 'confirmada'
            `,
            [idLaboratorio]
        );

        res.json({
            ok: true,
            reservas: rows
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

        // 1. Validar si el equipo tiene acceso a este laboratorio
        // A. Obtener detalles del laboratorio
        const [labRows] = await connection.query(
            'SELECT mostrarSiempre FROM laboratorios WHERE idLaboratorio = ?',
            [idLaboratorio]
        );
        if (labRows.length === 0) {
            await connection.rollback();
            return res.status(404).json({ ok: false, mensaje: 'Laboratorio no encontrado' });
        }
        const mostrarSiempre = labRows[0].mostrarSiempre;

        // B. Obtener detalles del equipo
        const [equipoRows] = await connection.query(
            'SELECT idClase FROM equipos WHERE idEquipo = ?',
            [idEquipo]
        );
        if (equipoRows.length === 0) {
            await connection.rollback();
            return res.status(404).json({ ok: false, mensaje: 'Equipo no encontrado' });
        }
        const idClaseEquipo = equipoRows[0].idClase;

        // C. Si el laboratorio NO es libre (mostrarSiempre = 0), validar la clase del equipo
        if (mostrarSiempre === 0) {
            if (!idClaseEquipo) {
                await connection.rollback();
                return res.status(403).json({ 
                    ok: false, 
                    mensaje: 'Este laboratorio es exclusivo para clases. Un equipo libre no puede reservarlo.' 
                });
            }

            // Verificar si la clase del equipo está asignada a este laboratorio
            const [claseRows] = await connection.query(
                'SELECT idLaboratorio FROM clases WHERE idClase = ?',
                [idClaseEquipo]
            );
            if (claseRows.length === 0 || claseRows[0].idLaboratorio !== parseInt(idLaboratorio, 10)) {
                await connection.rollback();
                return res.status(403).json({ 
                    ok: false, 
                    mensaje: 'Este equipo pertenece a una clase diferente y no tiene acceso a este laboratorio.' 
                });
            }
        }

        // 2. Encontrar una estación disponible en el laboratorio para esa fecha y hora
        const [estaciones] = await connection.query(
            `SELECT e.idEstacion 
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

        // 3. Crear la reserva
        await connection.query(
            `INSERT INTO reservas (idEquipo, idEstacion, fecha, hora, estado)
             VALUES (?, ?, ?, ?, 'confirmada')`,
            [idEquipo, idEstacion, fecha, hora]
        );

        await connection.commit();

        res.json({
            ok: true,
            mensaje: 'Reserva creada exitosamente',
            idEstacion
        });

    } catch (error) {
        await connection.rollback();
        console.error('Error al crear reserva:', error);
        res.status(500).json({ ok: false, mensaje: 'Error al procesar la reserva' });
    } finally {
        connection.release();
    }
};

module.exports = {
    reservasLaboratorio,
    crearReserva
};