const API_URL = "http://localhost:8080/apiUsuario";

export async function login(nombreUsuario, contrasena) {
  try {
    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombreUsuario, contrasena })
    });

    const json = await res.json();

    if (!res.ok || json.status !== "success") {
      throw new Error(json.message || "Error en login");
    }

    return json; // {status, data, message}
  } catch (error) {
    console.error("Error en login:", error);
    throw error;
  }
}

export function getUsuarioLogueado() {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
}

export function logout() {
  localStorage.removeItem("user");
  window.location.href = "../login/login.html";
}

export function isLoggedIn() {
  return localStorage.getItem("user") !== null;
}
