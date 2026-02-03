import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { api, getToken } from "./api";

import NavBar from "./components/NavBar";
import RequireAuth from "./components/RequireAuth";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Feed from "./pages/Feed";
import Discover from "./pages/Discover";
import Item from "./pages/Item";
import Profile from "./pages/Profile";
import ToExperience from "./pages/ToExperience";

function App() {
  const [me, setMe] = useState(null);
  const [loadingMe, setLoadingMe] = useState(true);

  async function refreshMe() {
    const token = getToken();
    if (!token) {
      setMe(null);
      setLoadingMe(false);
      return;
    }
    try {
      const data = await api.me();
      setMe(data);
    } catch {
      setMe(null);
    } finally {
      setLoadingMe(false);
    }
  }

  useEffect(() => {
    refreshMe();
  }, []);

  return (
    <BrowserRouter>
      <NavBar me={me} />

      {loadingMe ? (
        <div style={{ padding: 16 }}>Loading…</div>
      ) : (
        <Routes>
          <Route
            path="/"
            element={
              <RequireAuth>
                <Feed />
              </RequireAuth>
            }
          />
          <Route
            path="/discover"
            element={
              <RequireAuth>
                <Discover />
              </RequireAuth>
            }
          />
          <Route
            path="/items/:id"
            element={
              <RequireAuth>
                <Item me={me} />
              </RequireAuth>
            }
          />
          <Route
            path="/users/:id"
            element={
              <RequireAuth>
                <Profile me={me} />
              </RequireAuth>
            }
          />
          <Route
            path="/to-experience"
            element={
              <RequireAuth>
                <ToExperience />
              </RequireAuth>
            }
          />

          <Route path="/login" element={<Login onAuth={refreshMe} />} />
          <Route path="/signup" element={<Signup onAuth={refreshMe} />} />
        </Routes>
      )}
    </BrowserRouter>
  );
}

export default App