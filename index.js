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
    database: "RouteIt"
    // Acá pongan las credenciales que pusieron dentro de su Workbench para que
    // la api pueda acceder a la base de datos
});


// Se usan los módulos
app.use(cookieParser());
app.use(express.static(path.resolve(__dirname, '../'))); // Define el directorio base de los archivos estáticos
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Se usa para revisar si un usuario está autenticado
async function isAuth(req, res, next) {
    const token = req.cookies.token;

    if (token) {
        try {
            const decoded = jwt.verify(token, SECRET_KEY);
            req.user = decoded; // Almacena el usuario decodificado en req.user
            
            // Permitir acceso a la ruta de activación sin verificar el estado de activación
            if (req.originalUrl === "/activation") {
                return next(); // Si es la ruta de activación, deja pasar
            }

            // Verifica si el usuario está activado para las demás rutas
            const result = await userHandler.isActive(req.user.userId);
            if (!result[0].usuario_estatus) {
                return res.status(401).redirect("/activation"); // Redirigir si no está activado
            }

            next(); // Continuar con la ruta solicitada
        } catch (error) {
            console.error('Token inválido:', error);
            res.clearCookie('token');
            return res.status(401).redirect("/about");
        }
    } else {
        return res.status(401).redirect("/about"); // Redirige si no hay token
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

        return res.sendFile(path.resolve(__dirname, '../pages/login.html'));
    } catch(error) {
        return res.status(error.status).send(error.message);
    }
});

app.get("/activation", (req, res) => {
    return res.sendFile(path.resolve(__dirname, '../pages/activation.html'));
});

app.get("/organizaciones", (req, res) => {
    if (req.query.organizacion_id) {
        const organizacion_id = req.query.organizacion_id;

        const query = "SELECT * FROM organizaciones WHERE organizacion_id = ?";
        connection.query(query, [organizacion_id], (error, results) => {  
            if (error) {
                return res.status(500).json({ error: "Error en la consulta" });
            }
            if (results.length === 0) {
                return res.status(404).json({ error: "Organización no encontrada" });
            }
            return res.json(results); // Cambié 'ruta' por 'results'
        });
        return;
    }

    const query = "SELECT * FROM organizaciones";
    connection.query(query, (error, results) => {
        if (error) {
            return res.status(500).json({ error: "Error en la consulta" });
        }
        return res.json(results); // Enviar los resultados aquí también
    });
});

/**
 * Ejemplo de solicitud
 {
    "email": "polar@gmail.com",
    "password": "polar"
}
 */

// Endpoints protegidos
app.get("/about", (req, res) => {
    res.sendFile(path.resolve(__dirname, '../pages/about.html'));
});

app.use(isAuth); // Solo usuarios autenticados acceden a las siguientes rutas

// Endpoints protegidos
app.get("/", (req, res) => {
    res.sendFile(path.resolve(__dirname, '../pages/index.html'));
});

app.post("/activation", async (req, res) => {
    const perfil_info = req.body;
    const { organizacion, nombre } = perfil_info;

    console.log(req.user)

    // Verifica si los campos necesarios están presentes
    if (!organizacion || !nombre) {
        return res.status(400).send("Faltan datos necesarios para la activación");
    }

    try {
        // Llama a la función activar con los datos del perfil
        await userHandler.activar(req.user.userId, organizacion, nombre);
        return res.status(201).redirect("/");
    } catch (error) {
        // Manejo adecuado de errores
        const statusCode = error.status || 500; // Si no hay status, devuelve un 500
        const errorMessage = error.message || "Ocurrió un error inesperado"; // Mensaje por defecto
        return res.status(statusCode).send(errorMessage);
    }
});

// Esto se puede hacer en el cliente, aunque es divertido haberlo hecho en el back
app.post('/auth/logout', (req, res) => {
    res.clearCookie("token");
    return res.redirect('../pages/login.html');
});

app.get("/queja", (req, res) => {
    return res.sendFile(path.resolve(__dirname, '../pages/quejas.html'));
});

app.get("/queja/user", async (req, res) => {
    try {
        const queja_info = await userHandler.verQueja(req.user.userId); 
        console.log(queja_info);
        return res.json(queja_info);
    } catch(error) {
        return res.sendStatus(error.status);
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
app.post("/queja", async (req, res) => {
    const queja = req.body;

    try {
        await userHandler.queja(req.user.userId, queja);
        res.status(201).send("Queja registrada con éxito");
    } catch(error) {
        return res.status(error.status).send(error.message);
    }
});

app.get("/map", (req, res) => {
    return res.sendFile(path.resolve(__dirname, '../pages/map.html'));
});

app.get("/perfil", (req, res) => {
    return res.sendFile(path.resolve(__dirname, '../pages/profile.html'));
});

app.get("/perfil/info", (req, res) => {
    const userId = req.user.userId;
    const query = "SELECT * FROM perfiles WHERE usuario_fk = ?";
    connection.query(query, [userId], (error, results) => {
        if (error) {
            return res.status(500).json({ error: "Error en la consulta" });
        }
        return res.json(results);
    });
});

app.get("/rutas", (req, res) => {
    if (req.query.ruta_id) {
        const ruta_id = req.query.ruta_id;

        const query = "SELECT * FROM rutas WHERE ruta_id = ?";
        connection.query(query, [ruta_id], (error, results) => {  
            if (error) {
                return res.status(500).json({ error: "Error en la consulta" });
            }
            if (results.length === 0) {
                return res.status(404).json({ error: "Ruta no encontrada" });
            }
            const ruta = results[0];
            // Seleccionar idioma
            ruta.ruta_nombre = ruta.ruta_nombre.en; // Cambia 'es' por 'en' para inglés
            ruta.ruta_descripcion = ruta.ruta_descripcion.en; // Similar con descripción
            return res.json(ruta);
        });
        return;
    }
    const query = "SELECT * FROM rutas";
    connection.query(query, (error, results) => {
        if (error) {
            return res.status(500).json({ error: "Error en la consulta" });
        }
        results.forEach(ruta => {
            // Ajustar campos según idioma
            ruta.ruta_nombre = ruta.ruta_nombre.en; // Cambia 'es' por 'en' para inglés
            ruta.ruta_descripcion = ruta.ruta_descripcion.en; // Similar con descripción
        });
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
