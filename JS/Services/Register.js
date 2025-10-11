
const API_URL = "https://sasaapi-73d5de493985.herokuapp.com/auth/cliente";


export function validEmail(e) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}


export function isAdult(dateStr) {
  if (!dateStr) return false;
  const hoy = new Date();
  const nacimiento = new Date(dateStr);
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
  return edad >= 18;
}


export function normalizeName(v) {
  return v.normalize("NFKC").replace(/\s+/g, " ").trim();
}

export function nameValid(v) {
  if (!v) return false;
  const t = normalizeName(v);
  return t.length >= 2 && /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]+$/.test(t);
}


export async function registrarCliente(cliente) {
  try {
    const res = await fetch(`${API_URL}/registro`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cliente),
    });

    const json = await res.json();

    if (!res.ok) {
      throw new Error(json.message || "Error al registrar cliente");
    }

    return json;
  } catch (error) {
    console.error(" Error al registrar cliente:", error);
    throw error;
  }
}


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
