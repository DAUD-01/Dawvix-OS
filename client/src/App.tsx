import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Desktop from "./pages/Desktop";

function App() {
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
