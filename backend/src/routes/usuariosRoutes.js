const express = require('express');

const router  = express.Router();

const {
    getUsuarios,
    getAlumnos
} = require('../controllers/usuariosController');

router.get('/usuarios', getUsuarios); // Ruta para obtener todos los usuarios
router.get('/alumnos', getAlumnos); // Ruta para obtener alumnos

module.exports = router;