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

module.exports = {
  getUsuarios
};