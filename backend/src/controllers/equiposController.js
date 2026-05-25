const pool = require("../config/db");

const crearEquipo = async (req, res) => {
  const { nombreEquipo, alumnos, idClase } = req.body;

  if (!nombreEquipo || !alumnos || alumnos.length === 0 || alumnos.length > 3) {
    return res.status(400).json({
      error: "Debe proporcionar un nombre y seleccionar entre 1 y 3 alumnos.",
    });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const classId =
      idClase && idClase !== "Ninguna" && idClase !== ""
        ? parseInt(idClase, 10)
        : null;

    // 1. Insertar el equipo
    const [result] = await connection.query(
      "INSERT INTO equipos (nombre, idClase) VALUES (?, ?)",
      [nombreEquipo, classId],
    );
    const idEquipo = result.insertId;

    // 2. Insertar en tabla puente alumno_equipo
    const values = alumnos.map((noControl) => [noControl, idEquipo, classId]);
    await connection.query(
      "INSERT INTO alumno_equipo (idAlumno, idEquipo, idClase) VALUES ?",
      [values],
    );

    await connection.commit();

    res.json({
      ok: true,
      mensaje: "Equipo creado exitosamente",
      idEquipo,
    });
  } catch (error) {
    await connection.rollback();
    console.error("Error al crear equipo:", error);
    res
      .status(500)
      .json({ error: "Error al crear equipo", detalles: error.message });
  } finally {
    connection.release();
  }
};

const getEquiposAlumno = async (req, res) => {
  const { noControl, idClase } = req.body;

  if (!noControl) {
    return res.status(400).json({ error: 'Debe proporcionar el número de control.' });
  }

  try {
    let classId = null;
    if (idClase !== undefined && idClase !== null && idClase !== 'Ninguna' && idClase !== 'null' && idClase !== '') {
      const parsed = parseInt(idClase, 10);
      if (!isNaN(parsed)) {
        classId = parsed;
      }
    }

    let sql = `
      SELECT DISTINCT e.idEquipo, e.nombre 
      FROM equipos e
      JOIN alumno_equipo ae ON e.idEquipo = ae.idEquipo
      WHERE ae.idAlumno = ?
    `;
    const params = [noControl];

    if (classId !== null) {
      sql += ` AND e.idClase = ?`;
      params.push(classId);
    } else {
      sql += ` AND e.idClase IS NULL`;
    }

    const [rows] = await pool.query(sql, params);
    res.json({ ok: true, equipos: rows });
  } catch (error) {
    console.error('Error al obtener equipos del alumno:', error);
    res.status(500).json({ error: 'Error al obtener equipos', detalles: error.message });
  }
};

module.exports = {
  crearEquipo,
  getEquiposAlumno,
};
