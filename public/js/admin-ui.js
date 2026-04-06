document.addEventListener('DOMContentLoaded', () => {
  const menu = document.getElementById('navbarMenu');
  const toggle = document.getElementById('navbarToggle');
  const firstContentBlock = document.querySelector('.admin-dashboard, .stock-container, .form-container');

  if (firstContentBlock && !firstContentBlock.id) {
    firstContentBlock.id = 'admin-main-content';
  }

  if (menu && toggle) {
    const setExpanded = (expanded) => {
      toggle.setAttribute('aria-expanded', String(expanded));
      toggle.setAttribute('aria-label', expanded ? 'Cerrar menú principal' : 'Abrir menú principal');
    };

    const closeMenu = () => {
      menu.classList.remove('active');
      setExpanded(false);
    };

    const toggleMenu = () => {
      const expanded = !menu.classList.contains('active');
      menu.classList.toggle('active', expanded);
      setExpanded(expanded);
    };

    setExpanded(false);

    toggle.addEventListener('click', (event) => {
      event.stopPropagation();
      toggleMenu();
    });

    document.addEventListener('click', (event) => {
      if (!menu.classList.contains('active')) return;
      if (!menu.contains(event.target) && !toggle.contains(event.target)) {
        closeMenu();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeMenu();
      }
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 768) {
        closeMenu();
      }
    });

    menu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
          closeMenu();
        }
      });
    });
  }

  const currentPath = window.location.pathname.replace(/\/$/, '');
  document.querySelectorAll('.nav-link, .submenu-link').forEach((link) => {
    const href = (link.getAttribute('href') || '').replace(/\/$/, '');
    if (!href || href === '/cerrar-sesion') return;

    const isCurrent = href === currentPath || (href !== '/administrador' && currentPath.startsWith(href));
    if (isCurrent) {
      link.classList.add('is-current');
      link.setAttribute('aria-current', 'page');
    }
  });
});
