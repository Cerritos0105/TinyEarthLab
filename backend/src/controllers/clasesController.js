const pool = require('../config/db');

const getClasesAlumno = async (req, res) => {
  const { noControl } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT 
          c.idClase, 
          m.nombre AS materiaNombre, 
          c.idMateria,
          l.nombre AS laboratorioNombre,
          c.hora
       FROM inscripciones i
       JOIN clases c ON i.idClase = c.idClase
       JOIN materias m ON c.idMateria = m.clave
       LEFT JOIN laboratorios l ON c.idLaboratorio = l.idLaboratorio
       WHERE i.idAlumno = ?`,
       [noControl]
    );
    res.json({ ok: true, clases: rows });
  } catch (error) {
    console.error('Error al obtener clases del alumno:', error);
    res.status(500).json({ error: 'Error al obtener clases del alumno', detalles: error.message });
  }
};

module.exports = {
  getClasesAlumno
};
