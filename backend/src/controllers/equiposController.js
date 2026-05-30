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
  console.log("[getEquiposAlumno] noControl recibido:", noControl, "| idClase:", idClase);
  if (!noControl) {
    return res.status(400).json({ ok: false, error: "Falta noControl" });
  }
  try {
    // Paso 1: obtener equipos del alumno
    let query = `
      SELECT DISTINCT e.idEquipo, e.nombre
      FROM equipos e
      JOIN alumno_equipo ae ON e.idEquipo = ae.idEquipo
      WHERE ae.idAlumno = ?`;
    const params = [noControl];

    if (idClase && idClase !== "TODAS") {
      query += " AND ae.idClase = ?";
      params.push(idClase);
    }

    const [equiposRows] = await pool.query(query, params);
    console.log("[getEquiposAlumno] equipos encontrados:", equiposRows.length);

    if (equiposRows.length === 0) {
      return res.json({ ok: true, equipos: [] });
    }

    // Paso 2: para cada equipo, obtener sus integrantes (nombre viene de usuarios)
    const equiposIds = equiposRows.map(e => e.idEquipo);
    const [miembrosRows] = await pool.query(
      `SELECT ae.idEquipo, CONCAT(u.nombre, ' ', u.apellidos) AS nombreCompleto
       FROM alumno_equipo ae
       JOIN alumnos a ON ae.idAlumno = a.noControl
       JOIN usuarios u ON a.idUsuario = u.idUsuario
       WHERE ae.idEquipo IN (?)`,
      [equiposIds]
    );

    // Agrupar miembros por equipo
    const miembrosPorEquipo = {};
    miembrosRows.forEach(m => {
      if (!miembrosPorEquipo[m.idEquipo]) miembrosPorEquipo[m.idEquipo] = [];
      miembrosPorEquipo[m.idEquipo].push(m.nombreCompleto);
    });

    const equipos = equiposRows.map(e => ({
      idEquipo: e.idEquipo,
      nombre: e.nombre,
      alumnos: miembrosPorEquipo[e.idEquipo] || []
    }));

    res.json({ ok: true, equipos });
  } catch (error) {
    console.error("Error al obtener equipos del alumno:", error.message);
    res.status(500).json({ ok: false, error: "Error al obtener equipos", detalle: error.message });
  }
};

module.exports = {
  crearEquipo,
  getEquiposAlumno,
};
