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

// Función para cerrar sesión
function logout() {
  // Limpiar tokens del localStorage
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  
  // Redirigir al login
  window.location.href = '/login';
}

