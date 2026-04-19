import { useEffect, useState } from "react";
import { createIncomingQC, fetchIncomingSummary } from "../services/api";

const initialForm = {
  poNumber: "",
  supplierId: "1",
  partNumber: "PCB-CTRL-001",
  qtyReceived: "100",
  qtyPassed: "100",
  qtyFailed: "0",
  inspectorId: "2",
  comments: "",
  deliveryDate: "",
  items: []
};

const initialItem = {
  partNumber: "",
  description: "",
  qtyOrdered: "",
  qtyReceived: "",
  qtyGood: "",
  qtyBad: "",
  serialNumbers: "",
  location: ""
};

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

function IncomingQC() {
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

  async function loadSummary() {
    try {
      setIsLoading(true);
      const data = await fetchIncomingSummary();
      setSummary(data);
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
  }

  function updateItemField(event) {
    const { name, value } = event.target;

    setCurrentItem((current) => ({
      ...current,
      [name]: value,
      // Auto-calculate good/bad quantities
      ...(name === "qtyReceived" && {
        qtyGood: value,
        qtyBad: "0",
      }),
      ...(name === "qtyBad" && {
        qtyGood: Math.max(
          0,
          (parseInt(current.qtyReceived, 10) || 0) - (parseInt(value, 10) || 0)
        ).toString(),
      }),
      ...(name === "qtyGood" && {
        qtyBad: Math.max(
          0,
          (parseInt(current.qtyReceived, 10) || 0) - (parseInt(value, 10) || 0)
        ).toString(),
      }),
    }));
  }

  function addItem() {
    const newItem = {
      ...currentItem,
      id: Date.now(),
    };
    
    setItems([...items, newItem]);
    setCurrentItem(initialItem);
    setShowItemForm(false);
    
    // Update form totals
    const newItems = [...items, newItem];
    const totalGood = newItems.reduce((sum, item) => sum + (parseInt(item.qtyGood) || 0), 0);
    const totalBad = newItems.reduce((sum, item) => sum + (parseInt(item.qtyBad) || 0), 0);
    
    setForm(prev => ({
      ...prev,
      qtyReceived: (totalGood + totalBad).toString(),
      qtyPassed: totalGood.toString(),
      qtyFailed: totalBad.toString(),
    }));
  }

  function removeItem(itemId) {
    const updatedItems = items.filter(item => item.id !== itemId);
    setItems(updatedItems);
    
    // Recalculate totals
    const totalGood = updatedItems.reduce((sum, item) => sum + (parseInt(item.qtyGood) || 0), 0);
    const totalBad = updatedItems.reduce((sum, item) => sum + (parseInt(item.qtyBad) || 0), 0);
    
    setForm(prev => ({
      ...prev,
      qtyReceived: (totalGood + totalBad).toString(),
      qtyPassed: totalGood.toString(),
      qtyFailed: totalBad.toString(),
    }));
  }

  function createNCRForFailedItems() {
    const failedItems = items.filter(item => parseInt(item.qtyBad) > 0);
    
    if (failedItems.length === 0) {
      setMessage({
        type: "error",
        text: "No failed items found to create NCR for"
      });
      return;
    }

    // Create NCR for each failed item
    const ncrPromises = failedItems.map(item => {
      const ncrData = {
        incidentType: "SUPPLIER",
        recipientCompanyName: `Supplier ${form.supplierId}`,
        incidentDate: form.deliveryDate || new Date().toISOString().split('T')[0],
        incidentNumber: `ME-SCF-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
        orderReference: form.poNumber,
        initiatorReporter: "Current User",
        initiatorCompanyName: "QualiTrack Company",
        affectedDepartment: "PRODUCTION",
        reportDate: new Date().toISOString().split('T')[0],
        productNumber: item.partNumber,
        productDescription: item.description,
        partNumber: item.partNumber,
        partDescription: item.description,
        serialUidBatch: item.serialNumbers,
        affectedQuantity: item.qtyBad,
        nonConformanceDescription: `Item ${item.partNumber} failed QC inspection. ${item.qtyBad} out of ${item.qtyReceived} units were rejected.`,
        desiredOutcome: "Replace failed items with conforming products",
        rootCauseAnalysis: "Quality control inspection revealed non-conformance to specifications",
        correctivePreventiveActions: "Return failed items to supplier and implement additional quality checks"
      };

      return createIncomingQC(ncrData);
    });

    return Promise.all(ncrPromises);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      // Save QC inspection with items
      const qcData = {
        ...form,
        items: items,
        qtyReceived: Number(form.qtyReceived),
        qtyPassed: Number(form.qtyPassed),
        qtyFailed: Number(form.qtyFailed),
        supplierId: Number(form.supplierId),
        inspectorId: Number(form.inspectorId),
      };

      const data = await createIncomingQC(qcData);

      setMessage({
        type: "success",
        text: data.data.ncr
          ? `Inspection saved and NCR ${data.data.ncr.ncr_number} was opened.`
          : "Inspection saved successfully with no NCR required.",
      });

      // Reset form
      setForm(initialForm);
      setItems([]);
      await loadSummary();
      
      // Check if there are failed items and create NCRs automatically
      const failedItems = items.filter(item => parseInt(item.qtyBad) > 0);
      if (failedItems.length > 0) {
        try {
          await createNCRForFailedItems();
          setMessage(prev => ({
            ...prev,
            text: `${prev.text} Also created ${failedItems.length} NCR(s) for failed items.`
          }));
        } catch (ncrError) {
          setMessage(prev => ({
            ...prev,
            text: `${prev.text} Warning: Failed to create automatic NCRs: ${ncrError.message}`
          }));
        }
      }
    } catch (error) {
      // Extract backend error messages if available
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

  return (
    <section className="content-grid">
      <article className="panel">
        <div className="panel-header">
          <div>
            <h2>Log Incoming Inspection</h2>
            <p className="subtle">Start with the first production-safe workflow in the system.</p>
          </div>
        </div>

        <div className="quantity-grid">
          <div className="quantity-chip received">
            <strong>{totalInspections}</strong>
            <span>Total inspections</span>
          </div>
          <div className="quantity-chip passed">
            <strong>{totalReceived}</strong>
            <span>Total quantity received</span>
          </div>
          <div className="quantity-chip failed">
            <strong>{totalFailed}</strong>
            <span>Total failed quantity</span>
          </div>
        </div>

        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="poNumber">PO Number</label>
            <input
              id="poNumber"
              name="poNumber"
              value={form.poNumber}
              onChange={updateField}
              placeholder="PO-2026-0042"
              required
            />
          </div>

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
            <label htmlFor="supplierId">Supplier ID</label>
            <input
              id="supplierId"
              name="supplierId"
              type="number"
              min="1"
              value={form.supplierId}
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

          <div className="field">
            <label htmlFor="qtyReceived">Quantity Received</label>
            <input
              id="qtyReceived"
              name="qtyReceived"
              type="number"
              min="0"
              value={form.qtyReceived}
              onChange={updateField}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="qtyPassed">Quantity Passed</label>
            <input
              id="qtyPassed"
              name="qtyPassed"
              type="number"
              min="0"
              value={form.qtyPassed}
              onChange={updateField}
              required
            />
          </div>

          <div className="field full">
            <label htmlFor="qtyFailed">Quantity Failed</label>
            <input
              id="qtyFailed"
              name="qtyFailed"
              type="number"
              min="0"
              value={form.qtyFailed}
              onChange={updateField}
              required
            />
          </div>

        <div className="field">
          <label htmlFor="qtyPassed">Quantity Passed</label>
          <input
            id="qtyPassed"
            name="qtyPassed"
            type="number"
            min="0"
            value={form.qtyPassed}
            onChange={updateField}
            required
          />
        </div>

        <div className="field full">
          <label htmlFor="qtyFailed">Quantity Failed</label>
          <input
            id="qtyFailed"
            name="qtyFailed"
            type="number"
            min="0"
            value={form.qtyFailed}
            onChange={updateField}
            required
          />
        </div>

        <div className="field full">
          <label htmlFor="comments">Comments</label>
          <textarea
            id="comments"
            name="comments"
            rows="5"
            value={form.comments}
            onChange={updateField}
            placeholder="Capture defects, lot condition, missing documents, or supplier concerns."
          />
        </div>

          <div className="actions field full">
            <button className="primary-button" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving inspection..." : "Submit Incoming QC"}
            </button>
            <span className="subtle">
              If failed quantity is greater than 0, backend automatically creates a linked NCR.
            </span>
          </div>
        </form>

        {message && <div className={`message ${message.type}`}>{message.text}</div>}

        <aside className="panel">
          <div className="panel-header">
            <div>
              <h3>Recent Inspections</h3>
              <p className="subtle">
                {summary.stats.accepted_count ?? 0} accepted inspections captured so far.
              </p>
            </div>
          </div>

          <div className="list-card">
            {isLoading ? (
              <div className="empty-state">Loading inspection history...</div>
            ) : summary.recentInspections.length === 0 ? (
              <div className="empty-state">
                No inspection data yet. Submit first incoming QC record to populate the feed.
              </div>
            ) : (
              summary.recentInspections.map((inspection) => (
                <article className="inspection-item" key={inspection.id}>
                  <header>
                    <div>
                      <h4>{inspection.po_number}</h4>
                      <p>{inspection.part_number}</p>
                      {inspection.barcode && (
                        <p><small>Barcode: {inspection.barcode}</small></p>
                      )}
                    </div>
                    <span className={`status-pill ${formatStatus(inspection.status)}`}>
                      {inspection.status}
                    </span>
                  </header>
                  <div className="inspection-details">
                    <p><strong>Quantity:</strong> {inspection.qty_received} received, {inspection.qty_passed} passed, {inspection.qty_failed} failed</p>
                    <p><strong>Inspector:</strong> {inspection.inspector_name}</p>
                    <p><strong>Date:</strong> {formatDate(inspection.created_at)}</p>
                    
                    {/* Display all items with their details */}
                    {inspection.items && inspection.items.length > 0 && (
                      <div style={{ marginTop: "15px", padding: "10px", background: "#f8f9fa", borderRadius: "4px" }}>
                        <h5 style={{ margin: "0 0 10px 0", fontSize: "14px", color: "#333" }}>Items Inspected:</h5>
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
                              </div>
                              <div style={{ textAlign: "right", fontSize: "11px" }}>
                                <div><strong>Qty:</strong> {item.qtyReceived}</div>
                                <div style={{ color: "#28a745" }}><strong>Good:</strong> {item.qtyGood}</div>
                                <div style={{ color: "#dc3545" }}><strong>Bad:</strong> {item.qtyBad}</div>
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
      </article>
    </section>
  );
};

export default IncomingQC;
