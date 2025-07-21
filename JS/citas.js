const API_URL = "https://retoolapi.dev/2Kfhrs/cita";
let fechaActual = new Date();

document.addEventListener("DOMContentLoaded", () => {
  cargarCalendario(fechaActual);

  const userId = localStorage.getItem("userId");
  document.getElementById("menuUserId").textContent = userId || "Desconocido";

  const menuToggle = document.getElementById("menuToggle");
  const profileMenu = document.getElementById("profileMenu");
  const overlay = document.getElementById("overlay");
  const closeMenu = document.getElementById("closeMenu");

  menuToggle.addEventListener("click", () => {
    profileMenu.classList.add("open");
    overlay.classList.add("show");
  });

  closeMenu.addEventListener("click", cerrarMenu);
  overlay.addEventListener("click", cerrarMenu);

  function cerrarMenu() {
    profileMenu.classList.remove("open");
    overlay.classList.remove("show");
  }

  const nombreElement = document.getElementById("menuNombre");
  const paseElement = document.getElementById("menuPase");

  fetch(`https://retoolapi.dev/DeaUI0/registro/${userId}`)
    .then(res => res.json())
    .then(user => {
      nombreElement.textContent = `${user.nombre} ${user.apellido}`;
      paseElement.textContent = user.pase || "Cliente";
    });

  document.getElementById("formCita").addEventListener("submit", async (e) => {
    e.preventDefault();

    const fecha = document.getElementById("fechaSeleccionada").value;
    const horaInput = document.getElementById("horaInput").value;
    const meridiano = document.getElementById("meridiano").value;
    const estado = document.getElementById("estado").value;
    const descripcion = document.getElementById("descripcion").value;

    if (!fecha) {
      return Swal.fire({
        icon: 'warning',
        title: 'Fecha requerida',
        text: 'Debes seleccionar una fecha del calendario.',
        confirmButtonColor: '#c91a1a'
      });
    }

    if (!horaInput) {
      return Swal.fire({
        icon: 'error',
        title: 'Hora inválida',
        text: 'Debes ingresar una hora válida.',
        confirmButtonColor: '#c91a1a'
      });
    }

    const [horaStr, minutoStr] = horaInput.split(':');
    let horaNum = parseInt(horaStr);
    const minuto = parseInt(minutoStr);

    if (meridiano === "PM" && horaNum !== 12) {
      horaNum += 12;
    } else if (meridiano === "AM" && horaNum === 12) {
      horaNum = 0;
    }

    const horaFinal = `${horaNum.toString().padStart(2, "0")}:${minutoStr}`;
    if (horaFinal < "07:00" || horaFinal > "16:00") {
      return Swal.fire({
        icon: 'error',
        title: 'Hora fuera de horario',
        text: 'Solo se permiten citas entre 07:00 AM y 04:00 PM.',
        confirmButtonColor: '#c91a1a'
      });
    }

    const datos = {
      fecha,
      hora: horaFinal,
      estado,
      descripcion,
      idCliente: userId
    };

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos)
      });

      if (!res.ok) throw new Error("Error al guardar");

      Swal.fire({
        icon: 'success',
        title: 'Cita registrada',
        text: 'Tu cita fue guardada exitosamente.',
        confirmButtonColor: '#28a745'
      });

      e.target.reset();
      document.getElementById("fechaSeleccionada").value = "";
      mostrarCitas();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo registrar la cita.',
        confirmButtonColor: '#c91a1a'
      });
    }
  });

  mostrarCitas();
});

function cargarCalendario(fecha) {
  const calendario = document.getElementById("calendario");
  calendario.innerHTML = "";

  const mes = fecha.getMonth();
  const anio = fecha.getFullYear();
  const primerDia = new Date(anio, mes, 1).getDay();
  const diasMes = new Date(anio, mes + 1, 0).getDate();
  const diasSemana = ["L", "M", "M", "J", "V", "S", "D"];

  diasSemana.forEach(d => {
    const div = document.createElement("div");
    div.classList.add("fw-bold", "text-center", "border-bottom");
    div.textContent = d;
    calendario.appendChild(div);
  });

  for (let i = 0; i < (primerDia + 6) % 7; i++) {
    const div = document.createElement("div");
    div.classList.add("py-2");
    calendario.appendChild(div);
  }

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  for (let dia = 1; dia <= diasMes; dia++) {
    const fechaCompleta = new Date(anio, mes, dia);
    const div = document.createElement("div");
    div.classList.add("text-center", "py-2", "rounded", "calendar-cell");
    div.textContent = dia;
    div.style.cursor = "pointer";

    if (fechaCompleta < hoy) {
      div.classList.add("text-muted");
      div.style.pointerEvents = "none";
    } else {
      div.onclick = () => seleccionarFecha(dia);
    }

    calendario.appendChild(div);
  }

  document.getElementById("mesActual").textContent =
    fecha.toLocaleString("es", { month: "long" }) + " " + anio;

  fechaActual = fecha;
}

function cambiarMes(cambio) {
  fechaActual.setMonth(fechaActual.getMonth() + cambio);
  cargarCalendario(fechaActual);
}

function seleccionarFecha(dia) {
  const mes = fechaActual.getMonth() + 1;
  const anio = fechaActual.getFullYear();
  const fecha = `${anio}-${mes.toString().padStart(2, "0")}-${dia.toString().padStart(2, "0")}`;
  document.getElementById("fechaSeleccionada").value = fecha;

  document.querySelectorAll("#calendario div").forEach(div => div.classList.remove("bg-dark", "text-white"));
  event.target.classList.add("bg-dark", "text-white");
}

async function mostrarCitas() {
  const userId = localStorage.getItem("userId");
  const contenedor = document.getElementById("listaCitas");
  contenedor.innerHTML = "<h5 class='mt-4'>Mis Citas</h5>";

  try {
    const res = await fetch(API_URL);
    const data = await res.json();
    const citasUsuario = data.filter(cita => cita.idCliente == userId);

    if (citasUsuario.length === 0) {
      contenedor.innerHTML += "<p class='text-muted'>No tienes citas registradas.</p>";
      return;
    }

    citasUsuario.forEach(cita => {
      contenedor.innerHTML += `
        <div class="border rounded p-2 mb-2 bg-white position-relative">
          <strong>${cita.fecha}</strong> a las <strong>${cita.hora}</strong><br>
          Estado: ${cita.estado}<br>
          ${cita.descripcion ? `Descripción: ${cita.descripcion}<br>` : ""}
          <button class="btn btn-sm btn-danger position-absolute top-0 end-0 m-1" onclick="eliminarCita(${cita.id})">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      `;
    });
  } catch (err) {
    console.error("Error al cargar citas:", err);
  }
}

async function eliminarCita(id) {
  const confirmacion = await Swal.fire({
    title: '¿Eliminar cita?',
    text: "Esta acción no se puede deshacer.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#aaa',
    confirmButtonText: 'Sí, eliminar'
  });

  if (confirmacion.isConfirmed) {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE"
      });

      if (!res.ok) throw new Error("Error al eliminar");

      Swal.fire({
        icon: 'success',
        title: 'Cita eliminada',
        text: 'Tu cita ha sido eliminada.',
        confirmButtonColor: '#28a745'
      });

      mostrarCitas();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo eliminar la cita.',
        confirmButtonColor: '#c91a1a'
      });
    }
  }
}
