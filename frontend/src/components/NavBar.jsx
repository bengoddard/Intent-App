import React from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { clearToken } from "../api";

function NavBar({ me, setMe }) {
  const navigate = useNavigate();

  return (
    <div className='navbar'>
      <Link to="/feed" style={{ fontWeight: 800, textDecoration: "none" }}>Intent</Link>

      <NavLink to="/discover">Discover</NavLink>
      <NavLink to="/to-experience">Experience</NavLink>

      <div className="navbar-inner">
        {me ? (
          <>
            <NavLink to={`/users/${me}`} className="nav-link my-profile">My Profile</NavLink>
            <button
              onClick={() => {
                clearToken();
                setMe(null);
                navigate("/");
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <NavLink to="/">Log in</NavLink>
            <NavLink to="/signup">Sign up</NavLink>
          </>
        )}
      </div>
    </div>
  );
}

export default NavBar