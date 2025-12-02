import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [initialized, setInitialized] = useState(false);

  // Load auth from localStorage on first render
  useEffect(() => {
    try {
      const stored = localStorage.getItem("auth");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.user && parsed.token) {
          setUser(parsed.user);
          setToken(parsed.token);
        }
      }
    } catch (err) {
      console.error("Failed to parse auth from localStorage", err);
    } finally {
      setInitialized(true);
    }
  }, []);

  // Save auth to localStorage whenever it changes
  useEffect(() => {
    if (user && token) {
      localStorage.setItem("auth", JSON.stringify({ user, token }));
    } else {
      localStorage.removeItem("auth");
    }
  }, [user, token]);

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  const value = {
    user,
    token,
    setUser,
    setToken,
    logout,
    initialized,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
