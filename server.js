// 🔹 Importamos las dependencias necesarias
import express from "express";
import dotenv from "dotenv";
import supportRoutes from "./routes/support.js";

// 🔹 Cargamos variables de entorno (.env)
dotenv.config();

// 🔹 Creamos la app de Express
const app = express();


// 🔹 Middleware para permitir recibir JSON en las peticiones
// Esto es necesario para leer req.body
app.use(express.json());


// 🔹 Ruta base para verificar que el servidor está activo
// Puedes probar en el navegador: http://localhost:3000
app.get("/", (req, res) => {
  res.send("🚀 FixIT AI funcionando correctamente");
});


// 🔹 Ruta principal de soporte
// Aquí es donde llega el problema del usuario
// Ejemplo: POST /api/support
app.use("/api/support", supportRoutes);


// 🔹 Definimos el puerto
// Usa el del .env si existe, o 3000 por defecto
const PORT = process.env.PORT || 3000;


// 🔹 Iniciamos el servidor
app.listen(PORT, () => {
  console.log(`🔥 Servidor corriendo en http://localhost:${PORT}`);
});