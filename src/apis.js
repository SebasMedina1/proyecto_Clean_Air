import express from "express";
import {pool} from './db.js'
import { PORT } from "./config.js";
const api= express();

api.get('/',(req,res) => { 
    res.send('Prueba de respuesta')
});

api.get('/ping',async(req,res) => { 
    const [resultado] = await pool.query('SELECT "Prueba de primera consulta" as resultado');
    console.log (resultado)
    res.json(resultado)
});

api.get('/create',async(req,res) => { 
    const [resultado] = await pool.query('INSERT INTO usuarios (nombre, email) VALUES ("Juan Pérez", "juan.perez@example.com")');
    console.log (resultado)
    res.json(resultado)
});


api.listen(PORT);

