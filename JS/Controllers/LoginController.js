import { getUsuarios } from "../Services/LoginService.js";

function parseResponse(apiResponse) {
  if (Array.isArray(apiResponse)) return apiResponse;
  if (apiResponse.data?.content) return apiResponse.data.content;
  if (apiResponse.content) return apiResponse.content;
  if (apiResponse.data) return apiResponse.data;
  return [];
}

let usuariosCache = [];

async function loadUsuarios() {
    try {
        const usuarios = await getUsuarios();
        usuariosCache = usuarios;
    } catch (e) {
        console.error("Error al cargar usuarios:", e);
    }
}

document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!usuariosCache.length) {
        try {
            usuariosCache = await getUsuarios();
        } catch (e) {
            console.error(e)
        }
    }

    const usuario = usuariosCache.find(u => (u.correo === email) && (u.contrasena === password));
    if (usuario) {
        localStorage.setItem("userId", String(usuario.id));
        localStorage.setItem("userCorreo", usuario.correo || "");
        localStorage.setItem("userNombre", usuario.nombre || "");

        window.location.href = "../../dashboard/index.html"
    } else {
        Swal.fire({
            icon: "error",
            title: "Error de autenticación",
            text: "Correo o contraseña incorrectos"
        })
    }
});
document.addEventListener("DOMContentLoaded", loadUsuarios);