const API_BASE = "http://localhost:5555";

export function getToken() {
  return localStorage.getItem("token");
}

export function setToken(token) {
  localStorage.setItem("token", token);
}

export function clearToken() {
  localStorage.removeItem("token");
}

async function request(path, { method = "GET", body, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };

  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const contentType = res.headers.get("content-type") || "";
  let data = null;
  if (res.status !== 204) {
    const text = await res.text();
    if (text) {
      data = contentType.includes("application/json") ? JSON.parse(text) : text;
    }
  }

  if (!res.ok) {
    const msg = data?.error || data?.message || `Request failed (${res.status})`;
    throw new Error(msg);
  }

  return data;
}

export const api = {
  signup: (payload) => request("/signup", { method: "POST", body: payload, auth: false }),
  login: (payload) => request("/", { method: "POST", body: payload, auth: false }),
  me: () => request("/me"),

  feed: () => request("/feed"),
  discover: (q) => request(`/discover${q ? `?q=${encodeURIComponent(q)}` : ""}`),
  item: (id) => request(`/items/${id}`),
  profile: (id) => request(`/users/${id}`),
  toExperience: () => request("/to-experience"),

  createItem: (payload) => request("/items", { method: "POST", body: payload }),

  addToList: (media_id) => request("/list", { method: "POST", body: { media_id } }),
  removeFromList: (media_id) => request(`/list/${media_id}`, { method: "DELETE" }),
  setListStatus: (media_id, status) =>
    request(`/list/${media_id}/status`, { method: "PATCH", body: { status } }),

  reviewUpsert: (payload) => request("/reviews", { method: "POST", body: payload }),
  reviewDelete: (media_id) => request(`/reviews/${media_id}`, { method: "DELETE" }),

  follow: (user_id) => request("/follow", { method: "POST", body: { user_id } }),
  unfollow: (user_id) => request(`/follow/${user_id}`, { method: "DELETE" }),
};