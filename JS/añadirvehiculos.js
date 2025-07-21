const API_URL = "https://retoolapi.dev/4XQf28/anadirvehiculo";
const form = document.getElementById("formVehiculo");
const editarId = localStorage.getItem("vehiculoEditarId");

// Validar campos
function validarCampos({ marca, modelo, color, placa, vin }) {
  const soloTexto = /^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]{2,}$/;
  const textoConNumeros = /^[A-Za-zÁÉÍÓÚáéíóúñÑ0-9\s]{2,}$/;
  const formatoPlaca = /^[A-Z]{0,3}-?\d{3,6}$/; // Acepta P123456, P123-456, CD1234, 123456
  const formatoVIN = /^[A-HJ-NPR-Z0-9]{6,17}$/i;

  if (!soloTexto.test(marca)) return "Marca inválida. Solo letras, mínimo 2 caracteres.";
  if (!textoConNumeros.test(modelo)) return "Modelo inválido. Letras o números, mínimo 2 caracteres.";
  if (!soloTexto.test(color)) return "Color inválido. Solo letras.";
  if (!formatoPlaca.test(placa)) return "Placa inválida. Ej: P123456, CD1234, 123456.";
  if (vin && !formatoVIN.test(vin)) return "VIN inválido. 6 a 17 caracteres alfanuméricos.";

  return null;
}

document.addEventListener("DOMContentLoaded", async () => {
  if (editarId) {
    try {
      const res = await fetch(`${API_URL}/${editarId}`);
      const data = await res.json();
      document.getElementById("marca").value = data.marca || "";
      document.getElementById("modelo").value = data.modelo || "";
      document.getElementById("color").value = data.color || "";
      document.getElementById("placa").value = data.placa || "";
      document.getElementById("vin").value = data.vin || "";
    } catch (err) {
      console.error("Error al cargar datos:", err);
      Swal.fire("Error", "No se pudieron cargar los datos", "error");
    }
  }

  // Menú Pokémon
  const menuToggle = document.getElementById("menuToggle");
  const profileMenu = document.getElementById("profileMenu");
  const overlay = document.getElementById("overlay");
  const closeMenu = document.getElementById("closeMenu");

  function closeProfileMenu() {
    profileMenu.classList.remove("open");
    overlay.classList.remove("show");
  }

  menuToggle?.addEventListener("click", () => {
    profileMenu.classList.add("open");
    overlay.classList.add("show");
  });
  closeMenu?.addEventListener("click", closeProfileMenu);
  overlay?.addEventListener("click", closeProfileMenu);

  // Cargar usuario
  const userId = localStorage.getItem("userId");
  const apiUrl = `https://retoolapi.dev/DeaUI0/registro/${userId}`;
  if (userId) {
    fetch(apiUrl)
      .then(res => res.json())
      .then(user => {
        document.getElementById("menuUserId").textContent = userId;
        document.getElementById("menuNombre").textContent = `${user.nombre} ${user.apellido}`;
        document.getElementById("menuPase").textContent = user.pase || "Cliente";
      })
      .catch(err => console.error("Error al cargar usuario:", err));
  }
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const marca = document.getElementById("marca").value.trim();
  const modelo = document.getElementById("modelo").value.trim();
  const color = document.getElementById("color").value.trim();
  const placa = document.getElementById("placa").value.trim().toUpperCase();
  const vin = document.getElementById("vin").value.trim().toUpperCase();
  const idCliente = localStorage.getItem("userId");

  const error = validarCampos({ marca, modelo, color, placa, vin });
  if (error) {
    Swal.fire("Error", error, "error");
    return;
  }

  const datos = { marca, modelo, color, placa, vin, idCliente };

  try {
    if (editarId) {
      await fetch(`${API_URL}/${editarId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos),
      });
      localStorage.removeItem("vehiculoEditarId");
      Swal.fire("Actualizado", "Vehículo editado correctamente", "success").then(() => {
        window.location.href = "Vehiculos.html";
      });
    } else {
      await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos),
      });
      Swal.fire("Guardado", "Vehículo agregado correctamente", "success").then(() => {
        window.location.href = "Vehiculos.html";
      });
    }
  } catch (err) {
    console.error("Error al guardar:", err);
    Swal.fire("Error", "Hubo un problema al guardar los datos", "error");
  }
});
