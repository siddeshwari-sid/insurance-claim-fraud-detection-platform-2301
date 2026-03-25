import React from 'react';
import { NavLink } from 'react-router-dom';
import './layout.css';
import { getAppName, getAppTagline } from '../config/brand';

// PUBLIC_INTERFACE
export default function Layout({ children, authEnabled = false, authed = false, onLogout }) {
  return (
    <div className="appShell">
      <aside className="sidebar" aria-label="Primary navigation">
        <div className="brand">
          <div className="brandMark" aria-hidden="true" />
          <div className="brandText">
            <div className="brandTitle">{getAppName()}</div>
            <div className="brandSubtitle">{getAppTagline()}</div>
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

        {authEnabled && authed ? (
          <div className="sidebarFooter">
            <button className="button" type="button" onClick={onLogout} style={{ width: '100%' }}>
              Logout
            </button>
          </div>
        ) : null}
      </aside>

      <main className="content" role="main">
        {children}
      </main>
    </div>
  );
}
