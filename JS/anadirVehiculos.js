import { createVehiculo, updateVehiculo, getVehiculoById } from "./Services/VehiculoService.js";

document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("formVehiculo");
  const btnGuardar = form.querySelector(".btn.primary");
  const userId = localStorage.getItem("userId");

  // Detectar si viene con ?id en la URL
  const params = new URLSearchParams(window.location.search);
  const editId = params.get("id");

  if (editId) {
    // Cambiar título y botón
    document.querySelector(".page-title").textContent = "Editar Vehículo";
    btnGuardar.textContent = "Actualizar";

    try {
      const vehiculo = await getVehiculoById(editId);
      console.log("Vehículo cargado:", vehiculo); // 👀 debug

      // Llenar formulario con lo que devuelve el backend
      document.getElementById("marca").value = vehiculo.marca || "";
      document.getElementById("modelo").value = vehiculo.modelo || "";
      document.getElementById("anio").value = vehiculo.anio || "";
      document.getElementById("placa").value = vehiculo.placa || "";
      document.getElementById("vin").value = vehiculo.vin || "";
      document.getElementById("estado").value = vehiculo.idEstado || "";
    } catch (e) {
      console.error("Error cargando vehículo:", e);
      Swal.fire("Error", "No se pudieron cargar los datos del vehículo", "error");
    }
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!userId) {
      Swal.fire("Error", "Debes iniciar sesión", "error");
      return;
    }

    // Armar objeto como lo espera tu VehicleDTO en backend
    const vehiculo = {
      marca: document.getElementById("marca").value.trim(),
      modelo: document.getElementById("modelo").value.trim(),
      anio: parseInt(document.getElementById("anio").value),
      placa: document.getElementById("placa").value.trim(),
      vin: document.getElementById("vin").value.trim(),
      idCliente: parseInt(userId, 10),
      idEstado: parseInt(document.getElementById("estado").value)
    };

    if (!vehiculo.marca || !vehiculo.modelo || !vehiculo.anio || !vehiculo.placa || !vehiculo.vin || !vehiculo.idEstado) {
      Swal.fire("Error", "Completa todos los campos", "error");
      return;
    }

    try {
      if (editId) {
        await updateVehiculo(editId, vehiculo);
        Swal.fire("Éxito", "Vehículo actualizado correctamente", "success")
          .then(() => (window.location.href = "./Vehiculos.html"));
      } else {
        await createVehiculo(vehiculo);
        Swal.fire("Éxito", "Vehículo agregado correctamente", "success")
          .then(() => (window.location.href = "./Vehiculos.html"));
      }
    } catch (e) {
      console.error("Error guardando vehículo:", e);
      Swal.fire("Error", "No se pudo guardar el vehículo", "error");
    }
  });
});
