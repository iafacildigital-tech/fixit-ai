import express from "express";
import dotenv from "dotenv";
import supportRoutes from "./routes/support.js";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();

// 🔧 Necesario para __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 📦 Middleware
app.use(express.json());

// 🌐 Servir archivos del frontend (carpeta public)
app.use(express.static(path.join(__dirname, "public")));

// 🔗 Rutas API
app.use("/api/support", supportRoutes);

// 🏠 Ruta principal → cargar index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// 🚀 Puerto dinámico (Render usa process.env.PORT)
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🔥 Servidor corriendo en puerto ${PORT}`);
});