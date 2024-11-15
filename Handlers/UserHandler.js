const mysql = require("mysql2");
const jwt = require("jsonwebtoken");
const SECRET_KEY = "Clave ultra secreta";

/**
 * Maneja todo lo que tenga que ver con los usuarios
 * como obtener su información, manejo de quejas, etc.
 * @class
 */
class UserHandler {
    constructor(db) {
        this.db = db;
    }

    async login(email, password) {
        const query = 'SELECT cuenta_id FROM cuenta_usuario WHERE correo = ? AND contraseña = ?';
        return new Promise((resolve, reject) => {
            this.db.query(query, [email, password], (error, results) => {
                if (error) {
                    console.error('Error al buscar el usuario:', error);
                    return reject({ status: 500, message: "Error en el servidor" });
                }
                
                if (results.length === 0) {
                    return reject({ status: 401, message: "Correo o contraseña incorrectos" });
                }

                const token = jwt.sign({ userId: results[0].cuenta_id }, SECRET_KEY, { expiresIn: '1h' });
                resolve({ token, userId: results[0].cuenta_id });
            });
        });
    }

    async register(email, password) {
        const query = `INSERT INTO cuenta_usuario(correo, contraseña) VALUES (?, ?)`;
        return new Promise((resolve, reject) => {
            this.db.query(query, [email, password], (error, results) => {
                if (error) {
                    console.error('Error al insertar el usuario:', error);
                    return reject({ status: 500, message: "Error al registrar el usuario" });
                }
                console.log("Usuario registrado exitosamente:", email);
                resolve(results);
            });
        });
    }
/**
 * La queja del usuario se va a conformar por dos parámetros, el id del usuario al que
 * pertenece la queja y los detalles de la queja en un JSON, tiene que contener
 * la ruta a la que va dirigida y la descripción
 * @method
 */
    async queja(id_user, queja) {
        const query = "INSERT INTO quejas (comentario, fk_estudiante, ruta_queja) VALUES (?, ?, ?)";
        const { comentario, ruta_id } = queja;

        return new Promise((resolve, reject) => {
            this.db.query(query, [comentario, id_user, ruta_id], (error, results) => {
                if (error) {
                    console.error('Error al insertar la queja:', error);
                    return reject({ status: 500, message: "Error al registrar la queja" });
                }
                console.log("Queja completada");
                resolve(results);
            });
        });
    }
    async verQueja(id_user) {
        const query = "SELECT * FROM quejas WHERE fk_estudiante = (?)";

        return new Promise((resolve, reject) => {
            this.db.query(query, [id_user], (error, results) => {
                if (error) {
                    console.error('Error al insertar la queja:', error);
                    return reject({ status: 500, message: "Error al registrar la queja" });
                }
                resolve(results);
            });
        });
    }
}

module.exports = UserHandler;