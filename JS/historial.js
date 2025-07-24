document.addEventListener("DOMContentLoaded", async () => {
  // --- Variables del menú Pokémon ---
  const menuToggle  = document.getElementById("menuToggle");
  const profileMenu = document.getElementById("profileMenu");
  const overlay     = document.getElementById("overlay");
  const closeMenu   = document.getElementById("closeMenu");

  function closeProfileMenu() {
    profileMenu.classList.remove("open");
    overlay.classList.remove("show");
  }

  menuToggle.addEventListener("click", () => {
    profileMenu.classList.add("open");
    overlay.classList.add("show");
  });
  closeMenu.addEventListener("click", closeProfileMenu);
  overlay.addEventListener("click", closeProfileMenu);

  // --- Carga de datos del usuario ---
  const userId       = localStorage.getItem("userId");
  const userIdEl     = document.getElementById("menuUserId");
  const nombreEl     = document.getElementById("menuNombre");
  const paseEl       = document.getElementById("menuPase");

  if (userIdEl) userIdEl.textContent = userId || "Desconocido";

  if (userId) {
    try {
      const resUser = await fetch(`https://retoolapi.dev/DeaUI0/registro/${userId}`);
      if (!resUser.ok) throw new Error("Usuario no encontrado");
      const user = await resUser.json();
      if (nombreEl) nombreEl.textContent = `${user.nombre} ${user.apellido}`;
      if (paseEl)   paseEl.textContent   = user.pase || "Cliente";
    } catch (err) {
      console.error("Error cargando usuario:", err);
    }
  }

  // --- Carga y renderizado del Historial con SweetAlert para eliminar ---
  const container = document.getElementById("historialContainer");
  const urlHist   = "https://retoolapi.dev/0uphCm/historial";

  try {
    const res = await fetch(urlHist);
    if (!res.ok) throw new Error("No se pudo obtener el historial");
    const data = await res.json();

    container.innerHTML = ""; // limpia contenido previo

    if (!data.length) {
      container.innerHTML = "<p class='text-center text-muted'>No hay registros de historial.</p>";
      return;
    }

    data.forEach(item => {
      // Detecta variantes de nombre de campo
      const ingreso = item.fecha_ingreso    ?? item["fecha ingreso"]    ?? item.fechaIngreso    ?? "-";
      const salida  = item.fecha_salida     ?? item["fecha salida"]     ?? item.fechaSalida     ?? "-";
      const trabajo = item.trabajo_realizado?? item["trabajo realizado"]?? item.trabajoRealizado ?? "-";
      const obs     = item.observaciones     ?? item.Observaciones        ?? "";

      const card = document.createElement("div");
      card.className = "historial-item card mb-3 position-relative";
      card.innerHTML = `
        <div class="card-body">
          <button class="delete-btn"><i class="fas fa-trash"></i></button>
          <h5 class="card-title">Vehículo ID: ${item.idVehiculo ?? item.idvehiculo ?? item.id}</h5>
          <p><strong>Ingreso:</strong> ${ingreso}</p>
          <p><strong>Salida:</strong> ${salida}</p>
          <p><strong>Trabajo:</strong> ${trabajo}</p>
          <p><strong>Observaciones:</strong> ${obs || "-"}</p>
        </div>
      `;
      container.appendChild(card);

      // Lógica de eliminación con SweetAlert
      const btnDel = card.querySelector(".delete-btn");
      btnDel.addEventListener("click", () => {
        Swal.fire({
          title: '¿Eliminar este registro?',
          text: '¡Esta acción no se puede deshacer!',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          cancelButtonColor: '#3085d6',
          confirmButtonText: 'Sí, eliminar',
          cancelButtonText: 'Cancelar'
        }).then(async (result) => {
          if (result.isConfirmed) {
            try {
              const resDel = await fetch(`${urlHist}/${item.id}`, { method: "DELETE" });
              if (!resDel.ok) throw new Error("Error en DELETE");
              card.remove();
              Swal.fire(
                'Eliminado',
                'El registro ha sido eliminado.',
                'success'
              );
            } catch (e) {
              console.error("Error eliminando registro:", e);
              Swal.fire(
                'Error',
                'No se pudo eliminar el registro.',
                'error'
              );
            }
          }
        });
      });
    });

  } catch (err) {
    console.error("Historial load failed", err);
    container.innerHTML = "<p class='text-center text-danger'>Error al cargar historial.</p>";
  }
});
