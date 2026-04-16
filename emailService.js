import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function enviarCorreoSoporte(problema, usuario) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_TECNICO,
      subject: "🚨 Nuevo caso de soporte - FixIT AI",
      html: `
        <h2>Nuevo caso escalado</h2>
        <p><strong>Usuario:</strong> ${usuario}</p>
        <p>${problema}</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("📩 Correo enviado correctamente");
  } catch (error) {
    console.error("❌ Error enviando correo:", error);
  }
}