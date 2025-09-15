const $=s=>document.querySelector(s);
const form=$("#registerForm");
const duiInput=$("#dui");
const passwordInput=$("#password");
const correoInput=$("#correo");
const fechaInput=$("#fechaNacimiento");
const nombreInput=$("#nombre");
const apellidoInput=$("#apellido");
const generoSelect=$("#genero");
const btn=$("#btnRegistrar");
const togglePwd=$("#togglePwd");
const charCount=$("#charCount");
const hasLetter=$("#hasLetter");
const hasNumber=$("#hasNumber");
const hasSpecial=$("#hasSpecial");
const meter=$("#passMeter");
const strengthLabel=$("#passStrengthLabel");
const API_LIST="https://retoolapi.dev/DeaUI0/registro";

const MAX_PASS=15;
const MIN_PASS=8;

function setBtnLoading(v){if(!btn)return;btn.disabled=v;btn.textContent=v?"Creando cuenta…":"Registrarse"}

function scorePass(p){
  let s=0;
  if(p.length>=MIN_PASS) s++;
  if(/[a-z]/.test(p)) s++;
  if(/[A-Z]/.test(p)) s++;
  if(/\d/.test(p)) s++;
  if(/[@$!%*#?&._-]/.test(p)) s++;
  return s; // 0..5
}

function setMeter(p){
  const s=scorePass(p);
  const w=[0,20,40,60,80,100][s];
  if(meter){ meter.style.width=w+"%"; meter.style.background=s<=2?"#ef4444":s<=4?"#f59e0b":"#16a34a"; }
  if(strengthLabel){
    let txt="Débil", color="#ef4444";
    if(s>=3 && s<=4){ txt="Media"; color="#f59e0b"; }
    if(s>=5){ txt="Fuerte"; color="#16a34a"; }
    strengthLabel.textContent = p.length ? txt : "";
    strengthLabel.style.color = color;
  }
}

function validEmail(e){return/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)}

function isAdult(dateStr){
  if(!dateStr) return false;
  const h=new Date();
  const d=new Date(dateStr);
  let age=h.getFullYear()-d.getFullYear();
  const m=h.getMonth()-d.getMonth();
  if(m<0||(m===0&&h.getDate()<d.getDate())) age--;
  return age>=18;
}

function normalizeName(v){return v.normalize("NFKC").replace(/\s+/g," ").trim()}

function nameValid(v){
  if(!v) return false;
  const t=normalizeName(v);
  if(t.length<2) return false;
  return/^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]+$/.test(t)
}

(function initDateLimits(){
  if(!fechaInput) return;
  const today=new Date();
  const two=n=>String(n).padStart(2,"0");
  function fmt(d){return `${d.getFullYear()}-${two(d.getMonth()+1)}-${two(d.getDate())}`}
  const max=new Date(today.getFullYear()-18, today.getMonth(), today.getDate());
  const min=new Date(today.getFullYear()-100, today.getMonth(), today.getDate());
  fechaInput.setAttribute("max", fmt(max));
  fechaInput.setAttribute("min", fmt(min));
})();

duiInput?.addEventListener("input",()=>{
  let v=duiInput.value.replace(/[^\d]/g,"");
  if(v.length>9) v=v.slice(0,9);
  if(v.length>8) v=v.slice(0,8)+"-"+v.slice(8);
  duiInput.value=v
});

passwordInput?.addEventListener("input",()=>{
  let v=passwordInput.value;
  if(v.length>MAX_PASS){
    v=v.slice(0,MAX_PASS);
    passwordInput.value=v;
  }
  const lengthValid=v.length>=MIN_PASS && v.length<=MAX_PASS;
  const letterValid=/[A-Za-z]/.test(v);
  const numberValid=/\d/.test(v);
  const specialValid=/[@$!%*#?&._-]/.test(v);
  if(charCount) charCount.className=lengthValid?"valid":"invalid";
  if(hasLetter) hasLetter.className=letterValid?"valid":"invalid";
  if(hasNumber) hasNumber.className=numberValid?"valid":"invalid";
  if(hasSpecial) hasSpecial.className=specialValid?"valid":"invalid";
  setMeter(v)
});

togglePwd?.addEventListener("click",()=>{
  if(!passwordInput) return;
  const t=passwordInput.getAttribute("type")==="password"?"text":"password";
  passwordInput.setAttribute("type",t);
  togglePwd.innerHTML=t==="text"?'<i class="fa-regular fa-eye-slash"></i>':'<i class="fa-regular fa-eye"></i>'
});

form?.addEventListener("submit",async e=>{
  e.preventDefault();
  const nombre=normalizeName(nombreInput.value);
  const apellido=normalizeName(apellidoInput.value);
  const dui=duiInput.value.trim();
  const fechaNacimiento=fechaInput.value;
  const genero=generoSelect.value;
  const correo=correoInput.value.trim();
  const password=passwordInput.value;

  const duiRegex=/^\d{8}-\d{1}$/;
  const passRegex=new RegExp(`^(?=.*[A-Za-z])(?=.*\\d)(?=.*[@$!%*#?&._-]).{${MIN_PASS},${MAX_PASS}}$`);

  let ok=true;
  if(!nameValid(nombre)){nombreInput.classList.add("invalid");ok=false}else nombreInput.classList.remove("invalid");
  if(!nameValid(apellido)){apellidoInput.classList.add("invalid");ok=false}else apellidoInput.classList.remove("invalid");
  if(!duiRegex.test(dui)){duiInput.classList.add("invalid");ok=false}else duiInput.classList.remove("invalid");
  if(!isAdult(fechaNacimiento)){fechaInput.classList.add("invalid");ok=false}else fechaInput.classList.remove("invalid");
  if(!genero){generoSelect.classList.add("invalid");ok=false}else generoSelect.classList.remove("invalid");
  if(!validEmail(correo)){correoInput.classList.add("invalid");ok=false}else correoInput.classList.remove("invalid");
  if(!passRegex.test(password)){passwordInput.classList.add("invalid");ok=false}else passwordInput.classList.remove("invalid");

  if(!ok){Swal.fire("Revisa los campos","Hay datos inválidos o incompletos","warning");return}

  try{
    setBtnLoading(true);
    const list=await fetch(API_LIST);
    const users=await list.json();
    const correoExiste=Array.isArray(users)&&users.some(u=>u.correo?.toLowerCase()===correo.toLowerCase());
    const duiExiste=Array.isArray(users)&&users.some(u=>String(u.dui)===dui);
    if(correoExiste){setBtnLoading(false);Swal.fire("Correo en uso","Ese correo ya está registrado","warning");return}
    if(duiExiste){setBtnLoading(false);Swal.fire("DUI en uso","Ese DUI ya está registrado","warning");return}

    const payload={nombre,apellido,dui,fechaNacimiento,genero,correo,contrasena:password};
    const res=await fetch(API_LIST,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
    if(!res.ok) throw new Error();
    Swal.fire({icon:"success",title:"Registro exitoso",text:"Tu cuenta ha sido creada",confirmButtonText:"Iniciar sesión"})
      .then(()=>{location.href="./login.html"});
  }catch{
    Swal.fire("Error","No se pudo completar el registro","error");
  }finally{
    setBtnLoading(false);
  }
});
