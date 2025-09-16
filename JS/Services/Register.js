// ===============================
// ClienteRegistroService.js
// ===============================

const API_URL = "http://localhost:8080/auth/cliente"; // 👈 cambia si tu endpoint es otro

// -------- Validar email --------
export function validEmail(e) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

// -------- Validar mayoría de edad --------
export function isAdult(dateStr) {
  if (!dateStr) return false;
  const h = new Date();
  const d = new Date(dateStr);
  let age = h.getFullYear() - d.getFullYear();
  const m = h.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && h.getDate() < d.getDate())) age--;
  return age >= 18;
}

// -------- Normalizar y validar nombre --------
export function normalizeName(v) {
  return v.normalize("NFKC").replace(/\s+/g, " ").trim();
}

export function nameValid(v) {
  if (!v) return false;
  const t = normalizeName(v);
  if (t.length < 2) return false;
  return /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]+$/.test(t);
}

// -------- Crear cliente --------
export async function registrarCliente(cliente) {
  const res = await fetch(`${API_URL}/registro`, {
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

  return res.json();
}

// -------- Validar si correo o DUI existen --------
export async function validarDuplicados(correo, dui) {
  const res = await fetch(`${API_URL}/consultar`);
  if (!res.ok) return { correoExiste: false, duiExiste: false };

  const data = await res.json();
  const correoExiste = Array.isArray(data) && data.some((u) => u.correo?.toLowerCase() === correo.toLowerCase());
  const duiExiste = Array.isArray(data) && data.some((u) => String(u.dui) === dui);

  return { correoExiste, duiExiste };
}
