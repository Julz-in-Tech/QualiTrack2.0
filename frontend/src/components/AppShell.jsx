import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import SidebarMenu from "./SidebarMenu";

function AppShell({ children, currentUser, currentPage, setCurrentPage }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout } = useAuth();

  async function handleLogout() {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  function getHeroContent() {
    switch (currentPage) {
      case "receiving":
        return {
          title: "Receiving Inspection",
          description: "Incoming quality control with barcode tracking and traceability for supplier deliveries."
        };
      case "internal":
        return {
          title: "Internal Inspection",
          description: "Internal quality control with traceability to receiving inspections and failure pattern analysis."
        };
      case "ncr":
        return {
          title: "Non-Conformance Report (NCR)",
          description: "Document and track quality issues, root causes, and corrective actions."
        };
      default:
        return {
          title: "QualiTrack",
          description: "Quality Management System"
        };
    }
  }

  const heroContent = getHeroContent();

  return (
    <main className="app-shell">
      <div className="app-topbar">
        <div className="user-badge">
          <strong>{currentUser.displayName || currentUser.email}</strong>
          <span>{currentUser.email}</span>
        </div>

        <button className="secondary-button" type="button" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* Navigation */}
      <nav className="app-navigation" style={{
        background: "#fff",
        padding: "1rem",
        borderBottom: "1px solid #e9ecef",
        marginBottom: "2rem"
      }}>
        <div style={{
          display: "flex",
          gap: "1rem",
          maxWidth: "1200px",
          margin: "0 auto",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          <div style={{display: "flex", gap: "1rem"}}>
            <button
              className={currentPage === "receiving" ? "nav-button active" : "nav-button"}
              onClick={() => setCurrentPage("receiving")}
              style={{
                padding: "0.5rem 1rem",
                border: "1px solid #dee2e6",
                borderRadius: "4px",
                background: currentPage === "receiving" ? "#007bff" : "#fff",
                color: currentPage === "receiving" ? "#fff" : "#495057",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
            >
              Receiving Inspection
            </button>
            <button
              className={currentPage === "internal" ? "nav-button active" : "nav-button"}
              onClick={() => setCurrentPage("internal")}
              style={{
                padding: "0.5rem 1rem",
                border: "1px solid #dee2e6",
                borderRadius: "4px",
                background: currentPage === "internal" ? "#007bff" : "#fff",
                color: currentPage === "internal" ? "#fff" : "#495057",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
            >
              Internal Inspection
            </button>
            <button
              className={currentPage === "ncr" ? "nav-button active" : "nav-button"}
              onClick={() => setCurrentPage("ncr")}
              style={{
                padding: "0.5rem 1rem",
                border: "1px solid #dee2e6",
                borderRadius: "4px",
                background: currentPage === "ncr" ? "#007bff" : "#fff",
                color: currentPage === "ncr" ? "#fff" : "#495057",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
            >
              NCR Form
            </button>
          </div>
          
          {/* Hamburger Menu Button */}
          <button
            onClick={() => setSidebarOpen(true)}
            style={{
              padding: "0.5rem",
              border: "1px solid #dee2e6",
              borderRadius: "4px",
              background: "#fff",
              color: "#495057",
              cursor: "pointer",
              transition: "all 0.2s ease",
              display: "flex",
              flexDirection: "column",
              gap: "3px",
              justifyContent: "center",
              width: "40px",
              height: "40px"
            }}
          >
            <div style={{
              width: "20px",
              height: "2px",
              background: "#495057",
              transition: "all 0.2s ease"
            }}></div>
            <div style={{
              width: "20px",
              height: "2px",
              background: "#495057",
              transition: "all 0.2s ease"
            }}></div>
            <div style={{
              width: "20px",
              height: "2px",
              background: "#495057",
              transition: "all 0.2s ease"
            }}></div>
          </button>
        </div>
      </nav>

      <section className="hero">
        <article className="hero-card">
          <span className="eyebrow">QualiTrack MVP</span>
          <h1>{heroContent.title}</h1>
          <p>
            {heroContent.description}
          </p>
        </article>
      </section>

      {children}
      
      {/* Sidebar Menu */}
      <SidebarMenu
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
    </main>
  );
}

export default AppShell;
