CREATE DATABASE RouteIt;

USE RouteIt;

CREATE TABLE usuarios(
    usuario_id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_correo VARCHAR(127) NOT NULL UNIQUE,
    usuario_contraseña BLOB NOT NULL,
    usuario_estatus BOOLEAN DEFAULT FALSE
);

CREATE TABLE organizaciones(
    organizacion_id INT AUTO_INCREMENT PRIMARY KEY,
    organizacion_nombre VARCHAR(31) NOT NULL
);

CREATE TABLE rutas(
    ruta_id INT AUTO_INCREMENT PRIMARY KEY,
    organizacion_fk INT,
    ruta_nombre JSON,
    /* Con el siguiente formato:
    {
        "es": "Ruta norte",
        "en": "North route"
    }
    */
    ruta_precio DECIMAL(4, 2),
    ruta_descripcion JSON,
    /* Con el siguiente formato:
    {
        "es": "Esta ruta comienza en Alsuper Riberas con destino final a la UTCh",
        "en": "This route begins in Alsuper Riberas with final destination at UTCh"
    }
    */ 
    ruta_estatus BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (organizacion_fk) REFERENCES organizaciones(organizacion_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);

CREATE TABLE paradas(
    parada_id INT AUTO_INCREMENT PRIMARY KEY,
    ruta_fk INT NOT NULL,
    waypoint POINT NOT NULL,
    parada_orden INT NOT NULL,
    parada_descripcion VARCHAR(63),
    FOREIGN KEY (ruta_fk) REFERENCES rutas(ruta_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);

CREATE TABLE perfiles(
    perfil_id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_fk INT,
    organizacion_fk INT,
    ruta_preferida_fk INT,
    perfil_nombre VARCHAR(63),
    FOREIGN KEY (usuario_fk) REFERENCES usuarios(usuario_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
    FOREIGN KEY (organizacion_fk) REFERENCES organizaciones(organizacion_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
    FOREIGN KEY (ruta_preferida_fk) REFERENCES rutas(ruta_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);

CREATE TABLE comentarios (
    comentario_id INT AUTO_INCREMENT PRIMARY KEY,
    perfil_fk INT NOT NULL,
    ruta_fk INT NOT NULL,
    comentario TEXT NOT NULL,
    FOREIGN KEY (perfil_fk) REFERENCES perfiles(perfil_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
    FOREIGN KEY (ruta_fk) REFERENCES rutas(ruta_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);

DELIMITER //

CREATE PROCEDURE registrar_usuario (
    IN email VARCHAR(127),
    IN contraseña VARCHAR(63)
)
BEGIN

    INSERT INTO usuarios (
        usuario_correo,
        usuario_contraseña
    )
    VALUES(
        email,
        SHA2(contraseña, 256)
    );

END //

DELIMITER ;

DELIMITER //

CREATE PROCEDURE verificar_usuario (
    IN email VARCHAR(127),
    IN contraseña VARCHAR(63)
)
BEGIN

    SELECT usuario_id FROM usuarios 
    WHERE usuario_correo = email AND usuario_contraseña = SHA2(contraseña, 256);

END //

DELIMITER ;

INSERT INTO organizaciones(organizacion_nombre)
VALUES ("UTCh");

INSERT INTO rutas (ruta_nombre, ruta_precio, ruta_descripcion, ruta_estatus)
VALUES 
('{"es": "Ruta noroeste", "en": "Northwest route"}', 15.00, '{
    "es": "Lista de paradas: Inicia en Alsuper Riberas y sus paradas son las mismas que las del camión urbano",
    "en": "List of stops: Starts at Alsuper Riberas and its stops are the same as the urban bus"
}', TRUE),

('{"es": "Ruta noreste", "en": "Northeast route"}', 20.00, '{
    "es": "Lista de paradas: Inicia en Av. Prieto Luján y Av. Hidroelectrica, sus paradas son las del camión urbano",
    "en": "List of stops: Starts at Av. Prieto Luján and Av. Hidroelectrica, its stops are those of the urban bus"
}', TRUE),

('{"es": "Ruta sur", "en": "South route"}', 15.00, '{
    "es": "Lista de paradas: Inicia en Alsuper Fuentes Mares, sus paradas son las del camión urbano",
    "en": "List of stops: Starts at Alsuper Fuentes Mares, its stops are those of the urban bus"
}', TRUE),

('{"es": "Ruta Sur #2", "en": "South route #2"}', 15.00, '{
    "es": "Lista de paradas: Inicia en frente de Terminal Sur J.P II, sus paradas son las del camión urbano",
    "en": "List of stops: Starts in front of Terminal Sur J.P II, its stops are those of the urban bus"
}', TRUE),

('{"es": "Sur desde la UTCH", "en": "South from UTCH"}', 20.00, '{
    "es": "Lista de paradas: Inicia en la UTCH, con dirección a la glorieta tricentenario, de ahí se dirige a la Pacheco y Pedro Meoqui",
    "en": "List of stops: Starts at UTCH, heading to the Tricentenario roundabout, then goes to Pacheco and Pedro Meoqui"
}', FALSE);

UPDATE rutas
SET organizacion_fk = 1;

INSERT INTO paradas (
    ruta_fk,
    waypoint,
    parada_orden,
    parada_descripcion
  )
VALUES
-- Ruta norte 1
(1, POINT(28.76468937404245, -106.16938378182661), 1, "Alsuper Riberas"),
(1, POINT(28.70258687986386, -106.14192785268213), 2, "Circuito universitario"),
(1, POINT(28.642632, -106.146909), 3, "UTCh"),
-- Ruta norte 2
(2, POINT(28.74224416257849, -106.13791303769614), 1, "Av. Prieto Luján"),
(2, POINT(28.744635839841038, -106.13287504610011), 2, "Anthony Quinn"),
(2, POINT(28.74662489997584, -106.12841291189626), 3, "Paseo real"),
(2, POINT(28.737653981907993, -106.12332086962223), 4, "Mina Casale"),
(2, POINT(28.738884097381824, -106.12042303329815), 5, "Mina progreso"),
(2, POINT(28.73959033440291, -106.11832342831346), 6, "Mina progreso y Av. Industrial"),
(2, POINT(28.73366447915171, -106.11529624207145), 7, "Elektra Av. Industrias"),
(2, POINT(28.7293389520265, -106.11349216961726), 8, "Industrias y Dostoyevski"),
(2, POINT(28.7265705711264, -106.12033780365736), 9, "Dostoyevski y Sosa Vera"),
(2, POINT(28.642632, -106.146909), 10, "UTCh"),
-- Sur de ida 1
(3, POINT(28.62086575203181, -106.03171545445987), 1, "Alsuper Fuentes Mares"),
(3, POINT(28.626852230301544, -106.03041384077241), 2, ""),
(3, POINT(28.645222841283974, -106.06899465553275), 3, ""),
(3, POINT(28.639714254961497, -106.07456167121934), 4, "Neri Santos"),
(3, POINT(28.642632, -106.146909), 5, "UTCh"),
-- Sur de ida 2
(4, POINT(28.62035661347746, -106.03111531931404), 1, "Alsuper Fuentes Mares"),
(4, POINT(28.6015419, -106.1026966), 2, "Glorieta Tricentenario"),
(4, POINT(28.647509, -106.133202), 3, "Cantera Y Valles Vivar"),
(4, POINT(28.642632, -106.146909), 4, "UTCh"),
-- Sur rumbo a la UTCh
(5, POINT(28.64215, -106.147051), 1, "UTCh"),
(5, POINT(28.623221582883048, -106.11379527074813), 2, "Fashion Mall"),
(5, POINT(28.601764, -106.102537), 3, "Glorieta Tricentenario"),
(5, POINT(28.619668405494654, -106.05115941991217), 4, "Fuentes Mares vialidad CH-P"),
(5, POINT(28.620905095639092, -106.03170352277296), 5, "Fuentes Mares, Nueva España"),
(5, POINT(28.62689755522281, -106.03041925721031), 6, "Terminal Sur"),
(5, POINT(28.636038471134963, -106.04539948224136), 7, "Pacheco y Pedro Meoqui");

ALTER TABLE rutas ADD COLUMN ruta_imagen VARCHAR(30);

UPDATE rutas
SET ruta_imagen = "norte1.png"
WHERE ruta_id = 1;

UPDATE rutas
SET ruta_imagen = "norte2.png"
WHERE ruta_id = 2;

UPDATE rutas
SET ruta_imagen = "sur.png"
WHERE ruta_id = 3;

UPDATE rutas
SET ruta_imagen = "sur2.png"
WHERE ruta_id = 4;

UPDATE rutas
SET ruta_imagen = "sur_vuelta.png"
WHERE ruta_id = 5;

create role usuario;
grant select, update, insert on comentarios to usuario;
grant select, update, insert on perfiles to usuario;
grant select, update, insert on usuarios to usuario;
grant select on rutas to usuario;
grant select on paradas to usuario;
grant select on organizaciones to usuario;
grant execute on RouteIt.* to usuario;

create role administrador;
grant select, update, insert, execute on RouteIt.* to administrador;

-- Crear usuario para un cliente regular
CREATE USER 'usuario_cliente'@'localhost' IDENTIFIED BY 'fibo1123581321nacci';
GRANT usuario TO 'usuario_cliente'@'localhost';
SET DEFAULT ROLE ALL TO 'usuario_cliente'@'localhost';

-- Crear usuario para un administrador
CREATE USER 'admin_cliente'@'localhost' IDENTIFIED BY 'fibo1123581321nacci';
GRANT administrador TO 'admin_cliente'@'localhost';
SET DEFAULT ROLE ALL TO 'admin_cliente'@'localhost';

FLUSH PRIVILEGES;