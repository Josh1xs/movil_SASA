const API_CITAS = "https://retoolapi.dev/2Kfhrs/cita";
const API_VEH   = "https://retoolapi.dev/4XQf28/anadirvehiculo";
const API_USER_BASE = "https://retoolapi.dev/DeaUI0/registro/";


const qs = (s) => document.querySelector(s);
const params = new URLSearchParams(location.search);
const citaId = params.get("id");


(function sidebar(){
  const overlay = qs("#overlay");
  const menu = qs("#profileMenu");
  const toggle = qs("#menuToggle");
  const closeMenu = qs("#closeMenu");

  function open(){ menu.classList.add("open"); overlay.classList.add("show"); overlay.setAttribute("aria-hidden","false"); document.body.style.overflow="hidden"; }
  function close(){ menu.classList.remove("open"); overlay.classList.remove("show"); overlay.setAttribute("aria-hidden","true"); document.body.style.overflow=""; }

  toggle?.addEventListener("click", ()=>{ toggle.classList.add("spin"); setTimeout(()=>toggle.classList.remove("spin"),600); open(); });
  closeMenu?.addEventListener("click", close);
  overlay?.addEventListener("click", close);
  window.addEventListener("keydown", (e)=> e.key==="Escape" && close());


  const userId = localStorage.getItem("userId");
  qs("#menuUserId").textContent = userId || "Desconocido";
  if (userId){
    fetch(API_USER_BASE + userId).then(r=>r.json()).then(u=>{
      qs("#menuNombre").textContent = `${u?.nombre??""} ${u?.apellido??""}`.trim() || "Usuario";
      qs("#menuPase").textContent   = u?.pase || "Cliente";
    }).catch(()=>{});
  }
})();


async function loadDetalle(){
  if (!citaId){ location.replace("./citas.html"); return; }
  try{
    const cita = await fetch(`${API_CITAS}/${encodeURIComponent(citaId)}`).then(r=>r.json());

    
    qs("#titleFecha").textContent = cita.fecha || "—";
    qs("#code").textContent       = `#CITA-${cita.id ?? "—"}`;


    qs("#horaTxt").textContent    = cita.hora || "—";
    qs("#estadoTxt").textContent  = cita.estado || "—";
    qs("#descTxt").textContent    = cita.descripcion || "—";

    let vehiculoTxt = "—";
    if (cita.idVehiculo){
      try{
        const veh = await fetch(`${API_VEH}/${cita.idVehiculo}`).then(r=>r.json());
        vehiculoTxt = `${veh.marca || "Vehículo"} ${veh.modelo || ""} - ${veh.placa || ""}`.trim();
      }catch{}
    }
    qs("#vehiculoTxt").textContent = vehiculoTxt;


    qs("#btnPdf").dataset.fecha = cita.fecha || "";
    qs("#btnPdf").dataset.hora  = cita.hora  || "";
    qs("#btnPdf").dataset.code  = cita.id ? `#CITA-${cita.id}` : "cita";
  }catch(err){
    console.error(err);
    if (window.Swal) Swal.fire("Error","No se pudo cargar el detalle","error");
  }
}


async function downloadPDF(){
  const card = qs("#citaCard");
  if (!card) return;

  const fecha = qs("#btnPdf").dataset.fecha || "";
  const hora  = qs("#btnPdf").dataset.hora  || "";
  const code  = qs("#btnPdf").dataset.code  || "cita";

  try{
    const canvas = await html2canvas(card, { scale: 2, useCORS: true, background:"#ffffff" });
    const imgData = canvas.toDataURL("image/png");

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ orientation:"p", unit:"pt", format:"a4" });
    const pageWidth  = pdf.internal.pageSize.getWidth();
    const margin = 36; 
    const renderWidth = pageWidth - margin*2;
    const ratio = canvas.height / canvas.width;
    const renderHeight = renderWidth * ratio;

    pdf.addImage(imgData, "PNG", margin, margin, renderWidth, renderHeight, undefined, "FAST");

    const safeFecha = fecha.replaceAll("/","-");
    pdf.save(`detalle-${code}-${safeFecha || "sasa"}.pdf`);
  }catch(err){
    console.error(err);
    if (window.Swal) Swal.fire("Error","No se pudo generar el PDF","error");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadDetalle();
  qs("#btnPdf")?.addEventListener("click", downloadPDF);
});
