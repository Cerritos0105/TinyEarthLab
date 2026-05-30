const express = require("express");
const router = express.Router();
const { getClasesAlumno } = require("../controllers/clasesController");

router.get("/alumno/:noControl", getClasesAlumno);

module.exports = router;
