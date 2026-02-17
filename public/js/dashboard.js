// Función para formatear fecha
function formatearFecha(fechaIso) {
  if (!fechaIso) return "Sin fecha";
  const fecha = new Date(fechaIso);
  const dia = String(fecha.getDate()).padStart(2, '0');
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const anio = fecha.getFullYear();
  return `${dia}/${mes}/${anio}`;
}

// Función para obtener el texto de prioridad
function getPrioridadClass(prioridad) {
  const prioridades = {
    'urgente': 'prioridad-urgente',
    'alta': 'prioridad-alta',
    'media': 'prioridad-media',
    'baja': 'prioridad-baja'
  };
  return prioridades[prioridad] || 'prioridad-media';
}

// Función para obtener el texto de estado
function getEstadoClass(estado) {
  const estados = {
    'pendiente': 'estado-pendiente',
    'en_proceso': 'estado-en_proceso',
    'completada': 'estado-completada',
    'cancelada': 'estado-cancelada'
  };
  
  return estados[estado] || 'estado-pendiente';
}

// Cargar órdenes próximas
async function cargarProximasOrdenes() {
  try {
    const response = await fetchWithAuth("/api/ordenes");
    const ordenes = await response.json();

    if (!Array.isArray(ordenes)) {
      console.error("La respuesta no es un array:", ordenes);
      return;
    }

    // Filtrar solo órdenes con fecha de servicio futura o de hoy
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    const ordenesProximas = ordenes
      .filter(o => {
        if (!o.fecha_servicio) return false;
        const fechaServicio = new Date(o.fecha_servicio);
        return fechaServicio >= hoy;
      })
      .sort((a, b) => new Date(a.fecha_servicio) - new Date(b.fecha_servicio))
      .slice(0, 8); // Mostrar solo las 8 más próximas

    const ordenesUrgentes = ordenes
      .filter(o => o.prioridad === 'urgente' || o.prioridad === 'alta')
      .sort((a, b) => {
        const prioridadOrden = { urgente: 0, alta: 1, media: 2, baja: 3 };
        return prioridadOrden[a.prioridad] - prioridadOrden[b.prioridad];
      })
      .slice(0, 8);

    // Mostrar órdenes próximas
    const proximasLista = document.getElementById('proximasOrdenesList');
    if (ordenesProximas.length === 0) {
      proximasLista.innerHTML = '<li class="no-ordenes">No hay órdenes programadas próximamente</li>';
    } else {
      proximasLista.innerHTML = ordenesProximas.map(o => `
        <li data-orden-id="${o.id}" class="orden-clickeable">
          <span class="orden-fecha">${formatearFecha(o.fecha_servicio)}</span>
          <span class="orden-detalle">
            Orden #${o.id} - ${o.descripcion || o.observacion || "Sin descripción"}
            <span class="orden-prioridad ${getPrioridadClass(o.prioridad)}">${o.prioridad || 'media'}</span>
            <span class="orden-estado ${getEstadoClass(o.estado)}">${o.estado || 'pendiente'}</span>
          </span>
        </li>
      `).join('');

      // Agregar listeners a los elementos
      proximasLista.querySelectorAll('.orden-clickeable').forEach(li => {
        li.addEventListener('click', function() {
          const ordenId = this.getAttribute('data-orden-id');
          window.location.href = `/ordenes?id=${ordenId}`;
        });
      });
    }

    // Mostrar reclamos recientes
    cargarReclamos();

    // Actualizar estadísticas
    actualizarEstadisticas(ordenes);

  } catch (error) {
    console.error("Error al cargar órdenes:", error);
    document.getElementById('proximasOrdenesList').innerHTML = 
      '<li class="no-ordenes">Error al cargar las órdenes</li>';
  }
}

// Cargar reclamos recientes
async function cargarReclamos() {
  try {
    const response = await fetchWithAuth("/api/reclamos");
    const reclamos = await response.json();

    if (!Array.isArray(reclamos)) {
      console.error("La respuesta no es un array:", reclamos);
      return;
    }

    // Ordenar por fecha (más recientes primero) y tomar los últimos 8
    const reclamosRecientes = reclamos
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
      .slice(0, 8);

    const reclamosLista = document.getElementById('reclamosList');
    
    if (reclamosRecientes.length === 0) {
      reclamosLista.innerHTML = '<li class="no-reclamos">No hay reclamos registrados</li>';
    } else {
      reclamosLista.innerHTML = reclamosRecientes.map(r => `
        <li data-reclamo-id="${r.id}" class="reclamo-clickeable">
          <span class="reclamo-fecha">${formatearFecha(r.fecha)}</span>
          <span class="reclamo-detalle">
            #${r.id} - ${r.detalles || 'Sin detalles'}
          </span>
        </li>
      `).join('');

      // Agregar listeners a los elementos
      reclamosLista.querySelectorAll('.reclamo-clickeable').forEach(li => {
        li.addEventListener('click', function() {
          window.location.href = '/reclamos';
        });
      });
    }

  } catch (error) {
    console.error("Error al cargar reclamos:", error);
    document.getElementById('reclamosList').innerHTML = 
      '<li class="no-reclamos">Error al cargar los reclamos</li>';
  }
}

// Función para actualizar estadísticas
function actualizarEstadisticas(ordenes) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  // Usar los valores del nuevo esquema (minúsculas con guión bajo)
  const pendientes = ordenes.filter(o => o.estado === 'pendiente').length;
  const enProceso = ordenes.filter(o => o.estado === 'en_proceso').length;
  const completadas = ordenes.filter(o => o.estado === 'completada').length;
  
  document.getElementById('stat-pendientes').textContent = pendientes;
  document.getElementById('stat-proceso').textContent = enProceso;
  document.getElementById('stat-completadas').textContent = completadas;
  document.getElementById('stat-total').textContent = ordenes.length;
  

}

// Inicialización al cargar el DOM
document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutBtn");
  
  // Botón de cerrar sesión
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("user");
      window.location.href = "/login";
    });
  }

  // Cargar órdenes al iniciar
  cargarProximasOrdenes();

  // Actualizar cada 5 minutos
  setInterval(cargarProximasOrdenes, 5 * 60 * 1000);
});

//logout
if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      logout();
    })};