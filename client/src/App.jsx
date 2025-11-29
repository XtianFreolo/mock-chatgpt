import { useEffect, useState } from "react";
import styles from "./App.module.css";

function App() {
  const [health, setHealth] = useState(null);

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

  return (
    <div className={styles.app}>
      <h1>Mock ChatGPT</h1>
      <p className={styles.health}>
        API status: {health ? health.status : "checking..."}
      </p>

      <div className={styles.container}>
        {/* Auth Panel */}
        <div className={styles.authPanel}>
          <h2>Register</h2>
          <form>
            <input placeholder="Email" type="email" />
            <input placeholder="Password" type="password" />
            <button type="button">Sign Up</button>
          </form>

          <h2>Login</h2>
          <form>
            <input placeholder="Email" type="email" />
            <input placeholder="Password" type="password" />
            <button type="button">Log In</button>
          </form>
        </div>

        {/* Chat Panel */}
        <div className={styles.chatPanel}>
          <h2>Chat</h2>
          <div className={styles.chatWindow}>
            {/* Later: list of messages */}
            <p className={styles.placeholder}>
              Start chatting once you log in!
            </p>
          </div>
          <form className={styles.chatForm}>
            <input
              className={styles.chatInput}
              placeholder="Ask me anything..."
            />
            <button type="button" className={styles.chatButton}>
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;
