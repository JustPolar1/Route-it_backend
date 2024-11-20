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

2. Define la clave secreta para firmar cookies}
``` JavaScript
const SECRET_KEY = "Clave ultra secreta";
```

3. Asegurate que tu base de datos contenga las tablas necesarias

## Endpoints

## Colaboradores

Esta API fue creada para un proyecto integrador de la Universidad Tecnológica de Chihuahua
y fue hecha por las siguientes personas:

- JustPolar1 - Fullstack (Adán Giovanni Ramirez Erives)
- JustSeven - Backend enfocada a bases de datos (Avril Alexa Caraveo Veleta)
- Diegodealer - Frontend (Diego Emilio Rodríguez Falcón)
- Delulw - Frontend enfocada al diseño (Guadalupe Saraí Jáquez Aguilar)
