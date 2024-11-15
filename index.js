const express = require('express');
const app = express();
const path = require('path');
const port = 3000;

const mysql = require("mysql2"); // Para la conexión a MySQL
const jwt = require("jsonwebtoken"); // Para la lectura y verificación de tokens
const cookieParser = require('cookie-parser'); // Para la lectura de tokens
const UserHandler = require('./Handlers/UserHandler'); // El controlador de todo lo relacionado al usuario
const { Console, error } = require('console');
const { resourceLimits } = require('worker_threads');

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

// Se usa para revisar si un usuario está autenticado
function isAuth(req, res, next) {
    const token = req.cookies.token;

    if (token) {
        try {
            const decoded = jwt.verify(token, SECRET_KEY);
            // PUede ser útil por ejemplo para cargar la información del usuario
            req.user = decoded; // Puedes almacenar la información decodificada del usuario en el request
            
            console.log(req.user);
            return next(); // Continuamos con el siguiente middleware/controlador
        } catch (error) {
            // Estaría bueno hacer un control de cada excepción para dar más contexto al usuario
            console.error('Token inválido:', error);
            res.clearCookie('token');
            return res.status(401).redirect("/pages/login.html");
        }
    } else {
        return res.status(401).redirect("/pages/login.html"); // Redirige si no hay token
    }
}

// Para manejar cuestiones del usuario se crea una instancia de usuario
// únicamente pasamos la conexión, sus métodos contienen argumentos donde te pide diversa información
// principalmente la ID del usuario en la base de datos
const userHandler = new UserHandler(connection);

app.post("/auth/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const { token, userId } = await userHandler.login(email, password); // Se llama al método login de userHandler
        // En efecto, tengo que documentar todavía los métodos, aguántenme ;u;
        res.cookie('token', token, {
            httpOnly: false,  // Para que sea accesible en JavaScript (esto puede cambiar a true en producción)
            maxAge: 86400000, // Expira en un día
        });
        // Si todo salió bien se guarda tu token y te redirije a la página principal
        return res.redirect('/');
        // No hace falta mandar un status de que salió bien, es redundante
    } catch (error) {
        console.log("Error de inicio de sesión:", error);
        // Sino entonces se manda el mensaje de error
        return res.status(error.status).send(error.message);
    }
});

/**
 * Ejemplo de solicitud
 {
    "email": "polar@gmail.com",
    "password": "polar"
}
 */

// Registro del usuario
app.post('/auth/register', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Dentro del controlador del usuario se registra el usuario
        await userHandler.register(email, password);

        return res.status(201).redirect('/');
    } catch(error) {
        return res.status(error.status).send(error.message);
    }
});

/**
 * Ejemplo de solicitud
 {
    "email": "polar@gmail.com",
    "password": "polar"
}
 */

app.use(isAuth); // Solo usuarios autenticados acceden a las siguientes rutas

// Endpoints protegidos
app.get("/", (req, res) => {
    res.sendFile(path.resolve(__dirname, '../pages/index.html'));
});

// Esto se puede hacer en el cliente, aunque es divertido haberlo hecho en el back
app.post('/auth/logout', (req, res) => {
    res.clearCookie("token");
    return res.redirect('../pages/login.html');
});

app.get("/queja", (req, res) => {
    return res.sendFile(path.resolve(__dirname, '../pages/quejas.html'));
});

app.post("/queja", async (req, res) => {
    const queja = req.body;

    try {
        await userHandler.queja(req.user.userId, queja);
        res.status(201).send("Queja registrada con éxito");
    } catch(error) {
        return res.status(error.status).send(error.message);
    }
});

/**
 * Es importante aclarar que esta ruta necesita cookies con el token firmado de inicio de sesión
 * que contenga el ID del usuario para funcionar
 * Ejemplo de solicitud
{
	“ruta_id”: 4,
	“comentario”: “La otra vez casi me tropiezo porque había un agujero en el camión”
}
 */

app.get("/map", (req, res) => {
    return res.sendFile(path.resolve(__dirname, '../pages/map.html'));
});

app.get("/perfil", (req, res) => {
    return res.sendFile(path.resolve(__dirname, '../pages/perfil.html'));
});

app.get("/rutas", (req, res) => {
    if (req.query.ruta_id) {
        const ruta_id = parseInt(req.query.ruta_id);

        const query = "SELECT * FROM rutas WHERE ruta_id = ?";
        connection.query(query, [ruta_id], (error, results) => {  // Pasa ruta_id dentro de un array
            if (error) {
                return res.status(500).json({ error: "Error en la consulta" });
            }
            return res.json(results);
        });
        return;
    }
    const query = "SELECT * FROM rutas";
    connection.query(query, (error, results) => {
        if (error) {
            return res.status(500).json({ error: "Error en la consulta" });
        }
        return res.json(results);
    });
});

app.get("/rutas/paradas", (req, res) => {
    const query = "SELECT * FROM paradas";
    connection.query(query, (error, results) => {
        if (error) {
            return res.status(500).json({ error: "Error en la consulta" });
        }
        return res.json(results);
    });
});

app.listen(port, () => {
    console.log("Aplicación abierta en: http://localhost:" + port);
});
