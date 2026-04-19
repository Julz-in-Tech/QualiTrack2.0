import { useState } from "react";
import { useAuth } from "./contexts/AuthContext";
// import AuthPage from "./pages/AuthPage"; // Temporarily disabled
import AppShell from "./components/AppShell";
import ReceivingInspection from "./pages/ReceivingInspection";
import InternalInspection from "./pages/InternalInspection";
import NCRForm from "./pages/NCRForm";
import LoginPage from "./pages/LoginPage";

function App() {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState("receiving");

  if (!user) {
    return <LoginPage />;
  }

  function renderPage() {
    switch (currentPage) {
      case "receiving":
        return <ReceivingInspection setCurrentPage={setCurrentPage} />;
      case "internal":
        return <InternalInspection setCurrentPage={setCurrentPage} />;
      case "ncr":
        return <NCRForm />;
      default:
        return <ReceivingInspection setCurrentPage={setCurrentPage} />;
    }
  }

  return (
    <AppShell currentUser={user} currentPage={currentPage} setCurrentPage={setCurrentPage}>
      {renderPage()}
    </AppShell>
  );
}

export default App;
