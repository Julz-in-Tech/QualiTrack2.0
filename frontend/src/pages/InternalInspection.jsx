import { useEffect, useState } from "react";
import { createIncomingQC, fetchIncomingSummary } from "../services/api";

const initialForm = {
  receivingInspectionId: "",
  partNumber: "",
  internalInspectionDate: "",
  inspectorId: "2",
  testType: "FUNCTIONAL",
  comments: "",
  items: []
};

const initialItem = {
  partNumber: "",
  barcode: "",
  serialNumber: "",
  testResult: "PASS",
  failureReason: "",
  testDetails: "",
  location: ""
};

const testTypes = ["FUNCTIONAL", "VISUAL", "DIMENSIONAL", "ELECTRICAL", "ENVIRONMENTAL"];
const testResults = ["PASS", "FAIL", "REWORK", "QUARANTINE"];

function formatStatus(status) {
  return status.toLowerCase().replace(/\s+/g, "-");
}

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

function InternalInspection() {
  const [form, setForm] = useState(initialForm);
  const [summary, setSummary] = useState({
    stats: {
      total_inspections: 0,
      total_received: 0,
      total_failed: 0,
      accepted_count: 0,
    },
    recentInspections: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [showItemForm, setShowItemForm] = useState(false);
  const [currentItem, setCurrentItem] = useState(initialItem);
  const [items, setItems] = useState([]);
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: ""
  });
  const [receivingInspections, setReceivingInspections] = useState([]);
  const [selectedReceivingInspection, setSelectedReceivingInspection] = useState(null);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);

  async function loadSummary() {
    try {
      setIsLoading(true);
      const data = await fetchIncomingSummary();
      setSummary(data);
      
      // Load receiving inspections for linking
      const stored = JSON.parse(localStorage.getItem('qualitrack_inspections') || '[]');
      const receivingOnly = stored.filter(inspection => 
        inspection.items && inspection.items.some(item => item.inspectionType === "receiving")
      );
      setReceivingInspections(receivingOnly);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadSummary();
  }, []);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    // Load receiving inspection details when selected
    if (name === "receivingInspectionId" && value) {
      const inspection = receivingInspections.find(insp => insp.id === parseInt(value));
      setSelectedReceivingInspection(inspection);
      if (inspection && inspection.items && inspection.items.length > 0) {
        setForm(prev => ({
          ...prev,
          partNumber: inspection.items[0].partNumber
        }));
      }
    }
  }

  function updateDateRange(event) {
    const { name, value } = event.target;
    setDateRange((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function updateItemField(event) {
    const { name, value } = event.target;
    setCurrentItem((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleBarcodeScan(barcode) {
    // Find item in receiving inspection by barcode
    if (selectedReceivingInspection && selectedReceivingInspection.items) {
      const foundItem = selectedReceivingInspection.items.find(item => item.barcode === barcode);
      if (foundItem) {
        setCurrentItem(prev => ({
          ...prev,
          barcode,
          partNumber: foundItem.partNumber,
          serialNumber: foundItem.serialNumbers
        }));
      } else {
        setCurrentItem(prev => ({
          ...prev,
          barcode
        }));
      }
    } else {
      setCurrentItem(prev => ({
        ...prev,
        barcode
      }));
    }
    setShowBarcodeScanner(false);
  }

  function addItem() {
    const newItem = {
      ...currentItem,
      id: Date.now(),
      inspectionType: "internal",
      inspectionDate: new Date().toISOString(),
      receivingInspectionId: form.receivingInspectionId
    };
    
    setItems([...items, newItem]);
    setCurrentItem(initialItem);
    setShowItemForm(false);
  }

  function removeItem(itemId) {
    const updatedItems = items.filter(item => item.id !== itemId);
    setItems(updatedItems);
  }

  function calculateFailureRate() {
    const totalInspections = items.length;
    const failedItems = items.filter(item => item.testResult === "FAIL").length;
    return totalInspections > 0 ? ((failedItems / totalInspections) * 100).toFixed(2) : 0;
  }

  function getFailurePatterns() {
    const patterns = {};
    items.forEach(item => {
      if (item.testResult === "FAIL") {
        const key = `${item.partNumber}-${item.failureReason}`;
        patterns[key] = (patterns[key] || 0) + 1;
      }
    });
    return patterns;
  }

  function getFilteredInspections() {
    if (!dateRange.startDate && !dateRange.endDate) {
      return summary.recentInspections;
    }
    
    return summary.recentInspections.filter(inspection => {
      const inspectionDate = new Date(inspection.created_at);
      const start = dateRange.startDate ? new Date(dateRange.startDate) : new Date(0);
      const end = dateRange.endDate ? new Date(dateRange.endDate) : new Date();
      return inspectionDate >= start && inspectionDate <= end;
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      // Save internal inspection with linkage to receiving inspection
      const qcData = {
        ...form,
        items: items.map(item => ({
          ...item,
          inspectionType: "internal",
          inspectionDate: new Date().toISOString(),
          receivingInspectionId: form.receivingInspectionId
        })),
        inspectorId: Number(form.inspectorId),
        overallFailureRate: calculateFailureRate(),
        failurePatterns: getFailurePatterns(),
        linkedToReceiving: true
      };

      const data = await createIncomingQC(qcData);

      // Check for failed items and create NCRs automatically
      const failedItems = items.filter(item => item.testResult === "FAIL");
      let ncrMessage = "";
      
      if (failedItems.length > 0) {
        try {
          // Create NCRs for failed items
          const ncrPromises = failedItems.map(item => {
            const ncrData = {
              incidentType: "INTERNAL",
              recipientCompanyName: "QualiTrack Company",
              incidentDate: form.internalInspectionDate || new Date().toISOString().split('T')[0],
              incidentNumber: `ME-ICF-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
              orderReference: selectedReceivingInspection?.poNumber || "N/A",
              initiatorReporter: "Current User",
              initiatorCompanyName: "QualiTrack Company",
              affectedDepartment: "PRODUCTION",
              reportDate: new Date().toISOString().split('T')[0],
              productNumber: item.partNumber,
              productDescription: item.testDetails,
              partNumber: item.partNumber,
              partDescription: item.testDetails,
              serialUidBatch: item.serialNumber,
              affectedQuantity: "1",
              nonConformanceDescription: `Internal test failed for ${item.partNumber}. ${item.failureReason}`,
              desiredOutcome: "Investigate root cause and implement corrective actions",
              rootCauseAnalysis: "Internal testing revealed non-conformance to specifications",
              correctivePreventiveActions: "Review internal processes and implement additional quality controls"
            };

            return createIncomingQC(ncrData);
          });

          await Promise.all(ncrPromises);
          ncrMessage = ` Also created ${failedItems.length} NCR(s) for failed tests.`;
        } catch (ncrError) {
          ncrMessage = ` Warning: Failed to create automatic NCRs: ${ncrError.message}`;
        }
      }

      setMessage({
        type: "success",
        text: `Internal inspection saved successfully. Failure rate: ${calculateFailureRate()}%.${ncrMessage}`,
      });

      // Reset form
      setForm(initialForm);
      setItems([]);
      setSelectedReceivingInspection(null);
      await loadSummary();
    } catch (error) {
      const serverMessage = error.response?.data?.message || error.message;
      const validationErrors = error.response?.data?.errors;

      setMessage({
        type: "error",
        text: validationErrors 
          ? `${serverMessage}: ${validationErrors.join(" ")}` 
          : serverMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const totalInspections = summary.stats.total_inspections ?? 0;
  const totalReceived = summary.stats.total_received ?? 0;
  const totalFailed = summary.stats.total_failed ?? 0;
  const filteredInspections = getFilteredInspections();
  const failurePatterns = getFailurePatterns();

  // Calculate monthly data
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyInspections = summary.recentInspections.filter(inspection => {
    const date = new Date(inspection.created_at);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });

  return (
    <section className="content-grid">
      <article className="panel">
        <div className="panel-header">
          <div>
            <h2>Internal Inspection</h2>
            <p className="subtle">Internal quality control with traceability to receiving inspections</p>
          </div>
        </div>

        {/* Statistics Dashboard */}
        <div className="quantity-grid">
          <div className="quantity-chip received">
            <strong>{totalInspections}</strong>
            <span>Total inspections</span>
          </div>
          <div className="quantity-chip passed">
            <strong>{totalReceived}</strong>
            <span>Total items tested</span>
          </div>
          <div className="quantity-chip failed">
            <strong>{totalFailed}</strong>
            <span>Total failures</span>
          </div>
          <div className="quantity-chip">
            <strong>{calculateFailureRate()}%</strong>
            <span>Failure rate</span>
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
              Clear Filter
            </button>
          </div>
        </div>

        {/* Failure Patterns */}
        {Object.keys(failurePatterns).length > 0 && (
          <div style={{
            background: "#f8d7da",
            padding: "15px",
            borderRadius: "4px",
            marginBottom: "20px"
          }}>
            <h4>Failure Patterns Detected</h4>
            <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "10px"}}>
              {Object.entries(failurePatterns).map(([pattern, count]) => (
                <div key={pattern} style={{
                  border: "1px solid #f5c6cb",
                  borderRadius: "4px",
                  padding: "10px",
                  background: "white"
                }}>
                  <strong>{pattern}</strong>
                  <div style={{fontSize: "12px", color: "#721c24"}}>
                    Occurrences: {count}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="receivingInspectionId">Link to Receiving Inspection</label>
            <select
              id="receivingInspectionId"
              name="receivingInspectionId"
              value={form.receivingInspectionId}
              onChange={updateField}
              required
              style={{width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "4px"}}
            >
              <option value="">Select receiving inspection...</option>
              {receivingInspections.map(inspection => (
                <option key={inspection.id} value={inspection.id}>
                  PO: {inspection.poNumber} - {formatDate(inspection.createdAt)}
                </option>
              ))}
            </select>
          </div>

          {selectedReceivingInspection && (
            <div style={{
              background: "#e7f3ff",
              padding: "15px",
              borderRadius: "4px",
              gridColumn: "1 / -1"
            }}>
              <h4>Linked Receiving Inspection Details</h4>
              <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px"}}>
                <div>
                  <strong>PO Number:</strong> {selectedReceivingInspection.poNumber}
                </div>
                <div>
                  <strong>Delivery Date:</strong> {selectedReceivingInspection.deliveryDate}
                </div>
                <div>
                  <strong>Items Received:</strong> {selectedReceivingInspection.items?.length || 0}
                </div>
                <div>
                  <strong>Failure Rate:</strong> {selectedReceivingInspection.overallFailureRate || 0}%
                </div>
              </div>
              {selectedReceivingInspection.items && selectedReceivingInspection.items.length > 0 && (
                <div style={{marginTop: "10px"}}>
                  <strong>Items from receiving:</strong>
                  <ul style={{margin: "5px 0", paddingLeft: "20px"}}>
                    {selectedReceivingInspection.items.map((item, index) => (
                      <li key={index} style={{fontSize: "12px"}}>
                        {item.partNumber} - Qty: {item.qtyReceived} - Location: {item.location || "N/A"}
                        {item.barcode && <span> - Barcode: {item.barcode}</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div className="field">
            <label htmlFor="partNumber">Part Number</label>
            <input
              id="partNumber"
              name="partNumber"
              value={form.partNumber}
              onChange={updateField}
              placeholder="PCB-CTRL-001"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="testType">Test Type</label>
            <select
              id="testType"
              name="testType"
              value={form.testType}
              onChange={updateField}
              required
              style={{width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "4px"}}
            >
              {testTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="internalInspectionDate">Inspection Date</label>
            <input
              id="internalInspectionDate"
              name="internalInspectionDate"
              type="date"
              value={form.internalInspectionDate}
              onChange={updateField}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="inspectorId">Inspector ID</label>
            <input
              id="inspectorId"
              name="inspectorId"
              type="number"
              min="1"
              value={form.inspectorId}
              onChange={updateField}
              required
            />
          </div>

          {/* Items Section */}
          <div className="field" style={{gridColumn: "1 / -1"}}>
            <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px"}}>
              <h4>Test Items ({items.length})</h4>
              <button
                type="button"
                onClick={() => setShowItemForm(true)}
                style={{
                  padding: "5px 10px",
                  background: "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer"
                }}
              >
                + Add Test Item
              </button>
            </div>

            {/* Items List */}
            {items.map((item, index) => (
              <div key={item.id} style={{
                border: "1px solid #ddd",
                borderRadius: "4px",
                padding: "10px",
                marginBottom: "10px",
                background: item.testResult === "FAIL" ? "#f8d7da" : "#f9f9f9"
              }}>
                <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                  <div>
                    <strong>Test {index + 1}</strong>
                    <span style={{marginLeft: "10px", color: "#666"}}>{item.partNumber}</span>
                    {item.barcode && (
                      <span style={{marginLeft: "10px", color: "#007bff"}}>
                        <small>Barcode: {item.barcode}</small>
                      </span>
                    )}
                    <span style={{
                      marginLeft: "10px",
                      padding: "2px 8px",
                      borderRadius: "12px",
                      fontSize: "12px",
                      background: item.testResult === "PASS" ? "#d4edda" : 
                                 item.testResult === "FAIL" ? "#f8d7da" : "#fff3cd",
                      color: item.testResult === "PASS" ? "#155724" : 
                             item.testResult === "FAIL" ? "#721c24" : "#856404"
                    }}>
                      {item.testResult}
                    </span>
                  </div>
                  <div style={{display: "flex", gap: "10px"}}>
                    <button
                      type="button"
                      onClick={() => setCurrentItem(item)}
                      style={{
                        padding: "2px 6px",
                        background: "#28a745",
                        color: "white",
                        border: "none",
                        borderRadius: "3px",
                        cursor: "pointer",
                        fontSize: "12px"
                      }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      style={{
                        padding: "2px 6px",
                        background: "#dc3545",
                        color: "white",
                        border: "none",
                        borderRadius: "3px",
                        cursor: "pointer",
                        fontSize: "12px"
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div style={{marginTop: "10px"}}>
                  <small style={{color: "#666"}}>{item.testDetails}</small>
                </div>
                {item.failureReason && (
                  <div style={{marginTop: "5px"}}>
                    <small style={{color: "#dc3545"}}>Failure: {item.failureReason}</small>
                  </div>
                )}
                {item.serialNumber && (
                  <div style={{marginTop: "5px"}}>
                    <small style={{color: "#666"}}>Serial: {item.serialNumber}</small>
                  </div>
                )}
              </div>
            ))}

            {/* Item Form Modal */}
            {showItemForm && (
              <div style={{
                position: "fixed",
                top: "0",
                left: "0",
                right: "0",
                bottom: "0",
                background: "rgba(0,0,0,0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: "1000"
              }}>
                <div style={{
                  background: "white",
                  padding: "20px",
                  borderRadius: "8px",
                  width: "90%",
                  maxWidth: "500px"
                }}>
                  <h3 style={{marginTop: "0", marginBottom: "20px"}}>
                    {currentItem.id ? "Edit Test Item" : "Add Test Item"}
                  </h3>
                  
                  <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px"}}>
                    <div>
                      <label>Part Number *</label>
                      <input
                        type="text"
                        name="partNumber"
                        value={currentItem.partNumber}
                        onChange={updateItemField}
                        placeholder="PCB-CTRL-001"
                        required
                        style={{width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "4px"}}
                      />
                    </div>
                    <div>
                      <label>Barcode</label>
                      <div style={{display: "flex", gap: "5px"}}>
                        <input
                          type="text"
                          name="barcode"
                          value={currentItem.barcode}
                          onChange={updateItemField}
                          placeholder="Scan or enter barcode"
                          style={{flex: 1, padding: "8px", border: "1px solid #ddd", borderRadius: "4px"}}
                        />
                        <button
                          type="button"
                          onClick={() => setShowBarcodeScanner(true)}
                          style={{
                            padding: "8px",
                            background: "#007bff",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer"
                          }}
                        >
                          Scan
                        </button>
                      </div>
                    </div>
                  </div>

                  <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "10px"}}>
                    <div>
                      <label>Serial Number</label>
                      <input
                        type="text"
                        name="serialNumber"
                        value={currentItem.serialNumber}
                        onChange={updateItemField}
                        placeholder="Serial number"
                        style={{width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "4px"}}
                      />
                    </div>
                    <div>
                      <label>Test Result *</label>
                      <select
                        name="testResult"
                        value={currentItem.testResult}
                        onChange={updateItemField}
                        required
                        style={{width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "4px"}}
                      >
                        {testResults.map(result => (
                          <option key={result} value={result}>{result}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div style={{marginTop: "10px"}}>
                    <label>Test Details</label>
                    <textarea
                      name="testDetails"
                      value={currentItem.testDetails}
                      onChange={updateItemField}
                      placeholder="Describe the test performed..."
                      rows={3}
                      style={{width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "4px", resize: "vertical"}}
                    />
                  </div>

                  {currentItem.testResult === "FAIL" && (
                    <div style={{marginTop: "10px"}}>
                      <label>Failure Reason *</label>
                      <textarea
                        name="failureReason"
                        value={currentItem.failureReason}
                        onChange={updateItemField}
                        placeholder="Describe why the test failed..."
                        rows={3}
                        required
                        style={{width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "4px", resize: "vertical"}}
                      />
                    </div>
                  )}

                  <div style={{marginTop: "10px"}}>
                    <label>Location</label>
                    <input
                      type="text"
                      name="location"
                      value={currentItem.location}
                      onChange={updateItemField}
                      placeholder="Test location..."
                      style={{width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "4px"}}
                    />
                  </div>

                  <div style={{display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "20px"}}>
                    <button
                      type="button"
                      onClick={() => {
                        setShowItemForm(false);
                        setCurrentItem(initialItem);
                      }}
                      style={{
                        padding: "8px 16px",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        background: "#f5f5f5",
                        cursor: "pointer"
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={addItem}
                      style={{
                        padding: "8px 16px",
                        border: "none",
                        borderRadius: "4px",
                        background: "#007bff",
                        color: "white",
                        cursor: "pointer"
                      }}
                    >
                      {currentItem.id ? "Update Item" : "Add Item"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Barcode Scanner Modal */}
            {showBarcodeScanner && (
              <div style={{
                position: "fixed",
                top: "0",
                left: "0",
                right: "0",
                bottom: "0",
                background: "rgba(0,0,0,0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: "1001"
              }}>
                <div style={{
                  background: "white",
                  padding: "20px",
                  borderRadius: "8px",
                  width: "90%",
                  maxWidth: "400px"
                }}>
                  <h3 style={{marginTop: "0", marginBottom: "20px"}}>Barcode Scanner</h3>
                  <div style={{
                    border: "2px dashed #007bff",
                    borderRadius: "4px",
                    padding: "40px",
                    textAlign: "center",
                    background: "#f8f9fa"
                  }}>
                    <div style={{fontSize: "48px", marginBottom: "10px"}}>Scan Barcode</div>
                    <p style={{color: "#666"}}>Position barcode in scanner area</p>
                    <input
                      type="text"
                      placeholder="Or enter barcode manually"
                      style={{
                        width: "100%",
                        padding: "8px",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        marginTop: "10px"
                      }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleBarcodeScan(e.target.value);
                        }
                      }}
                    />
                  </div>
                  <div style={{display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "20px"}}>
                    <button
                      type="button"
                      onClick={() => setShowBarcodeScanner(false)}
                      style={{
                        padding: "8px 16px",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        background: "#f5f5f5",
                        cursor: "pointer"
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Comments */}
          <div className="field full">
            <label htmlFor="comments">Comments</label>
            <textarea
              id="comments"
              name="comments"
              rows="5"
              value={form.comments}
              onChange={updateField}
              placeholder="Additional notes about the internal inspection..."
            />
          </div>

          <div className="actions field full">
            <button className="primary-button" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving internal inspection..." : "Submit Internal Inspection"}
            </button>
            <span className="subtle">
              This inspection is linked to the receiving inspection for complete traceability.
            </span>
          </div>
        </form>

        {message && <div className={`message ${message.type}`}>{message.text}</div>}

        {/* Monthly Inspection Data */}
        <div style={{
          background: "#f8f9fa",
          padding: "15px",
          borderRadius: "4px",
          marginTop: "20px"
        }}>
          <h4>Monthly Inspection Data</h4>
          <div style={{display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "15px"}}>
            <div style={{
              border: "1px solid #ddd",
              borderRadius: "4px",
              padding: "10px",
              background: "white",
              textAlign: "center"
            }}>
              <div style={{fontSize: "24px", fontWeight: "bold", color: "#007bff"}}>
                {monthlyInspections.length}
              </div>
              <div style={{fontSize: "12px", color: "#666"}}>
                Internal Inspections Completed
              </div>
              <div style={{fontSize: "10px", color: "#999", marginTop: "5px"}}>
                This month
              </div>
            </div>
            <div style={{
              border: "1px solid #ddd",
              borderRadius: "4px",
              padding: "10px",
              background: "white",
              textAlign: "center"
            }}>
              <div style={{fontSize: "24px", fontWeight: "bold", color: "#28a745"}}>
                {monthlyInspections.filter(i => i.linkedToReceiving).length}
              </div>
              <div style={{fontSize: "12px", color: "#666"}}>
                Linked to Receiving Inspections
              </div>
              <div style={{fontSize: "10px", color: "#999", marginTop: "5px"}}>
                This month
              </div>
            </div>
            <div style={{
              border: "1px solid #ddd",
              borderRadius: "4px",
              padding: "10px",
              background: "white",
              textAlign: "center"
            }}>
              <div style={{fontSize: "24px", fontWeight: "bold", color: "#dc3545"}}>
                {failurePatterns ? Object.keys(failurePatterns).length : 0}
              </div>
              <div style={{fontSize: "12px", color: "#666"}}>
                Failure Patterns Detected
              </div>
              <div style={{fontSize: "10px", color: "#999", marginTop: "5px"}}>
                This month
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* Recent Inspections with Filtering */}
      <aside className="panel">
        <div className="panel-header">
          <div>
            <h3>Recent Internal Inspections</h3>
            <p className="subtle">
              {filteredInspections.length} inspections found in selected date range.
            </p>
          </div>
        </div>

        <div className="list-card">
          {isLoading ? (
            <div className="empty-state">Loading inspection history...</div>
          ) : filteredInspections.length === 0 ? (
            <div className="empty-state">
              No internal inspection data found. Link to a receiving inspection and submit the first internal inspection.
            </div>
          ) : (
            filteredInspections.map((inspection) => (
              <article className="inspection-item" key={inspection.id}>
                <header>
                  <div>
                    <h4>{inspection.po_number}</h4>
                    <p>{inspection.part_number}</p>
                    {inspection.linkedToReceiving && (
                      <p><small>Linked to receiving inspection</small></p>
                    )}
                  </div>
                  <span className={`status-pill ${formatStatus(inspection.status)}`}>
                    {inspection.status}
                  </span>
                </header>
                <div className="inspection-details">
                  <p><strong>Test Type:</strong> {inspection.testType}</p>
                  <p><strong>Inspector:</strong> {inspection.inspector_name}</p>
                  <p><strong>Date:</strong> {formatDate(inspection.created_at)}</p>
                  {inspection.overallFailureRate && (
                    <p><strong>Failure Rate:</strong> {inspection.overallFailureRate}%</p>
                  )}
                  
                  {/* Display all test items with their details */}
                  {inspection.items && inspection.items.length > 0 && (
                    <div style={{ marginTop: "15px", padding: "10px", background: "#f8f9fa", borderRadius: "4px" }}>
                      <h5 style={{ margin: "0 0 10px 0", fontSize: "14px", color: "#333" }}>Test Items:</h5>
                      {inspection.items.map((item, index) => (
                        <div key={index} style={{ 
                          marginBottom: "8px", 
                          padding: "8px", 
                          background: "white", 
                          border: "1px solid #dee2e6", 
                          borderRadius: "4px",
                          fontSize: "12px"
                        }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                              <strong style={{ color: "#007bff" }}>{item.partNumber}</strong>
                              {item.description && <span> - {item.description}</span>}
                              {item.barcode && (
                                <div style={{ color: "#666", marginTop: "2px" }}>
                                  <strong>Barcode:</strong> {item.barcode}
                                </div>
                              )}
                              {item.serialNumbers && (
                                <div style={{ color: "#666", marginTop: "2px" }}>
                                  <strong>Serial/Batch:</strong> {item.serialNumbers}
                                </div>
                              )}
                              {item.testType && (
                                <div style={{ color: "#666", marginTop: "2px" }}>
                                  <strong>Test Type:</strong> {item.testType}
                                </div>
                              )}
                            </div>
                            <div style={{ textAlign: "right", fontSize: "11px" }}>
                              <div><strong>Test Result:</strong> 
                                <span style={{ 
                                  color: item.testResult === "PASS" ? "#28a745" : "#dc3545",
                                  fontWeight: "bold"
                                }}>
                                  {" "}{item.testResult}
                                </span>
                              </div>
                              {item.testStandard && (
                                <div><strong>Standard:</strong> {item.testStandard}</div>
                              )}
                              {item.testValue && (
                                <div><strong>Value:</strong> {item.testValue}</div>
                              )}
                              {item.failureRate > 0 && (
                                <div style={{ color: item.failureRate > 10 ? "#dc3545" : "#ffc107" }}>
                                  <strong>Fail Rate:</strong> {item.failureRate}%
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            ))
          )}
        </div>
      </aside>
    </section>
  );
}

export default InternalInspection;
