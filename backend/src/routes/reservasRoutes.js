const express = require('express');
const router = express.Router();

const {
    reservasLaboratorio
} = require('../controllers/reservasController');

router.get(
    '/laboratorio/:idLaboratorio',
    reservasLaboratorio
);

module.exports = router;