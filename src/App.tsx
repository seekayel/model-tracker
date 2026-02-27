import { useEffect, useState } from 'react';
import { catalogData, findComboDetail } from './catalog';
import HomePage from './pages/HomePage';
import GridPage from './pages/GridPage';
import AboutPage from './pages/AboutPage';
import VariantPage from './pages/VariantPage';

type AppRoute = '/' | '/grid' | '/about' | '/variant';

type RouteState = {
  route: AppRoute;
  searchParams: URLSearchParams;
};

function resolveRouteState(hash: string): RouteState {
  const value = hash.replace(/^#/, '') || '/';
  const questionIndex = value.indexOf('?');
  const route = questionIndex >= 0 ? value.slice(0, questionIndex) : value;
  const queryString = questionIndex >= 0 ? value.slice(questionIndex + 1) : '';

  if (route === '/' || route === '/grid' || route === '/about' || route === '/variant') {
    return {
      route,
      searchParams: new URLSearchParams(queryString),
    };
  }

  return {
    route: '/',
    searchParams: new URLSearchParams(''),
  };
}

function routeHref(route: AppRoute): string {
  return `#${route}`;
}

const ROUTE_LABELS: Record<AppRoute, string> = {
  '/': 'Home',
  '/grid': 'Grid',
  '/about': 'About',
  '/variant': 'Variant',
};

export default function App() {
  const [hashLocation, setHashLocation] = useState<string>(() => window.location.hash);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const routeState = resolveRouteState(hashLocation);
  const route = routeState.route;
  const variantGameKey = routeState.searchParams.get('game') ?? '';
  const variantProviderId = routeState.searchParams.get('provider') ?? '';
  const variantModelKey = routeState.searchParams.get('model') ?? '';
  const comboDetail = route === '/variant'
    ? findComboDetail(variantGameKey, variantProviderId, variantModelKey)
    : null;

  useEffect(() => {
    const onHashChange = () => {
      setHashLocation(window.location.hash);
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

      {route === '/' && <HomePage rows={catalogData.baselineRows} />}
      {route === '/grid' && <GridPage models={catalogData.models} sections={catalogData.sections} />}
      {route === '/about' && <AboutPage />}
      {route === '/variant' && (
        <VariantPage
          combo={comboDetail}
          gameKey={variantGameKey}
          providerId={variantProviderId}
          modelKey={variantModelKey}
        />
      )}
    </div>
  );
}
