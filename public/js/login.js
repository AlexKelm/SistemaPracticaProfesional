document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");

  form.addEventListener("submit", async (e) => {
    e.preventDefault(); // evita que recargue la página

    // Tomamos los valores del formulario
    const username = document.getElementById("usuario").value;
    const password = document.getElementById("password").value;

    try {
      const response = await fetch("/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (response.ok) {
        console.log("✅ Login exitoso: " + data.message);
        localStorage.setItem("user", JSON.stringify(data.user));
        window.location.href = "dashboard.html";
      } else {
        alert("❌ Error: No se pudo autenticar el usuario. error: " + data.message);
      }
    } catch (err) {
      console.error("Error al conectar con backend:", err);
      alert("❌ No se pudo conectar con el servidor.");
    }
  });
});
