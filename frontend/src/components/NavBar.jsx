import React from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { clearToken } from "../api";

function NavBar({ me }) {
  const navigate = useNavigate();

  return (
    <div className='navbar'>
      <Link to="/" style={{ fontWeight: 800, textDecoration: "none" }}>Intent</Link>

      <NavLink to="/discover">Discover</NavLink>
      <NavLink to="/to-experience">Experience</NavLink>

      <div className="navbar-inner">
        {me ? (
          <>
            <NavLink to={`/users/${me}`}>My Profile</NavLink>
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