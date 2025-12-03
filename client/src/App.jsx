import styles from "./App.module.css";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import ChatPage from "./pages/ChatPage.jsx";

function App() {
  const { user } = useAuth();

  return (
    <div className={styles.app}>
      <Routes>
        {/* Direct to Login*/}
        <Route path="/" element={<LoginPage />} />
        {/* Direct to Login*/}
        <Route path="/login" element={<LoginPage />} />
        {/* Register page */}
        <Route path="/register" element={<RegisterPage />} />
        {/* Protected chat route */}
        <Route
          path="/chat"
          element={user ? <ChatPage /> : <Navigate to="/login" replace />}
        />
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;