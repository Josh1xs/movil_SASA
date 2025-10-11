
const API_BASE = "https://sasaapi-73d5de493985.herokuapp.com";
const API_URL = `${API_BASE}/auth/cliente`;

export async function login(correo, contrasena) {
  try {
    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correo, contrasena }),
    });

    const json = await res.json();
    console.log("📩 Respuesta login:", json);

    if (!res.ok || !json.token) {
      throw new Error(json.message || "Credenciales incorrectas");
    }


    localStorage.setItem("user", JSON.stringify(json.cliente));
    localStorage.setItem("userId", json.cliente.idCliente || json.cliente.id);
    localStorage.setItem("token", json.token);

    console.log("✅ Token guardado:", json.token.substring(0, 20) + "...");
    return json;
  } catch (error) {
    console.error("Error en login:", error);
    throw error;
  }
}


export function logout() {
  ["user", "userId", "token"].forEach((k) => localStorage.removeItem(k));


  if (window.location.pathname.includes("Autenticacion")) {
    window.location.href = "login.html";
  } else {
    window.location.href = "../Autenticacion/login.html";
  }
}


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
  return !!getToken() && !!getUsuarioLogueado();
}


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
