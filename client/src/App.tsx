import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { getCurrentUser } from "./services/authService";
import { useAuthStore } from "./stores/authStore";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Desktop from "./pages/Desktop";

function App() {
  const { token, setUser } = useAuthStore();

  useEffect(() => {
    const restoreUser = async () => {
      if (!token) return;

      try {
        const user = await getCurrentUser(token);

        setUser(user);
      } catch {
        localStorage.removeItem("token");
      }
    };

    restoreUser();
  }, [token, setUser]);
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/desktop" element={<Desktop />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
