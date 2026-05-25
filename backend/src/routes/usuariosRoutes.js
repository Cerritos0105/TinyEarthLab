const express = require('express');

const router  = express.Router();

const {
    getUsuarios,
} = require('../controllers/usuariosController');

router.get('/usuarios', getUsuarios); // Ruta para obtener todos los usuarios

module.exports = router;