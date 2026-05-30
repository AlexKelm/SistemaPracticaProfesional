// Configuración de la API
const API_BASE_URL = '';

// Variables globales
let tecnicos = [];
let tecnicoEditando = null;

// Elementos del DOM (se inicializarán cuando el DOM esté listo)
let tablaTecnicosBody;
let buscadorTecnico;
let btnAgregarTecnico;
let modalTecnico;
let modalOrdenes;
let formTecnico;
let modalTitulo;
let modalTituloOrdenes;
let estadoGroup;
let ordenesTecnico;

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar elementos del DOM
    tablaTecnicosBody = document.getElementById('tablaTecnicosBody');
    buscadorTecnico = document.getElementById('buscadorTecnico');
    btnAgregarTecnico = document.getElementById('btnAgregarTecnico');
    modalTecnico = document.getElementById('modalTecnico');
    modalOrdenes = document.getElementById('modalOrdenes');
    formTecnico = document.getElementById('formTecnico');
    modalTitulo = document.getElementById('modalTitulo');
    modalTituloOrdenes = document.getElementById('modalTituloOrdenes');
    estadoGroup = document.getElementById('estadoGroup');
    ordenesTecnico = document.getElementById('ordenesTecnico');
    
    // Verificar que todos los elementos existen
    if (!tablaTecnicosBody || !btnAgregarTecnico || !modalTecnico || !formTecnico) {
        console.error('❌ Error: No se encontraron algunos elementos del DOM');
        return;
    }
    
    cargarTecnicos();
    configurarEventListeners();
});

// Configurar event listeners
function configurarEventListeners() {
    // Verificar elementos antes de agregar listeners
    if (!btnAgregarTecnico) {
        console.error('❌ btnAgregarTecnico no existe');
        return;
    }
    
    // Botón agregar técnico
    btnAgregarTecnico.addEventListener('click', () => {
        abrirModalNuevo();
    });

    // Buscador
    if (buscadorTecnico) {
        buscadorTecnico.addEventListener('input', filtrarTecnicos);
    }

    // Formulario técnico
    if (formTecnico) {
        formTecnico.addEventListener('submit', guardarTecnico);
    }

    // Botones de cancelar
    const btnCancelar = document.getElementById('cancelarTecnico');
    if (btnCancelar) {
        btnCancelar.addEventListener('click', cerrarModalTecnico);
    }

    // Botón cerrar (X) del modal de técnico
    const btnCerrarModalTecnico = document.getElementById('btnCerrarModalTecnico');
    if (btnCerrarModalTecnico) {
        btnCerrarModalTecnico.addEventListener('click', cerrarModalTecnico);
    }

    // Botón cerrar (X) del modal de órdenes
    const btnCerrarModalOrdenes = document.getElementById('btnCerrarModalOrdenes');
    if (btnCerrarModalOrdenes) {
        btnCerrarModalOrdenes.addEventListener('click', () => {
            if (modalOrdenes) modalOrdenes.style.display = 'none';
        });
    }

    // Cerrar modales con X
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            if (modal) modal.style.display = 'none';
        });
    });

    // Cerrar modales al hacer clic fuera
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
}

// Cargar técnicos desde la API
async function cargarTecnicos() {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/tecnicos`);
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    tecnicos = data;
    mostrarTecnicos(tecnicos);
  } catch (error) {
    console.error('Error al cargar técnicos:', error);
    mostrarMensaje(`Error al cargar técnicos: ${error.message}`, 'error');
  }
}

// Mostrar técnicos en la tabla
function mostrarTecnicos(tecnicosFiltrados) {
  if (!tablaTecnicosBody) {
    console.error('No se encontró el elemento tablaTecnicosBody');
    return;
  }
  
  tablaTecnicosBody.innerHTML = '';
  
  if (tecnicosFiltrados.length === 0) {
    tablaTecnicosBody.innerHTML = '<tr><td colspan="6" class="text-center">No hay técnicos registrados</td></tr>';
    return;
  }
  
  tecnicosFiltrados.forEach((tecnico) => {
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td>${tecnico.nombre} ${tecnico.apellido}</td>
      <td>${tecnico.email || '-'}</td>
      <td>${tecnico.telefono || '-'}</td>
      <td>${formatearFecha(tecnico.fecha_creacion)}</td>
      <td class="acciones">
        <button class="btn-small btn-primary" data-action="editar" data-id="${tecnico.id_tecnico}">Editar</button>
        <button class="btn-small btn-danger" data-action="eliminar" data-id="${tecnico.id_tecnico}">Eliminar</button>
        <button class="btn-small btn-secondary" data-action="ver-ordenes" data-id="${tecnico.id_tecnico}">Ver Órdenes</button>
      </td>
    `;
    
    // Agregar event listeners a los botones
    const btnEditar = fila.querySelector('[data-action="editar"]');
    const btnEliminar = fila.querySelector('[data-action="eliminar"]');
    const btnVerOrdenes = fila.querySelector('[data-action="ver-ordenes"]');
    
    btnEditar.addEventListener('click', () => editarTecnico(tecnico.id_tecnico));
    btnEliminar.addEventListener('click', () => eliminarTecnico(tecnico.id_tecnico));
    btnVerOrdenes.addEventListener('click', () => verOrdenes(tecnico.id_tecnico));
    
    tablaTecnicosBody.appendChild(fila);
  });
}

// Filtrar técnicos
function filtrarTecnicos() {
    const termino = buscadorTecnico.value.toLowerCase();
    const tecnicosFiltrados = tecnicos.filter(tecnico => 
        tecnico.nombre.toLowerCase().includes(termino) ||
        tecnico.apellido.toLowerCase().includes(termino) ||
        (tecnico.email && tecnico.email.toLowerCase().includes(termino)) ||
        (tecnico.telefono && tecnico.telefono.toLowerCase().includes(termino))
    );
    mostrarTecnicos(tecnicosFiltrados);
}

// Abrir modal para nuevo técnico
function abrirModalNuevo() {
    if (!modalTecnico) {
        console.error('❌ modalTecnico no existe');
        return;
    }
    
    tecnicoEditando = null;
    if (modalTitulo) modalTitulo.textContent = 'Nuevo Técnico';
    if (formTecnico) formTecnico.reset();
    if (estadoGroup) estadoGroup.style.display = 'none';
    modalTecnico.style.display = 'flex';
}

// Editar técnico
function editarTecnico(id) {
  const tecnico = tecnicos.find(t => t.id_tecnico === id);
  if (!tecnico) {
    console.error('❌ Técnico no encontrado con id:', id);
    return;
  }

  tecnicoEditando = tecnico;
  if (modalTitulo) modalTitulo.textContent = 'Editar Técnico';
  if (estadoGroup) estadoGroup.style.display = 'none';
  
  // Llenar formulario
  const nombreInput = document.getElementById('nombre');
  const apellidoInput = document.getElementById('apellido');
  const emailInput = document.getElementById('email');
  const telefonoInput = document.getElementById('telefono');
  
  if (nombreInput) nombreInput.value = tecnico.nombre;
  if (apellidoInput) apellidoInput.value = tecnico.apellido;
  if (emailInput) emailInput.value = tecnico.email || '';
  if (telefonoInput) telefonoInput.value = tecnico.telefono || '';
  
  if (modalTecnico) {
    modalTecnico.style.display = 'flex';
  } else {
    console.error('❌ modalTecnico no existe');
  }
}

// Guardar técnico
async function guardarTecnico(e) {
    e.preventDefault();
    
    const formData = new FormData(formTecnico);
    const datos = Object.fromEntries(formData.entries());

    try {
      let response;
      if (tecnicoEditando) {
        // Actualizar
        response = await fetchWithAuth(`${API_BASE_URL}/api/tecnicos/${tecnicoEditando.id_tecnico}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(datos)
        });
      } else {
        // Crear
        response = await fetchWithAuth(`${API_BASE_URL}/api/tecnicos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(datos)
        });
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al guardar técnico');
      }

      mostrarMensaje(tecnicoEditando ? 'Técnico actualizado correctamente' : 'Técnico creado correctamente', 'success');
      cerrarModalTecnico();
      cargarTecnicos();
    } catch (error) {
      console.error('Error al guardar técnico:', error);
      mostrarMensaje(error.message, 'error');
    }
}

// Eliminar técnico
async function eliminarTecnico(id) {
  if (!confirm('¿Estás seguro de que quieres eliminar este técnico?')) return;

  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/tecnicos/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al eliminar técnico');
    }

    mostrarMensaje('Técnico eliminado correctamente', 'success');
    cargarTecnicos();
  } catch (error) {
    console.error('Error al eliminar técnico:', error);
    mostrarMensaje(error.message, 'error');
  }
}

// Ver órdenes del técnico
async function verOrdenes(id) {
  const tecnico = tecnicos.find(t => t.id_tecnico === id);
  if (!tecnico) return;

  modalTituloOrdenes.textContent = `Órdenes de ${tecnico.nombre} ${tecnico.apellido}`;
  
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/tecnicos/${id}/ordenes`);
    if (!response.ok) throw new Error('Error al cargar órdenes');
    
    const ordenes = await response.json();
    mostrarOrdenes(ordenes);
    modalOrdenes.style.display = 'flex';
  } catch (error) {
    console.error('Error al cargar órdenes del técnico:', error);
    mostrarMensaje('Error al cargar órdenes del técnico', 'error');
  }
}

// Mostrar órdenes en el modal
function mostrarOrdenes(ordenes) {
    ordenesTecnico.innerHTML = '';
    
    if (ordenes.length === 0) {
        ordenesTecnico.innerHTML = '<p>No hay órdenes asignadas a este técnico</p>';
        return;
    }

    const tabla = document.createElement('table');
    tabla.className = 'ordenes-table';
    tabla.innerHTML = `
        <thead>
            <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>Descripción</th>
                <th>Estado</th>
                <th>Prioridad</th>
                <th>Fecha Servicio</th>
            </tr>
        </thead>
        <tbody>
            ${ordenes.map(orden => `
                <tr>
                    <td>${orden.id}</td>
                    <td>${orden.razon_social}</td>
                    <td>${orden.observacion || '-'}</td>
                    <td><span class="badge badge-${orden.estado}">${orden.estado}</span></td>
                    <td><span class="badge badge-${orden.prioridad}">${orden.prioridad}</span></td>
                    <td>${orden.fecha_servicio ? formatearFecha(orden.fecha_servicio) : '-'}</td>
                </tr>
            `).join('')}
        </tbody>
    `;
    ordenesTecnico.appendChild(tabla);
}

// Cerrar modal técnico
function cerrarModalTecnico() {
    modalTecnico.style.display = 'none';
    formTecnico.reset();
    tecnicoEditando = null;
}

// Formatear fecha
function formatearFecha(fecha) {
    if (!fecha) return '-';
    return new Date(fecha).toLocaleDateString('es-ES');
}

// Mostrar mensaje
function mostrarMensaje(mensaje, tipo) {
    // Crear elemento de mensaje
    const mensajeDiv = document.createElement('div');
    mensajeDiv.className = `mensaje mensaje-${tipo}`;
    mensajeDiv.textContent = mensaje;
    
    // Agregar al DOM
    document.body.appendChild(mensajeDiv);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        mensajeDiv.remove();
    }, 3000);
}

//logout 
if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      logout();
    })};
