const pool = require('../config/db');

const login = async (req, res) => {
    try {
        const { correo, contrasena } = req.body;

        //consulta
        const [rows] = await pool.query(
            `SELECT u.*, a.noControl AS noControlAlumno, d.noControl AS noControlDocente 
             FROM usuarios u 
             LEFT JOIN alumnos a ON u.idUsuario = a.idUsuario 
             LEFT JOIN docentes d ON u.idUsuario = d.idUsuario 
             WHERE u.correo = ?`, 
            [correo]
        );
    
        if (rows.length === 0) {
            return res.status(401).json({
                ok: false,
                mensaje: 'correo no existe'
            });
        }
    
        const usuario = rows[0];
        const [passwordResult] = await pool.query(
            'SELECT SHA2(?, 256) AS passwordHash', 
            [contrasena]
        );
        const passwordHash = passwordResult[0].passwordHash;
    
        if (passwordHash != usuario.contrasena) {
            return res.status(401).json({
                ok: false,
                mensaje: 'contraseña incorrecta'
            });
        }

        const noControl = usuario.tipo === 'alumno' ? usuario.noControlAlumno : usuario.noControlDocente;

        res.json({
            ok: true,
            mensaje: 'Login exitoso',
            usuario: {
                idUsuario: usuario.idUsuario,
                noControl: noControl,
                nombre: usuario.nombre,
                apellidos: usuario.apellidos,
                sexo: usuario.sexo,
                correo: usuario.correo,
                tipo: usuario.tipo
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            mensaje: 'Error en el servidor'
        });
    }
};

module.exports = { 
    login 
};