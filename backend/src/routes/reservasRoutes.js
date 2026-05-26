const express = require('express');
const router = express.Router();

const {
    reservasLaboratorio,
    crearReserva,
    cancelarReserva,
    cancelarHoraReserva,
    obtenerEstadisticasLab,
} = require('../controllers/reservasController');

router.get(
    '/laboratorio/:idLaboratorio',
    reservasLaboratorio
);

router.post(
    '/',
    crearReserva
);

router.post(
    '/cancelar/:idReserva',
    cancelarReserva
);

router.post(
    '/cancelar-hora',
    cancelarHoraReserva
);

router.get(
    '/estadisticas/laboratorio/:idLaboratorio',
    obtenerEstadisticasLab
);

module.exports = router;