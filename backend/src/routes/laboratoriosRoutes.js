const express = require("express");
const router = express.Router();

const {
  laboratoriosAlumno,
  laboratoriosMostrarSiempre,
  obtenerTodosLaboratorios,
} = require("../controllers/laboratoriosController");

router.get("/alumno/:idUsuario", laboratoriosAlumno);

router.get("/siempre-disponibles", laboratoriosMostrarSiempre);

router.get("/todos", obtenerTodosLaboratorios);

module.exports = router;
