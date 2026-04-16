import dotenv from "dotenv";
import { enviarCorreoSoporte } from "./emailService.js";

dotenv.config();

enviarCorreoSoporte("Prueba de problema desde FixIT AI", "Andres");