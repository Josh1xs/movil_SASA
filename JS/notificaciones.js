document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("notificacionesContainer");
  const usuarioId = localStorage.getItem("usuarioId"); // <-- GUARDA ESTO AL LOGUEARTE EN TABLA USUARIO

  if(!usuarioId){
    container.innerHTML = "<p class='text-center text-muted'>No hay usuario en sesión.</p>";
    return;
  }

  try{
    // Devuelve notificaciones con campos reales: mensaje, fecha, tipoNotificacion, lectura, idUsuario
    const data = await fetch(`/api/notificaciones?idUsuario=${encodeURIComponent(usuarioId)}`).then(r=>r.json());

    if(!data.length){
      container.innerHTML = "<p class='text-center text-muted'>No tienes notificaciones.</p>";
      return;
    }

    container.innerHTML = data.reverse().map(n => `
      <div class="notification-card">
        <h5 class="fw-bold">${n.tipoNotificacion}</h5>
        <p>${n.mensaje}</p>
        <div class="d-flex justify-content-between align-items-center mt-2">
          <small class="text-muted">${new Date(n.fecha).toLocaleString()}</small>
          <button class="btn btn-sm ${n.lectura?'btn-outline-secondary':'btn-primary'} mark-btn" data-id="${n.idNotificacion}">
            ${n.lectura ? "Leída" : "Marcar como leída"}
          </button>
        </div>
      </div>
    `).join("");

    // Marcar como leída
    container.addEventListener("click", async (e)=>{
      const btn = e.target.closest(".mark-btn");
      if(!btn) return;
      const id = btn.dataset.id;
      try{
        await fetch(`/api/notificaciones/${id}`, {
          method: "PATCH",
          headers: { "Content-Type":"application/json" },
          body: JSON.stringify({ lectura: true })
        });
        btn.classList.remove("btn-primary"); btn.classList.add("btn-outline-secondary");
        btn.textContent = "Leída";
      }catch{ /* opcional: feedback */ }
    });

  }catch{
    container.innerHTML = "<p class='text-danger text-center'>Error al cargar notificaciones.</p>";
  }
});
