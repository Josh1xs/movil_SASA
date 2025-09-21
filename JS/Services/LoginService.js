// ===============================
// Services/LoginService.js
// ===============================

// Detectar el host dinámicamente
let API_BASE;

if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
  // PC navegador
  API_BASE = "http://localhost:8080";
} else if (window.location.hostname === "10.0.2.2") {
  // Emulador Android
  API_BASE = "http://10.0.2.2:8080";
} else {
  // Producción (ejemplo Vercel / dominio real)
  API_BASE = "https://mi-backend-produccion.com"; // 👈 cámbialo cuando subas
}

const API_URL = `${API_BASE}/auth/cliente`;

// -------------------------------
// LOGIN
// -------------------------------
export async function login(correo, contrasena) {
  try {
    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correo, contrasena }),
    });

    const json = await res.json();

    console.log("Respuesta del login:", json);

    if (!res.ok || json.status !== "OK" || !json.token) {
      throw new Error(json.message || "Credenciales incorrectas");
    }

    // ✅ Guardar datos en localStorage
    localStorage.setItem("user", JSON.stringify(json.cliente));
    localStorage.setItem("userId", json.cliente.id);   // asegúrate que el backend manda `id`
    localStorage.setItem("token", json.token);

    console.log("Token guardado:", json.token.substring(0, 20) + "...");
    return json; // {status, token, cliente}
  } catch (error) {
    console.error("Error en login:", error);
    throw error;
  }
}

// -------------------------------
// LOGOUT
// -------------------------------
export function logout() {
  ["user", "userId", "token"].forEach((k) => localStorage.removeItem(k));
  window.location.href = "../Autenticacion/login.html";
}

// -------------------------------
// GETTERS
// -------------------------------
export function getUsuarioLogueado() {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
}

export function getUserId() {
  return localStorage.getItem("userId");
}

export function getToken() {
  return localStorage.getItem("token");
}

export function isLoggedIn() {
  return (
    localStorage.getItem("user") !== null &&
    localStorage.getItem("token") !== null
  );
}

// -------------------------------
// HANDLER DE 401 GLOBAL
// -------------------------------
export async function fetchWithAuth(url, options = {}) {
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(url, { ...options, headers });

  if (res.status === 401) {
    logout();
    Swal.fire("Sesión expirada", "Debes iniciar sesión nuevamente", "warning");
    throw new Error("401 - Sesión expirada");
  }

  return res;
}
