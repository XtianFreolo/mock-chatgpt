import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../App.module.css";
import { useAuth } from "../context/AuthContext.jsx";

function LoginPage() {
    const { setUser, setToken } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Login failed");
                return;
            }

            setUser(data.user);
            setToken(data.token);

            navigate("/chat");
        } catch (err) {
            console.error(err);
            setError("Something went wrong during login");
        }
    };

    return (
        <div className={styles.page}>
            <h1>Mock ChatGPT</h1>
            <h2>Log in</h2>

            {error && <p className={styles.error}>{error}</p>}

            <form onSubmit={handleLogin} className={styles.authPanel}>
                <input
                    placeholder="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    placeholder="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit">Log In</button>
            </form>
        </div>
    );
}

export default LoginPage;
