import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, setToken } from "../api";

export default function Signup({ onAuth }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    try {
      const { token } = await api.signup({ username, password });
      setToken(token);
      await onAuth?.();
      navigate("/");
    } catch (e) {
      setErr(e.message);
    }
  }

  return (
    <div style={{ padding: 16, maxWidth: 420 }}>
      <h2>Sign up</h2>
      {err && <div style={{ color: "crimson" }}>{err}</div>}
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
        <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="username" />
        <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password (8+)" type="password" />
        <button>Create account</button>
      </form>
      <p style={{ marginTop: 10 }}>
        Have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  );
}