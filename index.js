const express = require('express');
const app = express();
const path = require('path');
const port = 3000;

const mysql = require("mysql2"); // Para la conexión a MySQL
const jwt = require("jsonwebtoken"); // Para la lectura y verificación de tokens
const cookieParser = require('cookie-parser'); // Para la lectura de tokens
const UserHandler = require('./Handlers/UserHandler'); // El controlador de todo lo relacionado al usuario

const SECRET_KEY = "Clave ultra secreta"; // Clave para firmar tokens

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "12345",
    database: "rutas_utch"
    // Acá pongan las credenciales que pusieron dentro de su Workbench para que
    // la api pueda acceder a la base de datos
});
// Se usan los módulos
app.use(cookieParser());
app.use(express.static(path.resolve(__dirname, '../'))); // Define el directorio base de los archivos estáticos
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Para manejar cuestiones del usuario se crea una instancia de usuario
// únicamente pasamos la conexión, sus métodos contienen argumentos donde te pide diversa información
// principalmente la ID del usuario en la base de datos
const userHandler = new UserHandler(connection);

// Endpoints
app.get("/", (req, res) => {
    const token = req.cookies.token;
    // Si existe una sesión iniciada te mandará a la página de inicio
    if (token) {
        res.sendFile(path.resolve(__dirname, '../pages/index.html'));
    } else {
        // Caso contrario te manda al login, para que te logueees o te registres
        res.sendFile(path.resolve(__dirname, '../pages/login.html'));
/**
 * No sé cómo pero me gustaría que la página automáticamente te
 * restrinja el acceso a la página y te obligue a tener una cuenta activa
 */
    }
});

app.post("/auth/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const { token, userId } = await userHandler.login(email, password); // Se llama al método login de userHandler
        // En efecto, tengo que documentar todavía los métodos, aguántenme ;u;
        res.cookie('token', token, {
            httpOnly: false, // En producción esto lo tenemos que cambiar a true
            maxAge: 86400000 // Un día en milisegundos
        });
        // Si todo salió bien se guarda tu token y te redirije a la página principal
        return res.redirect('/pages/index.html');
        // No hace falta mandar un status de que salió bien, es redundante
    } catch (error) {
        // Sino entonces se manda el mensaje de error
        return res.status(error.status).send(error.message);
    }
});
// Esto se puede hacer en el cliente, aunque es divertido haberlo hecho en el back
app.post('/auth/logout', (req, res) => {
    res.clearCookie("token");
    return res.redirect('/pages/login.html');
});
// Registro del usuario
app.post('/auth/register', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Dentro del controlador del usuario se registra el usuario
        await userHandler.register(email, password);
        res.redirect('/pages/login.html');
    } catch(error) {
        return res.status(error.status).send(error.message);
    }
});

app.post("/queja", async (req, res) => {
    const queja = req.body;
    const token = req.cookies.token;
    // Primero revisa si hay una sesión activa, así nos ahorramos algunos ataques
    if (!token) {
        return res.status(401).send("No estás autenticado");
    }

    try {
        // Se firma el token para verificarlo
        const decodificado = jwt.verify(token, SECRET_KEY);
        const user_id = decodificado.userId; // Se extrae el ID del usuario para hacer la consulta

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

app.listen(port, () => {
    console.log("Aplicación abierta en: http://localhost:" + port);
});
