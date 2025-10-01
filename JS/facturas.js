// ../JS/facturas.js
const $ = (s,c=document)=>c.querySelector(s);
const $$ = (s,c=document)=>Array.from(c.querySelectorAll(s));

const userId = localStorage.getItem("userId");

const isProd = typeof window!=="undefined" && window.location.hostname.includes("vercel.app");
const API_BASE = isProd
  ? "https://sasa-expo-j7n5lcpcp-david-guardados-projects.vercel.app"
  : "http://localhost:8080";

const API_FACTURAS   = `${API_BASE}/apiFactura`;
const API_ORDENES    = `${API_BASE}/apiOrdenTrabajo`;
const API_DETALLES   = `${API_BASE}/apiDetalleOrden`;
const KEY_ARCH = (userId ? `archived_invoices_${userId}` : `archived_invoices`);

function getArchived(){try{return JSON.parse(localStorage.getItem(KEY_ARCH)||"[]")}catch{return[]}}
function setArchived(arr){localStorage.setItem(KEY_ARCH,JSON.stringify(arr||[]))}
function isArchived(id){return getArchived().includes(String(id))}
function toggleArchive(id,on){const set=new Set(getArchived());on?set.add(String(id)):set.delete(String(id));setArchived([...set])}

async function http(url,{method="GET",headers={},body,credentials}={}){
  const isForm = body instanceof FormData;
  const baseHeaders = isForm?{}:{"Content-Type":"application/json"};
  const token = localStorage.getItem("authToken");
  const auth  = token?{Authorization:`Bearer ${token}`}:{};
  const res = await fetch(url,{method,headers:{...baseHeaders,...auth,...headers},body,credentials});
  const text = await res.text();
  if(!res.ok) throw new Error(`HTTP ${res.status} -> ${url}\n${text}`);
  try{return text?JSON.parse(text):null}catch{return text}
}

function normalizePage(json){
  if(json?.data?.content) return {content:json.data.content,totalElements:json.data.totalElements??json.data.content.length};
  if(json?.content)        return {content:json.content,totalElements:json.totalElements??json.content.length};
  if(Array.isArray(json?.data)) return {content:json.data,totalElements:json.data.length};
  if(Array.isArray(json))        return {content:json,totalElements:json.length};
  return {content:[],totalElements:0};
}

async function listarFacturas({page=0,size=100}={}) {
  const q = new URLSearchParams({page,size});
  const json = await http(`${API_FACTURAS}/consultar?${q.toString()}`);
  return normalizePage(json).content;
}

async function getOrdenById(id) {
  return http(`${API_ORDENES}/consultar/${encodeURIComponent(id)}`);
}

async function getDetallesByOrden(idOrden) {
  const q = new URLSearchParams({idOrden});
  const json = await http(`${API_DETALLES}/consultar?${q.toString()}`);
  const norm = normalizePage(json).content;
  return Array.isArray(norm)?norm:[];
}

function money(n){const v=Number(n||0);return v.toLocaleString("es-SV",{minimumFractionDigits:2,maximumFractionDigits:2})}
function fmtDate(d){if(!d)return "—"; const s=String(d); return s.length>=10?s.substring(0,10):s}

const listEl = $("#facturasLista");
const emptyEl = $("#facturasEmpty");

function skeleton(n=3){
  return Array.from({length:n}).map(()=>`
    <div class="card" aria-busy="true" style="overflow:hidden">
      <div style="height:16px;width:30%;background:#eef0f3;border-radius:6px;margin-bottom:10px"></div>
      <div class="invoice-grid">
        <div class="row"><div class="k" style="width:60%;height:12px;background:#f3f4f6;border-radius:6px"></div><div class="v" style="width:30%;height:12px;background:#f3f4f6;border-radius:6px"></div></div>
        <div class="row"><div class="k" style="width:50%;height:12px;background:#f3f4f6;border-radius:6px"></div><div class="v" style="width:40%;height:12px;background:#f3f4f6;border-radius:6px"></div></div>
        <div class="row"><div class="k" style="width:40%;height:12px;background:#f3f4f6;border-radius:6px"></div><div class="v" style="width:30%;height:12px;background:#f3f4f6;border-radius:6px"></div></div>
      </div>
    </div>
  `).join("");
}

function estadoBadge(estado){
  const e=(estado||"Pendiente").toLowerCase();
  const map={
    pagada:{bg:"#dcfce7",color:"#166534",txt:"Pagada"},
    pendiente:{bg:"#fef3c7",color:"#7c5e10",txt:"Pendiente"},
    cancelada:{bg:"#fee2e2",color:"#991b1b",txt:"Cancelada"}
  };
  const m = map[e]||map.pendiente;
  return `<span class="badge" style="background:${m.bg};color:${m.color}">${m.txt}</span>`;
}

function renderFacturas(facts){
  if(!facts.length){
    listEl.innerHTML="";
    emptyEl.classList.remove("hidden");
    return;
  }
  emptyEl.classList.add("hidden");
  listEl.innerHTML = facts.map(f=>{
    const id = f.idFactura ?? f.id ?? "-";
    const fecha = fmtDate(f.fecha);
    const total = money(f.montoTotal ?? f.total ?? 0);
    const metodo = f.metodoPago ?? f.metodo ?? f.metodoPagoNombre ?? "—";
const vehInferido = `${f.placaVehiculo ?? ""} ${f.marcaVehiculo ?? ""}`.trim();
const veh = f.vehiculo
  ?? f.vehiculoNombre
  ?? (vehInferido !== "" ? vehInferido : "—");
    const archived = isArchived(id);
    return `
      <article class="card" data-id="${id}" data-idorden="${f.idOrden ?? f.id_orden ?? ""}">
        <div class="invoice-head">
          <h3 class="invoice-title">#FAC-${id}</h3>
          <div class="flex" style="display:flex;gap:8px;align-items:center">
            ${estadoBadge(f.estado)}
            <button class="btn ghost btn-archive" aria-pressed="${archived}" title="${archived?"Desarchivar":"Archivar"}">
              <i class="fa-solid ${archived?"fa-box-open":"fa-box-archive"}"></i> ${archived?"Desarchivar":"Archivar"}
            </button>
          </div>
        </div>
        <div class="invoice-grid">
          <div class="row"><div class="k">Fecha</div><div class="v">${fecha}</div></div>
          <div class="row"><div class="k">Vehículo</div><div class="v">${veh||"—"}</div></div>
          <div class="row"><div class="k">Método de pago</div><div class="v">${metodo}</div></div>
          <div class="row strong"><div class="k">Total</div><div class="v">$ ${total}</div></div>
        </div>
        <div class="invoice-actions">
          <button class="btn primary btn-toggle-detalle"><i class="fa-solid fa-list"></i> Ver detalle</button>
          <button class="btn ghost btn-share"><i class="fa-solid fa-share-from-square"></i> Compartir</button>
        </div>
        <div class="detalle-wrap" hidden>
          <div class="table-wrap" style="margin-top:10px;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
            <table class="table" style="width:100%;border-collapse:collapse">
              <thead style="background:#f9fafb">
                <tr>
                  <th style="text-align:left;padding:8px 10px;font-size:.9rem;color:#6b7280">Mantenimiento</th>
                  <th style="text-align:center;padding:8px 10px;font-size:.9rem;color:#6b7280">Cant.</th>
                  <th style="text-align:right;padding:8px 10px;font-size:.9rem;color:#6b7280">Subtotal</th>
                </tr>
              </thead>
              <tbody class="tbody-detalle"></tbody>
            </table>
          </div>
        </div>
      </article>
    `;
  }).join("");
}

async function loadAndRender(){
  if(!userId){await Swal.fire("Debes iniciar sesión","","info");return}
  listEl.innerHTML = skeleton(4);
  try{
    const data = await listarFacturas({});
    const propias = data.filter(f => String(f.idCliente ?? f.clienteId ?? f.usuarioId ?? "") === String(userId));
    const visibles = propias.filter(f => !isArchived(f.idFactura ?? f.id));
    renderFacturas(visibles);
  }catch(e){
    listEl.innerHTML="";
    emptyEl.textContent="No se pudieron cargar las facturas.";
    emptyEl.classList.remove("hidden");
  }
}

async function cargarDetalleEn(article){
  const tbody = $(".tbody-detalle", article);
  const idOrden = article.dataset.idorden;
  if(!tbody) return;
  tbody.innerHTML = `<tr><td colspan="3" style="padding:10px;text-align:center;color:#6b7280">Cargando…</td></tr>`;
  try{
    let detalles=[];
    if(idOrden) detalles = await getDetallesByOrden(idOrden);
    tbody.innerHTML = detalles.length ? detalles.map(d=>{
      const nombre = d.mantenimientoNombre ?? d.nombre ?? `ID ${d.idMantenimiento ?? "-"}`;
      const cant   = d.cantidad ?? 1;
      const sub    = money(d.subtotal ?? (cant*(Number(d.precioUnitario||0))));
      return `<tr>
        <td style="padding:8px 10px;border-top:1px solid #f1f5f9">${nombre}</td>
        <td style="padding:8px 10px;border-top:1px solid #f1f5f9;text-align:center">${cant}</td>
        <td style="padding:8px 10px;border-top:1px solid #f1f5f9;text-align:right">$ ${sub}</td>
      </tr>`;
    }).join("") : `<tr><td colspan="3" style="padding:10px;text-align:center;color:#6b7280">Sin detalle disponible</td></tr>`;
  }catch{
    tbody.innerHTML = `<tr><td colspan="3" style="padding:10px;text-align:center;color:#b3261e">Error al cargar el detalle</td></tr>`;
  }
}

document.addEventListener("click", async (e)=>{
  const card = e.target.closest(".card[data-id]");
  if(e.target.closest(".btn-archive") && card){
    const id = card.dataset.id;
    const nowArchived = !(e.target.closest(".btn-archive").getAttribute("aria-pressed")==="true");
    toggleArchive(id, nowArchived);
    await loadAndRender();
    return;
  }
  if(e.target.closest(".btn-toggle-detalle") && card){
    const wrap = $(".detalle-wrap", card);
    const hidden = wrap.hasAttribute("hidden");
    if(hidden){ await cargarDetalleEn(card); wrap.removeAttribute("hidden"); e.target.closest(".btn").innerHTML='<i class="fa-solid fa-eye-slash"></i> Ocultar detalle'; }
    else{ wrap.setAttribute("hidden",""); e.target.closest(".btn").innerHTML='<i class="fa-solid fa-list"></i> Ver detalle'; }
    return;
  }
  if(e.target.closest(".btn-share") && card){
    const id = card.dataset.id;
    const url = location.origin + location.pathname.replace(/[^/]+$/,"") + `facturas.html#fac-${id}`;
    if(navigator.share){ try{ await navigator.share({title:`Factura #${id}`, text:`Factura #${id} — SASA`, url}); }catch{} }
    else{ navigator.clipboard?.writeText(url); await Swal.fire({icon:"success",title:"Enlace copiado"}); }
  }
});

const overlay = $("#overlay");
const profileMenu = $("#profileMenu");
const menuToggle = $("#menuToggle");
const closeMenu = $("#closeMenu");
function abrir(){profileMenu?.classList.add("open");overlay?.classList.add("show");}
function cerrar(){profileMenu?.classList.remove("open");overlay?.classList.remove("show");}
menuToggle?.addEventListener("click", abrir);
closeMenu?.addEventListener("click", cerrar);
overlay?.addEventListener("click", cerrar);
window.addEventListener("keydown",e=>e.key==="Escape"&&cerrar());

document.addEventListener("DOMContentLoaded", loadAndRender);
