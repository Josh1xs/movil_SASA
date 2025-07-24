document.addEventListener("DOMContentLoaded", () => {
  const userId = localStorage.getItem("userId");
  const API_USER = `https://retoolapi.dev/DeaUI0/registro/${userId}`;
  const API_CITAS = `https://retoolapi.dev/2Kfhrs/cita`;
  const API_VEHICULOS = "https://retoolapi.dev/4XQf28/anadirvehiculo";

  const citasHomeList = document.getElementById("citasHomeList");
  const listaVehiculosDashboard = document.getElementById("listaVehiculosDashboard");
  const menuUserId = document.getElementById("menuUserId");
  const menuNombre = document.getElementById("menuNombre");
  const menuPase = document.getElementById("menuPase");
  const avatarLink = document.getElementById("userIconLink");

  const overlay = document.getElementById("overlay");
  const profileMenu = document.getElementById("profileMenu");
  const menuToggle = document.getElementById("menuToggle");
  const closeMenu = document.getElementById("closeMenu");

  if (menuToggle && profileMenu && overlay) {
    menuToggle.addEventListener("click", () => {
      profileMenu.classList.add("open");
      overlay.classList.add("show");
    });
  }

  if (closeMenu && overlay && profileMenu) {
    closeMenu.addEventListener("click", cerrarMenu);
    overlay.addEventListener("click", cerrarMenu);
  }

  function cerrarMenu() {
    profileMenu.classList.remove("open");
    overlay.classList.remove("show");
  }

  if (menuUserId) {
    menuUserId.textContent = userId || "Desconocido";
  }

  if (avatarLink) {
    avatarLink.addEventListener("click", () => {
      window.location.href = "../Ajustes/ajustes.html";
    });
  }

  if (userId && API_USER) {
    fetch(API_USER)
      .then(res => res.json())
      .then(user => {
        menuNombre.textContent = `${user.nombre} ${user.apellido}`;
        menuPase.textContent = user.pase || "Cliente";
      });
  }

if (userId && citasHomeList) {
  fetch(API_CITAS)
    .then(res => res.json())
    .then(data => {
      const citasUsuario = data.filter(cita => cita.idCliente == userId);
      citasHomeList.innerHTML = citasUsuario.length === 0
        ? "<p>No tienes citas programadas.</p>"
        : citasUsuario.map(cita => `
            <div class="cita-card">
              <div class="cita-info">
                <div class="cita-label">Fecha</div>
                <div class="cita-fecha">${cita.fecha}</div>
              </div>
              <div class="cita-detalle">
                <div><span class="cita-label">Hora:</span> ${cita.hora}</div>
                <div><span class="cita-label">Descripción:</span><br>${cita.descripcion || 'Sin descripción'}</div>
              </div>
            </div>
          `).join("");
    });
}



  if (userId && listaVehiculosDashboard) {
  fetch(API_VEHICULOS)
    .then(res => res.json())
    .then(data => {
      const vehiculos = data.filter(v => v.idCliente == userId);
      listaVehiculosDashboard.innerHTML = vehiculos.length === 0
        ? "<p>No tienes vehículos registrados.</p>"
        : vehiculos.map(v => `
            <div class="vehiculo-card animate-slide-in">
              <div class="vehiculo-header">
                <h6>${v.marca || 'Vehículo'} ${v.modelo || ''}</h6>
                <button class="vehiculo-btn" onclick="location.href='../Mis Vehiculos/Vehiculos.html'">
                  <i class="fas fa-chevron-right"></i>
                </button>
              </div>
              <div class="vehiculo-info">
                <p><span>Color:</span> ${v.color}</p>
                <p><span>Placa:</span> ${v.placa}</p>
                <p><span>VIN:</span> ${v.vin}</p>
              </div>
            </div>
          `).join("");
    });
}
});
