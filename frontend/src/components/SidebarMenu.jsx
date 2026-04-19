import { useState, useEffect } from "react";

function formatDate(value) {
  if (!value) {
    return "Just now";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat("en-ZA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function SidebarMenu({ isOpen, onClose, currentPage, setCurrentPage }) {
  const [historyExpanded, setHistoryExpanded] = useState(false);
  const [activeHistoryTab, setActiveHistoryTab] = useState("receiving");
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: ""
  });
  const [receivingInspections, setReceivingInspections] = useState([]);
  const [internalInspections, setInternalInspections] = useState([]);
  const [productTrends, setProductTrends] = useState({});

  useEffect(() => {
    if (isOpen) {
      loadInspectionData();
    }
  }, [isOpen]);

  function loadInspectionData() {
    // Load from localStorage
    const stored = JSON.parse(localStorage.getItem('qualitrack_inspections') || '[]');
    const ncrs = JSON.parse(localStorage.getItem('qualitrack_ncrs') || '[]');
    
    // Separate by inspection type
    const receiving = stored.filter(inspection => 
      inspection.items && inspection.items.some(item => item.inspectionType === "receiving")
    );
    const internal = stored.filter(inspection => 
      inspection.items && inspection.items.some(item => item.inspectionType === "internal")
    );
    
    setReceivingInspections(receiving);
    setInternalInspections(internal);
    
    // Calculate product trends
    const trends = {};
    stored.forEach(inspection => {
      if (inspection.items) {
        inspection.items.forEach(item => {
          if (!trends[item.partNumber]) {
            trends[item.partNumber] = {
              totalInspections: 0,
              totalFailed: 0,
              failureRate: 0
            };
          }
          trends[item.partNumber].totalInspections++;
          if (parseInt(item.qtyBad) > 0 || item.testResult === "FAIL") {
            trends[item.partNumber].totalFailed++;
          }
        });
      }
    });
    
    Object.keys(trends).forEach(partNumber => {
      const stats = trends[partNumber];
      stats.failureRate = ((stats.totalFailed / stats.totalInspections) * 100).toFixed(2);
    });
    
    setProductTrends(trends);
  }

  function updateDateRange(event) {
    const { name, value } = event.target;
    setDateRange((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function getFilteredInspections(inspections) {
    if (!dateRange.startDate && !dateRange.endDate) {
      return inspections;
    }
    
    return inspections.filter(inspection => {
      const inspectionDate = new Date(inspection.createdAt);
      const start = dateRange.startDate ? new Date(dateRange.startDate) : new Date(0);
      const end = dateRange.endDate ? new Date(dateRange.endDate) : new Date();
      return inspectionDate >= start && inspectionDate <= end;
    });
  }

  function handleNavigation(page) {
    setCurrentPage(page);
    onClose();
  }

  function toggleHistory() {
    setHistoryExpanded(!historyExpanded);
  }

  const filteredReceiving = getFilteredInspections(receivingInspections);
  const filteredInternal = getFilteredInspections(internalInspections);

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.5)",
            zIndex: 999,
          }}
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: isOpen ? "0" : "-350px",
          width: "350px",
          height: "100%",
          background: "#007bff",
          boxShadow: "-4px 0 20px rgba(0, 0, 0, 0.15)",
          transition: "right 0.3s ease",
          zIndex: 1000,
          overflow: "auto"
        }}
      >
        <div style={{ padding: "0" }}>
          {/* Header */}
          <div style={{ 
            padding: "25px 20px", 
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <div>
              <h2 style={{ 
                margin: "0", 
                color: "white", 
                fontSize: "20px",
                fontWeight: "600"
              }}>
                QualiTrack Menu
              </h2>
              <p style={{ 
                margin: "5px 0 0 0", 
                color: "rgba(255, 255, 255, 0.8)",
                fontSize: "14px"
              }}>
                Quality Management System
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                background: "rgba(255, 255, 255, 0.2)",
                border: "none",
                fontSize: "24px",
                cursor: "pointer",
                color: "white",
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background 0.2s ease"
              }}
              onMouseOver={(e) => e.target.style.background = "rgba(255, 255, 255, 0.3)"}
              onMouseOut={(e) => e.target.style.background = "rgba(255, 255, 255, 0.2)"}
            >
              ×
            </button>
          </div>

          {/* Navigation Menu */}
          <div style={{ padding: "20px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {/* Receiving Inspection */}
              <button
                onClick={() => handleNavigation("receiving")}
                style={{
                  padding: "15px 20px",
                  border: "none",
                  borderRadius: "12px",
                  background: currentPage === "receiving" ? "rgba(255, 255, 255, 0.95)" : "rgba(255, 255, 255, 0.1)",
                  color: currentPage === "receiving" ? "#007bff" : "white",
                  cursor: "pointer",
                  textAlign: "left",
                  fontSize: "16px",
                  fontWeight: "500",
                  transition: "all 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px"
                }}
                onMouseOver={(e) => {
                  if (currentPage !== "receiving") {
                    e.target.style.background = "rgba(255, 255, 255, 0.2)";
                  }
                }}
                onMouseOut={(e) => {
                  if (currentPage !== "receiving") {
                    e.target.style.background = "rgba(255, 255, 255, 0.1)";
                  }
                }}
              >
                Receiving Inspection
              </button>

              {/* Internal Inspection */}
              <button
                onClick={() => handleNavigation("internal")}
                style={{
                  padding: "15px 20px",
                  border: "none",
                  borderRadius: "12px",
                  background: currentPage === "internal" ? "rgba(255, 255, 255, 0.95)" : "rgba(255, 255, 255, 0.1)",
                  color: currentPage === "internal" ? "#007bff" : "white",
                  cursor: "pointer",
                  textAlign: "left",
                  fontSize: "16px",
                  fontWeight: "500",
                  transition: "all 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px"
                }}
                onMouseOver={(e) => {
                  if (currentPage !== "internal") {
                    e.target.style.background = "rgba(255, 255, 255, 0.2)";
                  }
                }}
                onMouseOut={(e) => {
                  if (currentPage !== "internal") {
                    e.target.style.background = "rgba(255, 255, 255, 0.1)";
                  }
                }}
              >
                Internal Inspection
              </button>

              {/* NCR Form */}
              <button
                onClick={() => handleNavigation("ncr")}
                style={{
                  padding: "15px 20px",
                  border: "none",
                  borderRadius: "12px",
                  background: currentPage === "ncr" ? "rgba(255, 255, 255, 0.95)" : "rgba(255, 255, 255, 0.1)",
                  color: currentPage === "ncr" ? "#007bff" : "white",
                  cursor: "pointer",
                  textAlign: "left",
                  fontSize: "16px",
                  fontWeight: "500",
                  transition: "all 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px"
                }}
                onMouseOver={(e) => {
                  if (currentPage !== "ncr") {
                    e.target.style.background = "rgba(255, 255, 255, 0.2)";
                  }
                }}
                onMouseOut={(e) => {
                  if (currentPage !== "ncr") {
                    e.target.style.background = "rgba(255, 255, 255, 0.1)";
                  }
                }}
              >
                NCR Form
              </button>

              {/* History Section */}
              <div style={{ marginTop: "20px" }}>
                <button
                  onClick={toggleHistory}
                  style={{
                    padding: "15px 20px",
                    border: "none",
                    borderRadius: "12px",
                    background: historyExpanded ? "rgba(255, 255, 255, 0.95)" : "rgba(255, 255, 255, 0.1)",
                    color: historyExpanded ? "#007bff" : "white",
                    cursor: "pointer",
                    textAlign: "left",
                    fontSize: "16px",
                    fontWeight: "500",
                    transition: "all 0.2s ease",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    width: "100%"
                  }}
                  onMouseOver={(e) => {
                    if (!historyExpanded) {
                      e.target.style.background = "rgba(255, 255, 255, 0.2)";
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!historyExpanded) {
                      e.target.style.background = "rgba(255, 255, 255, 0.1)";
                    }
                  }}
                >
                  <span>History</span>
                  <span style={{ marginLeft: "auto", fontSize: "12px" }}>
                    {historyExpanded ? "×" : "+"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* History Popup */}
      {historyExpanded && (
        <div
          style={{
            position: "fixed",
            top: "120px",
            right: isOpen ? "370px" : "20px",
            width: "320px",
            background: "white",
            borderRadius: "12px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
            zIndex: 1001,
            transition: "right 0.3s ease",
            maxHeight: "500px",
            overflow: "auto"
          }}
        >
          <div style={{ padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
              <h3 style={{ margin: "0", color: "#333", fontSize: "18px" }}>
                History Options
              </h3>
              <button
                onClick={toggleHistory}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "20px",
                  cursor: "pointer",
                  color: "#666",
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "background 0.2s ease"
                }}
                onMouseOver={(e) => e.target.style.background = "#f0f0f0"}
                onMouseOut={(e) => e.target.style.background = "none"}
              >
                ×
              </button>
            </div>
            
            {/* History Sub-menu */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px" }}>
              <button
                onClick={() => setActiveHistoryTab("receiving")}
                style={{
                  padding: "12px 16px",
                  border: "1px solid #dee2e6",
                  borderRadius: "8px",
                  background: activeHistoryTab === "receiving" ? "#007bff" : "#fff",
                  color: activeHistoryTab === "receiving" ? "white" : "#333",
                  cursor: "pointer",
                  textAlign: "left",
                  fontSize: "14px",
                  transition: "all 0.2s ease"
                }}
              >
                Receiving Inspection History
              </button>
              <button
                onClick={() => setActiveHistoryTab("internal")}
                style={{
                  padding: "12px 16px",
                  border: "1px solid #dee2e6",
                  borderRadius: "8px",
                  background: activeHistoryTab === "internal" ? "#007bff" : "#fff",
                  color: activeHistoryTab === "internal" ? "white" : "#333",
                  cursor: "pointer",
                  textAlign: "left",
                  fontSize: "14px",
                  transition: "all 0.2s ease"
                }}
              >
                Internal Inspection History
              </button>
              <button
                onClick={() => setActiveHistoryTab("product")}
                style={{
                  padding: "12px 16px",
                  border: "1px solid #dee2e6",
                  borderRadius: "8px",
                  background: activeHistoryTab === "product" ? "#007bff" : "#fff",
                  color: activeHistoryTab === "product" ? "white" : "#333",
                  cursor: "pointer",
                  textAlign: "left",
                  fontSize: "14px",
                  transition: "all 0.2s ease"
                }}
              >
                Product History
              </button>
            </div>

            {/* Date Range Filter */}
            <div style={{ marginBottom: "15px" }}>
              <label style={{ color: "#333", fontSize: "12px", display: "block", marginBottom: "8px" }}>
                Filter by Date Range
              </label>
              <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "8px"}}>
                <input
                  type="date"
                  name="startDate"
                  value={dateRange.startDate}
                  onChange={updateDateRange}
                  style={{
                    width: "100%", 
                    padding: "8px", 
                    border: "1px solid #ddd", 
                    borderRadius: "6px",
                    background: "#fff",
                    fontSize: "12px"
                  }}
                />
                <input
                  type="date"
                  name="endDate"
                  value={dateRange.endDate}
                  onChange={updateDateRange}
                  style={{
                    width: "100%", 
                    padding: "8px", 
                    border: "1px solid #ddd", 
                    borderRadius: "6px",
                    background: "#fff",
                    fontSize: "12px"
                  }}
                />
              </div>
              <button
                type="button"
                onClick={() => setDateRange({startDate: "", endDate: ""})}
                style={{
                  padding: "6px 12px",
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                  background: "#f8f9fa",
                  color: "#333",
                  cursor: "pointer",
                  fontSize: "12px"
                }}
              >
                Clear Filter
              </button>
            </div>

            {/* History List */}
            <div>
              {activeHistoryTab === "receiving" && (
                <div>
                  {filteredReceiving.length === 0 ? (
                    <div style={{textAlign: "center", color: "#666", padding: "20px"}}>
                      No receiving inspections found
                    </div>
                  ) : (
                    filteredReceiving.map(inspection => (
                      <div key={inspection.id} style={{
                        background: "#f8f9fa",
                        borderRadius: "8px",
                        padding: "12px",
                        marginBottom: "8px",
                        border: "1px solid #dee2e6"
                      }}>
                        <div style={{color: "#333"}}>
                          <strong style={{fontSize: "14px"}}>{inspection.poNumber}</strong>
                          <div style={{fontSize: "11px", color: "#666"}}>
                            {formatDate(inspection.createdAt)}
                          </div>
                          <div style={{fontSize: "11px", color: "#666"}}>
                            Items: {inspection.items?.length || 0} | Passed: {inspection.qtyPassed || 0} | Failed: {inspection.qtyFailed || 0}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeHistoryTab === "internal" && (
                <div>
                  {filteredInternal.length === 0 ? (
                    <div style={{textAlign: "center", color: "#666", padding: "20px"}}>
                      No internal inspections found
                    </div>
                  ) : (
                    filteredInternal.map(inspection => (
                      <div key={inspection.id} style={{
                        background: "#f8f9fa",
                        borderRadius: "8px",
                        padding: "12px",
                        marginBottom: "8px",
                        border: "1px solid #dee2e6"
                      }}>
                        <div style={{color: "#333"}}>
                          <strong style={{fontSize: "14px"}}>{inspection.partNumber}</strong>
                          <div style={{fontSize: "11px", color: "#666"}}>
                            {formatDate(inspection.createdAt)}
                          </div>
                          <div style={{fontSize: "11px", color: "#666"}}>
                            Test Type: {inspection.testType} | Failures: {inspection.items?.filter(item => item.testResult === "FAIL").length || 0}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeHistoryTab === "product" && (
                <div>
                  {Object.keys(productTrends).length === 0 ? (
                    <div style={{textAlign: "center", color: "#666", padding: "20px"}}>
                      No product data available
                    </div>
                  ) : (
                    Object.entries(productTrends).map(([partNumber, stats]) => (
                      <div key={partNumber} style={{
                        background: "#f8f9fa",
                        borderRadius: "8px",
                        padding: "12px",
                        marginBottom: "8px",
                        border: "1px solid #dee2e6"
                      }}>
                        <div style={{color: "#333"}}>
                          <strong style={{fontSize: "14px"}}>{partNumber}</strong>
                          <div style={{fontSize: "11px", color: "#666"}}>
                            Inspections: {stats.totalInspections} | Failed: {stats.totalFailed}
                          </div>
                          <div style={{fontSize: "11px", color: stats.failureRate > 10 ? "#dc3545" : "#28a745"}}>
                            Failure Rate: {stats.failureRate}%
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default SidebarMenu;
