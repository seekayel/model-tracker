import { useEffect, useState } from 'react';
import { catalogData } from './catalog';
import HomePage from './pages/HomePage';
import GridPage from './pages/GridPage';
import AboutPage from './pages/AboutPage';

type AppRoute = '/' | '/grid' | '/about';

function resolveRoute(hash: string): AppRoute {
  const route = hash.replace(/^#/, '') || '/';

  if (route === '/' || route === '/grid' || route === '/about') {
    return route;
  }

  return '/';
}

function routeHref(route: AppRoute): string {
  return `#${route}`;
}

const ROUTE_LABELS: Record<AppRoute, string> = {
  '/': 'Home',
  '/grid': 'Grid',
  '/about': 'About',
};

export default function App() {
  const [route, setRoute] = useState<AppRoute>(() => resolveRoute(window.location.hash));
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    const onHashChange = () => {
      setRoute(resolveRoute(window.location.hash));
    };

    window.addEventListener('hashchange', onHashChange);
    return () => {
      window.removeEventListener('hashchange', onHashChange);
    };
  }, []);

  useEffect(() => {
    if (!isDrawerOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsDrawerOpen(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isDrawerOpen]);

  return (
    <div className="app-shell">
      <header className="app-topbar">
        <div className="topbar-left">
          <button
            type="button"
            className="menu-button"
            aria-label="Toggle navigation menu"
            aria-controls="side-nav"
            aria-expanded={isDrawerOpen}
            onClick={() => setIsDrawerOpen((open) => !open)}
          >
            <span />
            <span />
            <span />
          </button>
          <a href={routeHref('/')} className="app-brand">
            MODEL TRACKER
          </a>
        </div>
        <span className="route-pill">{ROUTE_LABELS[route]}</span>
      </header>

      {isDrawerOpen && (
        <button
          type="button"
          className="drawer-overlay"
          aria-label="Close navigation menu"
          onClick={() => setIsDrawerOpen(false)}
        />
      )}

      <aside id="side-nav" className={`side-drawer${isDrawerOpen ? ' open' : ''}`} aria-hidden={!isDrawerOpen}>
        <div className="drawer-heading">Navigate</div>
        <nav className="drawer-nav" aria-label="Main navigation">
          <a
            href={routeHref('/')}
            className={`drawer-link${route === '/' ? ' active' : ''}`}
            onClick={() => setIsDrawerOpen(false)}
          >
            Home
          </a>
          <a
            href={routeHref('/grid')}
            className={`drawer-link${route === '/grid' ? ' active' : ''}`}
            onClick={() => setIsDrawerOpen(false)}
          >
            Grid
          </a>
          <a
            href={routeHref('/about')}
            className={`drawer-link${route === '/about' ? ' active' : ''}`}
            onClick={() => setIsDrawerOpen(false)}
          >
            About
          </a>
        </nav>
      </aside>

      {route === '/' && <HomePage rows={catalogData.rows} />}
      {route === '/grid' && <GridPage models={catalogData.models} rows={catalogData.rows} />}
      {route === '/about' && <AboutPage />}
    </div>
  );
}
