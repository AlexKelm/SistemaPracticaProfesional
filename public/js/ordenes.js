const tablaOrdenes = document.getElementById("tablaOrdenes");
let ordenesGlobal = [];
let modoEdicion = { activo: false, id: null };

// Cargar órdenes en la tabla
async function cargarOrdenes() {
  try {
    const response = await fetchWithAuth("/api/ordenes");
    const ordenes = await response.json();
    ordenesGlobal = ordenes;
    mostrarOrdenes(ordenes);
  } catch (err) {
    console.error("Error al cargar órdenes:", err);
  }
}

// Formatear fecha
function formatearFecha(fechaIso) {
  if (!fechaIso) return "";
  const fecha = new Date(fechaIso);
  const dia = String(fecha.getDate()).padStart(2, '0');
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const anio = fecha.getFullYear();
  const hora = String(fecha.getHours()).padStart(2, '0');
  const min = String(fecha.getMinutes()).padStart(2, '0');
  return `${dia}/${mes}/${anio} ${hora}:${min}`;
}

// Mostrar órdenes en la tabla
function mostrarOrdenes(ordenes) {
  tablaOrdenes.innerHTML = "";
  ordenes.forEach(orden => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${orden.id}</td>
      <td>${orden.razon_social}</td>
      <td>${orden.descripcion || orden.observacion || ''}</td>
      <td>${orden.estado}</td>
      <td>${orden.prioridad}</td>
      <td>${formatearFecha(orden.fecha_creacion)}</td>
      <td>${formatearFecha(orden.fecha_servicio)}</td>
      <td class="acciones">
        <button class="btn-accion editar" onclick="editarOrden(${orden.id})">Editar</button>
        <button class="btn-accion eliminar" onclick="eliminarOrden(${orden.id})">Eliminar</button>
        <button class="btn-accion ver" onclick="verOrden(${orden.id})">Ver</button>
      </td>
    `;
    tablaOrdenes.appendChild(fila);
  });
}

function filtrarOrdenes() {
  const texto = document.getElementById("buscarOrden").value.toLowerCase();
  const filtradas = ordenesGlobal.filter(orden =>
    (orden.descripcion && orden.descripcion.toLowerCase().includes(texto)) ||
    (orden.observacion && orden.observacion.toLowerCase().includes(texto)) ||
    (orden.razon_social && orden.razon_social.toLowerCase().includes(texto)) ||
    (orden.estado && orden.estado.toLowerCase().includes(texto)) ||
    (orden.prioridad && orden.prioridad.toLowerCase().includes(texto))
  );
  mostrarOrdenes(filtradas);
}

// Abrir modal (nuevo o edición) y cargar clientes
async function abrirModal() {
  document.getElementById("modalNuevaOrden").style.display = "flex";
  const titulo = document.getElementById("modalTitulo");
  titulo.textContent = modoEdicion.activo ? "Editar Orden" : "Nueva Orden";

  // Cargar clientes
  const selectCliente = document.getElementById("selectCliente");
  selectCliente.innerHTML = "";
  const clientesResp = await fetchWithAuth("/api/clientes");
  const clientes = await clientesResp.json();
  
  if (clientes.length === 0) {
    selectCliente.innerHTML = "<option value=''>No hay clientes disponibles</option>";
    console.warn("⚠️ No hay clientes en la base de datos");
    return;
  }
  
  clientes.forEach(c => {
    const option = document.createElement("option");
    const clienteId = c.id_cliente || c.id;
    if (!clienteId) {
      console.error("❌ Cliente sin ID:", c);
      return;
    }
    option.value = clienteId;
    option.textContent = c.razon_social;
    selectCliente.appendChild(option);
  });
  
  // Cargar tipos de servicio
  const selectTipoServicio = document.getElementById("selectTipoServicio");
  selectTipoServicio.innerHTML = "";
  
  try {
    const tiposResp = await fetchWithAuth("/api/tipo-servicio");
    
    if (!tiposResp.ok) {
      console.error("❌ Error al cargar tipos de servicio:", tiposResp.status);
      selectTipoServicio.innerHTML = "<option value=''>Error al cargar tipos de servicio</option>";
    } else {
      const tipos = await tiposResp.json();
      
      if (tipos.length === 0) {
        selectTipoServicio.innerHTML = "<option value=''>No hay tipos de servicio disponibles</option>";
      } else {
        tipos.forEach(t => {
          const option = document.createElement("option");
          option.value = t.id;
          const texto = t.detalle || t.nombre;
          option.textContent = texto;
          selectTipoServicio.appendChild(option);
        });
      }
    }
  } catch (error) {
    console.error("❌ Error al cargar tipos de servicio:", error);
    selectTipoServicio.innerHTML = "<option value=''>Error al cargar tipos de servicio</option>";
  }
  
  // Cargar técnicos
  const selectTecnico = document.getElementById("selectTecnico");
  selectTecnico.innerHTML = "";
  
  try {
    const tecnicosResp = await fetchWithAuth("/api/tecnicos");
    
    if (!tecnicosResp.ok) {
      console.error("❌ Error al cargar técnicos:", tecnicosResp.status);
      selectTecnico.innerHTML = "<option value=''>Error al cargar técnicos</option>";
    } else {
      const tecnicos = await tecnicosResp.json();
      
      if (tecnicos.length === 0) {
        selectTecnico.innerHTML = "<option value=''>No hay técnicos disponibles</option>";
      } else {
        tecnicos.forEach(t => {
          const option = document.createElement("option");
          const tecnicoId = t.id_tecnico || t.id;
          option.value = tecnicoId;
          option.textContent = `${t.nombre} ${t.apellido}`;
          selectTecnico.appendChild(option);
        });
      }
    }
  } catch (error) {
    console.error("❌ Error al cargar técnicos:", error);
    selectTecnico.innerHTML = "<option value=''>Error al cargar técnicos</option>";
  }
}

// Mostrar modal de nueva orden (reset y abrir)
async function nuevaOrden() {
  modoEdicion = { activo: false, id: null };
  document.getElementById("formNuevaOrden").reset();
  await abrirModal();
}

// Ocultar modal
function cerrarModal() {
  document.getElementById("modalNuevaOrden").style.display = "none";
  document.getElementById("formNuevaOrden").reset();
  modoEdicion = { activo: false, id: null };
}

// Guardar orden (creación o edición)
document.getElementById("formNuevaOrden").addEventListener("submit", async function(e) {
  e.preventDefault();
  const cliente_id = document.getElementById("selectCliente").value;
  const tipo_servicio_id = document.getElementById("selectTipoServicio").value;
  const tecnico_id = document.getElementById("selectTecnico").value;
  const observacion = document.getElementById("inputObservacion").value;
  const estado = document.getElementById("selectEstado").value;
  const prioridad = document.getElementById("selectPrioridad").value;
  const costo = document.getElementById("inputCosto").value;
  const fecha_creacion = document.getElementById("inputFechaCreacion").value;
  const fecha_servicio = document.getElementById("inputFechaServicio").value || null;

  // Validación del cliente
  if (!cliente_id || cliente_id === '' || cliente_id === 'undefined') {
    alert("Por favor selecciona un cliente válido");
    console.error("❌ ID de cliente inválido:", cliente_id);
    return;
  }

  try {
    const url = modoEdicion.activo ? `/api/ordenes/${modoEdicion.id}` : "/api/ordenes";
    const method = modoEdicion.activo ? "PUT" : "POST";
    const response = await fetchWithAuth(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cliente_id,
        tipo_servicio_id,
        tecnico_id,
        observacion,
        estado,
        prioridad,
        costo,
        fecha_creacion,
        fecha_servicio
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || "Error al guardar orden");
    }
    
    cerrarModal();
    cargarOrdenes();
  } catch (err) {
    console.error("Error al crear orden:", err);
  }
});

// Botón cancelar
document.getElementById("btnCancelarModal").addEventListener("click", cerrarModal);

// Botón cerrar (X) del modal
document.getElementById("btnCerrarModalOrden").addEventListener("click", cerrarModal);

async function editarOrden(id) {
  try {
    const response = await fetchWithAuth(`/api/ordenes/${id}`);
    const orden = await response.json();

    modoEdicion = { activo: true, id };

    await abrirModal();

    document.getElementById("selectCliente").value = orden.cliente_id;
    document.getElementById("inputObservacion").value = orden.observacion || "";
    // Convertir estado de vuelta a formato de select (capitalizado)
    const estadoCapitalizado = orden.estado ? orden.estado.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : "Pendiente";
    const prioridadCapitalizada = orden.prioridad ? orden.prioridad.charAt(0).toUpperCase() + orden.prioridad.slice(1) : "Media";
    document.getElementById("selectEstado").value = estadoCapitalizado;
    document.getElementById("selectPrioridad").value = prioridadCapitalizada;
    // input type=date espera formato YYYY-MM-DD
    const toDateInput = (iso) => iso ? new Date(iso).toISOString().slice(0,10) : "";
    document.getElementById("inputFechaCreacion").value = toDateInput(orden.fecha_creacion);
    document.getElementById("inputFechaServicio").value = toDateInput(orden.fecha_servicio);
  } catch (err) {
    console.error("Error al editar orden:", err);
  }
}

async function eliminarOrden(id) {
  const confirmar = confirm(`¿Seguro que deseas eliminar la orden #${id}?`);
  if (!confirmar) return;
  try {
    await fetchWithAuth(`/api/ordenes/${id}`, { method: "DELETE" });
    cargarOrdenes();
  } catch (err) {
    console.error("Error al eliminar orden:", err);
  }
}

async function verOrden(id) {
  try {
    const response = await fetchWithAuth(`/api/ordenes/${id}`);
    const orden = await response.json();
    const cont = document.getElementById("contenidoVerOrden");
    cont.innerHTML = `
      <ul style="list-style:none; padding-left:0;">
        <li><strong>Orden #:</strong> ${orden.id}</li>
        <li><strong>Cliente:</strong> ${orden.razon_social}</li>
        <li><strong>Descripción:</strong> ${orden.descripcion || orden.observacion || "-"}</li>
        <li><strong>Estado:</strong> ${orden.estado || "-"}</li>
        <li><strong>Prioridad:</strong> ${orden.prioridad || "-"}</li>
        <li><strong>Fecha creación:</strong> ${formatearFecha(orden.fecha_creacion)}</li>
        <li><strong>Fecha servicio:</strong> ${formatearFecha(orden.fecha_servicio)}</li>
      </ul>
    `;
    document.getElementById("modalVerOrden").style.display = "flex";
  } catch (err) {
    console.error("Error al ver orden:", err);
  }
}

// Inicializar tabla al cargar la página
document.addEventListener("DOMContentLoaded", () => {
  cargarOrdenes();
  const buscador = document.getElementById("buscarOrden");
  if (buscador) {
    buscador.addEventListener("input", filtrarOrdenes);
  }
  const btnNuevaOrden = document.getElementById("btnNuevaOrden");
  if (btnNuevaOrden) {
    btnNuevaOrden.addEventListener("click", nuevaOrden);
  }
  const btnCerrarVerOrden = document.getElementById("btnCerrarVerOrden");
  if (btnCerrarVerOrden) {
    btnCerrarVerOrden.addEventListener("click", () => {
      document.getElementById("modalVerOrden").style.display = "none";
      document.getElementById("contenidoVerOrden").innerHTML = "";
    });
  }
});

//logout
if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      logout();
    })};