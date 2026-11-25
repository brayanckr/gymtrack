# GymTrack

Proyecto de *Diseño de Software*: una aplicación para **desarrollar y dar seguimiento al entrenamiento en el gimnasio** (objetivos, rutinas, sesiones,
mediciones y progreso). Este repositorio reúne **todo el proyecto**: el análisis y diseño, la API, la demo web y las pruebas de la API.

| Carpeta | Qué hay |
|---|---|
| [`documentacion/`](documentacion/README.md) | Historias de usuario, mockups, modelo de dominio, las cinco vistas arquitectónicas y el contrato de la API |
| [`backend/`](backend/README.md) | API REST en Java (Spring Boot + MongoDB), tres capas, comentada |
| [`frontend/`](frontend/README.md) | Demo web (React + Vite + TypeScript) que consume la API |
| [`pruebas-api/`](pruebas-api/) | Colección de Postman, peticiones para VS Code (REST Client), consultas de MongoDB y guías en Word |

## Ejecutar la aplicación

Requisitos: **JDK 17 o superior**, **Node 20 o superior** y MongoDB en `localhost:27017`.

En una terminal, la API (http://localhost:8080):

```powershell
cd backend
./mvnw spring-boot:run
```

En otra terminal, la demo web (http://localhost:5173):

```powershell
cd frontend
npm install
npm run dev
```

## Diagramas

Las cinco vistas, con sus imágenes, están explicadas en [`documentacion/docs/04-vistas-arquitectonicas.md`](documentacion/docs/04-vistas-arquitectonicas.md);
los archivos editables (`.drawio`) están en [`documentacion/diagramas/editables/`](documentacion/diagramas/editables/).
