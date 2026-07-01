import { Link, NavLink, Outlet } from 'react-router-dom';
import { Film, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/lib/useTheme';
import { useEffect, useState } from 'react';

const navItems = [
  { to: '/',           label: 'Search' },
  { to: '/movies/new', label: 'Add Movie' },
  { to: '/analytics',  label: 'Analytics' },
  { to: '/timeseries', label: 'TimeSeries' },
];

export default function AppLayout() {
  const { theme, setTheme, resolved } = useTheme();

  function toggleTheme() {
    setTheme(resolved === 'dark' ? 'light' : 'dark');
  }

  return (
    <div className="min-h-screen bg-background [background-image:radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 font-semibold text-foreground shrink-0">
            <Film className="size-5 text-primary" />
            <span className="hidden sm:inline">MovieDB</span>
          </Link>
          <nav className="flex items-center gap-1">
            {navItems.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-md text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="flex-1" />

          <button
            onClick={toggleTheme}
            className="size-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-200"
            aria-label={`Switch to ${resolved === 'dark' ? 'light' : 'dark'} theme`}
          >
            {resolved === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-8 animate-in fade-in slide-in-from-top-4 duration-500">
        <Outlet />
      </main>
    </div>
  );
}
