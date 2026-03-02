console.log("usuarios.js cargado correctamente"); 
const tablaUsuarios = document.getElementById("tablaUsuarios");
let usuariosGlobal = []; // Guardar todos los usuarios

// Cargar usuarios en la tabla
async function cargarUsuarios() {
  try {
    const response = await fetchWithAuth("/api/usuarios");
    const usuarios = await response.json();
    usuariosGlobal = usuarios; // Guardar para filtrar
    mostrarUsuarios(usuarios);
  } catch (err) {
    console.error("Error al cargar usuarios:", err);
  }
}
 
// Mostrar usuarios en la tabla
function mostrarUsuarios(usuarios) {
  tablaUsuarios.innerHTML = "";
  usuarios.forEach(usuario => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${usuario.id_usuario}</td>
      <td>${usuario.usuario}</td>
      <td>${usuario.rol}</td>
      <td>${usuario.activo ? 'Sí' : 'No'}</td>
      <td>${usuario.fecha_creacion ? new Date(usuario.fecha_creacion).toLocaleDateString() : '-'}</td>
      <td class="acciones">
        <button class="btn-small btn-primary" onclick="editarUsuario(${usuario.id_usuario})">Editar</button>
        <button class="btn-small btn-danger" onclick="eliminarUsuario(${usuario.id_usuario})">Eliminar</button>
      </td>
    `;
    tablaUsuarios.appendChild(fila);
  });
}

// Filtrar usuarios por texto
function filtrarUsuarios() {
  const texto = document.getElementById("buscadorUsuario").value.toLowerCase();
  const filtrados = usuariosGlobal.filter(usuario =>
    (usuario.usuario && usuario.usuario.toLowerCase().includes(texto)) ||
    (usuario.rol && usuario.rol.toLowerCase().includes(texto))
  );
  mostrarUsuarios(filtrados);
}

// Mostrar modal de nuevo usuario
function mostrarModalNuevoUsuario() {
  document.getElementById("tituloModalUsuario").textContent = "Nuevo Usuario";
  document.getElementById("inputPassword").required = true;
  document.getElementById("inputPassword").placeholder = "Contraseña requerida";
  document.getElementById("modalNuevoUsuario").style.display = "flex";
}

// Ocultar modal
function cerrarModalUsuario() {
  document.getElementById("modalNuevoUsuario").style.display = "none";
  document.getElementById("formNuevoUsuario").reset();
  Array.from(document.querySelectorAll("#formNuevoUsuario input")).forEach(el => el.disabled = false);
  document.querySelector("#formNuevoUsuario .btn-primary").style.display = "";
  document.getElementById("inputPassword").required = false;
  modoEdicion = false;
  usuarioEditandoId = null;
}

let modoEdicion = false;
let usuarioEditandoId = null;

// Mostrar modal para editar usuario
async function editarUsuario(id) {
  try {
    const response = await fetchWithAuth(`/api/usuarios/${id}`);
    const usuario = await response.json();

    // Rellenar el formulario con los datos del usuario
    document.getElementById("inputUsuario").value = usuario.usuario || "";
    document.getElementById("inputRol").value = usuario.rol || "";
    document.getElementById("inputActivo").value = usuario.activo || 1;
    
    // En modo edición, la contraseña es opcional
    document.getElementById("inputPassword").required = false;
    document.getElementById("inputPassword").placeholder = "Dejar vacío para no cambiar";
    document.getElementById("inputPassword").value = "";

    modoEdicion = true;
    usuarioEditandoId = id;

    document.getElementById("tituloModalUsuario").textContent = "Editar Usuario";
    document.getElementById("modalNuevoUsuario").style.display = "flex";
  } catch (err) {
    console.error("Error al editar usuario:", err);
  }
}

// Guardar usuario (nuevo o editado)
document.getElementById("formNuevoUsuario").addEventListener("submit", async function(e) {
  e.preventDefault();
  const usuario = document.getElementById("inputUsuario").value;
  const password = document.getElementById("inputPassword").value;
  const rol = document.getElementById("inputRol").value;
  const activo = parseInt(document.getElementById("inputActivo").value);

  if (!usuario || !rol) {
    alert("El usuario y el rol son obligatorios.");
    return;
  }

  try {
    if (modoEdicion && usuarioEditandoId) {
      // Editar usuario existente
      const body = { usuario, rol, activo };
      if (password) {
        body.password = password; // Solo incluir password si se proporcionó
      }
      
      await fetchWithAuth(`/api/usuarios/${usuarioEditandoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
    } else {
      // Crear nuevo usuario
      if (!password) {
        alert("La contraseña es obligatoria para crear un nuevo usuario.");
        return;
      }
      
      await fetchWithAuth("/api/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario, password, rol })
      });
    }
    cerrarModalUsuario();
    cargarUsuarios();
  } catch (err) {
    console.error("Error al guardar usuario:", err);
    alert("Error al guardar usuario. Ver consola para detalles.");
  } finally {
    modoEdicion = false;
    usuarioEditandoId = null;
  }
});

// Botón cancelar
document.getElementById("btnCancelarUsuario").addEventListener("click", cerrarModalUsuario);

// Botón cerrar (X) del modal
document.getElementById("btnCerrarModalUsuario").addEventListener("click", cerrarModalUsuario);

// Botón agregar usuario
document.getElementById("btnAgregarUsuario").addEventListener("click", mostrarModalNuevoUsuario);

// Función para eliminar usuario (soft delete)
async function eliminarUsuario(id) {
  if (!confirm("¿Seguro que quieres desactivar este usuario?")) return;
  try {
    await fetchWithAuth(`/api/usuarios/${id}`, { method: "DELETE" });
    cargarUsuarios();
  } catch (err) {
    console.error("Error al eliminar usuario:", err);
  }
}

// Inicializar tabla al cargar la página
document.addEventListener("DOMContentLoaded", () => {
  cargarUsuarios();
  // Buscador
  const buscador = document.getElementById("buscadorUsuario");
  if (buscador) {
    buscador.addEventListener("input", filtrarUsuarios);
  }
});

// Logout
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    logout();
  });
}
