const tablaReclamos = document.getElementById("tablaReclamos");
let reclamosGlobal = [];
let modoEdicion = { activo: false, id: null };

// Cargar reclamos en la tabla
async function cargarReclamos() {
  try {
    const response = await fetchWithAuth("/api/reclamos");
    const reclamos = await response.json();
    reclamosGlobal = reclamos;
    mostrarReclamos(reclamos);
  } catch (err) {
    console.error("Error al cargar reclamos:", err);
  }
}

// Formatear fecha
function formatearFecha(fechaIso) {
  if (!fechaIso) return "";
  const fecha = new Date(fechaIso);
  const dia = String(fecha.getDate()).padStart(2, '0');
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const anio = fecha.getFullYear();
  return `${dia}/${mes}/${anio}`;
}

// Mostrar reclamos en la tabla
function mostrarReclamos(reclamos) {
  tablaReclamos.innerHTML = "";
  
  if (reclamos.length === 0) {
    tablaReclamos.innerHTML = `
      <tr>
        <td colspan="4" style="text-align: center; padding: 40px; color: #9ca3af;">
          No hay reclamos registrados
        </td>
      </tr>
    `;
    return;
  }
  
  reclamos.forEach(reclamo => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${reclamo.id}</td>
      <td>${reclamo.detalles || '-'}</td>
      <td>${formatearFecha(reclamo.fecha)}</td>
      <td class="acciones">
        <button class="btn-accion editar" onclick="editarReclamo(${reclamo.id})">Editar</button>
        <button class="btn-accion eliminar" onclick="eliminarReclamo(${reclamo.id})">Eliminar</button>
      </td>
    `;
    tablaReclamos.appendChild(fila);
  });
}

// Filtrar reclamos por texto
function filtrarReclamos() {
  const texto = document.getElementById("buscadorReclamo").value.toLowerCase();
  const filtrados = reclamosGlobal.filter(reclamo =>
    (reclamo.detalles && reclamo.detalles.toLowerCase().includes(texto)) ||
    (reclamo.id && reclamo.id.toString().includes(texto))
  );
  mostrarReclamos(filtrados);
}

// Abrir modal (nuevo o edición)
function abrirModal() {
  document.getElementById("modalNuevoReclamo").style.display = "flex";
  const titulo = document.getElementById("modalTitulo");
  titulo.textContent = modoEdicion.activo ? "Editar Reclamo" : "Nuevo Reclamo";
  
  // Establecer fecha actual si es nuevo
  if (!modoEdicion.activo) {
    const hoy = new Date().toISOString().split('T')[0];
    document.getElementById("inputFecha").value = hoy;
  }
}

// Mostrar modal de nuevo reclamo
function nuevoReclamo() {
  modoEdicion = { activo: false, id: null };
  document.getElementById("formNuevoReclamo").reset();
  abrirModal();
}

// Ocultar modal
function cerrarModal() {
  document.getElementById("modalNuevoReclamo").style.display = "none";
  document.getElementById("formNuevoReclamo").reset();
  modoEdicion = { activo: false, id: null };
}

// Guardar reclamo (creación o edición)
document.getElementById("formNuevoReclamo").addEventListener("submit", async function(e) {
  e.preventDefault();
  
  const detalles = document.getElementById("inputDetalles").value;
  const fecha = document.getElementById("inputFecha").value;

  if (!detalles) {
    alert("Los detalles son obligatorios");
    return;
  }

  try {
    const url = modoEdicion.activo ? `/api/reclamos/${modoEdicion.id}` : "/api/reclamos";
    const method = modoEdicion.activo ? "PUT" : "POST";
    
    const response = await fetchWithAuth(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ detalles, fecha })
    });
    
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Error al guardar reclamo");
    }
    
    cerrarModal();
    cargarReclamos();
  } catch (err) {
    console.error("Error al guardar reclamo:", err);
    alert(err.message);
  }
});

// Botón cancelar
document.getElementById("btnCancelarReclamo").addEventListener("click", cerrarModal);

// Botón cerrar (X) del modal
document.getElementById("btnCerrarModalReclamo").addEventListener("click", cerrarModal);

// Botón nuevo reclamo
document.getElementById("btnAgregarReclamo").addEventListener("click", nuevoReclamo);

// Editar reclamo
async function editarReclamo(id) {
  try {
    const response = await fetchWithAuth(`/api/reclamos/${id}`);
    const reclamo = await response.json();

    modoEdicion = { activo: true, id };

    document.getElementById("inputDetalles").value = reclamo.detalles || "";
    
    // Formatear fecha para input type="date"
    if (reclamo.fecha) {
      const fecha = new Date(reclamo.fecha);
      const fechaFormateada = fecha.toISOString().split('T')[0];
      document.getElementById("inputFecha").value = fechaFormateada;
    }

    abrirModal();
  } catch (err) {
    console.error("Error al cargar reclamo:", err);
    alert("Error al cargar los datos del reclamo");
  }
}

// Eliminar reclamo
async function eliminarReclamo(id) {
  if (!confirm("¿Estás seguro de eliminar este reclamo?")) return;

  try {
    const response = await fetchWithAuth(`/api/reclamos/${id}`, {
      method: "DELETE"
    });
    
    if (!response.ok) {
      throw new Error("Error al eliminar reclamo");
    }
    
    cargarReclamos();
  } catch (err) {
    console.error("Error al eliminar reclamo:", err);
    alert("Error al eliminar el reclamo");
  }
}

// Inicializar tabla al cargar la página
document.addEventListener("DOMContentLoaded", () => {
  cargarReclamos();
  
  // Buscador
  const buscador = document.getElementById("buscadorReclamo");
  if (buscador) {
    buscador.addEventListener("input", filtrarReclamos);
  }
  
  // Logout
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      logout();
    });
  }
});
