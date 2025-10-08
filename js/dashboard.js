document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutBtn");

  // Botón de cerrar sesión
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      // TODO: limpiar almacenamiento local de sesión si se usa
      // localStorage.removeItem("usuario");

      // Redirigir al login
      window.location.href = "login.html";
    });
  }
});
