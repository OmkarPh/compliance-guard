import { Routes, Route } from "react-router-dom";
import Compliant from "./components/Compliant";
import NonCompliant from "./components/NonCompliant";
import PrimaryNavbar from "./components/PrimaryNavbar";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@material-tailwind/react";

import "./App.css";
import "./css/tailwind.css";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <PrimaryNavbar />
        <Routes>
          <Route path="/" element={<Compliant />} />
          <Route path="/compliant" element={<Compliant />} />
          <Route path="/noncompliant" element={<NonCompliant />} />
        </Routes>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
