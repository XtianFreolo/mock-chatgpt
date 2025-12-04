/* global puter */
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../App.module.css";
import { useAuth } from "../context/AuthContext.jsx";

const PRESET_PROMPTS = [
    "Explain how this mock ChatGPT app is built.",
    "Give me ideas to improve this project.",
    "Help me debug a frontend bug.",
    "Explain how JWT authentication works.",
    "What are some good test cases for this app?",
];

function ChatPage() {
    const { user, token, logout } = useAuth();
    const navigate = useNavigate();

    const [health, setHealth] = useState(null);
    const [messageInput, setMessageInput] = useState("");
    const [messages, setMessages] = useState([]);
    const [isReplying, setIsReplying] = useState(false);



    const inputRef = useRef(null);
    const chatWindowRef = useRef(null);

    useEffect(() => {
        if (!user || !token) {
            navigate("/login");
        }
    }, [user, token, navigate]);

    useEffect(() => {
        if (chatWindowRef.current) {
            chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
        }
    }, [messages]);

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

        // send user message now
        const localUserMessage = {
            id: `temp-${Date.now()}`,
            role: "user",
            content,
            created_at: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, localUserMessage]);
        setIsReplying(true);


        let assistantContent = null;

        // AI prompt via puter.js
        try {
            if (window.puter && window.puter.ai && window.puter.ai.chat) {
                const completion = await window.puter.ai.chat(content, {
                    model: "gpt-5-nano", // model
                });

                // completion response
                if (typeof completion === "string") {
                    assistantContent = completion;
                } else if (
                    completion &&
                    completion.message &&
                    Array.isArray(completion.message.content) &&
                    completion.message.content[0]?.text
                ) {
                    assistantContent = completion.message.content[0].text;
                } else {
                    assistantContent = String(completion);
                }
            } else {
                console.warn("Puter.js not loaded; falling back to mock reply on backend.");
            }
        } catch (err) {
            console.error("Puter AI error:", err);
            //if none work we back at my boring replies
        }

        try {
            // backend safety net
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    content,
                    assistantContent,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                console.error(data.error || "Chat request failed");
                return;
            }
            // append only the bot reply (user msg already added)
            const botMessage = data.messages.find((m) => m.role === "assistant");
            if (botMessage) {
                setMessages((prev) => [...prev, botMessage]);
            }
        } catch (err) {
            console.error("Chat send error:", err);
        } finally {
            setIsReplying(false);
        }
    };

    const handlePresetClick = async (prompt) => {
        // focus input and send immediately
        inputRef.current?.focus();
        setMessageInput("");

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ content: prompt }),
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

    const handleClearChat = async () => {
        if (!token) return;

        try {
            const res = await fetch("/api/chat/history", {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await res.json();

            if (!res.ok) {
                console.error(data.error || "Failed to clear history");
                return;
            }

            setMessages([]);
        } catch (err) {
            console.error("Clear chat error:", err);
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
                    {/* 🔹 Chat header + Clear button */}
                    <div className={styles.chatHeaderRow}>
                        <h2>Chat</h2>
                        <button
                            type="button"
                            className={styles.clearButton}
                            onClick={handleClearChat}
                            disabled={messages.length === 0}
                        >
                            Clear chat
                        </button>
                    </div>

                    {/* Preset prompts */}
                    <div className={styles.presetContainer}>
                        {PRESET_PROMPTS.map((p) => (
                            <button
                                key={p}
                                type="button"
                                className={styles.presetButton}
                                onClick={() => handlePresetClick(p)}
                            >
                                {p}
                            </button>
                        ))}
                    </div>

                    <div
                        ref={chatWindowRef}
                        className={styles.chatWindow}
                        onClick={() => inputRef.current?.focus()}
                    >
                        {messages.length === 0 ? (
                            <p className={styles.placeholder}>
                                Ask me something to start the mock chat!
                            </p>
                        ) : (
                            <>
                                {messages.map((m) => (
                                    <div
                                        key={m.id}
                                        className={
                                            m.role === "user" ? styles.userMessage : styles.botMessage
                                        }
                                    >
                                        <strong>{m.role === "user" ? "You" : "Bot"}: </strong>
                                        <span>{m.content}</span>
                                    </div>
                                ))}

                                {isReplying && (
                                    <p className={styles.placeholder}> Hold on Im using my super duper AI brain...</p>
                                )}
                            </>
                        )}
                    </div>

                    <form className={styles.chatForm} onSubmit={handleSendMessage}>
                        <input
                            ref={inputRef}
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
