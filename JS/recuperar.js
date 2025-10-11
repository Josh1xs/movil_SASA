const $=s=>document.querySelector(s);
const form=$("#recoveryForm");
const email=$("#email");
const emailErr=$("#emailErr");
const btn=$("#btnSend");
function validEmail(v){return/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)}
function setLoading(v){btn.disabled=v;btn.textContent=v?"Enviando…":"Enviar código"}
function genCode(){return Math.floor(100000+Math.random()*900000).toString()}
email.addEventListener("input",()=>{const ok=validEmail(email.value.trim());email.classList.toggle("invalid",!ok);emailErr.textContent=ok?"":"Correo inválido"})
form.addEventListener("submit",async e=>{
  e.preventDefault();
  const v=email.value.trim();
  const ok=validEmail(v);
  email.classList.toggle("invalid",!ok);
  emailErr.textContent=ok?"":"Correo inválido";
  if(!ok)return;
  try{
    setLoading(true);
    const code=genCode();
    const payload={email:v,code,ts:Date.now()};
    localStorage.setItem("recoveryEmail",v);
    localStorage.setItem("recoveryCode",code);
    localStorage.setItem("recoveryMeta",JSON.stringify(payload));
    await new Promise(r=>setTimeout(r,900));
    await Swal.fire({icon:"success",title:"Código enviado",text:`Hemos enviado un código a ${v}.`,confirmButtonText:"Continuar",confirmButtonColor:"#c91a1a"});
    location.href="./codigo.html";
  }catch{
    Swal.fire("Error","No se pudo enviar el código","error");
  }finally{
    setLoading(false);
  }
});
