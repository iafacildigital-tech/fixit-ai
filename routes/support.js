import express from "express";
import { enviarCorreoSoporte } from "../emailService.js";

const router = express.Router();

// 🔹 Simulación de tu función de IA (ajusta si ya tienes una)
async function obtenerRespuestaIA(problema) {
  // Aquí va tu integración real con OpenAI
  // Por ahora simulamos comportamiento

  if (problema.toLowerCase().includes("no tengo internet")) {
    return "Intenta reiniciar el router y verificar cables.";
  }

  // Caso donde no puede resolver
  return "Lo siento, no pude resolver tu problema automáticamente.";
}

// 🔹 Ruta principal de soporte
router.post("/", async (req, res) => {
  try {
    const { mensaje, usuario } = req.body;

    // 1. Obtener respuesta de la IA
    const respuestaIA = await obtenerRespuestaIA(mensaje);

    // 2. Validar si no pudo resolver
    if (respuestaIA.toLowerCase().includes("no pude")) {
      await enviarCorreoSoporte(mensaje, usuario || "Usuario desconocido");
    }

    // 3. Responder al frontend
    res.json({
      ok: true,
      respuesta: respuestaIA,
    });

  } catch (error) {
    console.error("❌ Error en soporte:", error);

    res.status(500).json({
      ok: false,
      mensaje: "Error procesando la solicitud",
    });
  }
});

export default router;