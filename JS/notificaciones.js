document.addEventListener("DOMContentLoaded", () => {
  /* =========================
     Config
     ========================= */
  const USERS_API_BASE = "https://retoolapi.dev/DeaUI0/registro";
  const NOTIFS_API_BASE = "https://retoolapi.dev/IOhfB6/notificaciones";

  const userId = localStorage.getItem("userId");

  /* =========================
     DOM refs
     ========================= */
  const overlay = document.getElementById("overlay");
  const profileMenu = document.getElementById("profileMenu");
  const menuToggle = document.getElementById("menuToggle");
  const menuToggleBottom = document.getElementById("menuToggleBottom");
  const closeMenuBtn = document.getElementById("closeMenu");

  const userIdElement = document.getElementById("menuUserId");
  const nombreElement = document.getElementById("menuNombre");
  const paseElement = document.getElementById("menuPase");

  const container = document.getElementById("notificacionesContainer");

  /* =========================
     Helpers UI (menú lateral)
     ========================= */
  function openMenu() {
    profileMenu?.classList.add("open");
    overlay?.classList.add("show");
  }
  function closeMenu() {
    profileMenu?.classList.remove("open");
    overlay?.classList.remove("show");
  }
  menuToggle?.addEventListener("click", openMenu);
  menuToggleBottom?.addEventListener("click", openMenu);
  closeMenuBtn?.addEventListener("click", closeMenu);
  overlay?.addEventListener("click", closeMenu);

  /* =========================
     Load User
     ========================= */
  if (userIdElement) userIdElement.textContent = userId || "Desconocido";

  if (userId) {
    fetch(`${USERS_API_BASE}/${userId}`)
      .then(r => r.json())
      .then(user => {
        if (user && typeof user === "object") {
          nombreElement && (nombreElement.textContent = `${user.nombre ?? ""} ${user.apellido ?? ""}`.trim() || "Usuario");
          paseElement && (paseElement.textContent = user.pase || "Cliente");
        }
      })
      .catch(err => console.error("Error cargando usuario:", err));
  }

  /* =========================
     Notificaciones
     ========================= */
  let notifications = [];

  function escapeHTML(str) {
    return String(str ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function cardTemplate(n) {
    // Estructura compatible con el CSS: grid 1fr | auto + botones
    return `
      <article class="notification-card" data-id="${escapeHTML(n.id)}">
        <div>
          <h5>${escapeHTML(n.titulo || "Notificación")}</h5>
          <p>${escapeHTML(n.descripcion || "")}</p>
          <div class="actions-icons" style="margin-top:10px;">
            <button class="btn-icon delete" title="Eliminar" aria-label="Eliminar notificación">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </div>
        <time class="notification-card__time" datetime="${escapeHTML(n.fecha || "")}">
          ${escapeHTML(n.fecha || "")}
        </time>
      </article>
    `;
  }

  function render() {
    if (!container) return;
    if (!notifications.length) {
      container.innerHTML = `
        <div class="notification-card">
          <h5>No tienes notificaciones</h5>
          <p class="text-muted">Aquí verás recordatorios, cambios de citas y novedades.</p>
        </div>`;
      return;
    }
    container.innerHTML = notifications.map(cardTemplate).join("");
  }

  // Cargar desde API
  async function loadNotifications() {
    try {
      const res = await fetch(NOTIFS_API_BASE);
      const data = await res.json();
      // Filtra por cliente
      const list = Array.isArray(data) ? data.filter(n => String(n.idCliente) === String(userId)) : [];
      // Muestra las más recientes primero
      notifications = list.reverse();
      render();
    } catch (err) {
      console.error("Error al cargar notificaciones:", err);
      container.innerHTML = `<p class="text-danger text-center">Error al cargar notificaciones.</p>`;
    }
  }

  // Eliminar en API y refrescar
  async function deleteNotification(id) {
    try {
      const res = await fetch(`${NOTIFS_API_BASE}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`DELETE ${res.status}`);
      // Quitar de la lista local y re-renderizar
      notifications = notifications.filter(n => String(n.id) !== String(id));
      render();
    } catch (err) {
      console.error("Error eliminando notificación:", err);
      if (window.Swal) {
        Swal.fire("Error", "No se pudo eliminar la notificación.", "error");
      } else {
        alert("No se pudo eliminar la notificación.");
      }
    }
  }

  // Confirmación amable (SweetAlert2 si está disponible)
  function confirmDelete(id) {
    if (window.Swal) {
      Swal.fire({
        title: "¿Eliminar esta notificación?",
        text: "Esta acción no se puede deshacer.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#c91a1a",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar"
      }).then(r => { if (r.isConfirmed) deleteNotification(id); });
    } else {
      if (confirm("¿Eliminar esta notificación?")) deleteNotification(id);
    }
  }

  // Delegación de eventos: eliminar
  container?.addEventListener("click", (e) => {
    const delBtn = e.target.closest(".delete");
    if (!delBtn) return;
    const card = e.target.closest(".notification-card");
    const id = card?.getAttribute("data-id");
    if (!id) return;
    confirmDelete(id);
  });

  // Init
  loadNotifications();
});
