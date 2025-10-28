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
    'en_proceso': 'estado-en_proceso'
  };
  
  return estados[estado] || 'estado-pendiente';
}

// Cargar órdenes próximas
async function cargarProximasOrdenes() {
  try {
    const response = await fetch("/api/ordenes");
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
          window.location.href = `ordenes.html?id=${ordenId}`;
        });
      });
    }

    // Mostrar órdenes urgentes
    const urgentesLista = document.getElementById('reclamosList');
    if (ordenesUrgentes.length === 0) {
      urgentesLista.innerHTML = '<li class="no-ordenes">No hay reclamos</li>';
    } else {
      urgentesLista.innerHTML = ordenesUrgentes.map(o => `
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
      urgentesLista.querySelectorAll('.orden-clickeable').forEach(li => {
        li.addEventListener('click', function() {
          const ordenId = this.getAttribute('data-orden-id');
          window.location.href = `ordenes.html?id=${ordenId}`;
        });
      });
    }

    // Actualizar estadísticas
    actualizarEstadisticas(ordenes);

  } catch (error) {
    console.error("Error al cargar órdenes:", error);
    document.getElementById('proximasOrdenesList').innerHTML = 
      '<li class="no-ordenes">Error al cargar las órdenes</li>';
    document.getElementById('reclamosList').innerHTML = 
      '<li class="no-ordenes">Error al cargar las órdenes</li>';
  }
}

// Función para actualizar estadísticas
function actualizarEstadisticas(ordenes) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const pendientes = ordenes.filter(o => o.estado === 'Pendiente').length;
  const enProceso = ordenes.filter(o => o.estado === 'En Proceso').length;
  const completadasHoy = ordenes.filter(o => o.estado === 'Finalizada').length;
  
  document.getElementById('stat-pendientes').textContent = pendientes;
  document.getElementById('stat-proceso').textContent = enProceso;
  document.getElementById('stat-completadas').textContent = completadasHoy;
  document.getElementById('stat-total').textContent = ordenes.length;
}

// Inicialización al cargar el DOM
document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutBtn");
  
  // Botón de cerrar sesión
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("user");
      window.location.href = "login.html";
    });
  }

  // Cargar órdenes al iniciar
  cargarProximasOrdenes();

  // Actualizar cada 5 minutos
  setInterval(cargarProximasOrdenes, 5 * 60 * 1000);
});
