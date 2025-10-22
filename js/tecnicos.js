// Configuración de la API
const API_BASE_URL = 'http://localhost:3000';

// Variables globales
let tecnicos = [];
let tecnicoEditando = null;

// Elementos del DOM
const tablaTecnicosBody = document.getElementById('tablaTecnicosBody');
const buscadorTecnico = document.getElementById('buscadorTecnico');
const btnAgregarTecnico = document.getElementById('btnAgregarTecnico');
const modalTecnico = document.getElementById('modalTecnico');
const modalOrdenes = document.getElementById('modalOrdenes');
const formTecnico = document.getElementById('formTecnico');
const modalTitulo = document.getElementById('modalTitulo');
const modalTituloOrdenes = document.getElementById('modalTituloOrdenes');
const estadoGroup = document.getElementById('estadoGroup');
const ordenesTecnico = document.getElementById('ordenesTecnico');

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    cargarTecnicos();
    configurarEventListeners();
});

// Configurar event listeners
function configurarEventListeners() {
    // Botón agregar técnico
    btnAgregarTecnico.addEventListener('click', () => {
        abrirModalNuevo();
    });

    // Buscador
    buscadorTecnico.addEventListener('input', filtrarTecnicos);

    // Formulario técnico
    formTecnico.addEventListener('submit', guardarTecnico);

    // Botones de cancelar
    document.getElementById('cancelarTecnico').addEventListener('click', cerrarModalTecnico);

    // Cerrar modales con X
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            modal.style.display = 'none';
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
    const response = await fetch(`${API_BASE_URL}/tecnicos`);
    
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
    tablaTecnicosBody.innerHTML = '<tr><td colspan="8" class="text-center">No hay técnicos registrados</td></tr>';
    return;
  }
  
  tecnicosFiltrados.forEach((tecnico) => {
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td>${tecnico.nombre} ${tecnico.apellido}</td>
      <td>${tecnico.usuario}</td>
      <td>${tecnico.email || '-'}</td>
      <td>${tecnico.especialidad || '-'}</td>
      <td>${tecnico.telefono || '-'}</td>
      <td><span class="badge ${tecnico.activo ? 'badge-success' : 'badge-danger'}">${tecnico.activo ? 'Activo' : 'Inactivo'}</span></td>
      <td>${formatearFecha(tecnico.fecha_creacion)}</td>
      <td class="acciones">
        <button class="btn-small btn-primary" onclick="editarTecnico(${tecnico.id_tecnico})">Editar</button>
        <button class="btn-small btn-danger" onclick="eliminarTecnico(${tecnico.id_tecnico})">Eliminar</button>
        <button class="btn-small btn-secondary" onclick="verOrdenes(${tecnico.id_tecnico})">Ver Órdenes</button>
      </td>
    `;
    tablaTecnicosBody.appendChild(fila);
  });
}

// Filtrar técnicos
function filtrarTecnicos() {
    const termino = buscadorTecnico.value.toLowerCase();
    const tecnicosFiltrados = tecnicos.filter(tecnico => 
        tecnico.nombre.toLowerCase().includes(termino) ||
        tecnico.apellido.toLowerCase().includes(termino) ||
        tecnico.usuario.toLowerCase().includes(termino) ||
        (tecnico.email && tecnico.email.toLowerCase().includes(termino))
    );
    mostrarTecnicos(tecnicosFiltrados);
}

// Abrir modal para nuevo técnico
function abrirModalNuevo() {
    tecnicoEditando = null;
    modalTitulo.textContent = 'Nuevo Técnico';
    formTecnico.reset();
    estadoGroup.style.display = 'none';
    document.getElementById('password').required = true;
    modalTecnico.style.display = 'block';
}

// Editar técnico
function editarTecnico(id) {
  const tecnico = tecnicos.find(t => t.id_tecnico === id);
  if (!tecnico) return;

  tecnicoEditando = tecnico;
  modalTitulo.textContent = 'Editar Técnico';
  estadoGroup.style.display = 'block';
  document.getElementById('password').required = false;
  
  // Llenar formulario
  document.getElementById('nombre').value = tecnico.nombre;
  document.getElementById('apellido').value = tecnico.apellido;
  document.getElementById('usuario').value = tecnico.usuario;
  document.getElementById('email').value = tecnico.email || '';
  document.getElementById('especialidad').value = tecnico.especialidad || '';
  document.getElementById('telefono').value = tecnico.telefono || '';
  document.getElementById('direccion').value = tecnico.direccion || '';
  document.getElementById('activo').value = tecnico.activo.toString();
  
  modalTecnico.style.display = 'block';
}

// Guardar técnico
async function guardarTecnico(e) {
    e.preventDefault();
    
    const formData = new FormData(formTecnico);
    const datos = Object.fromEntries(formData.entries());
    
    // Convertir activo a boolean
    if (datos.activo) {
        datos.activo = datos.activo === 'true';
    }

    try {
      let response;
      if (tecnicoEditando) {
        // Actualizar
        response = await fetch(`${API_BASE_URL}/tecnicos/${tecnicoEditando.id_tecnico}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(datos)
        });
      } else {
        // Crear
        response = await fetch(`${API_BASE_URL}/tecnicos`, {
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
    const response = await fetch(`${API_BASE_URL}/tecnicos/${id}`, {
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
    const response = await fetch(`${API_BASE_URL}/tecnicos/${id}/ordenes`);
    if (!response.ok) throw new Error('Error al cargar órdenes');
    
    const ordenes = await response.json();
    mostrarOrdenes(ordenes);
    modalOrdenes.style.display = 'block';
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
                    <td>${orden.descripcion || '-'}</td>
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
