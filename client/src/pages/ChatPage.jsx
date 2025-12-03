import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../App.module.css";
import { useAuth } from "../context/AuthContext.jsx";

function ChatPage() {
    const { user, token, logout } = useAuth();
    const navigate = useNavigate();

    const [health, setHealth] = useState(null);
    const [messageInput, setMessageInput] = useState("");
    const [messages, setMessages] = useState([]);

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!user || !token) {
            navigate("/login");
        }
    }, [user, token, navigate]);

    // API health
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

    // Load chat history
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

        loadHistory();
    }, [token]);

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

    const handleLogout = () => {
        logout();
        setMessages([]);
        navigate("/login");
    };

    return (
        <div className={styles.page}>
            <h1>Mock ChatGPT</h1>
            <p className={styles.health}>
                API status: {health ? health.status : "checking..."}
            </p>

            {user && (
                <p className={styles.loggedIn}>
                    Logged in as <strong>{user.email}</strong>{" "}
                    <button className={styles.logoutButton} onClick={handleLogout}>
                        Log out
                    </button>
                </p>
            )}

            <div className={styles.container}>
                <div className={styles.chatPanel}>
                    <h2>Chat</h2>
                    <div className={styles.chatWindow}>
                        {messages.length === 0 ? (
                            <p className={styles.placeholder}>
                                Ask me something to start the mock chat!
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
                            placeholder="Ask me anything..."
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                        />
                        <button type="submit" className={styles.chatButton}>
                            Send
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default ChatPage;
