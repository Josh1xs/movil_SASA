// ===============================
// Services/LoginService.js
// ===============================

const API_URL = "http://localhost:8080/auth/cliente";

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

    // 🔍 Debug
    console.log("Respuesta del login:", json);

    if (!res.ok || json.status !== "OK" || !json.token) {
      throw new Error(json.message || "Credenciales incorrectas");
    }

    // ✅ Guardar datos en localStorage
    localStorage.setItem("user", JSON.stringify(json.cliente));
    localStorage.setItem("userId", json.cliente.id);   // 👈 confirma que en backend sea `id`
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
    // Sesión expirada → limpiar y mandar al login
    logout();
    Swal.fire("Sesión expirada", "Debes iniciar sesión nuevamente", "warning");
    throw new Error("401 - Sesión expirada");
  }

  return res;
}
