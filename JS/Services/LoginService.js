// ===============================
// LoginService.js
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

    // 🔍 Debug: ver respuesta del backend
    console.log("Respuesta del login:", json);

    if (!res.ok || json.status !== "OK") {
      throw new Error(json.message || "Credenciales incorrectas");
    }

    // ✅ Guardar datos en localStorage
    localStorage.setItem("user", JSON.stringify(json.cliente));
localStorage.setItem("userId", json.cliente.id);  // 👈 usa id correcto
    localStorage.setItem("token", json.token);

    // 🔍 Debug: ver qué quedó guardado
    console.log("Guardado en localStorage:");
    console.log("userId:", localStorage.getItem("userId"));
    console.log("token:", localStorage.getItem("token"));
    console.log("user:", localStorage.getItem("user"));

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
