document.addEventListener("DOMContentLoaded", () => {
  const userId = localStorage.getItem("userId");
  const API_USER = `https://retoolapi.dev/DeaUI0/registro/${userId}`;
  const API_CITAS = `https://retoolapi.dev/2Kfhrs/cita`;

  const bienvenida = document.getElementById("bienvenida");
  const citasContainer = document.getElementById("citasContainer");
  const menuUserId = document.getElementById("menuUserId");
  const menuNombre = document.getElementById("menuNombre");
  const menuPase = document.getElementById("menuPase");

  const overlay = document.getElementById("overlay");
  const profileMenu = document.getElementById("profileMenu");
  const menuToggle = document.getElementById("menuToggle");
  const closeMenu = document.getElementById("closeMenu");

  // Menú Pokémon
  menuToggle.addEventListener("click", () => {
    profileMenu.classList.add("open");
    overlay.classList.add("show");
  });

  closeMenu.addEventListener("click", cerrarMenu);
  overlay.addEventListener("click", cerrarMenu);

  function cerrarMenu() {
    profileMenu.classList.remove("open");
    overlay.classList.remove("show");
  }

  // Mostrar ID de usuario
  menuUserId.textContent = userId || "Desconocido";

  if (userId) {
    fetch(API_USER)
      .then(res => res.json())
      .then(user => {
        const nombreCompleto = `${user.nombre} ${user.apellido}`;
        bienvenida.innerHTML = `¡Bienvenido, <strong>${nombreCompleto}</strong>!`;
        menuNombre.textContent = nombreCompleto;
        menuPase.textContent = user.pase || "Cliente";
      })
      .catch(() => {
        bienvenida.textContent = "¡Bienvenido!";
      });

    fetch(API_CITAS)
      .then(res => res.json())
      .then(data => {
        const citas = data.filter(cita => cita.idCliente == userId);
        if (citas.length === 0) {
          citasContainer.innerHTML = `<p class="text-muted">No tienes citas programadas.</p>`;
          return;
        }

        citas.forEach(cita => {
          citasContainer.innerHTML += `
            <div class="card-cita text-center p-3 mb-3 bg-white rounded shadow-sm">
              <i class="fas fa-calendar-check fa-2x mb-2 text-primary"></i>
              <h6 class="fw-bold">${cita.descripcion || "Cita agendada"}</h6>
              <p class="mb-0">${cita.fecha}</p>
              <small class="text-muted">${cita.hora}</small>
            </div>
          `;
        });
      })
      .catch(err => {
        console.error("Error al cargar citas:", err);
      });
  }

  // Redirigir al hacer clic en el avatar
  const avatarLink = document.getElementById("userIconLink");
  if (avatarLink) {
    avatarLink.addEventListener("click", () => {
      window.location.href = "../Ajustes/ajustes.html";
    });
  }
});
