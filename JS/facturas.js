document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.getElementById("menuToggle");
  const profileMenu = document.getElementById("profileMenu");
  const overlay = document.getElementById("overlay");
  const closeMenu = document.getElementById("closeMenu");

  function closeProfileMenu() {
    profileMenu.classList.remove("open");
    overlay.classList.remove("show");
  }

  // Abrir y cerrar menú Pokémon
  menuToggle?.addEventListener("click", () => {
    profileMenu.classList.add("open");
    overlay.classList.add("show");
  });
  closeMenu?.addEventListener("click", closeProfileMenu);
  overlay?.addEventListener("click", closeProfileMenu);

  // Navegación fluida en menú
  document.querySelectorAll(".profile-menu a").forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      const href = link.getAttribute("href");
      closeProfileMenu();
      setTimeout(() => {
        window.location.href = href;
      }, 300);
    });
  });

  // Mostrar datos del usuario (si se desea mantener)
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
      .catch(err => console.error("Error cargando usuario:", err));
  }

  // Mostrar TODAS las facturas
  const contenedor = document.getElementById("facturasContainer");

  fetch("https://retoolapi.dev/P7S5Iw/facturas")
    .then(res => res.json())
    .then(data => {
      if (data.length === 0) {
        contenedor.innerHTML = "<p class='text-center text-muted'>No hay facturas registradas.</p>";
        return;
      }

      data.forEach(factura => {
        if (!factura.fecha || factura["monto total"] <= 0) return;

        const div = document.createElement("div");
        div.classList.add("card");
        div.innerHTML = `
          <h5 class="text-danger">Factura #${factura.id}</h5>
          <p><strong>Fecha:</strong> ${factura.fecha}</p>
          <p><strong>Total:</strong> $${factura["monto total"]}</p>
          <p><strong>Empleado:</strong> ${factura.idEmpleado}</p>
          <p><strong>Cliente:</strong> ${factura.idCliente || "No asignado"}</p>
        `;
        contenedor.appendChild(div);
      });
    })
    .catch(err => {
      console.error("Error al cargar facturas:", err);
      contenedor.innerHTML = "<p class='text-danger'>Error al cargar facturas.</p>";
    });
});
