document.addEventListener("DOMContentLoaded", () => {
  // ====== Endpoints ======
  const userId = localStorage.getItem("userId");
  const API_USER      = `https://retoolapi.dev/DeaUI0/registro/${userId}`;
  const API_CITAS     = `https://retoolapi.dev/2Kfhrs/cita`;
  const API_VEHICULOS = "https://retoolapi.dev/4XQf28/anadirvehiculo";

  // ====== DOM ======
  const overlay   = document.getElementById("overlay");
  const profileMenu = document.getElementById("profileMenu");
  const menuToggle  = document.getElementById("menuToggle");
  const closeMenu   = document.getElementById("closeMenu");
  const logoutBtn   = document.getElementById("logoutBtn");

  const nombreHeader = document.getElementById("nombreHeader");
  const menuUserId = document.getElementById("menuUserId");
  const menuNombre = document.getElementById("menuNombre");
  const menuPase   = document.getElementById("menuPase");
  const avatarLink = document.getElementById("userIconLink");

  const citasHomeList = document.getElementById("citasHomeList");
  const chipsCitas    = document.getElementById("citasChips");
  const tplCita       = document.getElementById("tplCitaCard");

  const listaVehiculosDashboard = document.getElementById("listaVehiculosDashboard");
  const tplVehiculo   = document.getElementById("tplVehiculoCard");

  // ====== Sidebar ======
  function abrirMenu() {
    profileMenu?.classList.add("open");
    overlay?.classList.add("show");
    overlay?.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
  function cerrarMenu() {
    profileMenu?.classList.remove("open");
    overlay?.classList.remove("show");
    overlay?.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }
  menuToggle?.addEventListener("click", () => {
    menuToggle.classList.add("spin");
    setTimeout(() => menuToggle.classList.remove("spin"), 600);
    abrirMenu();
  });
  closeMenu?.addEventListener("click", cerrarMenu);
  overlay?.addEventListener("click", cerrarMenu);
  window.addEventListener("keydown", (e) => e.key === "Escape" && cerrarMenu());

  // ====== Header / Menú ======
  if (menuUserId) menuUserId.textContent = userId || "Desconocido";
  avatarLink?.addEventListener("click", () => { window.location.href = "../Ajustes/ajustes.html"; });

  if (userId) {
    fetch(API_USER)
      .then(res => res.json())
      .then(user => {
        const nombre = `${user?.nombre ?? ""} ${user?.apellido ?? ""}`.trim() || "Usuario";
        if (nombreHeader) nombreHeader.textContent = nombre;
        if (menuNombre)   menuNombre.textContent = nombre;
        if (menuPase)     menuPase.textContent   = user?.pase || "Cliente";
        localStorage.setItem("nombre", nombre);
        if (user?.email) localStorage.setItem("email", user.email);
      })
      .catch(() => {
        if (nombreHeader) nombreHeader.textContent = localStorage.getItem("nombre") || "Usuario";
      });
  } else {
    if (nombreHeader) nombreHeader.textContent = localStorage.getItem("nombre") || "Usuario";
  }

  // ====== Logout ======
  logoutBtn?.addEventListener("click", async (e) => {
    e.preventDefault();
    try { /* opcional: invalida sesión en backend */ } catch {}
    finally {
      ["userId","nombre","name","email","pase","authToken","token","refreshToken"].forEach(k => localStorage.removeItem(k));
      sessionStorage.clear();
      document.cookie = "authToken=; Max-Age=0; path=/";
      const redirectTo = logoutBtn.getAttribute("href") || "../Authenticator/login.html";
      window.location.replace(redirectTo);
    }
  });

  // ====== Helpers ======
  const setText = (el, v) => { if (el) el.textContent = v ?? "—"; };
  const setBg   = (el, css) => { if (el) el.style.backgroundImage = css; };

  const fechaISOaObj = (iso) => {
    if (!iso) return null;
    const [y,m,d] = iso.split("-").map(Number);
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d);
  };
  const isToday = (iso) => {
    const d = fechaISOaObj(iso); if (!d) return false;
    const now = new Date();
    return d.getFullYear() === now.getFullYear() &&
           d.getMonth() === now.getMonth() &&
           d.getDate() === now.getDate();
  };
  const withinNextDays = (iso, days=7) => {
    const d = fechaISOaObj(iso); if (!d) return false;
    const start = new Date(); start.setHours(0,0,0,0);
    const end = new Date(start); end.setDate(end.getDate() + days);
    return d >= start && d <= end;
  };

  const fmtLabelHora = (fecha, hora) => {
    if (!fecha) return hora || "—";
    const d = fechaISOaObj(fecha); if (!d) return hora || "—";
    const hoy = new Date();
    const sameDay = d.toDateString() === hoy.toDateString();
    const pre = sameDay ? "Hoy" : d.toLocaleDateString("es", { weekday: "short" });
    return `${pre}, ${hora || "—"}`;
  };

  // ====== Favoritos (citas) ======
  const FAV_KEY = "citas_favoritas";
  const getFavs = () => { try { return JSON.parse(localStorage.getItem(FAV_KEY)) || []; } catch { return []; } };
  const setFavs = (arr) => localStorage.setItem(FAV_KEY, JSON.stringify(arr));
  const toggleFav = (id) => {
    const list = getFavs();
    const sid = String(id);
    const i = list.indexOf(sid);
    i === -1 ? list.push(sid) : list.splice(i, 1);
    setFavs(list);
    return list.includes(sid);
  };

  // ====== Citas (INDEX) ======
  let citasRaw = [];
  let filtro = "hoy"; // hoy | semana | todas

  chipsCitas?.addEventListener("click", (e) => {
    const a = e.target.closest("a[data-filter]");
    if (!a) return;
    e.preventDefault();
    chipsCitas.querySelectorAll(".chip").forEach(c => c.classList.remove("chip-active"));
    a.classList.add("chip-active");
    filtro = a.dataset.filter;
    renderCitas();
  });

  function filtrarCitasPorFiltro(lista) {
    if (filtro === "hoy")   return lista.filter(c => isToday(c.fecha));
    if (filtro === "semana")return lista.filter(c => withinNextDays(c.fecha, 7));
    return lista;
  }

  function renderCitas() {
    if (!citasHomeList) return;
    citasHomeList.innerHTML = "";

    // del usuario + filtro
    let items = (citasRaw || []).filter(c => String(c.idCliente) === String(userId));
    items = filtrarCitasPorFiltro(items);

    // favoritos primero, luego por fecha
    const favs = getFavs();
    items.sort((a, b) => {
      const af = favs.includes(String(a.id));
      const bf = favs.includes(String(b.id));
      if (af && !bf) return -1;
      if (!af && bf) return 1;
      const da = fechaISOaObj(a.fecha) || new Date(0);
      const db = fechaISOaObj(b.fecha) || new Date(0);
      return da - db;
    });

    if (!tplCita) {
      // Fallback simple si faltara el template
      citasHomeList.innerHTML = items.map(c => `
        <article class="card card-hero">
          <div class="card-hero__img"></div>
          <div class="card-hero__overlay">
            <div class="pill"><i class="fa-regular fa-clock"></i><span>${c.hora ?? "—"}</span></div>
            <div class="title">${c.descripcion || "Sin descripción"}</div>
            <div class="meta">
              <button class="cita-remaining-btn" data-fecha="${c.fecha||""}" data-hora="${c.hora||""}">
                <i class="fa-solid fa-hourglass-half"></i>
              </button>
              <div class="cita-code">#CITA-${c.id}</div>
            </div>
          </div>
          <button class="fav" type="button"><i class="fa-regular fa-heart"></i></button>
        </article>
      `).join("");
      return;
    }

    const frag = document.createDocumentFragment();
    items.forEach(cita => {
      const el = tplCita.content.firstElementChild.cloneNode(true);

      // link a detalle (si quieres)
      el.setAttribute("href", `../Citas/citas.html?id=${encodeURIComponent(cita.id)}`);

      // imagen de portada
      const img = el.querySelector(".card-hero__img");
      if (img) {
        const cover = cita.cover || cita.imagen || cita.img;
        cover ? setBg(img, `url('${cover}')`) : setBg(img, "linear-gradient(145deg, #fff6f4, #f2dddb)");
      }

      // textos
      const pillSpan = el.querySelector(".pill span");
      const title    = el.querySelector(".title");
      const code     = el.querySelector(".cita-code");
      setText(pillSpan, fmtLabelHora(cita.fecha, cita.hora));
      setText(title,   cita.descripcion || "Sin descripción");
      setText(code,    `#CITA-${cita.id}`);

      // botón tiempo restante
      const btnTime = el.querySelector(".cita-remaining-btn");
      if (btnTime) {
        btnTime.dataset.fecha = cita.fecha || "";
        btnTime.dataset.hora  = cita.hora  || "";
        btnTime.title = "Tiempo restante";
      }

      // favorito
      const btnFav = el.querySelector(".fav");
      const icon   = btnFav?.querySelector("i");
      const isFav  = getFavs().includes(String(cita.id));
      if (isFav) {
        btnFav?.classList.add("is-active");
        el.classList.add("is-pinned");
        icon?.classList.remove("fa-regular");
        icon?.classList.add("fa-solid");
      }
      btnFav?.addEventListener("click", (ev) => {
        ev.preventDefault(); ev.stopPropagation();
        const active = toggleFav(cita.id);
        if (active) {
          btnFav.classList.add("is-active");
          el.classList.add("is-pinned");
          icon.classList.remove("fa-regular"); icon.classList.add("fa-solid");
        } else {
          btnFav.classList.remove("is-active");
          el.classList.remove("is-pinned");
          icon.classList.remove("fa-solid"); icon.classList.add("fa-regular");
        }
        renderCitas(); // reordenar
      });

      frag.appendChild(el);
    });

    if (!items.length) {
      const empty = document.createElement("div");
      empty.style.color = "#fff";
      empty.style.opacity = "0.9";
      empty.style.padding = "8px 2px";
      empty.textContent = (filtro === "hoy") ? "No tienes citas para hoy." :
                          (filtro === "semana") ? "No hay citas esta semana." :
                          "Sin citas registradas.";
      citasHomeList.appendChild(empty);
    } else {
      citasHomeList.appendChild(frag);
    }
  }

  // Delegado: botón “tiempo restante”
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".cita-remaining-btn");
    if (!btn) return;
    const fecha = btn.dataset.fecha;
    const hora  = btn.dataset.hora;
    if (!fecha || !hora) return;

    const when = new Date(`${fecha}T${hora}:00`);
    const now  = new Date();
    const diff = when - now;

    const msg = (diff <= 0) ? "La cita ya pasó" : (() => {
      const totalMin = Math.floor(diff / 60000);
      const d = Math.floor(totalMin / 1440);
      const h = Math.floor((totalMin % 1440) / 60);
      const m = totalMin % 60;
      const parts = [];
      if (d) parts.push(`${d} día${d>1?"s":""}`);
      if (h) parts.push(`${h} h`);
      parts.push(`${m} min`);
      return parts.join(" ");
    })();

    if (window.Swal) {
      Swal.fire({
        icon: diff > 0 ? "info" : "warning",
        title: "Tiempo restante",
        text: `${msg} para tu cita (${fecha} ${hora})`,
        confirmButtonColor: "#c91a1a"
      });
    } else {
      alert(`${msg} para tu cita (${fecha} ${hora})`);
    }
  });

  // Cargar citas
  if (userId && citasHomeList) {
    fetch(API_CITAS, { cache: "no-store" })
      .then(res => res.json())
      .then(data => { citasRaw = Array.isArray(data) ? data : []; renderCitas(); })
      .catch(() => { citasRaw = []; renderCitas(); });
  }

  // ====== Vehículos (INDEX) ======
  function renderVehiculos(vehiculos) {
    if (!listaVehiculosDashboard) return;

    if (!vehiculos.length) {
      listaVehiculosDashboard.innerHTML = `
        <a class="card vehicle add-card" href="../Mis Vehiculos/AñadirVehiculo.html">
          <div class="add-icon"><i class="fa-solid fa-plus"></i></div>
          <div class="vehicle__body">
            <h3 class="vehicle__name">Añadir vehículo</h3>
            <p>Registra tu primer vehículo para comenzar.</p>
          </div>
          <i class="fa-solid fa-chevron-right vehicle__chev" aria-hidden="true"></i>
        </a>
      `;
      return;
    }

    const frag = document.createDocumentFragment();
    vehiculos.forEach(v => {
      const el = tplVehiculo.content.firstElementChild.cloneNode(true);
      el.href = "../Mis Vehiculos/Vehiculos.html";

      const img = el.querySelector(".vehicle__img");
      if (img && (v.foto || v.cover)) img.style.backgroundImage = `url('${v.foto || v.cover}')`;

      el.querySelector(".vehicle__name").textContent =
        `${v.marca || "Vehículo"} ${v.modelo || ""}`.trim();

      const ps = el.querySelectorAll(".vehicle__body p");
      ps[0].innerHTML = `<span>Color:</span> ${v.color || "—"}`;
      ps[1].innerHTML = `<span>Placa:</span> ${v.placa || "—"}`;
      ps[2].innerHTML = `<span>VIN:</span> ${v.vin || "—"}`;

      frag.appendChild(el);
    });

    listaVehiculosDashboard.innerHTML = "";
    listaVehiculosDashboard.appendChild(frag);
  }

  if (userId && listaVehiculosDashboard) {
    fetch(API_VEHICULOS, { cache: "no-store" })
      .then(res => res.json())
      .then(data => {
        const vehiculos = (Array.isArray(data) ? data : []).filter(v => String(v.idCliente) === String(userId));
        renderVehiculos(vehiculos);
      })
      .catch(() => renderVehiculos([]));
  }

  // ====== FAB: ocultar al bajar, mostrar al subir ======
  const fab = document.querySelector(".fab");
  if (fab) {
    let lastY = window.scrollY || 0;
    window.addEventListener("scroll", () => {
      const y = window.scrollY || 0;
      if (y > lastY + 6) fab.classList.add("fab-hide");      // down
      else if (y < lastY - 6) fab.classList.remove("fab-hide"); // up
      lastY = y;
    }, { passive: true });
  }

  // ====== Buscador: usa la ruta del botón lupa ======
  (function setupSearchGo(){
    const input = document.getElementById("searchInput");
    const btn   = document.getElementById("goSearch");
    if(!input || !btn) return;
    const RESULTS_PAGE = btn.dataset.resultsHref || "./resultados.html";
    function go(){
      const q = (input.value || "").trim();
      if(!q){
        if(window.Swal){
          Swal.fire({icon:"info", title:"Escribe algo para buscar", confirmButtonColor:"#c91a1a"});
        }
        return;
      }
      window.location.href = `${RESULTS_PAGE}?q=${encodeURIComponent(q)}`;
    }
    btn.addEventListener("click", go);
    input.addEventListener("keydown", e => { if(e.key === "Enter"){ e.preventDefault(); go(); }});
  })();
});
