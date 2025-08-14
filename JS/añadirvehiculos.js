// ================== CONFIG ==================
const API_URL = "https://retoolapi.dev/4XQf28/anadirvehiculo";
const API_USER_BASE = "https://retoolapi.dev/DeaUI0/registro/";

// ================== HELPERS =================
const $ = (id) => document.getElementById(id);
const toISODate = (d) => d.toISOString().slice(0, 10);
const toHHMM = (d) => d.toTimeString().slice(0, 5);

// Tamaño aprox del dataURL en KB
function dataUrlKB(dataUrl) {
  if (!dataUrl) return 0;
  const head = "base64,";
  const i = dataUrl.indexOf(head);
  const b64 = i >= 0 ? dataUrl.slice(i + head.length) : dataUrl;
  const bytes = Math.ceil((b64.length * 3) / 4);
  return Math.round(bytes / 1024);
}

// Cargar imagen desde dataURL
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// Dibujar a canvas con tamaño/calidad
function renderToCanvas(img, w, h, quality) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  // fondo blanco por si la img tiene transparencia
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(img, 0, 0, w, h);
  return canvas.toDataURL("image/jpeg", quality);
}

// Intentar reducir hasta maxKB. Si no se logra, devolver ""
async function shrinkToLimit(dataUrl, maxKB = 45) {
  try {
    let img = await loadImage(dataUrl);
    let w = img.width, h = img.height;

    // Escalas y calidades progresivas (rápido y efectivo)
    const widths = [900, 720, 600, 480, 360, 280, 220, 180, 150];
    const qualities = [0.82, 0.72, 0.65, 0.6, 0.55, 0.5, 0.45, 0.4, 0.35, 0.3];

    // Si ya cumple, devolver sin tocar
    if (dataUrlKB(dataUrl) <= maxKB) return dataUrl;

    for (const target of widths) {
      const ratio = Math.min(1, target / w, target / h);
      const nw = Math.max(1, Math.round(w * ratio));
      const nh = Math.max(1, Math.round(h * ratio));
      for (const q of qualities) {
        const out = renderToCanvas(img, nw, nh, q);
        if (dataUrlKB(out) <= maxKB) return out;
      }
    }
  } catch (e) {
    console.warn("shrinkToLimit error:", e);
  }
  return ""; // demasiado grande o error: devolver vacío para evitar 400
}

// Validación de campos
function validarCampos({ marca, modelo, color, placa, vin }) {
  const soloTexto = /^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]{2,}$/;
  const textoConNumeros = /^[A-Za-zÁÉÍÓÚáéíóúñÑ0-9\s-]{2,}$/;
  const formatoPlaca = /^[A-Z]{0,3}-?\d{3,6}$/;
  const formatoVIN = /^[A-HJ-NPR-Z0-9]{6,17}$/i;

  if (!soloTexto.test(marca)) return "Marca inválida. Solo letras (mín. 2).";
  if (!textoConNumeros.test(modelo)) return "Modelo inválido. Letras o números (mín. 2).";
  if (!soloTexto.test(color)) return "Color inválido. Solo letras.";
  if (!formatoPlaca.test(placa)) return "Placa inválida. Ej: P123456 o P123-456.";
  if (vin && !formatoVIN.test(vin)) return "VIN inválido (6–17 caracteres).";
  return null;
}

// ================== Uploader =================
const fotoInput = $("fotoInput");
const fotoPreview = $("fotoPreview");
const fotoData = $("fotoData");

// Compresión inicial para preview (rápida)
function compressForPreview(file) {
  return new Promise((resolve) => {
    const fr = new FileReader();
    fr.onload = async () => {
      try {
        const img = await loadImage(fr.result);
        const ratio = Math.min(900 / img.width, 900 / img.height, 1);
        const w = Math.round(img.width * ratio);
        const h = Math.round(img.height * ratio);
        const out = renderToCanvas(img, w, h, 0.82);
        resolve(out);
      } catch {
        resolve(fr.result); // fallback
      }
    };
    fr.onerror = () => resolve("");
    fr.readAsDataURL(file);
  });
}

function setPreview(dataUrl) {
  if (dataUrl) {
    fotoData.value = dataUrl;
    fotoPreview.style.backgroundImage = `url('${dataUrl}')`;
    fotoPreview.classList.add("has-img");
    fotoPreview.innerHTML = "&nbsp;";
  } else {
    fotoData.value = "";
    fotoPreview.style.backgroundImage = "none";
    fotoPreview.classList.remove("has-img");
    fotoPreview.innerHTML = `<i class="fa-regular fa-image"></i><span>Subir imagen</span>`;
    if (fotoInput) fotoInput.value = "";
  }
}

function setupUploader() {
  $("btnCambiarFoto")?.addEventListener("click", () => fotoInput?.click());
  $("btnQuitarFoto")?.addEventListener("click", () => setPreview(null));
  fotoPreview?.addEventListener("click", () => fotoInput?.click());
  fotoPreview?.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") fotoInput?.click();
  });

  fotoInput?.addEventListener("change", async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await compressForPreview(file);
    setPreview(dataUrl || null);
  });
}

// ================== Sidebar / Nav =================
function setupSidebar() {
  const overlay = $("overlay");
  const profileMenu = $("profileMenu");
  const closeMenu = $("closeMenu");
  const menuToggle = $("menuToggle");
  const menuToggleBottom = $("menuToggleBottom");

  [menuToggle, menuToggleBottom].forEach((btn) => {
    if (!btn) return;
    btn.addEventListener("click", () => {
      btn.classList.add("spin");
      setTimeout(() => btn.classList.remove("spin"), 600);
      profileMenu?.classList.add("open");
      overlay?.classList.add("show");
    });
  });

  function cerrar() {
    profileMenu?.classList.remove("open");
    overlay?.classList.remove("show");
  }
  closeMenu?.addEventListener("click", cerrar);
  overlay?.addEventListener("click", cerrar);

  const logoutBtn = $("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      ["userId", "nombre", "name", "email", "pase", "authToken", "token", "refreshToken"].forEach((k) =>
        localStorage.removeItem(k)
      );
      sessionStorage.clear();
      document.cookie = "authToken=; Max-Age=0; path=/";
      location.replace(logoutBtn.getAttribute("href") || "../Authenticator/login.html");
    });
  }
}

// ================== INIT =================
document.addEventListener("DOMContentLoaded", init);

async function init() {
  setupSidebar();
  setupUploader();
  setupButtonsFX();

  // Usuario en sidebar
  const userId = localStorage.getItem("userId") || "";
  if ($("menuUserId")) $("menuUserId").textContent = userId || "Desconocido";
  if (userId) {
    try {
      const u = await fetch(API_USER_BASE + userId).then((r) => r.json());
      $("menuNombre").textContent = `${u?.nombre ?? ""} ${u?.apellido ?? ""}`.trim() || "Usuario";
      $("menuPase").textContent = u?.pase || "Cliente";
    } catch {}
  }

  const editarId = localStorage.getItem("vehiculoEditarId");
  if (editarId) {
    // EDITAR
    const titleEl = $("pageTitle");
    const submitBtn = $("submitBtn");
    if (titleEl) titleEl.textContent = "Editar Vehículo";
    if (submitBtn) submitBtn.textContent = "Actualizar";
    await loadVehicleForEdit(editarId);
  } else {
    // NUEVO
    ensureNowTimestamps();
    setPreview(null);
  }

  $("formVehiculo")?.addEventListener("reset", () => {
    setTimeout(() => {
      setPreview(null);
      if (!localStorage.getItem("vehiculoEditarId")) ensureNowTimestamps();
    }, 0);
  });

  $("formVehiculo")?.addEventListener("submit", onSubmit);
}

// Cargar datos para edición (sin usar 'data' fuera del scope)
async function loadVehicleForEdit(id) {
  try {
    const resp = await fetch(`${API_URL}/${id}`);
    if (!resp.ok) throw new Error("No se pudo cargar el vehículo");
    const veh = await resp.json();

    $("marca").value = veh.marca || "";
    $("modelo").value = veh.modelo || "";
    $("color").value = veh.color || "";
    $("placa").value = veh.placa || "";
    $("vin").value = veh.vin || "";
    $("descripcion").value = veh.descripcion || "";
    $("tipoMantenimiento").value = veh.tipoMantenimiento || "";

    if (veh.foto) setPreview(veh.foto);
    else setPreview(null);

    if (veh.fechaRegistro) {
      $("fechaRegistro").value = veh.fechaRegistro;
      $("fechaRegistroVis").value = veh.fechaRegistro;
    }
    if (veh.horaRegistro) {
      $("horaRegistro").value = veh.horaRegistro;
      $("horaRegistroVis").value = veh.horaRegistro;
    }
  } catch (err) {
    console.error(err);
    Swal.fire("Error", "No se pudieron cargar los datos", "error");
  }
}

function ensureNowTimestamps() {
  const now = new Date();
  $("fechaRegistro").value = toISODate(now);
  $("horaRegistro").value = toHHMM(now);
  $("fechaRegistroVis").value = toISODate(now);
  $("horaRegistroVis").value = toHHMM(now);
}

// ================== SUBMIT =================
async function onSubmit(e) {
  e.preventDefault();

  const editarId = localStorage.getItem("vehiculoEditarId");

  const marca = $("marca").value.trim();
  const modelo = $("modelo").value.trim();
  const color = $("color").value.trim();
  const placa = $("placa").value.trim().toUpperCase();
  const vin = $("vin").value.trim().toUpperCase();
  const descripcion = $("descripcion").value.trim();
  const tipoMantenimiento = $("tipoMantenimiento").value;
  const idCliente = localStorage.getItem("userId") || "";

  if (!editarId) {
    // En nuevo, timestamps exactos al enviar
    ensureNowTimestamps();
  }
  const fechaRegistro = $("fechaRegistro").value;
  const horaRegistro = $("horaRegistro").value;

  const error = validarCampos({ marca, modelo, color, placa, vin });
  if (error) return Swal.fire("Error", error, "error");

  // Foto: reducir a <= 45 KB para evitar 400 de Retool
  let fotoFinal = fotoData.value || "";
  if (fotoFinal) {
    fotoFinal = await shrinkToLimit(fotoFinal, 45);
    if (!fotoFinal) {
      await Swal.fire({
        icon: "info",
        title: "Imagen omitida",
        text: "La imagen era muy pesada y se guardará sin foto.",
        confirmButtonColor: "#c91a1a",
      });
    }
  }

  const payload = {
    marca,
    modelo,
    color,
    placa,
    vin,
    descripcion,
    idCliente,
    fechaRegistro,
    horaRegistro,
    tipoMantenimiento,
    foto: fotoFinal, // <= 45 KB o vacío
  };

  try {
    const url = editarId ? `${API_URL}/${editarId}` : API_URL;
    const method = editarId ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const msg = await res.text().catch(() => "");
      throw new Error(`API ${res.status}: ${msg}`);
    }

    if (editarId) localStorage.removeItem("vehiculoEditarId");

    Swal.fire(
      editarId ? "Actualizado" : "Guardado",
      `Vehículo ${editarId ? "actualizado" : "agregado"} correctamente`,
      "success"
    ).then(() => (location.href = "Vehiculos.html"));
  } catch (err) {
    console.error(err);
    Swal.fire("Error", "Hubo un problema al guardar los datos", "error");
  }
}

// ================== FX botones =================
function setupButtonsFX() {
  document.querySelectorAll(".btn.modern").forEach((btn) => {
    btn.addEventListener("pointermove", (e) => {
      const rect = btn.getBoundingClientRect();
      btn.style.setProperty("--x", `${e.clientX - rect.left}px`);
      btn.style.setProperty("--y", `${e.clientY - rect.top}px`);
    });
  });
}
