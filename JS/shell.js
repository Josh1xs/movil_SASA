// JS/shell.js
document.addEventListener("DOMContentLoaded", () => {
  const qs = s => document.querySelector(s);

  const overlay = qs("#overlay");
  const menu    = qs("#profileMenu");
  const openBtn = qs("#menuToggle");
  const closeBtn= qs("#closeMenu");
  const logout  = qs("#logoutBtn");

  function openMenu(){
    menu?.classList.add("open");
    menu?.setAttribute("aria-hidden","false");
    overlay?.classList.add("show");
    overlay?.setAttribute("aria-hidden","false");
    document.body.style.overflow = "hidden";
  }
  function closeMenu(){
    menu?.classList.remove("open");
    menu?.setAttribute("aria-hidden","true");
    overlay?.classList.remove("show");
    overlay?.setAttribute("aria-hidden","true");
    document.body.style.overflow = "";
  }

  openBtn?.addEventListener("click", () => {
    openBtn.classList.add("spin");
    setTimeout(()=>openBtn.classList.remove("spin"), 600);
    openMenu();
  });
  closeBtn?.addEventListener("click", closeMenu);
  overlay?.addEventListener("click", closeMenu);
  window.addEventListener("keydown", e => { if(e.key === "Escape") closeMenu(); });

  // Rellena datos de usuario
  const userId = localStorage.getItem("userId");
  qs("#menuUserId") && (qs("#menuUserId").textContent = userId || "Desconocido");

  if (userId){
    fetch(`https://retoolapi.dev/DeaUI0/registro/${userId}`)
      .then(r=>r.json())
      .then(u=>{
        const nombre = `${u?.nombre??""} ${u?.apellido??""}`.trim() || "Usuario";
        qs("#menuNombre") && (qs("#menuNombre").textContent = nombre);
        qs("#menuPase")   && (qs("#menuPase").textContent   = u?.pase || "Cliente");
      })
      .catch(()=>{});
  }

  // Logout
  logout?.addEventListener("click", (e) => {
    e.preventDefault();
    try { /* opcional: invalidar en backend */ } catch {}
    finally{
      ["userId","nombre","name","email","pase","authToken","token","refreshToken"].forEach(k => localStorage.removeItem(k));
      sessionStorage.clear();
      document.cookie = "authToken=; Max-Age=0; path=/";
      const url = logout.getAttribute("href") || "../Authenticator/login.html";
      window.location.replace(url);
    }
  });
});
