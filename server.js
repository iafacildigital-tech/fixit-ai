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
const PORT = process.env.PORT || 10000;

// ===============================
// 🔧 CONFIGURACIÓN
// ===============================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===============================
// 🏠 ROOT → INTRO
// ===============================
app.get("/", (req, res) => {
res.sendFile(process.cwd() + "/public/intro.html");
});

// ===============================
// 📂 ARCHIVOS ESTÁTICOS
// ===============================
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
// 🔐 LOGIN (CORREGIDO)
// ===============================
app.post("/login", (req, res) => {
try {
const { email, password } = req.body;

```
let usuarios;

try {
  usuarios = JSON.parse(fs.readFileSync("usuarios.json", "utf-8"));
} catch (error) {
  console.error("❌ ERROR leyendo usuarios.json:", error);
  return res.status(500).json({ error: "Error leyendo usuarios" });
}

const usuario = usuarios.find(
  (u) => u.email === email && u.password === password
);

if (usuario) {
  return res.json({
    success: true,
    empresa: usuario.empresa,
    rol: usuario.rol
  });
}

return res.status(401).json({
  success: false,
  message: "Credenciales incorrectas"
});
```

} catch (error) {
console.error("❌ ERROR GENERAL LOGIN:", error);
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

```
const prompt = `
```

Eres un técnico IT experto pero explicas TODO de forma MUY SIMPLE.

Usuario dice:
"${problema}"

Responde en JSON:
{
"problema": "explicación clara",
"tipo": "tipo sencillo",
"solucion": "pasos fáciles"
}
`;

```
const completion = await openai.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [{ role: "user", content: prompt }]
});

let respuesta = completion.choices[0].message.content;

const match = respuesta.match(/\{[\s\S]*\}/);

let resultado;

try {
  resultado = match ? JSON.parse(match[0]) : null;
} catch {
  resultado = null;
}

if (!resultado) {
  resultado = {
    problema,
    tipo: "Desconocido",
    solucion: "No se pudo procesar"
  };
}

// 💾 HISTORIAL SEGURO
let historial = [];

try {
  historial = JSON.parse(fs.readFileSync("historial.json", "utf-8"));
} catch {
  historial = [];
}

historial.push({
  ...resultado,
  empresa,
  fecha: new Date()
});

fs.writeFileSync("historial.json", JSON.stringify(historial, null, 2));

res.json(resultado);
```

} catch (error) {
console.error("❌ ERROR IA:", error);
res.status(500).json({ error: "Error en IA" });
}
});

// ===============================
// 📊 HISTORIAL
// ===============================
app.get("/historial", (req, res) => {
try {
const empresa = req.headers["empresa"] || "demo";

```
let historial = [];

try {
  historial = JSON.parse(fs.readFileSync("historial.json", "utf-8"));
} catch {
  historial = [];
}

const filtrado = historial.filter(h => h.empresa === empresa);

res.json(filtrado);
```

} catch (error) {
console.error("❌ ERROR HISTORIAL:", error);
res.json([]);
}
});

// ===============================
// 📧 ESCALAR
// ===============================
app.post("/escalar", async (req, res) => {
try {
const empresa = req.headers["empresa"] || "demo";

```
const mensaje = `
```

🚨 NUEVO CASO ESCALADO

Empresa: ${empresa}
Problema: ${req.body.problema}
Tipo: ${req.body.tipo}

Solución:
${req.body.solucion}
`;

```
await enviarCorreoSoporte("Nuevo caso escalado", mensaje);

res.json({ success: true });
```

} catch (error) {
console.error("❌ ERROR CORREO:", error);
res.status(500).json({ error: "Error enviando correo" });
}
});

// ===============================
// 🔥 SERVIDOR
// ===============================
app.listen(PORT, () => {
console.log(`🔥 Servidor corriendo en puerto ${PORT}`);
});
