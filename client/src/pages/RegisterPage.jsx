import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../App.module.css";
import { useAuth } from "../context/AuthContext.jsx";

function RegisterPage() {
    const { setUser, setToken } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleRegister = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Registration failed");
                return;
            }

            // Clear any existing auth state
            setUser(null);
            setToken(null);

            // Registration successful, redirect to login

            navigate("/login");
        } catch (err) {
            console.error(err);
            setError("Something went wrong during registration");
        }
    };

    return (
        <div className={styles.page}>
            <h1>Mock ChatGPT</h1>
            <h2>Create an account</h2>

            {error && <p className={styles.error}>{error}</p>}

            <form onSubmit={handleRegister} className={styles.authPanel}>
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
                <button type="submit">Sign Up</button>
            </form>

            <p className={styles.loggedIn}>
                Already have an account?{" "}
                <button
                    type="button"
                    className={styles.linkButton}
                    onClick={() => navigate("/login")}
                >
                    Log in
                </button>
            </p>
        </div>
    );
}

export default RegisterPage;
