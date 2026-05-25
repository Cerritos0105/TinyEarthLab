const express = require("express");

const router = express.Router();

const {
  crearEquipo,
  getEquiposAlumno,
} = require("../controllers/equiposController");

router.post("/", crearEquipo); // POST /api/equipos
router.post("/alumno", getEquiposAlumno); // POST /api/equipos/alumno

module.exports = router;
