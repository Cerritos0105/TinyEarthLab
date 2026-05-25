const pool = require('../config/db');

const getUsuarios = async (req, res) => {
  try {
    const [rows] = await pool.query(
        'SELECT * FROM usuarios'
    );
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};

const getAlumnos = async (req, res) => {
  try {
    const [rows] = await pool.query(
        `SELECT A.noControl, U.nombre, U.apellidos 
         FROM usuarios U 
         JOIN alumnos A ON U.idUsuario = A.idUsuario`
    );
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener alumnos:', error);
    res.status(500).json({ error: 'Error al obtener alumnos' });
  }
};

module.exports = {
  getUsuarios,
  getAlumnos
};