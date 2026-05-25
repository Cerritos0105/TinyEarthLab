const express = require('express');
const cors = require('cors');

const usuariosRoutes = require('./routes/usuariosRoutes');
const authRoutes = require('./routes/authRoutes');
const laboratoriosRoutes = require('./routes/laboratoriosRoutes');
const reservasRoutes = require('./routes/reservasRoutes');
const equiposRoutes = require('./routes/equiposRoutes');
const clasesRoutes = require('./routes/clasesRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', usuariosRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/laboratorios', laboratoriosRoutes);
app.use('/api/reservas', reservasRoutes);
app.use('/api/equipos', equiposRoutes);
app.use('/api/clases', clasesRoutes);

module.exports = app;