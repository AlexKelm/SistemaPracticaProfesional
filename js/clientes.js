console.log("clientes.js cargado correctamente"); 
const tablaClientes = document.getElementById("tablaClientes");
let clientesGlobal = []; // Guardar todos los clientes

// 🔹 Cargar clientes en la tabla
async function cargarClientes() {
  try {
    const response = await fetch("http://localhost:3000/clientes");
    const clientes = await response.json();
    clientesGlobal = clientes; // Guardar para filtrar
    mostrarClientes(clientes);
  } catch (err) {
    console.error("Error al cargar clientes:", err);
  }
}
 
// Mostrar clientes en la tabla
function mostrarClientes(clientes) {
  tablaClientes.innerHTML = "";
  clientes.forEach(cliente => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${cliente.razon_social}</td>
      <td>${cliente.cuit}</td>
      <td>${cliente.telefono}</td>
      <td>${cliente.email}</td>
      <td>${cliente.referencia}</td>
      <td class="acciones">
        <button class="btn-small btn-primary" onclick="editarCliente(${cliente.id})">Editar</button>
        <button class="btn-small btn-danger" onclick="eliminarCliente(${cliente.id})">Eliminar</button>
        <button class="btn-small btn-secondary" onclick="verDetalles(${cliente.id})">Ver Órdenes</button>
      </td>
    `;
    tablaClientes.appendChild(fila);
  });
}

// Filtrar clientes por texto
function filtrarClientes() {
  const texto = document.getElementById("buscadorCliente").value.toLowerCase();
  const filtrados = clientesGlobal.filter(cliente =>
    (cliente.razon_social && cliente.razon_social.toLowerCase().includes(texto)) ||
    (cliente.cuit && cliente.cuit.toLowerCase().includes(texto)) ||
    (cliente.telefono && cliente.telefono.toLowerCase().includes(texto)) ||
    (cliente.email && cliente.email.toLowerCase().includes(texto)) ||
    (cliente.referencia && cliente.referencia.toLowerCase().includes(texto))
  );
  mostrarClientes(filtrados);
}

// Mostrar modal de nuevo cliente
function mostrarModalNuevoCliente() {
  document.getElementById("modalNuevoCliente").style.display = "flex";
}

// Ocultar modal
function cerrarModalCliente() {
  document.getElementById("modalNuevoCliente").style.display = "none";
  document.getElementById("formNuevoCliente").reset();
  Array.from(document.querySelectorAll("#formNuevoCliente input")).forEach(el => el.disabled = false);
  document.querySelector("#formNuevoCliente .btn-primary").style.display = "";
  modoEdicion = false;
  clienteEditandoId = null;
}

let modoEdicion = false;
let clienteEditandoId = null;

// Mostrar modal para editar cliente
async function editarCliente(id) {
  try {
    const response = await fetch(`http://localhost:3000/clientes/${id}`);
    const cliente = await response.json();

    // Rellenar el formulario con los datos del cliente
    document.getElementById("inputRazonSocial").value = cliente.razon_social || "";
    document.getElementById("inputCuit").value = cliente.cuit || "";
    document.getElementById("inputTelefono").value = cliente.telefono || "";
    document.getElementById("inputMail").value = cliente.email || "";
    document.getElementById("inputNombre").value = cliente.nombre_contacto || "";
    document.getElementById("inputApellido").value = cliente.apellido_contacto || "";

    modoEdicion = true;
    clienteEditandoId = id;

    document.getElementById("modalNuevoCliente").style.display = "flex";
  } catch (err) {
    console.error("Error al editar cliente:", err);
  }
}

// Guardar cliente (nuevo o editado)
document.getElementById("formNuevoCliente").addEventListener("submit", async function(e) {
  e.preventDefault();
  const razon_social = document.getElementById("inputRazonSocial").value;
  const cuit = document.getElementById("inputCuit").value;
  const telefono = document.getElementById("inputTelefono").value;
  const mail = document.getElementById("inputMail").value;
  const nombre = document.getElementById("inputNombre").value;
  const apellido = document.getElementById("inputApellido").value;

  if (!razon_social || !cuit) {
    alert("La razón social y el CUIT son obligatorios.");
    return;
  }

  try {
    if (modoEdicion && clienteEditandoId) {
      // Editar cliente existente
      await fetch(`http://localhost:3000/clientes/${clienteEditandoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ razon_social, cuit, telefono, email: mail, nombre_contacto: nombre, apellido_contacto: apellido })
      });
    } else {
      // Crear nuevo cliente
      await fetch("http://localhost:3000/clientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ razon_social, cuit, telefono, email: mail, nombre_contacto: nombre, apellido_contacto: apellido })
      });
    }
    cerrarModalCliente();
    cargarClientes();
  } catch (err) {
    console.error("Error al guardar cliente:", err);
  } finally {
    modoEdicion = false;
    clienteEditandoId = null;
  }
});

// Botón cancelar
document.getElementById("btnCancelarCliente").addEventListener("click", cerrarModalCliente);

// Reemplaza el prompt por el modal
document.getElementById("btnAgregarCliente").addEventListener("click", mostrarModalNuevoCliente);

// 🔹 Ver detalles de un cliente
async function verDetalles(id) {
  // Mostrar datos del cliente como antes
  const clienteResp = await fetch(`http://localhost:3000/clientes/${id}`);
  const cliente = await clienteResp.json();

  // Obtener las órdenes del cliente
  const ordenesResp = await fetch(`http://localhost:3000/ordenes`);
  const ordenes = await ordenesResp.json();
  const ordenesCliente = ordenes.filter(o => o.cliente_id == id);

  // Mostrar el modal de órdenes
  const modal = document.getElementById("modalOrdenesCliente");
  const lista = document.getElementById("listaOrdenesCliente");
  lista.innerHTML = "";

  if (ordenesCliente.length === 0) {
    lista.innerHTML = "<li>No hay órdenes para este cliente.</li>";
  } else {
    ordenesCliente.forEach(o => {
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>#${o.id}</strong> - ${o.observacion || "Sin descripción"}<br>
        Estado: ${o.estado} | Prioridad: ${o.prioridad} | Fecha: ${o.fecha_creacion}
      `;
      lista.appendChild(li);
    });
  }

  modal.style.display = "flex";
}

// Botón para cerrar el modal de órdenes
document.getElementById("btnCerrarOrdenesCliente").addEventListener("click", function() {
  document.getElementById("modalOrdenesCliente").style.display = "none";
});

// 🔹 Función para eliminar cliente
async function eliminarCliente(id) {
  if (!confirm("¿Seguro que quieres eliminar este cliente?")) return;
  try {
    await fetch(`http://localhost:3000/clientes/${id}`, { method: "DELETE" });
    cargarClientes();
  } catch (err) {
    console.error("Error al eliminar cliente:", err);
  }
}


// 🔹 Inicializar tabla al cargar la página
document.addEventListener("DOMContentLoaded", () => {
  cargarClientes();
  // Buscador
  const buscador = document.getElementById("buscadorCliente");
  if (buscador) {
    buscador.addEventListener("input", filtrarClientes);
  }
});
