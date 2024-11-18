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
        const query = 'SELECT usuario_id FROM usuarios WHERE usuario_correo = ? AND usuario_contraseña = SHA2(?, 256)';
        
        return new Promise((resolve, reject) => {
            this.db.query(query, [email, password], (error, results) => {
                if (error) {
                    console.error('Error al buscar el usuario:', error);
                    return reject({ status: 500, message: "Error en el servidor" });
                }
                
                if (results.length === 0) {
                    console.log(results);
                    return reject({ status: 401, message: "Correo o contraseña incorrectos" });
                }

                const token = jwt.sign({ userId: results[0].usuario_id }, SECRET_KEY, { expiresIn: '1h' });
                resolve({ token, userId: results[0].usuario_id });
            });
        });
    }

    async register(email, password) {
        const query = `CALL registrar_usuario(?, ?)`;
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

    async activar(usuario_id, organizacion_id, nombre_perfil) {
        const query = `INSERT INTO perfiles(usuario_fk, organizacion_fk, perfil_nombre) VALUES (?, ?, ?)`;
        return new Promise((resolve, reject) => {
            this.db.query(query, [usuario_id, organizacion_id, nombre_perfil], (error, results) => {
                if (error) {
                    console.error('Error al activar la cuenta:', error);
                    return reject({ status: 500, message: "Error al registrar el perfil" });
                }
                
                // Actualización del estado del usuario
                const query_activation = "UPDATE usuarios SET usuario_estatus = TRUE WHERE usuario_id = ?";
                this.db.query(query_activation, [usuario_id], (error, results) => {
                    if (error) {
                        console.error('Error al actualizar el estado del usuario:', usuario_id, "con error:", error);
                        return reject({ status: 500, message: "Error al actualizar estado del usuario" });
                    }
                    
                    resolve(results);  // Mover el resolve aquí, después de la segunda consulta
                });
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
        const query = "INSERT INTO comentarios (comentario, perfil_fk, ruta_fk) VALUES (?, ?, ?)";
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
        const query = "SELECT * FROM comentarios WHERE perfil_fk = (SELECT perfil_id FROM perfiles WHERE usuario_fk = ?)";

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
    async isActive(id_user) {
        const query = "SELECT usuario_estatus FROM usuarios WHERE usuario_id = ?";

        return new Promise((resolve, reject) => {
            this.db.query(query, [id_user], (error, results) => {
                if (error) {
                    console.error('Error al revisar si el usuario está activo:', error);
                    return reject({ status: 500, message: "Error al registrar la queja" });
                }
                resolve(results);
            });
        });
    }
}

module.exports = UserHandler;
