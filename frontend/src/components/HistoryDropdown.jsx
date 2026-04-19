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

function HistoryDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("receiving");
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: ""
  });
  const [receivingInspections, setReceivingInspections] = useState([]);
  const [internalInspections, setInternalInspections] = useState([]);
  const [monthlyData, setMonthlyData] = useState({});

  useEffect(() => {
    loadInspectionData();
  }, []);

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
    
    // Calculate monthly data
    calculateMonthlyData(receiving, internal, ncrs);
  }

  function calculateMonthlyData(receiving, internal, ncrs) {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyReceiving = receiving.filter(inspection => {
      const date = new Date(inspection.createdAt);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });
    
    const monthlyInternal = internal.filter(inspection => {
      const date = new Date(inspection.createdAt);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });
    
    const monthlyNCRs = ncrs.filter(ncr => {
      const date = new Date(ncr.createdAt);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });
    
    setMonthlyData({
      receiving: {
        total: monthlyReceiving.length,
        completed: monthlyReceiving.length
      },
      internal: {
        total: monthlyInternal.length,
        completed: monthlyInternal.length
      },
      ncrs: {
        total: monthlyNCRs.length,
        completed: monthlyNCRs.filter(ncr => ncr.status === "COMPLETED").length
      }
    });
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

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  const filteredReceiving = getFilteredInspections(receivingInspections);
  const filteredInternal = getFilteredInspections(internalInspections);

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={toggleDropdown}
        style={{
          padding: "0.5rem 1rem",
          border: "1px solid #dee2e6",
          borderRadius: "4px",
          background: "#fff",
          color: "#495057",
          cursor: "pointer",
          transition: "all 0.2s ease",
          display: "flex",
          alignItems: "center",
          gap: "5px"
        }}
      >
        History
        <span style={{ fontSize: "12px" }}>{"\u25bc"}</span>
      </button>

      {isOpen && (
        <div style={{
          position: "absolute",
          top: "100%",
          right: "0",
          background: "white",
          border: "1px solid #dee2e6",
          borderRadius: "4px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          zIndex: "1000",
          width: "800px",
          maxHeight: "600px",
          overflow: "auto"
        }}>
          <div style={{ padding: "20px" }}>
            <h3 style={{ marginTop: "0", marginBottom: "15px" }}>Inspection History</h3>
            
            {/* Monthly Summary */}
            <div style={{
              background: "#f8f9fa",
              padding: "15px",
              borderRadius: "4px",
              marginBottom: "20px"
            }}>
              <h4>Monthly Summary</h4>
              <div style={{display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "15px"}}>
                <div>
                  <strong>Receiving Inspections</strong>
                  <div>{monthlyData.receiving?.completed || 0} completed this month</div>
                </div>
                <div>
                  <strong>Internal Inspections</strong>
                  <div>{monthlyData.internal?.completed || 0} completed this month</div>
                </div>
                <div>
                  <strong>NCR Reports</strong>
                  <div>{monthlyData.ncrs?.total || 0} created this month</div>
                </div>
              </div>
            </div>

            {/* Date Range Filter */}
            <div style={{
              background: "#f8f9fa",
              padding: "15px",
              borderRadius: "4px",
              marginBottom: "20px"
            }}>
              <h4>Filter by Date Range</h4>
              <div style={{display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: "10px", alignItems: "end"}}>
                <div>
                  <label>Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    value={dateRange.startDate}
                    onChange={updateDateRange}
                    style={{width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "4px"}}
                  />
                </div>
                <div>
                  <label>End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    value={dateRange.endDate}
                    onChange={updateDateRange}
                    style={{width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "4px"}}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setDateRange({startDate: "", endDate: ""})}
                  style={{
                    padding: "8px 16px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    background: "#f5f5f5",
                    cursor: "pointer"
                  }}
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div style={{display: "flex", gap: "10px", marginBottom: "20px"}}>
              <button
                onClick={() => setActiveTab("receiving")}
                style={{
                  padding: "8px 16px",
                  border: "1px solid #dee2e6",
                  borderRadius: "4px",
                  background: activeTab === "receiving" ? "#007bff" : "#fff",
                  color: activeTab === "receiving" ? "#fff" : "#495057",
                  cursor: "pointer"
                }}
              >
                Receiving ({filteredReceiving.length})
              </button>
              <button
                onClick={() => setActiveTab("internal")}
                style={{
                  padding: "8px 16px",
                  border: "1px solid #dee2e6",
                  borderRadius: "4px",
                  background: activeTab === "internal" ? "#007bff" : "#fff",
                  color: activeTab === "internal" ? "#fff" : "#495057",
                  cursor: "pointer"
                }}
              >
                Internal ({filteredInternal.length})
              </button>
            </div>

            {/* Content */}
            <div style={{maxHeight: "300px", overflow: "auto"}}>
              {activeTab === "receiving" && (
                <div>
                  {filteredReceiving.length === 0 ? (
                    <div style={{textAlign: "center", color: "#666", padding: "20px"}}>
                      No receiving inspections found
                    </div>
                  ) : (
                    filteredReceiving.map(inspection => (
                      <div key={inspection.id} style={{
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        padding: "10px",
                        marginBottom: "10px"
                      }}>
                        <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                          <div>
                            <strong>{inspection.poNumber}</strong>
                            <div style={{fontSize: "12px", color: "#666"}}>
                              {formatDate(inspection.createdAt)}
                            </div>
                            <div style={{fontSize: "12px", color: "#666"}}>
                              Items: {inspection.items?.length || 0}
                            </div>
                          </div>
                          <div style={{textAlign: "right"}}>
                            <div style={{fontSize: "12px", color: "#666"}}>
                              Received: {inspection.qtyReceived || 0}
                            </div>
                            <div style={{fontSize: "12px", color: "#28a745"}}>
                              Passed: {inspection.qtyPassed || 0}
                            </div>
                            <div style={{fontSize: "12px", color: "#dc3545"}}>
                              Failed: {inspection.qtyFailed || 0}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === "internal" && (
                <div>
                  {filteredInternal.length === 0 ? (
                    <div style={{textAlign: "center", color: "#666", padding: "20px"}}>
                      No internal inspections found
                    </div>
                  ) : (
                    filteredInternal.map(inspection => (
                      <div key={inspection.id} style={{
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        padding: "10px",
                        marginBottom: "10px"
                      }}>
                        <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                          <div>
                            <strong>{inspection.partNumber}</strong>
                            <div style={{fontSize: "12px", color: "#666"}}>
                              {formatDate(inspection.createdAt)}
                            </div>
                            <div style={{fontSize: "12px", color: "#666"}}>
                              Test Type: {inspection.testType}
                            </div>
                          </div>
                          <div style={{textAlign: "right"}}>
                            <div style={{fontSize: "12px", color: "#666"}}>
                              Tests: {inspection.items?.length || 0}
                            </div>
                            <div style={{fontSize: "12px", color: "#dc3545"}}>
                              Failures: {inspection.items?.filter(item => item.testResult === "FAIL").length || 0}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Close button */}
            <div style={{textAlign: "center", marginTop: "20px"}}>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  padding: "8px 16px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  background: "#f5f5f5",
                  cursor: "pointer"
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HistoryDropdown;
