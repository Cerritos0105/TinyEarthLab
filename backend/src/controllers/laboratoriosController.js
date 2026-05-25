const pool = require('../config/db');

const laboratoriosAlumno = async (req, res) => {

    try {
        const { idUsuario } = req.params;

        const [rows] = await pool.query(
            `
            select distinct
	            l.idLaboratorio,
                l.nombre, 
                l.edificio,
                l.capacidad
            from CLASES c
            inner join INSCRIPCIONES i on c.idClase = i.idClase
            inner join LABORATORIOS l on c.idLaboratorio = l.idLaboratorio
            inner join ALUMNOS a on i.idAlumno = a.noControl
            where a.idUsuario = ?;
            `,
            [idUsuario]
        );

        res.json({
            ok: true,
            laboratorios: rows
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            ok: false,
            mensaje: 'Error servidor'
        });
    }
};

const laboratoriosMostrarSiempre = async (req, res) => {

    try {

        const [rows] = await pool.query(
            `
            select *
            from LABORATORIOS
            where mostrarSiempre = true;
            `
        );

        res.json({
            ok: true,
            laboratorios: rows
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
    laboratoriosAlumno,
    laboratoriosMostrarSiempre
};