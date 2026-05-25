const pool = require('../config/db');

const login = async (req, res) => {
    try {
        const { correo, contrasena } = req.body;

        //consulta
        const [rows] = await pool.query(
            'SELECT * FROM usuarios WHERE correo = ?', 
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

        res.json({
            ok: true,
            mensaje: 'Login exitoso',
            usuario: {
                idUsuario: usuario.idUsuario,
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