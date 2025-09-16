// ===============================
// menu.js - Manejo del menú perfil
// ===============================

document.addEventListener("DOMContentLoaded", () => {
  const qs = (s) => document.querySelector(s);

  const overlay  = qs("#overlay");
  const menu     = qs("#profileMenu");
  const openBtn  = qs("#menuToggle");
  const closeBtn = qs("#closeMenu");
  const logout   = qs("#logoutBtn");

  function openMenu() {
    menu?.classList.add("open");
    overlay?.classList.add("show");
    document.body.style.overflow = "hidden";
  }

  function closeMenu() {
    menu?.classList.remove("open");
    overlay?.classList.remove("show");
    document.body.style.overflow = "";
  }

  openBtn?.addEventListener("click", () => {
    openBtn.classList.add("spin");
    setTimeout(() => openBtn.classList.remove("spin"), 600);
    openMenu();
  });
  closeBtn?.addEventListener("click", closeMenu);
  overlay?.addEventListener("click", closeMenu);
  window.addEventListener("keydown", (e) => { if (e.key === "Escape") closeMenu(); });

  // Mostrar datos de usuario
  const userId = localStorage.getItem("userId");
  if (qs("#menuUserId")) qs("#menuUserId").textContent = userId || "Desconocido";

  if (userId) {
    fetch(`http://localhost:8080/apiCliente/${userId}`)
      .then((r) => r.json())
      .then((u) => {
        const nombre = `${u?.nombre ?? ""} ${u?.apellido ?? ""}`.trim() || "Usuario";

        if (qs("#menuNombre")) qs("#menuNombre").textContent = nombre;
        if (qs("#menuPase")) qs("#menuPase").textContent = u?.pase || "Cliente";

        localStorage.setItem("nombre", nombre);
        if (u?.correo) localStorage.setItem("email", u.correo);
      })
      .catch(() => {});
  }

  // Logout
  logout?.addEventListener("click", (e) => {
    e.preventDefault();

    [
      "userId", "nombre", "name", "email",
      "pase", "authToken", "token", "refreshToken"
    ].forEach((k) => localStorage.removeItem(k));

    sessionStorage.clear();
    document.cookie = "authToken=; Max-Age=0; path=/";

    const url = logout.getAttribute("href") || "../Authenticator/login.html";
    window.location.replace(url);
  });
});
