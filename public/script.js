// ===============================
// BASE URL (Render o local)
// ===============================
const API = ""; // deja vacío si frontend y backend están juntos

// ===============================
// LOGIN
// ===============================
async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const res = await fetch(API + "/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (data.success) {
      // 🔐 guardar token
      localStorage.setItem("token", data.token);

      // 🚀 redirigir
      window.location.href = "app.html";
    } else {
      alert(data.message || "Error en login");
    }

  } catch (error) {
    console.error("Error login:", error);
    alert("Error conectando con el servidor");
  }
}

// ===============================
// OBTENER TOKEN
// ===============================
function getToken() {
  return localStorage.getItem("token");
}

// ===============================
// VALIDAR SESIÓN
// ===============================
function checkAuth() {
  const token = getToken();

  if (!token) {
    window.location.href = "login.html";
  }
}

// ===============================
// LOGOUT
// ===============================
function logout() {
  localStorage.removeItem("token");
  window.location.href = "login.html";
}

// ===============================
// ANALIZAR PROBLEMA (IA)
// ===============================
async function analizarProblema() {
  const problema = document.getElementById("problema").value;

  if (!problema) {
    alert("Escribe un problema");
    return;
  }

  try {
    const res = await fetch(API + "/analizar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + getToken()
      },
      body: JSON.stringify({ problema })
    });

    const data = await res.json();

    document.getElementById("resultado").innerHTML = `
      <h3>Problema:</h3>
      <p>${data.problema}</p>

      <h3>Tipo:</h3>
      <p>${data.tipo}</p>

      <h3>Solución:</h3>
      <p>${data.solucion}</p>
    `;

    // guardar último resultado para escalar
    window.ultimoResultado = data;

  } catch (error) {
    console.error("Error IA:", error);
    alert("Error al analizar");
  }
}

// ===============================
// CARGAR HISTORIAL
// ===============================
async function cargarHistorial() {
  try {
    const res = await fetch(API + "/historial", {
      headers: {
        "Authorization": "Bearer " + getToken()
      }
    });

    const data = await res.json();

    const contenedor = document.getElementById("historial");

    contenedor.innerHTML = "";

    data.reverse().forEach(item => {
      const div = document.createElement("div");

      div.innerHTML = `
        <hr>
        <p><strong>Problema:</strong> ${item.problema}</p>
        <p><strong>Tipo:</strong> ${item.tipo}</p>
        <p><strong>Solución:</strong> ${item.solucion}</p>
        <small>${new Date(item.fecha).toLocaleString()}</small>
      `;

      contenedor.appendChild(div);
    });

  } catch (error) {
    console.error("Error historial:", error);
  }
}

// ===============================
// ESCALAR CASO (EMAIL)
// ===============================
async function escalarCaso() {
  if (!window.ultimoResultado) {
    alert("Primero analiza un problema");
    return;
  }

  try {
    const res = await fetch(API + "/escalar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + getToken()
      },
      body: JSON.stringify(window.ultimoResultado)
    });

    const data = await res.json();

    if (data.success) {
      alert("Caso escalado correctamente 🚀");
    } else {
      alert("Error al escalar");
    }

  } catch (error) {
    console.error("Error escalar:", error);
    alert("Error enviando correo");
  }
}

// ===============================
// AUTO INIT (cuando carga app.html)
// ===============================
window.addEventListener("DOMContentLoaded", () => {
  if (window.location.pathname.includes("app.html")) {
    checkAuth();
    cargarHistorial();
  }
});