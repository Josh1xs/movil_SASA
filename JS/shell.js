// ===============================
// menu.js - Manejo del menú perfil
// ===============================

import { getToken } from "../JS/Services/LoginService.js";

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

  // ===============================
  // Mostrar datos de usuario
  // ===============================
  const userId = localStorage.getItem("userId");
  const token  = getToken();

  if (qs("#menuUserId")) qs("#menuUserId").textContent = userId || "Desconocido";

  if (userId && token) {
    fetch(`http://localhost:8080/apiCliente/${userId}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    })
      .then((r) => {
        if (!r.ok) throw new Error(`Error ${r.status}`);
        return r.json();
      })
      .then((u) => {
        const nombre = `${u?.nombre ?? ""} ${u?.apellido ?? ""}`.trim() || "Usuario";

        if (qs("#menuNombre")) qs("#menuNombre").textContent = nombre;
        if (qs("#menuPase")) qs("#menuPase").textContent = u?.pase || "Cliente";

        localStorage.setItem("nombre", nombre);
        if (u?.correo) localStorage.setItem("email", u.correo);
      })
      .catch((err) => console.error("❌ Error cargando usuario:", err.message));
  }

  // ===============================
  // Logout
  // ===============================
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

