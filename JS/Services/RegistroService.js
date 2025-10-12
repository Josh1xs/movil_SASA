// ===============================
// ClienteRegistroService.js (Heroku)
// ===============================

const API_URL = "https://sasaapi-73d5de493985.herokuapp.com/auth/cliente";

// ------------------ VALIDACIONES ------------------

export function normalizeName(v) {
  return v.normalize("NFKC").replace(/\s+/g, " ").trim();
}

export function nameValid(v) {
  if (!v) return false;
  const t = normalizeName(v);
  return t.length >= 2 && /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]+$/.test(t);
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
  if (pass.length >= 8) fuerza++;
  if (/[A-Z]/.test(pass)) fuerza++;
  if (/[a-z]/.test(pass)) fuerza++;
  if (/[0-9]/.test(pass)) fuerza++;
  if (/[^A-Za-z0-9]/.test(pass)) fuerza++;
  if (fuerza <= 2) return "Baja";
  if (fuerza <= 4) return "Media";
  return "Alta";
}

// ------------------ REGISTRO ------------------

export async function registrarCliente(cliente) {
  try {
    const res = await fetch(`${API_URL}/register`, { // ✅ correcto
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

    return await res.json();
  } catch (error) {
    console.error("❌ Error al registrar cliente:", error);
    throw error;
  }
}

// ------------------ VALIDAR DUPLICADOS ------------------

export async function validarDuplicados(correo, dui) {
  try {
    const res = await fetch(`${API_URL}/consultar`);
    if (!res.ok) return { correoExiste: false, duiExiste: false };

    const data = await res.json();

    const correoExiste =
      Array.isArray(data) &&
      data.some((u) => u.correo?.toLowerCase() === correo.toLowerCase());

    const duiExiste =
      Array.isArray(data) &&
      data.some((u) => String(u.dui) === String(dui));

    return { correoExiste, duiExiste };
  } catch (error) {
    console.error("❌ Error al validar duplicados:", error);
    return { correoExiste: false, duiExiste: false };
  }
}
