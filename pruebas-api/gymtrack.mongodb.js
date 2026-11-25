// Playground de MongoDB for VS Code. Conéctate a "GymTrack (local)" y pulsa el botón ▶ (Run All) arriba a la derecha.
use('gymtrack');

// 1. Cuántos documentos hay en cada colección
db.getCollectionNames().sort().map(c => ({ coleccion: c, documentos: db.getCollection(c).countDocuments() }));

// Para ver una colección concreta, selecciona una línea y pulsa "Run Selected":
// db.usuarios.find();
// db.ejercicios.find();
// db.rutinas.find();
// db.asignaciones.find();
// db.objetivos.find();
// db.sesiones.find();
// db.mediciones.find();
