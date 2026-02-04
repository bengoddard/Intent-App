import React from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { clearToken } from "../api";

function NavBar({ me }) {
  const navigate = useNavigate();

  return (
    <div style={{ position: "sticky", top: 0, zIndex: 1000, display: "flex", gap: 12, padding: 12, borderBottom: "1px solid #ddd" }}>
      <Link to="/" style={{ fontWeight: 800, textDecoration: "none" }}>Intent</Link>

      <NavLink to="/" end>Feed</NavLink>
      <NavLink to="/discover">Discover</NavLink>
      <NavLink to="/to-experience">Experience</NavLink>

      <div style={{ marginLeft: "auto", display: "flex", gap: 12, alignItems: "center" }}>
        {me ? (
          <>
            <NavLink to={`/users/${me.id}`}>@{me.username}</NavLink>
            <button
              onClick={() => {
                clearToken();
                navigate("/login");
              }}
            >
              Log out
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login">Log in</NavLink>
            <NavLink to="/signup">Sign up</NavLink>
          </>
        )}
      </div>
    </div>
  );
}

export default NavBar