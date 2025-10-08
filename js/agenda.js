document.addEventListener('DOMContentLoaded', async function() {
  var calendarEl = document.getElementById('calendar');
  var eventList = document.getElementById('eventList');

  // Obtener órdenes del backend
  const response = await fetch("http://localhost:3000/ordenes/agenda");
  const ordenes = await response.json();
  if (!Array.isArray(ordenes)) {
    console.error("La respuesta de /ordenes/agenda no es un array:", ordenes);
    return;
  }

  // Convierte las órdenes en eventos para FullCalendar
  const eventos = ordenes.map(o => ({
    title: `Orden #${o.id_orden} - ${o.observacion || "Sin descripción"}`,
    start: o.fecha_servicio,
    allDay: true
  }));

  // Inicializa el calendario con las órdenes
  var calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    initialDate: new Date(),
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    events: eventos,
    selectable: true,
  });

  calendar.render();

  function formatearFecha(fechaIso) {
    if (!fechaIso) return "";
    const fecha = new Date(fechaIso);
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const anio = fecha.getFullYear();
    return `${dia}/${mes}/${anio}`;
  }

  // Mostrar las órdenes en la lista lateral
  eventList.innerHTML = "";
  // Ordenar las órdenes por fecha de servicio, las más cercanas primero
  ordenes.sort((a, b) => {
    const fechaA = new Date(a.fecha_servicio);
    const fechaB = new Date(b.fecha_servicio);
    return fechaA - fechaB;
  });

  ordenes.forEach(o => {
    const fecha = formatearFecha(o.fecha_servicio);
    const li = document.createElement('li');
    li.innerHTML = `<strong>${fecha}</strong> – Orden #${o.id_orden} (${o.observacion || "Sin descripción"})`;
    eventList.appendChild(li);
  });
});