import { useEffect, useState } from "react";
import styles from "./App.module.css";

function App() {
  const [health, setHealth] = useState(null);


  // Authentication state
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [authError, setAuthError] = useState("");

  // Chat state MOCKUP
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState([]);


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
    } catch (err) {
      console.error(err);
      setAuthError("Something went wrong during login");
    }
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    setMessages([]);
  };

  // For now: frontend-only mock chat
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !user) return;

    const content = messageInput.trim();

    const userMessage = {
      id: Date.now(),
      role: "user",
      content,
    };

    const botMessage = {
      id: Date.now() + 1,
      role: "assistant",
      content: `You said: "${content}". (Mock reply, backend coming soon!)`,
    };

    setMessages((prev) => [...prev, userMessage, botMessage]);
    setMessageInput("");
  };

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