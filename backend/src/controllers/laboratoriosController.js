const pool = require("../config/db");

const laboratoriosAlumno = async (req, res) => {
  try {
    const { idUsuario } = req.params;

    const [rows] = await pool.query(
      `
            select distinct
	            l.idLaboratorio,
                l.nombre, 
                l.edificio,
                (SELECT COUNT(*) FROM estaciones e WHERE e.idLaboratorio = l.idLaboratorio AND e.estado = 'disponible') as capacidad
            from CLASES c
            inner join INSCRIPCIONES i on c.idClase = i.idClase
            inner join LABORATORIOS l on c.idLaboratorio = l.idLaboratorio
            inner join ALUMNOS a on i.idAlumno = a.noControl
            where a.idUsuario = ? OR l.mostrarSiempre = 1;
            `,
      [idUsuario],
    );

    res.json({
      ok: true,
      laboratorios: rows,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      ok: false,
      mensaje: "Error servidor",
    });
  }
};

const laboratoriosMostrarSiempre = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `
            select l.idLaboratorio, l.nombre, l.edificio, l.mostrarSiempre,
                   (SELECT COUNT(*) FROM estaciones e WHERE e.idLaboratorio = l.idLaboratorio AND e.estado = 'disponible') as capacidad
            from LABORATORIOS l
            where l.mostrarSiempre = true;
            `,
    );

    res.json({
      ok: true,
      laboratorios: rows,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      ok: false,
      mensaje: "Error servidor",
    });
  }
};

const obtenerTodosLaboratorios = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `
            SELECT l.idLaboratorio, l.nombre, l.edificio, l.mostrarSiempre,
                   (SELECT COUNT(*) FROM estaciones e WHERE e.idLaboratorio = l.idLaboratorio AND e.estado = 'disponible') as capacidad
            FROM laboratorios l;
            `,
    );

    res.json({
      ok: true,
      laboratorios: rows,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      ok: false,
      mensaje: "Error servidor",
    });
  }
};

module.exports = {
  laboratoriosAlumno,
  laboratoriosMostrarSiempre,
  obtenerTodosLaboratorios,
};
