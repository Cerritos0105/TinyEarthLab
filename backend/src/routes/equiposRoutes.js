const express = require("express");

const router = express.Router();

const {
  crearEquipo,
  getEquiposAlumno,
} = require("../controllers/equiposController");

router.post("/", crearEquipo); // POST /api/equipos
router.post("/alumno", getEquiposAlumno); // http://localhost:3000/api/equipos/alumno

module.exports = router;
