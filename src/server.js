const express = require('express');
const WebSocket = require('ws');
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

        // Validar que el cuerpo de la solicitud tiene la estructura correcta
        if (!sensorData || typeof sensorData.gas_level === 'undefined' || typeof sensorData.sensor === 'undefined') {
            return res.status(400).send({ error: 'Datos incompletos o incorrectos' });
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
        console.error('Error procesando los datos:', error);
        res.status(500).send({ error: 'Error procesando los datos' });
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
