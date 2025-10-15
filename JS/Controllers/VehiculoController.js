// ===============================
// 🚗 VehiculoController.js ✅ FINAL COMPLETO
// (Heroku + Perfil + Logout + CRUD Vehículos)
// ===============================

import { getToken, getUserId, getUsuarioLogueado } from "../Services/LoginService.js";
import { getVehiculos, deleteVehiculo } from "../Services/VehiculoService.js";

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
  const lista = $("#vehiculosLista");
  const emptyMsg = $("#vehEmpty");

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

  // Menú lateral (abrir/cerrar)
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

  // Logout
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
  // 🔹 CARGAR VEHÍCULOS
  // ===============================
  try {
    const raw = await getVehiculos(token, 0, 100, "idVehiculo", "asc");
    console.log("Respuesta bruta del backend:", raw);

    const listaVehiculos = raw.data?.content || raw.data || raw.content || raw;
    if (!Array.isArray(listaVehiculos)) {
      console.error("Formato inesperado:", listaVehiculos);
      throw new Error("Formato de respuesta no válido");
    }

    console.log("Vehículos normalizados:", listaVehiculos);

    const misVehiculos = listaVehiculos.filter((v) => {
      const idC =
        v.idCliente ??
        v.IdCliente ??
        v.cliente?.idCliente ??
        v.cliente?.IdCliente ??
        v.clienteId;
      return !idC || String(idC) === String(userId);
    });

    if (misVehiculos.length === 0) {
      emptyMsg.classList.remove("hidden");
      lista.innerHTML = "";
    } else {
      emptyMsg.classList.add("hidden");
      lista.innerHTML = misVehiculos
        .map(
          (v) => `
          <div class="vcard" data-id="${v.idVehiculo ?? v.IdVehiculo ?? v.id}">
            <div class="vbody">
              <h3>${v.marca ?? v.Marca ?? "Sin marca"} ${v.modelo ?? v.Modelo ?? ""}</h3>
              ${v.anio || v.Anio ? `<p><strong>Año:</strong> ${v.anio ?? v.Anio}</p>` : ""}
              ${
                v.estado?.nombre
                  ? `<p><strong>Estado:</strong> ${v.estado.nombre}</p>`
                  : ""
              }
              <p><span class="chip">Placa: ${v.placa ?? v.Placa ?? "N/A"}</span></p>
              <p><strong>VIN:</strong> ${v.vin ?? v.Vin ?? "N/A"}</p>
            </div>
            <div class="actions">
              <button class="btn edit-btn editar">
                <i class="fa fa-pen"></i> Editar
              </button>
              <button class="btn delete-btn eliminar">
                <i class="fa fa-trash"></i> Eliminar
              </button>
            </div>
          </div>
        `
        )
        .join("");
    }
  } catch (err) {
    console.error("❌ Error cargando vehículos:", err);
    Swal.fire("Error", "No se pudieron cargar los vehículos", "error");
  }

  // ===============================
  // 🔹 EVENTO ELIMINAR
  // ===============================
  lista.addEventListener("click", async (e) => {
    const card = e.target.closest(".vcard");
    if (e.target.closest(".eliminar") && card) {
      const id = Number(card.dataset.id);

      if (!id || isNaN(id)) {
        Swal.fire("Error", "ID de vehículo no válido", "error");
        return;
      }

      const conf = await Swal.fire({
        title: "¿Eliminar vehículo?",
        text: "Esta acción no se puede deshacer",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#C91A1A",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Sí, eliminar",
      });

      if (conf.isConfirmed) {
        try {
          await deleteVehiculo(id, token);
          Swal.fire("Eliminado", "El vehículo fue eliminado correctamente", "success").then(() =>
            location.reload()
          );
        } catch (err) {
          console.error("❌ Error eliminando vehículo:", err);
          Swal.fire("Error", "No se pudo eliminar el vehículo", "error");
        }
      }
    }
  });

  // ===============================
  // 🔹 EVENTO EDITAR
  // ===============================
  lista.addEventListener("click", (e) => {
    const card = e.target.closest(".vcard");
    if (e.target.closest(".editar") && card) {
      const id = Number(card.dataset.id);

      if (!id || isNaN(id)) {
        Swal.fire("Error", "ID de vehículo no válido", "error");
        return;
      }

      location.href = `./anadirVehiculo.html?id=${encodeURIComponent(id)}`;
    }
  });

  // ===============================
  // 🔹 INICIALIZAR PERFIL
  // ===============================
  await cargarUsuario();
});
