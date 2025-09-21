// ===============================
// ClienteRegistroService.js (dinámico)
// ===============================

// Detectar host dinámico
let API_BASE;

if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
  API_BASE = "http://localhost:8080";
} else if (window.location.hostname === "10.0.2.2") {
  API_BASE = "http://10.0.2.2:8080"; // Emulador Android
} else {
  API_BASE = "https://mi-backend-produccion.com"; // 👈 cámbialo en producción
}

const API_URL = `${API_BASE}/auth/cliente`;

// -------- Normalizar / Validaciones --------
export function normalizeName(v) {
  return v.normalize("NFKC").replace(/\s+/g, " ").trim();
}

export function nameValid(v) {
  if (!v) return false;
  const t = normalizeName(v);
  if (t.length < 2) return false;
  return /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]+$/.test(t);
}

export function validEmail(e) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

export function isAdult(dateStr) {
  if (!dateStr) return false;
  const h = new Date();
  const d = new Date(dateStr);
  let age = h.getFullYear() - d.getFullYear();
  const m = h.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && h.getDate() < d.getDate())) age--;
  return age >= 18;
}

export function validDUI(dui) {
  return /^\d{8}-\d{1}$/.test(dui);
}

export function passwordStrength(pass) {
  let fuerza = 0;

  if (pass.length >= 8) fuerza++;           // mínimo 8 caracteres
  if (/[A-Z]/.test(pass)) fuerza++;         // mayúscula
  if (/[a-z]/.test(pass)) fuerza++;         // minúscula
  if (/[0-9]/.test(pass)) fuerza++;         // número
  if (/[^A-Za-z0-9]/.test(pass)) fuerza++;  // símbolo

  if (fuerza <= 2) return "Baja";
  if (fuerza <= 4) return "Media";
  return "Alta";
}

// -------- Registrar Cliente --------
export async function registrarCliente(cliente) {
  const res = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cliente),
  });

  if (!res.ok) {
    let err = {};
    try {
      err = await res.json();
    } catch {}
    throw new Error(err.message || "Error al registrar cliente");
  }

  return res.json(); // {status, cliente, token?}
}
