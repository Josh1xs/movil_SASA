document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.getElementById('menuToggle');
  const profileMenu = document.getElementById('profileMenu');
  const overlay = document.getElementById('overlay');
  const closeMenu = document.getElementById('closeMenu');

  function closeProfileMenu() {
    profileMenu.classList.remove('open');
    overlay.classList.remove('show');
  }

  menuToggle.addEventListener('click', () => {
    profileMenu.classList.add('open');
    overlay.classList.add('show');
  });

  closeMenu.addEventListener('click', closeProfileMenu);
  overlay.addEventListener('click', closeProfileMenu);

  // Cargar datos del usuario
  const userId = localStorage.getItem("userId");
  const apiUrl = `https://retoolapi.dev/DeaUI0/registro/${userId}`;
  const userIdElement = document.getElementById("menuUserId");
  const nombreElement = document.getElementById("menuNombre");
  const paseElement = document.getElementById("menuPase");

  if (userIdElement) userIdElement.textContent = userId || "Desconocido";

  if (userId) {
    fetch(apiUrl)
      .then(res => res.json())
      .then(user => {
        if (nombreElement) nombreElement.textContent = `${user.nombre} ${user.apellido}`;
        if (paseElement) paseElement.textContent = user.pase || "Cliente";
      })
      .catch(err => {
        console.error("Error cargando usuario:", err);
      });
  }

  // Mostrar notificaciones
  const container = document.getElementById("notificacionesContainer");

  fetch("https://retoolapi.dev/IOhfB6/notificaciones")
    .then(res => res.json())
    .then(data => {
      const notificacionesUsuario = data.filter(n => n.idCliente == userId);

      if (notificacionesUsuario.length === 0) {
        container.innerHTML = "<p class='text-center text-muted'>No tienes notificaciones.</p>";
      } else {
        notificacionesUsuario.reverse().forEach(n => {
          const card = document.createElement("div");
          card.className = "notification-card";
          card.innerHTML = `
            <h5 class="fw-bold">${n.titulo}</h5>
            <p>${n.descripcion}</p>
            <p class="text-end text-muted small mb-0">${n.fecha}</p>
          `;
          container.appendChild(card);
        });
      }
    })
    .catch(err => {
      console.error("Error al cargar notificaciones:", err);
      container.innerHTML = "<p class='text-danger text-center'>Error al cargar notificaciones.</p>";
    });
});
