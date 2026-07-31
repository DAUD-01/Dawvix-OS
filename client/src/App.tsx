import { useEffect } from "react";
import axios from "axios";

function App() {
  useEffect(() => {
    axios.get("http://localhost:5000").then((res) => console.log(res.data));
  }, []);

  return <h1>Dawvix OS</h1>;
}

export default App;
