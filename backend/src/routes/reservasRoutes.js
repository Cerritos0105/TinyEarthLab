const express = require('express');
const router = express.Router();

const {
    reservasLaboratorio,
    crearReserva,
    cancelarReserva,
    cancelarHoraReserva,
    obtenerEstadisticasLab,
    bloquearDia,
    desbloquearDia
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

router.post(
    '/bloquear-dia',
    bloquearDia
);

router.post(
    '/desbloquear-dia',
    desbloquearDia
);

module.exports = router;