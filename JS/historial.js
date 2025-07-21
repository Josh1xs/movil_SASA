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
});
