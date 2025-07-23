 function startAnimation() {
      const btn = document.querySelector(".button");
      btn.innerText = "Cargando...";
      btn.disabled = true;
      btn.style.pointerEvents = "none";
      btn.style.transition = "all 0.3s ease";
      btn.style.transform = "scale(0.95)";
      btn.style.boxShadow = "0 0 30px rgba(255, 0, 0, 0.5)";
      setTimeout(() => {
        window.location.href = "../Authenticator/login.html";
      }, 800);
    }