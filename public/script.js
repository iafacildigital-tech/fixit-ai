// ===============================
// 💬 MOSTRAR MENSAJES
// ===============================
function agregarMensaje(texto, tipo) {

  const chat = document.getElementById("chat");

  const div = document.createElement("div");
  div.className = "msg " + tipo;
  div.innerHTML = texto;

  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

// ===============================
// 🚀 FUNCIÓN PRINCIPAL
// ===============================
async function enviar() {

  const problema = document.getElementById("problema").value;
  const img = document.getElementById("imagen").files[0];

  if (!problema && !img) return;

  // Mostrar mensaje usuario
  agregarMensaje(problema || "📷 Imagen enviada", "user");

  // Loader
  const loader = document.createElement("div");
  loader.className = "msg bot";
  loader.innerHTML = `<div class="loader"></div>`;
  chat.appendChild(loader);

  // Obtener empresa
  const empresa = localStorage.getItem("empresa") || "demo";

  // Preparar datos
  const fd = new FormData();
  fd.append("problema", problema);
  if (img) fd.append("imagen", img);

  // ===============================
  // 📡 ENVIAR AL BACKEND
  // ===============================
  const res = await fetch("/analizar", {
    method: "POST",
    headers: {
      "empresa": empresa
    },
    body: fd
  });

  const data = await res.json();

  loader.remove();

  // ===============================
  // 🤖 MOSTRAR RESPUESTA
  // ===============================
  const mensaje = `
🔍 Problema: ${data.problema}<br>
🧠 Tipo: ${data.tipo}<br>
🛠️ Solución:<br>${data.solucion.replace(/\n/g,"<br>")}
`;

  agregarMensaje(mensaje, "bot");

  // ===============================
  // ❌ BOTÓN ESCALAR
  // ===============================
  const btn = document.createElement("button");
  btn.innerText = "❌ No funcionó";

  btn.onclick = async () => {

    await fetch("/escalar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "empresa": empresa
      },
      body: JSON.stringify(data)
    });

    agregarMensaje("📧 Escalado a soporte técnico", "bot");
  };

  document.getElementById("chat").appendChild(btn);
}