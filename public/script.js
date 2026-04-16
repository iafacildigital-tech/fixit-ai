// ===============================
// 🚀 IMPORTACIONES
// ===============================
import express from "express";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import dotenv from "dotenv";
import OpenAI from "openai";
import { enviarCorreoSoporte } from "./emailService.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ===============================
// 🔧 CONFIGURACIÓN
// ===============================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir frontend
app.use(express.static("public"));

// ===============================
// 📂 MULTER (subida de archivos)
// ===============================
const upload = multer({ dest: "uploads/" });

// ===============================
// 🤖 OPENAI
// ===============================
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// ===============================
// 🔐 LOGIN
// ===============================
app.post("/login", (req, res) => {
  try {
    const { email, password } = req.body;

    const usuarios = JSON.parse(fs.readFileSync("usuarios.json"));

    const usuario = usuarios.find(
      (u) => u.email === email && u.password === password
    );

    if (usuario) {
      return res.json({
        success: true,
        empresa: usuario.empresa
      });
    }

    return res.status(401).json({
      success: false,
      message: "Credenciales incorrectas"
    });

  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ error: "Error en servidor" });
  }
});

// ===============================
// 🧠 ANALIZAR PROBLEMA (IA)
// ===============================
app.post("/analizar", upload.single("imagen"), async (req, res) => {
  try {
    const problema = req.body.problema || "Problema no especificado";
    const empresa = req.headers["empresa"] || "demo";

    const prompt = `
Eres un técnico IT experto.

Analiza el siguiente problema:
"${problema}"

Responde en JSON con:
{
  "problema": "...",
  "tipo": "...",
  "solucion": "pasos claros"
}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    let respuesta = completion.choices[0].message.content;

    // Limpiar si viene con texto adicional
    const jsonMatch = respuesta.match(/\{[\s\S]*\}/);
    const resultado = jsonMatch ? JSON.parse(jsonMatch[0]) : {
      problema,
      tipo: "Desconocido",
      solucion: "No se pudo procesar la respuesta"
    };

    // Guardar historial
    const historial = JSON.parse(fs.readFileSync("historial.json"));
    historial.push({
      ...resultado,
      empresa,
      fecha: new Date()
    });

    fs.writeFileSync("historial.json", JSON.stringify(historial, null, 2));

    res.json(resultado);

  } catch (error) {
    console.error("Error IA:", error);
    res.status(500).json({ error: "Error procesando IA" });
  }
});

// ===============================
// 📧 ESCALAR A SOPORTE
// ===============================
app.post("/escalar", async (req, res) => {
  try {
    const empresa = req.headers["empresa"] || "demo";

    const mensaje = `
🚨 NUEVO CASO ESCALADO

Empresa: ${empresa}
Problema: ${req.body.problema}
Tipo: ${req.body.tipo}

Solución intentada:
${req.body.solucion}
`;

    await enviarCorreoSoporte("Nuevo caso escalado", mensaje);

    res.json({ success: true });

  } catch (error) {
    console.error("Error correo:", error);
    res.status(500).json({ error: "Error enviando correo" });
  }
});

// ===============================
// 🟢 RUTA BASE
// ===============================
app.get("/", (req, res) => {
  res.send("🚀 FixIT AI funcionando correctamente");
});

// ===============================
// 🔥 INICIAR SERVIDOR
// ===============================
app.listen(PORT, () => {
  console.log(`🔥 Servidor corriendo en puerto ${PORT}`);
});