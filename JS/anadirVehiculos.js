import { createVehiculo, updateVehiculo, getVehiculoById, existsPlaca } from "./Services/VehiculoService.js";

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

function openMenu() {
  const m = $("#profileMenu");
  const o = $("#overlay");
  m?.classList.add("open");
  m?.setAttribute("aria-hidden", "false");
  o?.classList.add("show");
  o?.setAttribute("aria-hidden", "false");
}
function closeMenu() {
  const m = $("#profileMenu");
  const o = $("#overlay");
  m?.classList.remove("open");
  m?.setAttribute("aria-hidden", "true");
  o?.classList.remove("show");
  o?.setAttribute("aria-hidden", "true");
}
function hydrateMenu() {
  try {
    const u = JSON.parse(localStorage.getItem("user") || "null");
    if (u) {
      $("#menuNombre").textContent = u.nombre || u.username || "Usuario";
      $("#menuPase").textContent = u.rol || "Cliente";
      $("#menuUserId").textContent = u.id ?? u.userId ?? "Desconocido";
    }
  } catch {}
}
function markTabActive() {
  const path = location.pathname.toLowerCase();
  $$(".tabbar__btn").forEach((b) => {
    const href = b.getAttribute("href") || "";
    if (path.endsWith(href.replace("../", "").toLowerCase())) b.classList.add("active");
    else b.classList.remove("active");
  });
}
function onlyLettersAndDigits(v) {
  return v.replace(/[^a-zA-Z0-9]/g, "");
}
function onlyDigits(v) {
  return v.replace(/\D/g, "");
}
function formatPlacaSV(value) {
  let d = onlyDigits(value).slice(0, 7);
  if (d.length <= 4) return d;
  return d.slice(0, 4) + "-" + d.slice(4);
}
function validateVIN(inputEl, errorEl) {
  let raw = onlyLettersAndDigits(inputEl.value).toUpperCase();
  raw = raw.replace(/[IOQ]/g, "");
  inputEl.value = raw.slice(0, 17);
  const ok = inputEl.value.length === 17;
  inputEl.classList.toggle("invalid", !ok);
  if (errorEl) {
    errorEl.style.display = ok ? "none" : "block";
    errorEl.textContent = ok ? "" : "El VIN debe tener exactamente 17 caracteres (sin I, O, Q).";
  }
  return ok;
}
async function validatePlaca(inputEl, errorEl, editId = null) {
  const formatted = formatPlacaSV(inputEl.value);
  inputEl.value = formatted;
  let ok = /^\d{4}-\d{3}$/.test(formatted);
  if (ok) {
    try {
      const yaExiste = await existsPlaca(formatted);
      if (yaExiste && !editId) {
        ok = false;
        errorEl.textContent = "La placa ya está registrada.";
        errorEl.style.display = "block";
      } else {
        errorEl.style.display = "none";
      }
    } catch {
      ok = false;
      errorEl.textContent = "Error al verificar placa.";
      errorEl.style.display = "block";
    }
  } else {
    errorEl.textContent = "La placa debe ser 1234-567.";
    errorEl.style.display = "block";
  }
  inputEl.classList.toggle("invalid", !ok);
  return ok;
}
async function confirmReset() {
  const r = await Swal.fire({
    title: "¿Limpiar formulario?",
    text: "Se borrarán todos los campos.",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Sí, limpiar",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#c91a1a",
  });
  return r.isConfirmed;
}
document.addEventListener("DOMContentLoaded", async () => {
  const form = $("#formVehiculo");
  const btnGuardar = form.querySelector(".btn.primary");
  const btnLimpiar = $("#btnLimpiar");
  const userId = localStorage.getItem("userId");
  const vinEl = $("#vin");
  const placaEl = $("#placa");
  const vinErr = $(".vin-error");
  const placaErr = $(".placa-error");
  const menuBtn = $("#menuToggle");
  const spin = (el) => {
    el?.classList.add("spin");
    setTimeout(() => el?.classList.remove("spin"), 600);
  };
  menuBtn?.addEventListener("click", () => {
    spin(menuBtn);
    openMenu();
  });
  $("#closeMenu")?.addEventListener("click", () => {
    spin(menuBtn);
    closeMenu();
  });
  $("#overlay")?.addEventListener("click", () => {
    spin(menuBtn);
    closeMenu();
  });
  $("#logoutBtn")?.addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  });
  $("#backBtn")?.addEventListener("click", (e) => {
    e.preventDefault();
    location.href = "./Vehiculos.html";
  });
  hydrateMenu();
  markTabActive();
  const params = new URLSearchParams(window.location.search);
  const editId = params.get("id");
  if (editId) {
    $(".page-title").textContent = "Editar Vehículo";
    btnGuardar.textContent = "Actualizar";
    try {
      const v = await getVehiculoById(editId);
      $("#marca").value = v.marca || "";
      $("#modelo").value = v.modelo || "";
      $("#anio").value = v.anio || "";
      $("#placa").value = v.placa || "";
      $("#vin").value = v.vin || "";
      $("#estado").value = v.idEstado || "";
    } catch {
      await Swal.fire("Error", "No se pudieron cargar los datos del vehículo", "error");
    }
  }
  vinEl.addEventListener("input", () => validateVIN(vinEl, vinErr));
  placaEl.addEventListener("blur", () => validatePlaca(placaEl, placaErr, editId));
  btnLimpiar?.addEventListener("click", async (e) => {
    e.preventDefault();
    if (await confirmReset()) {
      form.reset();
      vinErr.style.display = "none";
      placaErr.style.display = "none";
      vinEl.classList.remove("invalid");
      placaEl.classList.remove("invalid");
    }
  });
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!userId) {
      await Swal.fire("Error", "Debes iniciar sesión", "error");
      return;
    }
    const okVIN = validateVIN(vinEl, vinErr);
    const okPlaca = await validatePlaca(placaEl, placaErr, editId);
    const anio = parseInt($("#anio").value, 10);
    const withinYear = anio >= 1980 && anio <= 2099;
    $("#anio").classList.toggle("invalid", !withinYear);
    if (!okVIN || !okPlaca || !withinYear || !$("#marca").value.trim() || !$("#modelo").value.trim() || !$("#estado").value) {
      await Swal.fire("Error", "Revisa los campos marcados", "error");
      return;
    }
    const vehiculo = {
      marca: $("#marca").value.trim(),
      modelo: $("#modelo").value.trim(),
      anio: anio,
      placa: $("#placa").value.trim(),
      vin: $("#vin").value.trim().toUpperCase(),
      idCliente: parseInt(userId, 10),
      idEstado: parseInt($("#estado").value, 10),
    };
    try {
      if (editId) {
        await updateVehiculo(editId, vehiculo);
        await Swal.fire("Éxito", "Vehículo actualizado correctamente", "success");
      } else {
        await createVehiculo(vehiculo);
        await Swal.fire("Éxito", "Vehículo agregado correctamente", "success");
      }
      location.href = "./Vehiculos.html";
    } catch {
      await Swal.fire("Error", "No se pudo guardar el vehículo", "error");
    }
  });
});
