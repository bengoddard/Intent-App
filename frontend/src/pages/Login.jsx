import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { api, setToken } from "../api";

export default function Login({ onAuth }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    try {
      const { token } = await api.login({ username, password });
      setToken(token);
      await onAuth?.();
      const redirectTo = location.state?.from || "/";
      navigate(redirectTo);
    } catch (e) {
      setErr(e.message);
    }
  }

  return (
    <div style={{ padding: 16, maxWidth: 420 }}>
      <h2>Log in</h2>
      {err && <div style={{ color: "crimson" }}>{err}</div>}
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
        <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="username" />
        <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password" type="password" />
        <button>Log in</button>
      </form>
      <p style={{ marginTop: 10 }}>
        New? <Link to="/signup">Create account</Link>
      </p>
    </div>
  );
}