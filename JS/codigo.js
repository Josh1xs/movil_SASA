// ../JS/codigo.js
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("verificationForm");
  const codeInput = document.getElementById("code");
  const resendLink = document.getElementById("resendLink");

  if (!form || !codeInput) return;

  const storedCode = localStorage.getItem("recoveryCode");
  const expectedCode = (storedCode && /^\d{6}$/.test(storedCode)) ? storedCode : "123456";
  const email = localStorage.getItem("recoveryEmail") || "";

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const code = (codeInput.value || "").trim();

    if (!/^\d{6}$/.test(code)) {
      Swal.fire({ icon: "warning", title: "Código inválido", text: "Ingresa los 6 dígitos." });
      return;
    }

    if (code === expectedCode) {
      Swal.fire({ icon: "success", title: "Código verificado", text: "Verificación completada." })
        .then(() => { window.location.href = "login.html"; });
    } else {
      Swal.fire({ icon: "error", title: "Código incorrecto", text: "Revisa el código e inténtalo de nuevo." });
    }
  });

  if (resendLink) {
    resendLink.addEventListener("click", (e) => {
      e.preventDefault();
      const newCode = Math.floor(100000 + Math.random() * 900000).toString();
      localStorage.setItem("recoveryCode", newCode);
      Swal.fire({
        icon: "info",
        title: "Código reenviado",
        text: email ? `Se envió un nuevo código a ${email}.` : "Se generó un nuevo código.",
        confirmButtonText: "OK"
      });
    });
  }
});
