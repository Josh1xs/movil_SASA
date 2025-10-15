// ===============================
// 🧾 detallecitas.js (versión SASA completa y funcional)
// ===============================

import { getToken, getUserId } from "./Services/LoginService.js";
import { getCitaById } from "./Services/CitasService.js";
import { getVehiculos } from "./Services/VehiculoService.js";

document.addEventListener("DOMContentLoaded", async () => {
  // ===============================
  // 📦 Obtener parámetros y token
  // ===============================
  const params = new URLSearchParams(window.location.search);
  const citaId = params.get("id");
  const token = getToken();
  const userId = getUserId();

  if (!token || !userId) {
    await Swal.fire({
      icon: "warning",
      title: "Sesión requerida",
      text: "Por favor inicia sesión nuevamente.",
      confirmButtonColor: "#C91A1A",
    });
    location.href = "../Authenticator/login.html";
    return;
  }

  // ===============================
  // 🎯 Referencias del DOM
  // ===============================
  const titleFecha   = document.getElementById("titleFecha");
  const code         = document.getElementById("code");
  const horaTxt      = document.getElementById("horaTxt");
  const estadoTxt    = document.getElementById("estadoTxt");
  const descTxt      = document.getElementById("descTxt");
  const vehiculoTxt  = document.getElementById("vehiculoTxt");

  // ===============================
  // ⚠️ Validar parámetro ID
  // ===============================
  if (!citaId) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "No se encontró el ID de la cita.",
      confirmButtonColor: "#C91A1A",
    });
    return;
  }

  // ===============================
  // 🚀 Cargar datos de la cita
  // ===============================
  try {
    const cita = await getCitaById(token, citaId);
    console.log("✅ Cita cargada correctamente:", cita);

    if (!cita) throw new Error("Cita no encontrada");

    // ===============================
    // 🖋️ Renderizar datos base
    // ===============================
    titleFecha.textContent = cita.fecha || "—";
    code.textContent       = `#CITA-${cita.id}`;
    horaTxt.textContent    = cita.hora || "—";
    estadoTxt.textContent  = cita.tipoServicio || "—";
    descTxt.textContent    = cita.descripcion || "—";

    // ===============================
    // 🚗 Cargar vehículo asociado
    // ===============================
    if (cita.vehiculo?.placa) {
      vehiculoTxt.textContent = `${cita.vehiculo.marca} ${cita.vehiculo.modelo} (${cita.vehiculo.placa})`;
    } else if (cita.idVehiculo) {
      try {
        const res = await getVehiculos(token, 0, 50);
        const vehiculos = res.content ?? res;
        const encontrado = vehiculos.find(v => v.id === cita.idVehiculo);
        if (encontrado) {
          vehiculoTxt.textContent = `${encontrado.marca} ${encontrado.modelo} (${encontrado.placa})`;
        } else {
          vehiculoTxt.textContent = "Vehículo no encontrado";
        }
      } catch (e) {
        console.warn("⚠️ No se pudo cargar el vehículo:", e);
        vehiculoTxt.textContent = "Error cargando vehículo";
      }
    } else {
      vehiculoTxt.textContent = "—";
    }

  } catch (err) {
    console.error("❌ Error cargando detalle de cita:", err);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "No se pudo cargar el detalle de la cita.",
      confirmButtonColor: "#C91A1A",
    });
  }
});
