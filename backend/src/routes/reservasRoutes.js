const express = require('express');
const router = express.Router();

const {
    reservasLaboratorio,
    crearReserva
} = require('../controllers/reservasController');

router.get(
    '/laboratorio/:idLaboratorio',
    reservasLaboratorio
);

router.post(
    '/',
    crearReserva
);

module.exports = router;