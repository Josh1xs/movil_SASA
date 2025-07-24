const API_URL = "https://retoolapi.dev/2Kfhrs/cita";
let fechaActual = new Date();

document.addEventListener("DOMContentLoaded", () => {
  cargarCalendario(fechaActual);
  cargarVehiculosCliente(); // ✅ Solo una vez aquí
  mostrarCitas();           // ✅ Solo una vez aquí

  const userId = localStorage.getItem("userId");
  document.getElementById("menuUserId").textContent = userId || "Desconocido";

  // Menú flotante
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

  // Envío de cita
  document.getElementById("formCita").addEventListener("submit", async (e) => {
    e.preventDefault();

    const fecha = document.getElementById("fechaSeleccionada").value;
    const horaInput = document.getElementById("horaInput").value;
    const meridiano = document.getElementById("meridiano").value;
    const estado = document.getElementById("estado").value;
    const descripcion = document.getElementById("descripcion").value;
    const idVehiculo = document.getElementById("vehiculoSelect").value;

    if (!fecha || !horaInput || !idVehiculo) {
      return Swal.fire({
        icon: 'warning',
        title: 'Datos incompletos',
        text: 'Debes llenar todos los campos requeridos.',
        confirmButtonColor: '#c91a1a'
      });
    }

    const [horaStr, minutoStr] = horaInput.split(':');
    let horaNum = parseInt(horaStr);
    const minuto = parseInt(minutoStr);

    if (meridiano === "PM" && horaNum !== 12) horaNum += 12;
    else if (meridiano === "AM" && horaNum === 12) horaNum = 0;

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
      idCliente: userId,
      idVehiculo
    };

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos)
      });

      if (!res.ok) throw new Error("Error al guardar");

      const fechaNoti = new Date().toISOString().split("T")[0];

      const notificaciones = [
        {
          titulo: "Cita agendada con éxito",
          descripcion: `Tu cita fue programada para el ${fecha} a las ${horaFinal}.`,
          fecha: fechaNoti,
          idCliente: userId
        },
        {
          titulo: "Nueva cita agendada",
          descripcion: `El cliente con ID ${userId} ha agendado una cita para el vehículo con ID ${idVehiculo} el ${fecha} a las ${horaFinal}.`,
          fecha: fechaNoti,
          idCliente: userId,
          tipo: "cita"
        }
      ];

      for (const noti of notificaciones) {
        await fetch("https://retoolapi.dev/IOhfB6/notificaciones", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(noti)
        });
      }

      Swal.fire({
        icon: 'success',
        title: 'Cita registrada',
        text: 'Tu cita fue guardada y notificada exitosamente.',
        confirmButtonColor: '#28a745'
      });

      e.target.reset();
      document.getElementById("fechaSeleccionada").value = "";

      mostrarCitas(); // ✅ Actualizar después de guardar

    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo registrar la cita.',
        confirmButtonColor: '#c91a1a'
      });
    }
  });
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
    calendario.appendChild(document.createElement("div"));
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

  document.querySelectorAll("#calendario div").forEach(div =>
    div.classList.remove("bg-dark", "text-white")
  );
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

      const notificacion = {
        titulo: "Cita eliminada",
        descripcion: `Tu cita con ID ${id} fue eliminada correctamente.`,
        fecha: new Date().toISOString().split("T")[0],
        idCliente: localStorage.getItem("userId")
      };

      await fetch("https://retoolapi.dev/Nlb9BE/notificaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(notificacion)
      });

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

async function cargarVehiculosCliente() {
  const userId = localStorage.getItem("userId");
  const selectVehiculo = document.getElementById("vehiculoSelect");
  selectVehiculo.innerHTML = '<option value="">Selecciona tu vehículo</option>';

  try {
    const res = await fetch("https://retoolapi.dev/4XQf28/anadirvehiculo");
    const data = await res.json();

    const vehiculosCliente = data.filter(v => v.idCliente == userId);

    vehiculosCliente.forEach(v => {
      const option = document.createElement("option");
      option.value = v.id;
      option.textContent = `${v.marca} ${v.modelo} (${v.placa})`;
      selectVehiculo.appendChild(option);
    });

  } catch (err) {
    console.error("Error al cargar vehículos:", err);
  }
}
