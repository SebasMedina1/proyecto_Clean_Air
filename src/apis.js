import express from "express";
import {pool} from './db.js'
import { PORT } from "./config.js";
const api= express();

api.get('/',(req,res) => { 
    res.send('Prueba de respuesta')
});

api.get('/select',async(req,res) => { 
    const [resultado] = await pool.query('SELECT "Prueba de primera consulta" as resultado');
    console.log (resultado)
    res.json(resultado)
});

api.get('/create',async(req,res) => { 
    const [resultado] = await pool.query('INSERT INTO usuarios (id, nombre, email, fecha_registro) VALUES (1,"Juan Pérez", "juan.perez@example.com","2024-10-06")');
    console.log (resultado)
    res.json(resultado)
});


api.listen(PORT);

