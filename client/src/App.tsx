import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getCurrentUser } from "./services/authService";
import { useAuthStore } from "./stores/authStore";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Desktop from "./pages/Desktop";
import ProtectedRoute from "./routes/ProtectedRoutes";

function App() {
  const { token, setUser, logout } = useAuthStore();
  const [isInitializing, setIsInitializing] = useState(Boolean(token));

  useEffect(() => {
    const restoreUser = async () => {
      if (!token) {
        setIsInitializing(false);
        return;
      }

      try {
        const user = await getCurrentUser(token);
        setUser(user);
      } catch (err) {
        console.warn("Failed to restore user session:", err);
        logout();
      } finally {
        setIsInitializing(false);
      }
    };

    restoreUser();
  }, [token, setUser, logout]);

  if (isInitializing) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
          <p className="text-sm text-slate-400">Loading Dawvix OS...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/desktop"
          element={
            <ProtectedRoute>
              <Desktop />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
