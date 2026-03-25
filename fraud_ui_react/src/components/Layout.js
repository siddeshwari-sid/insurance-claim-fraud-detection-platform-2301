import React from 'react';
import { NavLink } from 'react-router-dom';
import './layout.css';

// PUBLIC_INTERFACE
export default function Layout({ children }) {
  return (
    <div className="appShell">
      <aside className="sidebar" aria-label="Primary navigation">
        <div className="brand">
          <div className="brandMark" aria-hidden="true" />
          <div className="brandText">
            <div className="brandTitle">FraudWatch</div>
            <div className="brandSubtitle">Claims risk analysis</div>
          </div>
        </div>

        <nav className="nav">
          <NavLink className={({ isActive }) => `navItem ${isActive ? 'active' : ''}`} to="/upload">
            Upload
          </NavLink>
          <NavLink className={({ isActive }) => `navItem ${isActive ? 'active' : ''}`} to="/claims">
            Claims
          </NavLink>
          <NavLink className={({ isActive }) => `navItem ${isActive ? 'active' : ''}`} to="/reports">
            Reports
          </NavLink>
        </nav>

        <div className="sidebarFooter">
          <div className="hint">
            Data is stored <strong>in-memory</strong> on the server for the active session.
          </div>
        </div>
      </aside>

      <main className="content" role="main">
        {children}
      </main>
    </div>
  );
}
