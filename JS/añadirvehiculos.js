const API_URL = "https://retoolapi.dev/4XQf28/anadirvehiculo";

const $ = (s)=>document.querySelector(s);
const userId = localStorage.getItem("userId");
const editId = localStorage.getItem("vehiculoEditarId") || new URLSearchParams(location.search).get("id");


(function sidebar(){
  const overlay=$("#overlay"), menu=$("#profileMenu"), toggle=$("#menuToggle"), closeBtn=$("#closeMenu"), logoutBtn=$("#logoutBtn");
  const open=()=>{menu?.classList.add("open"); overlay?.classList.add("show");};
  const close=()=>{menu?.classList.remove("open"); overlay?.classList.remove("show");};
  toggle?.addEventListener("click",()=>{toggle.classList.add("spin"); setTimeout(()=>toggle.classList.remove("spin"),600); open();});
  closeBtn?.addEventListener("click",close); overlay?.addEventListener("click",close);
  window.addEventListener("keydown",(e)=> e.key==="Escape"&&close());
  $("#menuUserId") && ($("#menuUserId").textContent = userId || "Desconocido");
  if (userId){
    fetch(`https://retoolapi.dev/DeaUI0/registro/${userId}`).then(r=>r.json()).then(u=>{
      $("#menuNombre") && ($("#menuNombre").textContent = `${u?.nombre??""} ${u?.apellido??""}`.trim() || "Usuario");
      $("#menuPase") && ($("#menuPase").textContent = u?.pase || "Cliente");
    }).catch(()=>{});
  }
  logoutBtn?.addEventListener("click", async (e)=>{
    e.preventDefault();
    ["userId","nombre","email","pase","authToken","token","refreshToken"].forEach(k=>localStorage.removeItem(k));
    sessionStorage.clear(); document.cookie="authToken=; Max-Age=0; path=/";
    window.location.replace(logoutBtn.getAttribute("href") || "../Authenticator/login.html");
  });
})();


const $form = $("#formVehiculo");
const $title= $("#formTitle");
const $marca= $("#marca");
const $modelo=$("#modelo");
const $anio  = $("#anio");
const $color = $("#color");
const $placa = $("#placa");
const $vin   = $("#vin");
const $estado= $("#estado");
const $desc  = $("#descripcion");


async function loadIfEdit(){
  if (!editId) return;
  try{
    const r = await fetch(`${API_URL}/${editId}`);
    if (!r.ok) throw new Error("API");
    const v = await r.json();
    $title.textContent = "Editar Vehículo";
    $marca.value  = v.marca  || "";
    $modelo.value = v.modelo || "";
    $anio.value   = v.anio   || "";
    $color.value  = v.color  || "";
    $placa.value  = v.placa  || "";
    $vin.value    = v.vin    || "";
    $estado.value = v.estado || "";
    $desc.value   = v.descripcion || "";
  }catch(err){
    console.error("No se pudo cargar el vehículo:", err);
    Swal.fire("Error","No se pudo cargar el vehículo para editar","error");
  }
}
document.addEventListener("DOMContentLoaded", loadIfEdit);


function validar(){
  const year = parseInt($anio.value,10);
  const nowY = new Date().getFullYear()+1;
  if (isNaN(year) || year<1980 || year>nowY){
    Swal.fire("Año inválido",`Debe estar entre 1980 y ${nowY}`,"warning");
    return false;
  }
  const vin = ($vin.value||"").toUpperCase();
  if (vin.length<11 || vin.length>20){
    Swal.fire("VIN inválido","Revisa la longitud (≈17).","warning");
    return false;
  }
  const placa = ($placa.value||"").trim();
  if (placa.length<4){
    Swal.fire("Placa inválida","Revisa el formato.","warning");
    return false;
  }
  return true;
}


$form?.addEventListener("submit", async (e)=>{
  e.preventDefault();
  if (!userId){ Swal.fire("Sesión","Vuelve a iniciar sesión","info"); return; }
  if (!validar()) return;

  const now = new Date();
  const fechaRegistro = now.toISOString().slice(0,10);
  const horaRegistro  = now.toTimeString().slice(0,5);

  const body = {
    idCliente: String(userId),
    marca: $marca.value.trim(),
    modelo: $modelo.value.trim(),
    anio: $anio.value.trim(),
    color: $color.value.trim(),
    placa: $placa.value.trim(),
    vin: $vin.value.trim(),
    estado: $estado.value,
    descripcion: $desc.value.trim(),
  };


  if (!editId){
    body.fechaRegistro = fechaRegistro;
    body.horaRegistro  = horaRegistro;
  }

  try{
    const r = await fetch(editId ? `${API_URL}/${editId}` : API_URL, {
      method: editId ? "PATCH" : "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify(body)
    });
    if (!r.ok){
      const t = await r.text().catch(()=> "");
      throw new Error(`API ${r.status}: ${t}`);
    }
    Swal.fire("Listo", `Vehículo ${editId ? "actualizado" : "registrado"} correctamente`, "success")
      .then(()=>{
        localStorage.removeItem("vehiculoEditarId");
        window.location.href = "./Vehiculos.html";
      });
  }catch(err){
    console.error(err);
    Swal.fire("Error","No se pudo guardar el vehículo","error");
  }
});


$form?.addEventListener("reset", ()=>{
  localStorage.removeItem("vehiculoEditarId");
});
