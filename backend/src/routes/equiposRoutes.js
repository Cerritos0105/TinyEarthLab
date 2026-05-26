const express = require("express");

const router = express.Router();

const {
  crearEquipo,
  getEquiposAlumno,
  eliminarEquipo,
  editarEquipo
} = require("../controllers/equiposController");

router.post("/", crearEquipo); // POST /api/equipos
router.post("/alumno", getEquiposAlumno); // POST /api/equipos/alumno
router.delete("/:idEquipo", eliminarEquipo); // DELETE /api/equipos/:idEquipo
router.put("/:idEquipo", editarEquipo); // PUT /api/equipos/:idEquipo

module.exports = router;
