const API_URL = "https://retoolapi.dev/4XQf28/anadirvehiculo";

document.getElementById("formVehiculo").addEventListener("submit", async (e) => {
  e.preventDefault();

  const userId = localStorage.getItem("userId"); // idCliente
  if (!userId) {
    Swal.fire("Error", "No se encontró el usuario en la sesión", "error");
    return;
  }

  const marca = document.getElementById("marca").value.trim();
  const modelo = document.getElementById("modelo").value.trim();
  const anio = parseInt(document.getElementById("anio").value);
  const placa = document.getElementById("placa").value.trim();
  const vin = document.getElementById("vin").value.trim();

  // Validaciones
  const currentYear = new Date().getFullYear();
  if (anio < 2000 || anio > currentYear) {
    Swal.fire("Error", `El año debe estar entre 2000 y ${currentYear}`, "error");
    return;
  }

  if (!/^[A-Z0-9-]+$/.test(placa)) {
    Swal.fire("Error", "La placa debe tener solo letras, números y guiones", "error");
    return;
  }

  if (vin && vin.length !== 17) {
    Swal.fire("Error", "El VIN debe tener exactamente 17 caracteres", "error");
    return;
  }

  const vehiculo = {
    marca,
    modelo,
    anio,
    placa,
    vin: vin || null,
    idCliente: parseInt(userId),
    idEstado: 1 // Activo por defecto
  };

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(vehiculo)
    });

    if (!res.ok) throw new Error("Error al registrar el vehículo");

    Swal.fire("Éxito", "Vehículo registrado correctamente", "success")
      .then(() => window.location.href = "Vehiculos.html");
  } catch (err) {
    console.error(err);
    Swal.fire("Error", "No se pudo registrar el vehículo", "error");
  }
});
