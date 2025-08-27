// ==================== F A C T U R A   D E T A L L E (JS COMPLETO) ====================
document.addEventListener("DOMContentLoaded", () => {
  const qs = s => document.querySelector(s);
  const params = new URLSearchParams(location.search);
  const id = params.get("id");

  // ===== Sidebar unificado =====
  const overlay     = qs("#overlay");
  const profileMenu = qs("#profileMenu");
  const menuToggle  = qs("#menuToggle");
  const closeMenu   = qs("#closeMenu");

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
  overlay?.addEventListener("click", () => { if (profileMenu?.classList.contains("open")) closeSidebar(); });
  window.addEventListener("keydown", e => { if (e.key === "Escape") closeSidebar(); });

  // Relleno de usuario (opcional)
  const userId = localStorage.getItem("userId");
  qs("#menuUserId") && (qs("#menuUserId").textContent = userId || "Desconocido");
  if (userId){
    fetch(`https://retoolapi.dev/DeaUI0/registro/${userId}`)
      .then(r=>r.json()).then(u=>{
        qs("#menuNombre") && (qs("#menuNombre").textContent = `${u?.nombre??""} ${u?.apellido??""}`.trim() || "Usuario");
        qs("#menuPase")   && (qs("#menuPase").textContent   = u?.pase || "Cliente");
      }).catch(()=>{});
  }

  // ===== Nodos detalle =====
  const title = qs("#invTitle");
  const estado = qs("#invEstado");
  const fecha  = qs("#invFecha");
  const empl   = qs("#invEmpleado");
  const mant   = qs("#invMant");
  const total  = qs("#invTotal");
  const pagos  = qs("#invPagos");
  const saldo  = qs("#invSaldo");
  const btnPagar = qs("#btnPagar");

  const money = n => Number(n||0).toLocaleString("es-SV",{style:"currency",currency:"USD"});

  // ===== Cargar factura =====
  async function loadInvoice() {
    if (!id) { title.textContent = "Factura —"; return; }
    try {
      const r = await fetch(`https://retoolapi.dev/P7S5Iw/facturas/${id}`, { cache:"no-store" });
      const f = await r.json();

      title.textContent = `Factura #${f.id ?? id}`;
      estado.textContent = (f.estado || "Pendiente");
      estado.className = "badge";
      if ((f.estado||"").toLowerCase() === "pagada") {
        estado.style.background = "#dcfce7";
        estado.style.color = "#166534";
      } else {
        estado.style.background = "#fde68a";
        estado.style.color = "#7c5e10";
      }

      fecha.textContent = f.fecha ? new Date(f.fecha).toLocaleString() : "—";
      empl.textContent  = f.idEmpleado ?? "—";
      mant.textContent  = f.mantenimiento || "—";

      const montoTotal = f["monto total"] ?? 0;
      const pagosAplic = f["pagos aplicados"] ?? 0;
      const saldoNum   = (montoTotal || 0) - (pagosAplic || 0);

      total.textContent = money(montoTotal);
      pagos.textContent = money(pagosAplic);
      saldo.textContent = money(saldoNum);

      // Info para modal
      qs("#pmFactura").textContent = `#${f.id ?? id}`;
      qs("#pmSaldo").textContent   = money(saldoNum);
      btnPagar.disabled = saldoNum <= 0;
      btnPagar.title = saldoNum <= 0 ? "Factura ya pagada" : "Pagar saldo";
    } catch (e) {
      console.error("Error cargando factura:", e);
    }
  }
  loadInvoice();

  // ===== Modal de pago (blur de fondo, sin deslizamientos) =====
  const appShell = qs(".app-shell");
  const tabbar   = qs(".tabbar");
  const backdrop = qs("#payBackdrop");
  const modal    = qs("#payModal");
  const payClose = qs("#payClose");

  const tabBtns    = document.querySelectorAll(".pay-tab");
  const formCard   = qs("#formCard");
  const formPaypal = qs("#formPaypal");
  const btnSubmit  = qs("#btnSubmitModal");
  const btnCancel  = qs("#btnCancelModal");

  function openModal(){
    backdrop.classList.add("show");
    backdrop.setAttribute("aria-hidden","false");
    modal.classList.add("show");
    modal.setAttribute("aria-hidden","false");
    appShell?.setAttribute("inert","");
    tabbar?.setAttribute("inert","");
    setTimeout(()=> qs("#ccNumber")?.focus(), 40);
  }
  function closeModal(){
    modal.classList.remove("show");
    modal.setAttribute("aria-hidden","true");
    backdrop.classList.remove("show");
    backdrop.setAttribute("aria-hidden","true");
    appShell?.removeAttribute("inert");
    tabbar?.removeAttribute("inert");
  }
  btnPagar?.addEventListener("click", openModal);
  payClose?.addEventListener("click", closeModal);
  btnCancel?.addEventListener("click", closeModal);
  backdrop?.addEventListener("click", closeModal);
  window.addEventListener("keydown", e => { if(e.key==="Escape") closeModal(); });

  // Tabs
  function setActiveTab(tab){
    tabBtns.forEach(b=>{
      const active = b.dataset.tab === tab;
      b.setAttribute("aria-selected", active ? "true" : "false");
      b.classList.toggle("active", active);
    });
    formCard.classList.toggle("show", tab === "card");
    formPaypal.classList.toggle("show", tab !== "card");
    btnSubmit.setAttribute("form", tab === "card" ? "formCard" : "formPaypal");
    btnSubmit.textContent = (tab === "card") ? "Pagar ahora" : "Continuar";
    (tab === "card" ? qs("#ccNumber") : qs("#ppEmail"))?.focus();
  }
  tabBtns.forEach(b => b.addEventListener("click", () => setActiveTab(b.dataset.tab)));
  setActiveTab("card");

  // Formateo suave tarjeta
  const ccNumber = qs("#ccNumber");
  const ccExp    = qs("#ccExp");
  ccNumber?.addEventListener("input", () => {
    let v = ccNumber.value.replace(/\D/g,"").slice(0,19);
    ccNumber.value = v.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
  });
  ccExp?.addEventListener("input", () => {
    let v = ccExp.value.replace(/\D/g,"").slice(0,4);
    if (v.length >= 3) v = v.slice(0,2) + "/" + v.slice(2);
    ccExp.value = v;
  });

  // Envíos (simulados / placeholder)
  formCard?.addEventListener("submit", e=>{
    e.preventDefault();
    const ok =
      ccNumber.value.replace(/\s/g,"").length >= 15 &&
      qs("#ccName").value.trim() &&
      /^\d{2}\/\d{2}$/.test(ccExp.value) &&
      qs("#ccCvv").value.trim().length >= 3 &&
      formCard.querySelector('input[name="save"]:checked');
    if(!ok){ alert("Revisa los datos de tu tarjeta."); return; }
    closeModal();
    alert("Pago procesado. ¡Gracias!");
  });

  formPaypal?.addEventListener("submit", e=>{
    e.preventDefault();
    const email = qs("#ppEmail").value.trim();
    if(!email || !email.includes("@")){ alert("Ingresa un correo válido."); return; }
    closeModal();
    alert("Procesando pago…");
  });
});
