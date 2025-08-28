import { createVehiculo } from "./Services/VehiculoService.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formVehiculo");
  const userId = localStorage.getItem("userId");

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!userId) {
      Swal.fire("Error", "Debes iniciar sesión", "error");
      return;
    }

    const vehiculo = {
      marca: document.getElementById("marca").value.trim(),
      modelo: document.getElementById("modelo").value.trim(),
      anio: parseInt(document.getElementById("anio").value),
      placa: document.getElementById("placa").value.trim(),
      vin: document.getElementById("vin").value.trim(),
      cliente: { idCliente: parseInt(userId, 10) },
      estado: { idEstado: parseInt(document.getElementById("estado").value) }
    };

    if (!vehiculo.marca || !vehiculo.modelo || !vehiculo.anio || !vehiculo.placa || !vehiculo.vin || !vehiculo.estado.idEstado) {
      Swal.fire("Error", "Completa todos los campos", "error");
      return;
    }

    try {
      await createVehiculo(vehiculo);
      Swal.fire("Éxito", "Vehículo agregado correctamente", "success")
        .then(() => window.location.href = "./Vehiculos.html");
    } catch (e) {
      console.error("Error creando vehículo", e);
      Swal.fire("Error", "No se pudo guardar el vehículo", "error");
    }
  });
});
