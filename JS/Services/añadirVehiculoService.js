const API_URL = "http://localhost:8080/apiVehiculo";


export async function addVehiculo(token, vehiculo) {
  try {
    const res = await fetch(`${API_URL}/registrar`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`, // 👈 JWT desde localStorage
        "Content-Type": "application/json"
      },
      body: JSON.stringify(vehiculo)
    });


    if (!res.ok) {
      let msg = `Error ${res.status}: No se pudo registrar el vehículo`;
      try {
        const errorData = await res.json();
        if (errorData.message) {
          msg = errorData.message;
        } else if (errorData.errors) {
          msg = Object.values(errorData.errors).join("\n");
        }
      } catch {

      }
      throw new Error(msg);
    }

    return await res.json();

  } catch (error) {
    console.error("Error en addVehiculo:", error);
    throw new Error(error.message || "No se pudo registrar el vehículo");
  }
}
