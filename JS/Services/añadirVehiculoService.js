// ===============================
// añadirVehiculoService.js
// ===============================
const API_URL = "http://localhost:8080/apiVehiculo";

// -------------------------------------
// Crear un nuevo vehículo
// vehiculo = {
//   marca: "Toyota",
//   modelo: "Corolla",
//   placa: "P123-456",
//   vin: "1HGBH41JXMN109186",
//   idCliente: 5
// }
// -------------------------------------
export async function addVehiculo(token, vehiculo) {
  try {
    const res = await fetch(`${API_URL}/registrar`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`, // 👈 JWT que ya tienes en localStorage
        "Content-Type": "application/json"
      },
      body: JSON.stringify(vehiculo)
    });

    // Manejo de error HTTP
    if (!res.ok) {
      let msg = "No se pudo registrar el vehículo. Verifica los datos ingresados.";
      try {
        const errorData = await res.json();
        if (errorData.message) msg = errorData.message;
      } catch {
        // si no se pudo parsear JSON, mantenemos el mensaje amigable
      }
      throw new Error(msg);
    }

    // Si es correcto, devuelve el JSON con {status, data}
    return await res.json();

  } catch (error) {
    console.error("❌ Error en addVehiculo:", error);
    throw new Error(error.message || "No se pudo registrar el vehículo");
  }
}
