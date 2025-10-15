// ===============================
// 🚘 anadirVehiculoController.js ✅ FINAL COMPLETO
// (Heroku + Perfil + Logout + Crear / Editar Vehículo)
// ===============================

import { getToken, getUserId, getUsuarioLogueado } from "../Services/LoginService.js";
import { getVehiculoById, addVehiculo, updateVehiculo } from "../Services/VehiculoService.js";

document.addEventListener("DOMContentLoaded", async () => {
  const $ = (s) => document.querySelector(s);

  // ===============================
  // 🔹 AUTENTICACIÓN
  // ===============================
  const token = getToken();
  const userId = getUserId();

  if (!userId || !token) {
    Swal.fire("Sesión requerida", "Debes iniciar sesión nuevamente", "warning").then(() =>
      location.replace("../Authenticator/login.html")
    );
    return;
  }

  // ===============================
  // 🔹 API BASE
  // ===============================
  const API_BASE = "https://sasaapi-73d5de493985.herokuapp.com";
  const API_USER = `${API_BASE}/apiCliente/${userId}`;

  // ===============================
  // 🔹 REFERENCIAS DOM
  // ===============================
  const form = $("#vehiculoForm");
  const btnLimpiar = $("#btnLimpiar");

  const overlay = $("#overlay");
  const profileMenu = $("#profileMenu");
  const menuToggle = $("#menuToggle");
  const closeMenu = $("#closeMenu");
  const logoutBtn = $("#logoutBtn");

  // ===============================
  // 🔹 PERFIL / MENÚ / LOGOUT
  // ===============================
  async function cargarUsuario() {
    try {
      const res = await fetch(API_USER, { headers: { Authorization: `Bearer ${token}` } });
      let u = null;
      if (res.ok) u = await res.json();

      const localUser = getUsuarioLogueado();
      const nombre =
        `${u?.nombre ?? localUser?.nombre ?? ""} ${u?.apellido ?? localUser?.apellido ?? ""}`.trim() ||
        "Usuario";
      const rol = (u?.rol ?? localUser?.rol ?? "Cliente").toUpperCase();

      const menuNombre = $("#menuNombre");
      const menuPase = $("#menuPase");
      const menuUserId = $("#menuUserId");

      if (menuNombre) menuNombre.textContent = nombre;
      if (menuPase) menuPase.textContent = rol;
      if (menuUserId) menuUserId.textContent = userId;

      localStorage.setItem("nombre", nombre);
      localStorage.setItem("rol", rol);
    } catch (err) {
      console.error("⚠️ Error al cargar usuario:", err);
    }
  }

  const abrirMenu = () => {
    profileMenu?.classList.add("open");
    overlay?.classList.add("show");
  };
  const cerrarMenu = () => {
    profileMenu?.classList.remove("open");
    overlay?.classList.remove("show");
  };

  menuToggle?.addEventListener("click", abrirMenu);
  closeMenu?.addEventListener("click", cerrarMenu);
  overlay?.addEventListener("click", cerrarMenu);
  window.addEventListener("keydown", (e) => e.key === "Escape" && cerrarMenu());

  logoutBtn?.addEventListener("click", async (e) => {
    e.preventDefault();
    const ok = await Swal.fire({
      title: "¿Cerrar sesión?",
      text: "Tu sesión actual se cerrará",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#C91A1A",
      confirmButtonText: "Sí, salir",
      cancelButtonText: "Cancelar",
    });
    if (ok.isConfirmed) {
      localStorage.clear();
      sessionStorage.clear();
      document.cookie = "authToken=; Max-Age=0; path=/";
      location.replace("../Authenticator/login.html");
    }
  });

  // ===============================
  // 🔹 MODO EDICIÓN
  // ===============================
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (id) {
    try {
      const vehiculo = await getVehiculoById(token, id);
      console.log("🔹 Vehículo cargado para edición:", vehiculo);

      $("#marca").value = vehiculo.marca ?? vehiculo.Marca ?? "";
      $("#modelo").value = vehiculo.modelo ?? vehiculo.Modelo ?? "";
      $("#anio").value = vehiculo.anio ?? vehiculo.Anio ?? "";
      $("#placa").value = vehiculo.placa ?? vehiculo.Placa ?? "";
      $("#vin").value = vehiculo.vin ?? vehiculo.Vin ?? "";

      const estadoVal = vehiculo.idEstado ?? vehiculo.estado?.idEstado;
      if (estadoVal) $("#estado").value = estadoVal;
    } catch (err) {
      console.error("❌ Error cargando vehículo:", err);
      Swal.fire("Error", "No se pudo cargar el vehículo", "error");
    }
  }

  // ===============================
  // 🔹 GUARDAR / ACTUALIZAR VEHÍCULO
  // ===============================
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const estadoVal = $("#estado").value;
      if (!estadoVal) {
        Swal.fire("Error", "Debes seleccionar un estado válido", "error");
        return;
      }

      const vehiculo = {
        marca: $("#marca").value.trim(),
        modelo: $("#modelo").value.trim(),
        anio: $("#anio").value,
        placa: $("#placa").value.trim(),
        vin: $("#vin").value.trim(),
        idCliente: userId,
        idEstado: Number(estadoVal),
      };

      try {
        if (id) {
          await updateVehiculo(token, id, vehiculo);
          Swal.fire("Actualizado", "El vehículo fue actualizado correctamente", "success").then(() =>
            location.replace("./Vehiculos.html")
          );
        } else {
          await addVehiculo(token, vehiculo);
          Swal.fire("Registrado", "El vehículo fue agregado correctamente", "success").then(() =>
            location.replace("./Vehiculos.html")
          );
        }
      } catch (err) {
        console.error("❌ Error guardando vehículo:", err);
        Swal.fire("Error", "No se pudo guardar el vehículo", "error");
      }
    });
  } else {
    console.error("⚠️ No se encontró el formulario con id='vehiculoForm'");
  }

  // ===============================
  // 🔹 BOTÓN LIMPIAR FORMULARIO
  // ===============================
  if (btnLimpiar) {
    btnLimpiar.addEventListener("click", () => {
      form.reset();
      if (id) {
        const nuevaUrl = window.location.pathname;
        window.history.replaceState({}, document.title, nuevaUrl);
      }
      Swal.fire({
        title: "Formulario limpio",
        text: "Todos los campos han sido vaciados.",
        icon: "info",
        confirmButtonColor: "#C91A1A",
      });
    });
  }

  // ===============================
  // 🔹 INICIALIZAR PERFIL
  // ===============================
  await cargarUsuario();
});
