document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");

  form.addEventListener("submit", async (e) => {
    e.preventDefault(); // evita que recargue la página

    // Tomamos los valores del formulario
    const username = document.getElementById("usuario").value;
    const password = document.getElementById("password").value;

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (response.ok) {
        // Guardar token en localStorage
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        window.location.href = "/dashboard";
      } else {
        alert("❌ Error: No se pudo autenticar el usuario. error: " + data.message);
      }
    } catch (err) {
      console.error("Error al conectar con backend:", err);
      alert("❌ No se pudo conectar con el servidor.");
    }
  });
});

// Función helper para fetch con autenticación
async function fetchWithAuth(url, options = {}) {
  const token = localStorage.getItem('token');
  
  if (!token) {
    window.location.href = '/login';
    return;
  }

  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    return;
  }

  return response;
}

// Usar en lugar de fetch normal
// Ejemplo: const response = await fetchWithAuth('/api/clientes');
