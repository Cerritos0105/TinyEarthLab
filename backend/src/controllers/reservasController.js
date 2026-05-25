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

module.exports = {
    reservasLaboratorio
};