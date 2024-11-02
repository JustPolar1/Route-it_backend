const express = require('express');
const app = express();
const path = require('path');
const port = 3000;

const mysql = require("mysql2");
const jwt = require("jsonwebtoken");
const cookieParser = require('cookie-parser');
const UserHandler = require('./Handlers/UserHandler');

const SECRET_KEY = "Clave ultra secreta";

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "12345",
    database: "rutas_utch"
});

app.use(cookieParser());
app.use(express.static(path.resolve(__dirname, '../'))); // Define el directorio base de los archivos estáticos
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Para manejar cuestiones del usuario
const userHandler = new UserHandler(connection);

// Endpoints
app.get("/", (req, res) => {
    const token = req.cookies.token;
    if (token) {
        res.sendFile(path.resolve(__dirname, '../pages/index.html'));
    } else {
        res.sendFile(path.resolve(__dirname, '../pages/login.html'));
    }
});

app.post("/auth/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const { token, userId } = await userHandler.login(email, password);
        res.cookie('token', token, {
            httpOnly: false, // En producción esto lo tenemos que cambiar a true
            maxAge: 86400000 // Un día en milisegundos
        });
        return res.redirect('/pages/index.html');
    } catch (error) {
        return res.status(error.status).send(error.message);
    }
});

app.post('/auth/logout', (req, res) => {
    res.clearCookie("token");
    return res.redirect('/pages/login.html');
});

app.post('/auth/register', async (req, res) => {
    const { email, password } = req.body;

    try {
        await userHandler.register(email, password);
        res.redirect('/pages/login.html');
    } catch(error) {
        return res.status(error.status).send(error.message);
    }
});

app.post("/queja", async (req, res) => {
    const queja = req.body;
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).send("No estás autenticado");
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        const user_id = decoded.userId; 

        await userHandler.queja(user_id, queja);
        res.status(200).send("Queja registrada con éxito");
    } catch(error) {
        return res.status(error.status).send(error.message);
    }
    res.status
});

app.get("/rutas", (req, res) => {
    // Implementación pendiente, aquí debería ir todo lo relacionado a la obtención de información de las rutas
});

app.listen(port, "192.168.0.85", () => {
    console.log("Aplicación abierta en: http://192.168.0.85:" + port);
});
