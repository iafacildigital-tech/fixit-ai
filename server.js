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
const PORT = process.env.PORT || 10000; // Render usa 10000

// ===============================
// 🔧 CONFIGURACIÓN
// ===============================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir frontend
app.use(express.static("public"));

// ===============================
// 📂 SUBIDA DE ARCHIVOS
// ===============================
const upload = multer({ dest: "uploads/" });

// ===============================
// 🤖 OPENAI
// ===============================
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// ===============================
// 🔐 LOGIN (IMPORTANTE)
// ===============================
app.post("/login", (req, res) => {
  try {
    const { email, password } = req.body;

    const usuarios = JSON.parse(fs.readFileSync("usuarios.json", "utf-8"));

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
    console.error("❌ Error en login:", error);
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
c
Eres un técnico de soporte IT que ayuda a personas SIN conocimientos técnicos.

Responde SIEMPRE de forma:
- sencilla
- clara
- paso a paso
- como si hablaras con alguien que no sabe de tecnología

EVITA:
- palabras técnicas (como RJ45, cat6, ethernet, etc)
- explicaciones complicadas

USA ejemplos simples como:
- "es el cable que conecta el internet a tu computador"
- "es la caja del internet que tienes en casa"

Responde en este formato JSON:
{
  "problema": "...",
  "tipo": "...",
  "solucion": "..."
}

Problema del usuario:
"${problema}"

`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    let respuesta = completion.choices[0].message.content;

    const match = respuesta.match(/\{[\s\S]*\}/);
    const resultado = match ? JSON.parse(match[0]) : {
      problema,
      tipo: "Desconocido",
      solucion: "No se pudo procesar"
    };

    // Guardar historial
    const archivoHistorial = `historial_${empresa}.json`;

// Crear archivo si no existe
if (!fs.existsSync(archivoHistorial)) {
  fs.writeFileSync(archivoHistorial, "[]");
}

const historial = JSON.parse(fs.readFileSync(archivoHistorial, "utf-8"));
    

    fs.writeFileSync(archivoHistorial, JSON.stringify(historial, null, 2));

    res.json(resultado);

  } catch (error) {
    console.error("❌ Error IA:", error);
    res.status(500).json({ error: "Error en IA" });
  }
});

// ===============================
// 📧 ESCALAR
// ===============================
app.post("/escalar", async (req, res) => {
  try {
    const empresa = req.headers["empresa"] || "demo";

    const mensaje = `
🚨 NUEVO CASO ESCALADO

Empresa: ${empresa}
Problema: ${req.body.problema}
Tipo: ${req.body.tipo}

Solución:
${req.body.solucion}
`;

    await enviarCorreoSoporte("Nuevo caso escalado", mensaje);

    res.json({ success: true });

  } catch (error) {
    console.error("❌ Error correo:", error);
    res.status(500).json({ error: "Error enviando correo" });
  }
});

// ===============================
// 🟢 RUTA TEST
// ===============================
app.get("/login", (req, res) => {
  res.send("✅ Ruta login activa");
});

// ===============================
// 🟢 ROOT
// ===============================
app.get("/", (req, res) => {
  res.send("🚀 FixIT AI funcionando correctamente");
});

// ===============================
// 🔥 SERVIDOR
// ===============================
app.listen(PORT, () => {
  console.log(`🔥 Servidor corriendo en puerto ${PORT}`);
});