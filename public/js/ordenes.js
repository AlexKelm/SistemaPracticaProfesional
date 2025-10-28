console.log("ordenes.js cargado correctamente");

const tablaOrdenes = document.getElementById("tablaOrdenes");
let ordenesGlobal = [];
let modoEdicion = { activo: false, id: null };

// Cargar órdenes en la tabla
async function cargarOrdenes() {
  try {
    const response = await fetch("/api/ordenes");
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
  document.getElementById("modalNuevaOrden").style.display = "block";
  const titulo = document.getElementById("modalTitulo");
  titulo.textContent = modoEdicion.activo ? "Editar Orden" : "Nueva Orden";

  const selectCliente = document.getElementById("selectCliente");
  selectCliente.innerHTML = "";
  const clientesResp = await fetch("/api/clientes");
  const clientes = await clientesResp.json();
  clientes.forEach(c => {
    const option = document.createElement("option");
    option.value = c.id;
    option.textContent = c.razon_social;
    selectCliente.appendChild(option);
  });
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
  const id_cliente = document.getElementById("selectCliente").value;
  const observacion = document.getElementById("inputObservacion").value;
  const estado = document.getElementById("selectEstado").value;
  const prioridad = document.getElementById("selectPrioridad").value;
  const fecha_creacion = document.getElementById("inputFechaCreacion").value;
  const fecha_servicio = document.getElementById("inputFechaServicio").value || null;

  try {
    const url = modoEdicion.activo ? `/api/ordenes/${modoEdicion.id}` : "/api/ordenes";
    const method = modoEdicion.activo ? "PUT" : "POST";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cliente_id: id_cliente,
        observacion,
        estado,
        prioridad,
        fecha_creacion,
        fecha_servicio
      })
    });
    cerrarModal();
    cargarOrdenes();
  } catch (err) {
    console.error("Error al crear orden:", err);
  }
});

// Botón cancelar
document.getElementById("btnCancelarModal").addEventListener("click", cerrarModal);

async function editarOrden(id) {
  try {
    const response = await fetch(`/api/ordenes/${id}`);
    const orden = await response.json();

    modoEdicion = { activo: true, id };

    await abrirModal();

    document.getElementById("selectCliente").value = orden.cliente_id;
    document.getElementById("inputObservacion").value = orden.observacion || "";
    document.getElementById("selectEstado").value = orden.estado || "Pendiente";
    document.getElementById("selectPrioridad").value = orden.prioridad || "Media";
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
    await fetch(`/api/ordenes/${id}`, { method: "DELETE" });
    cargarOrdenes();
  } catch (err) {
    console.error("Error al eliminar orden:", err);
  }
}

async function verOrden(id) {
  try {
    const response = await fetch(`/api/ordenes/${id}`);
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
    document.getElementById("modalVerOrden").style.display = "block";
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
