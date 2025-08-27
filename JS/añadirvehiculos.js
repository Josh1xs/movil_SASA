document.addEventListener("DOMContentLoaded", () => {
  const API_VEHICULOS = "https://retoolapi.dev/4XQf28/anadirvehiculo";
  const userId = localStorage.getItem("userId");

  // ===== Sidebar =====
  const overlay     = document.getElementById("overlay");
  const profileMenu = document.getElementById("profileMenu");
  const menuToggle  = document.getElementById("menuToggle");
  const closeMenu   = document.getElementById("closeMenu");
  const logoutBtn   = document.getElementById("logoutBtn");

  function openMenu(){
    profileMenu?.classList.add("open");
    profileMenu?.setAttribute("aria-hidden","false");
    overlay?.classList.add("show");
    overlay?.setAttribute("aria-hidden","false");
    document.body.style.overflow = "hidden";
  }
  function closeSidebar(){
    profileMenu?.classList.remove("open");
    profileMenu?.setAttribute("aria-hidden","true");
    overlay?.classList.remove("show");
    overlay?.setAttribute("aria-hidden","true");
    document.body.style.overflow = "";
  }
  menuToggle?.addEventListener("click", () => {
    menuToggle.classList.add("spin");
    setTimeout(() => menuToggle.classList.remove("spin"), 600);
    openMenu();
  });
  closeMenu?.addEventListener("click", closeSidebar);
  overlay?.addEventListener("click", closeSidebar);
  window.addEventListener("keydown", e => { if (e.key === "Escape") closeSidebar(); });

  // Usuario en menú
  document.getElementById("menuUserId") && (document.getElementById("menuUserId").textContent = userId || "Desconocido");
  if (userId){
    fetch(`https://retoolapi.dev/DeaUI0/registro/${userId}`)
      .then(r=>r.json()).then(u=>{
        document.getElementById("menuNombre") && (document.getElementById("menuNombre").textContent = `${u?.nombre??""} ${u?.apellido??""}`.trim() || "Usuario");
        document.getElementById("menuPase")   && (document.getElementById("menuPase").textContent   = u?.pase || "Cliente");
      }).catch(()=>{});
  }

  // Logout (opcional)
  logoutBtn?.addEventListener("click", async (e) => {
    e.preventDefault();
    try {} finally {
      ["userId","nombre","name","email","pase","authToken","token","refreshToken"].forEach(k => localStorage.removeItem(k));
      sessionStorage.clear();
      document.cookie = "authToken=; Max-Age=0; path=/";
      const redirectTo = logoutBtn.getAttribute("href") || "../Authenticator/login.html";
      window.location.replace(redirectTo);
    }
  });

  // ===== Form =====
  const form = document.getElementById("formVehiculo");
  const marca  = document.getElementById("marca");
  const modelo = document.getElementById("modelo");
  const anio   = document.getElementById("anio");
  const estado = document.getElementById("estado");
  const placa  = document.getElementById("placa");
  const vin    = document.getElementById("vin");

  const y = new Date().getFullYear();
  if (anio) {
    anio.setAttribute("min", "1980");
    anio.setAttribute("max", String(y + 1));
  }

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!userId) { alert("Debes iniciar sesión."); return; }

    const payload = {
      idCliente: String(userId),
      marca: (marca.value || "").trim(),
      modelo: (modelo.value || "").trim(),
      año: Number(anio.value || 0),       // ← campo año en la BD
      placa: (placa.value || "").trim(),
      vin: (vin.value || "").trim(),
      estado: (estado.value || "").trim() // Excelente / Bueno / Regular / Malo
    };

    // Validaciones simples
    if (!payload.marca || !payload.modelo || !payload.año || !payload.placa || !payload.vin || !payload.estado) {
      alert("Completa todos los campos obligatorios.");
      return;
    }
    if (String(payload.vin).length < 10) {
      alert("El VIN debe tener al menos 10 caracteres.");
      return;
    }

    try {
      const r = await fetch(API_VEHICULOS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!r.ok) throw new Error("Bad response");

      alert("Vehículo guardado correctamente.");
      window.location.href = "./Vehiculos.html";
    } catch (e) {
      console.error(e);
      alert("No se pudo guardar el vehículo.");
    }
  });
});
