const express = require('express');
const WebSocket = require('ws');
const pool = require('./db');
const { PORT } = require('./config');
const app = express();
const port = process.env.PORT || 3000;  // Puerto dinámico para Railway

// Middleware para procesar JSON
app.use(express.json());

// Middleware para capturar errores de JSON mal formados
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        console.error('Error de JSON:', err.message);
        return res.status(400).send({ error: 'JSON mal formado' });
    }
    next();
});

// Configuración del servidor WebSocket
const wss = new WebSocket.Server({ noServer: true });

// Ruta para recibir datos del ESP32
app.post('/api/data', (req, res) => {
    try {
        const sensorData = req.body;

        // Capturar posibles errores al analizar los datos
        if (!sensorData || typeof sensorData.gas_level === 'undefined' || typeof sensorData.sensor === 'undefined') {
            throw new Error('Datos incompletos o incorrectos');
        }

        const umbralCritico = 1;
        let alerta = false;

        // Verificar si el nivel de gas es mayor al umbral
        if (sensorData.gas_level >= umbralCritico) {
            alerta = true;
            console.log('ALERTA: Nivel de gas crítico:', sensorData.gas_level);
        }

        // Verificar qué datos se están enviando
        console.log('Datos enviados a los clientes:', sensorData);

        // Notificar a todos los clientes conectados mediante WebSocket
        wss.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                    alerta,
                    sensor: sensorData.sensor,
                    gas_level: sensorData.gas_level,
                    message: alerta ? 'Nivel de gas peligroso' : 'cuidado'
                }));
            }
        });

        res.status(200).send('Datos procesados');
    } catch (error) {
        // Captura cualquier error que ocurra durante el procesamiento
        console.error('Error procesando los datos del sensor:', req.body);
        console.error('Detalles del error:', error);
        res.status(500).send({ error: 'Error procesando los datos' });
    }
});
app.post('/api/login', async (req, res) => {
    try {
        // Recibir usuario y contraseña desde el cuerpo de la solicitud
        const { usuario, contrasena } = req.body;
        console.error('Error procesando los datos del sensor:', req.body);

        // Validar que ambos campos estén presentes
        if (!usuario || !contrasena) {
            return res.status(400).json({ error: 'Usuario y contraseña son obligatorios' });
        }

        // Realizar la consulta a la tabla usuarios
        const [rows] = await pool.query('SELECT * FROM users WHERE usuario = ? AND contrasena = ?', [usuario, contrasena]);

        // Verificar si se encontró algún registro que coincida
        if (rows.length > 0) {
            console.log('Autenticación exitosa:', rows);
            res.status(200).json({ mensaje: 'Autenticación exitosa', datos: rows[0] }); // Puedes personalizar la respuesta según sea necesario
        } else {
            res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
        }
    } catch (error) {
        console.error('Error en la autenticación:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});
// Nueva ruta para crear usuario
app.post('/api/create', async (req, res) => {
    try {
        const { usuario, contrasena } = req.body;

        // Validar que ambos campos estén presentes
        if (!usuario || !contrasena) {
            return res.status(400).json({ error: 'Usuario y contraseña son obligatorios' });
        }

        // Obtener el último ID de la tabla users
        const [rows] = await pool.query('SELECT MAX(id) AS lastId FROM users');

        let newId = 1; // Por defecto, si no hay ningún usuario, comenzamos con el ID 1
        if (rows.length > 0 && rows[0].lastId !== null) {
            newId = rows[0].lastId + 1; // Sumar 1 al último ID
        }

        // Insertar nuevo usuario en la tabla users con el nuevo ID
        const [result] = await pool.query(
            'INSERT INTO users (id, usuario, contrasena) VALUES (?, ?, ?)', 
            [newId, usuario, contrasena]
        );

        // Comprobar si el insert fue exitoso
        if (result.affectedRows > 0) {
            res.status(201).json({ mensaje: 'Usuario creado con éxito', userId: newId });
        } else {
            res.status(400).json({ error: 'No se pudo crear el usuario' });
        }
    } catch (error) {
        console.error('Error creando el usuario:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Configurar el servidor HTTP y WebSocket
const server = app.listen(port, () => {
    console.log(`Servidor API corriendo en http://localhost:${port}`);
});

// Integrar WebSocket en el servidor HTTP
server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
        console.log('Nuevo cliente conectado');
    });
});
