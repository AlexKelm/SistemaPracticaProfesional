// Cargar sidebar dinámicamente
async function loadSidebar() {
  try {
    const response = await fetch('components/sidebar.html');
    const sidebarHTML = await response.text();
    
    // Insertar el sidebar en el contenedor
    const container = document.querySelector('.dashboard-container');
    if (container) {
      container.insertAdjacentHTML('afterbegin', sidebarHTML);
      
      // Marcar la página activa basándose en la URL actual
      const currentPage = window.location.pathname.split('/').pop() || 'dashboard';
      const activeLink = document.querySelector(`.sidebar-nav a[data-page="${currentPage}"]`);
      if (activeLink) {
        activeLink.classList.add('active');
        
        // Actualizar el h2 del sidebar con el nombre de la página actual
        const sidebarTitle = document.querySelector('.sidebar-logo h2');
        if (sidebarTitle) {
          sidebarTitle.textContent = activeLink.textContent;
        }
      }
      
      // Inicializar el toggle del sidebar
      initSidebarToggle();
    }
  } catch (error) {
    console.error('Error cargando sidebar:', error);
  }
}

// Inicializar funcionalidad del toggle
function initSidebarToggle() {
  const sidebarToggle = document.getElementById('sidebarToggle');
  const sidebar = document.querySelector('.sidebar');
  const dashboardContainer = document.querySelector('.dashboard-container');

  if (sidebarToggle && sidebar && dashboardContainer) {
    sidebarToggle.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
      dashboardContainer.classList.toggle('sidebar-collapsed');
      localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
    });

    // Restaurar estado del sidebar desde localStorage
    if (localStorage.getItem('sidebarCollapsed') === 'true') {
      sidebar.classList.add('collapsed');
      dashboardContainer.classList.add('sidebar-collapsed');
    }
  }
}

// Cargar el sidebar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadSidebar);
} else {
  loadSidebar();
}
