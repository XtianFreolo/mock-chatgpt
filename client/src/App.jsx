import { useEffect, useState } from "react";
import styles from "./App.module.css";
import { useAuth } from "./context/AuthContext.jsx";

function App() {
  const { user, token, setUser, setToken, logout, initialized } = useAuth();

  const [health, setHealth] = useState(null);

  // Auth form state
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [authError, setAuthError] = useState("");

  // Chat state
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState([]);

  // Check API health on load
  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const res = await fetch("/api/health");
        const data = await res.json();
        setHealth(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchHealth();
  }, []);

  // Load history when we have a token (e.g., on refresh)
  useEffect(() => {
    const loadHistory = async () => {
      if (!token) {
        setMessages([]);
        return;
      }
      try {
        const res = await fetch("/api/chat/history", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (!res.ok) {
          console.error(data.error || "Failed to load history");
          return;
        }
        setMessages(data.messages);
      } catch (err) {
        console.error("History error:", err);
      }
    };

    if (initialized) {
      loadHistory();
    }
  }, [token, initialized]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: registerEmail,
          password: registerPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setAuthError(data.error || "Registration failed");
        return;
      }

      setUser(data.user);
      setToken(data.token);
      setLoginEmail("");
      setLoginPassword("");
      setRegisterPassword("");

      // Load history for new user (should be empty)
      setMessages([]);
    } catch (err) {
      console.error(err);
      setAuthError("Something went wrong during registration");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setAuthError(data.error || "Login failed");
        return;
      }

      setUser(data.user);
      setToken(data.token);
      setLoginPassword("");

      // History will be loaded automatically by the useEffect when token changes
    } catch (err) {
      console.error(err);
      setAuthError("Something went wrong during login");
    }
  };

  const handleLogout = () => {
    logout();
    setMessages([]);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !user || !token) return;

    const content = messageInput.trim();
    setMessageInput("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error(data.error || "Chat request failed");
        return;
      }

      setMessages((prev) => [...prev, ...data.messages]);
    } catch (err) {
      console.error("Chat send error:", err);
    }
  };

  if (!initialized) {
    // While we're loading auth from localStorage
    return (
      <div className={styles.app}>
        <h1>Mock ChatGPT</h1>
        <p className={styles.health}>Loading...</p>
      </div>
    );
  }

  return (
    <div className={styles.app}>
      <h1>Mock ChatGPT</h1>

      <p className={styles.health}>
        API status: {health ? health.status : "checking..."}
      </p>

      {user ? (
        <p className={styles.loggedIn}>
          Logged in as <strong>{user.email}</strong>
          <button className={styles.logoutButton} onClick={handleLogout}>
            Log out
          </button>
        </p>
      ) : (
        <p className={styles.loggedIn}>Not logged in</p>
      )}

      {authError && <p className={styles.error}>{authError}</p>}

      <div className={styles.container}>
        {/* Auth Panel */}
        <div className={styles.authPanel}>
          <h2>Register</h2>
          <form onSubmit={handleRegister}>
            <input
              placeholder="Email"
              type="email"
              value={registerEmail}
              onChange={(e) => setRegisterEmail(e.target.value)}
            />
            <input
              placeholder="Password"
              type="password"
              value={registerPassword}
              onChange={(e) => setRegisterPassword(e.target.value)}
            />
            <button type="submit">Sign Up</button>
          </form>

          <h2>Login</h2>
          <form onSubmit={handleLogin}>
            <input
              placeholder="Email"
              type="email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
            />
            <input
              placeholder="Password"
              type="password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
            />
            <button type="submit">Log In</button>
          </form>
        </div>

        {/* Chat Panel */}
        <div className={styles.chatPanel}>
          <h2>Chat</h2>
          <div className={styles.chatWindow}>
            {messages.length === 0 ? (
              <p className={styles.placeholder}>
                {user
                  ? "Ask me something to start the mock chat!"
                  : "Log in to start chatting."}
              </p>
            ) : (
              messages.map((m) => (
                <div
                  key={m.id}
                  className={
                    m.role === "user" ? styles.userMessage : styles.botMessage
                  }
                >
                  <strong>{m.role === "user" ? "You" : "Bot"}: </strong>
                  <span>{m.content}</span>
                </div>
              ))
            )}
          </div>
          <form className={styles.chatForm} onSubmit={handleSendMessage}>
            <input
              className={styles.chatInput}
              placeholder={
                user ? "Ask me anything..." : "Log in first to chat..."
              }
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              disabled={!user}
            />
            <button
              type="submit"
              className={styles.chatButton}
              disabled={!user}
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;
