# API del proyecto Route-It

## Tabla de Contenidos
- [Descripción](#descripción)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Endpoints](#endpoints)
- [Colaboradores](#colaboradores)

---

## Descripción
API para la obtención y manejo de información dentro de la página 
Route-It que permite el registro y manejo de los usuarios, obtención
de información de las rutas que deriva de la base de datos,
obtención de información de las paradas, publicación de quejas hacia 
diferentes rutas.
Nuestra API también contiene un mecanismos que protegen las rutas
para que nadie más que usuarios autenticados puedan acceder a estas
rutas.

## Instalación

1. Clona el repositorio dentro de la carpeta de la página de Route-It:
   ```bash
   git clone https://github.com/JustPolar1/route-it_backend.git
   cd route-it_backend
   ```
2. Instalación de dependencias
``` bash
npm install
```

3. Inicia el servidor
``` bash
node index.js
```

## Configuración

1. Configura tus credenciales de la base de datos MySQL dentro del archivo index.js
``` JavaScript
const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "tu_password",
    database: "RouteIt"
});
```

2. Define la clave secreta para firmar cookies
``` JavaScript
const SECRET_KEY = "Clave ultra secreta";
```

3. Asegurate que tu base de datos contenga las tablas necesarias

## Endpoints

### POST /auth/login

#### Formato de solicitud:
``` JSON
{
   "email": "email@dominio.com",
   "password": "contraseña-123"
}
```

#### Respuesta:
Firmará una token que guardará tu ID para futuras solicitudes

### POST /auth/register

#### Formato de solicitud:
``` JSON
{
   "email": "email@dominio.com",
   "password": "contraseña-123"
}
```

#### Respuesta:
Guardará tu usuario en la base de datos con un estatus 201

### POST /activation

#### Formato de solicitud:
``` JSON
{
   "organización": 1,
   "Nombre": "Manolo Pepino González"
}
```

#### Respuesta:
Activará tu usuario guardando tu información en una tabla de perfiles
dentro de la base de datos con estatus 201

### POST /queja

#### Formato de solicitud
``` JSON
{
   "comentario": "Comentario sobre la ruta",
   "ruta_id": 4
}
```

#### Respuesta:
Guardará tu queja dentro de la base de datos con estatus 201 y 
esta la podrás ver en tu perfil

### GET /queja/user

#### Respuesta:
Devolverá el siguiente JSON para permitir mostrar los comentarios 
de los usuarios.
``` JSON
[
    {
        "comentario_id": 3,
        "perfil_fk": 2,
        "ruta_fk": 2,
        "comentario": "Queja"
    },
    {
        "comentario_id": 4,
        "perfil_fk": 2,
        "ruta_fk": 2,
        "comentario": "Hello this is my complain :D"
    },
    ...
]
```

### GET /rutas

#### Respuesta:
Sirve para obtener las diferentes rutas de la organización a la que pertenece el usuario.
Adicionalmente la información podrá estar en inglés o en español relativo al idioma
seleccionado por el usuario
``` JSON
[
    {
        "ruta_id": 1,
        "organizacion_fk": 1,
        "ruta_nombre": "Northwest route",
        "ruta_precio": "15.00",
        "ruta_descripcion": "List of stops: Starts at Alsuper Riberas and its stops are the same as the urban bus",
        "ruta_estatus": 1
    },
    {
        "ruta_id": 2,
        "organizacion_fk": 1,
        "ruta_nombre": "Northeast route",
        "ruta_precio": "20.00",
        "ruta_descripcion": "List of stops: Starts at Av. Prieto Luján and Av. Hidroelectrica, its stops are those of the urban bus",
        "ruta_estatus": 1
    },
    ...
]
```
Cabe aclarar que si la solicitud contiene un parámetro de consulta que contenga el formato: 
GET /rutas?ruta_id=1
se obtendrá la información de esa ruta concreta que tenga esa ID.

Altamente útil para mostrar al usuario su ruta preferida dentro del perfil

### GET /rutas/paradas

#### Respuesta:
Se obtendrán las paradas asociadas a las rutas de la organización a la que pertenezca el usuario.

Necesario para la visualización de las rutas dentro de la página `map.html`
``` JSON
[
    {
        "parada_id": 1,
        "ruta_fk": 1,
        "waypoint": {
            "x": 28.76468937404245,
            "y": -106.16938378182661
        },
        "parada_orden": 1,
        "parada_descripcion": "Alsuper Riberas"
    },
    {
        "parada_id": 2,
        "ruta_fk": 1,
        "waypoint": {
            "x": 28.70258687986386,
            "y": -106.14192785268213
        },
        "parada_orden": 2,
        "parada_descripcion": "Circuito universitario"
    },
    ...
]
```

### GET /perfil/info

### Respuesta
Se obtendrá la información del perfil asociado a la cuenta actual.

Útil para la visualización de información dentro de `profile.html`

``` JSON
[
    {
        "perfil_id": 2,
        "usuario_fk": 2,
        "organizacion_fk": 1,
        "ruta_preferida_fk": null,
        "perfil_nombre": "Avril Alexa Caraveo Veleta"
    }
]
```

### GET /organizaciones

#### Respuesta:
Se obtendrá la información relacionada a las organizaciones.

Útil a la hora de elegir tu organización cuando activas tu perfil.
``` JSON
[
    {
        "organizacion_id": 1,
        "organizacion_nombre": "UTCh"
    },
    ...
]
```

*Cabe aclarar que muchas endpoint están protegidas debido a la necesidad
de una ID de usuario dentro del token firmado para la consulta de mucha de la información.*

## Colaboradores

Esta API fue creada para un proyecto integrador de la Universidad Tecnológica de Chihuahua
y fue hecha por las siguientes personas:

- JustPolar1 - Fullstack (Adán Giovanni Ramirez Erives)
- JustSeven - Backend enfocada a bases de datos (Avril Alexa Caraveo Veleta)
- Diegodealer - Frontend (Diego Emilio Rodríguez Falcón)
- Delulw - Frontend enfocada al diseño (Guadalupe Saraí Jáquez Aguilar)
