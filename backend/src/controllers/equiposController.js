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
    
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: "Uno de los alumnos seleccionados ya pertenece a un equipo en esta misma clase." });
    }

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
      SELECT DISTINCT e.idEquipo, e.nombre,
             (SELECT GROUP_CONCAT(a.idAlumno SEPARATOR ',') 
              FROM alumno_equipo a 
              WHERE a.idEquipo = e.idEquipo) as alumnosStr
      FROM equipos e
      JOIN alumno_equipo ae ON e.idEquipo = ae.idEquipo
      WHERE ae.idAlumno = ?
    `;
    const params = [noControl];

    if (idClase !== 'TODAS') {
      if (classId !== null) {
        sql += ` AND e.idClase = ?`;
        params.push(classId);
      } else {
        sql += ` AND e.idClase IS NULL`;
      }
    }

    const [rows] = await pool.query(sql, params);
    
    // Parsear el string de alumnos a un array
    const equiposFormateados = rows.map(row => ({
      ...row,
      alumnos: row.alumnosStr ? row.alumnosStr.split(',') : []
    }));

    res.json({ ok: true, equipos: equiposFormateados });
  } catch (error) {
    console.error('Error al obtener equipos del alumno:', error);
    res.status(500).json({ error: 'Error al obtener equipos', detalles: error.message });
  }
};

const eliminarEquipo = async (req, res) => {
  const { idEquipo } = req.params;

  try {
    // Alumno_equipo (y reservas asociadas) se deberían borrar en cascada si está configurado.
    // Si no, borramos explícitamente alumno_equipo primero, luego reservas si hay (pero reservas tiene FK).
    // Suponemos que la base de datos no tiene CASCADE para reservas. Mejor borramos reservas primero, luego alumno_equipo, luego equipo.
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    await connection.query("DELETE FROM reservas WHERE idEquipo = ?", [idEquipo]);
    await connection.query("DELETE FROM alumno_equipo WHERE idEquipo = ?", [idEquipo]);
    await connection.query("DELETE FROM equipos WHERE idEquipo = ?", [idEquipo]);

    await connection.commit();
    connection.release();

    res.json({ ok: true, mensaje: "Equipo eliminado" });
  } catch (error) {
    console.error("Error eliminando equipo:", error);
    res.status(500).json({ error: "Error al eliminar equipo" });
  }
};

const editarEquipo = async (req, res) => {
  const { idEquipo } = req.params;
  const { nombreEquipo, alumnos, idClase } = req.body;

  if (!nombreEquipo || !alumnos || alumnos.length === 0 || alumnos.length > 3) {
    return res.status(400).json({ error: "Nombre requerido y de 1 a 3 alumnos." });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const classId = (idClase && idClase !== "Ninguna" && idClase !== "") ? parseInt(idClase, 10) : null;

    // Actualizar nombre
    await connection.query("UPDATE equipos SET nombre = ?, idClase = ? WHERE idEquipo = ?", [nombreEquipo, classId, idEquipo]);

    // Borrar alumnos viejos
    await connection.query("DELETE FROM alumno_equipo WHERE idEquipo = ?", [idEquipo]);

    // Insertar alumnos nuevos
    const values = alumnos.map((noControl) => [noControl, idEquipo, classId]);
    await connection.query(
      "INSERT INTO alumno_equipo (idAlumno, idEquipo, idClase) VALUES ?",
      [values]
    );

    await connection.commit();
    res.json({ ok: true, mensaje: "Equipo actualizado" });
  } catch (error) {
    await connection.rollback();
    console.error("Error editando equipo:", error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: "Uno de los alumnos seleccionados ya pertenece a otro equipo en esta misma clase." });
    }

    res.status(500).json({ error: "Error editando equipo", detalles: error.message });
  } finally {
    connection.release();
  }
};

module.exports = {
  crearEquipo,
  getEquiposAlumno,
  eliminarEquipo,
  editarEquipo,
};
