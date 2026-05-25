const express = require('express');
const router = express.Router();

const {
    laboratoriosAlumno, 
    laboratoriosMostrarSiempre
} = require('../controllers/laboratoriosController');

router.get(
    '/alumno/:idUsuario',
    laboratoriosAlumno
);

router.get(
    '/siempre-disponibles',
    laboratoriosMostrarSiempre
);

module.exports = router;