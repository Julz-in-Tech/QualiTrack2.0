import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";

const initialForm = {
  // Document Header
  documentNumber: "ME-DOC-QAM-FOR-002-01-EN",
  version: "01",
  documentOwner: "",
  approver: "",
  approvalDate: "",
  
  // Recipient Details
  recipientCompanyName: "",
  incidentDate: "",
  incidentType: "SUPPLIER",
  contactPerson: "",
  incidentNumber: "",
  orderReference: "",
  returnDeliveryNote: "",
  
  // Initiator Details
  initiatorCompanyName: "",
  affectedDepartment: "PRODUCTION",
  initiatorReporter: "",
  reportDate: "",
  
  // Product Details
  productNumber: "",
  productDescription: "",
  partNumber: "",
  partDescription: "",
  serialUidBatch: "",
  affectedQuantity: "",
  
  // NCR Content
  nonConformanceDescription: "",
  desiredOutcome: "",
  rootCauseAnalysis: "",
  correctivePreventiveActions: "",
  additionalComments: "",
  
  // Approval & Follow-up
  initiatorSignature: "",
  recipientSignature: "",
  approvedBySignature: "",
  followUpDate: "",
  initiatorSignDate: "",
  recipientSignDate: "",
  approvedBySignDate: "",
  closureDate: "",
};

const incidentTypes = ["SUPPLIER", "CUSTOMER", "INTERNAL COMPLAINT"];
const departments = ["PRODUCTION", "TESTING", "STORES", "OTHER DEPARTMENT"];

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  return date.toISOString().split('T')[0];
}

function generateNCRNumber(type) {
  const prefix = type === "SUPPLIER" ? "ME-SCF" : type === "CUSTOMER" ? "ME-SCF" : "ME-ICF";
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}-${random}`;
}

function NCRForm() {
  const { user } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [savedNCRs, setSavedNCRs] = useState([]);

  useEffect(() => {
    // Load saved NCRs from localStorage
    const stored = JSON.parse(localStorage.getItem('qualitrack_ncrs') || '[]');
    setSavedNCRs(stored);
    
    // Check for pre-filled data from receiving inspection
    const prefillData = JSON.parse(localStorage.getItem('qualitrack_ncr_prefill') || '{}');
    
    // Set current user as initiator and apply pre-fill data if available
    if (user) {
      setForm(prev => ({
        ...prev,
        ...prefillData, // Apply pre-filled data first
        initiatorReporter: user.email || prefillData.initiatorReporter || "",
        initiatorCompanyName: "QualiTrack Company",
        reportDate: formatDate(new Date()),
        incidentDate: prefillData.incidentDate || formatDate(new Date())
      }));
      
      // Clear pre-fill data after applying it
      if (Object.keys(prefillData).length > 0) {
        localStorage.removeItem('qualitrack_ncr_prefill');
      }
    }
  }, [user]);

  function updateField(event) {
    const { name, value } = event.target;
    
    setForm((current) => ({
      ...current,
      [name]: value,
      // Auto-generate NCR number when incident type changes
      ...(name === "incidentType" && {
        incidentNumber: generateNCRNumber(value)
      })
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      // Create NCR record
      const ncrRecord = {
        ...form,
        id: Date.now(),
        status: "PENDING",
        createdAt: new Date().toISOString(),
        createdBy: user?.email || "Anonymous"
      };

      // Save to localStorage
      const updatedNCRs = [...savedNCRs, ncrRecord];
      localStorage.setItem('qualitrack_ncrs', JSON.stringify(updatedNCRs));
      setSavedNCRs(updatedNCRs);

      setMessage({
        type: "success",
        text: `NCR ${form.incidentNumber} created successfully!`
      });

      // Reset form
      setForm({
        ...initialForm,
        documentNumber: "ME-DOC-QAM-FOR-002-01-EN",
        version: "01",
        initiatorReporter: user?.email || "",
        initiatorCompanyName: "QualiTrack Company",
        reportDate: formatDate(new Date()),
        incidentDate: formatDate(new Date()),
        incidentNumber: generateNCRNumber(form.incidentType)
      });

    } catch (error) {
      setMessage({
        type: "error",
        text: `Failed to create NCR: ${error.message}`
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="content-grid">
      <article className="panel">
        <div className="panel-header">
          <div>
            <h2>Non-Conformance Report (NCR) Form</h2>
            <p className="subtle">Document and track quality issues and corrective actions</p>
          </div>
        </div>

        {/* Document Header */}
        <div className="document-header" style={{border: "2px solid #333", padding: "20px", marginBottom: "20px"}}>
          <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px"}}>
            <div>
              <p><strong>Document Number:</strong> {form.documentNumber}</p>
              <p><strong>Document Owner:</strong></p>
              <input
                type="text"
                name="documentOwner"
                value={form.documentOwner}
                onChange={updateField}
                placeholder="Name of Document Owner"
                style={{width: "100%", padding: "4px", border: "1px solid #ccc"}}
              />
              <p><strong>Approver:</strong></p>
              <input
                type="text"
                name="approver"
                value={form.approver}
                onChange={updateField}
                placeholder="Name of APPROVER"
                style={{width: "100%", padding: "4px", border: "1px solid #ccc"}}
              />
              <p><strong>Approval date:</strong></p>
              <input
                type="date"
                name="approvalDate"
                value={form.approvalDate}
                onChange={updateField}
                style={{width: "100%", padding: "4px", border: "1px solid #ccc"}}
              />
            </div>
            <div style={{textAlign: "right"}}>
              <p><strong>Version:</strong> {form.version}</p>
              <p><strong>Company LOGO Here</strong></p>
              <p><strong>Company NAME Here</strong></p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Recipient Details */}
          <div className="form-section" style={{marginBottom: "30px"}}>
            <h3>Recipient Details</h3>
            <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px"}}>
              <div>
                <label>Company Name *</label>
                <input
                  type="text"
                  name="recipientCompanyName"
                  value={form.recipientCompanyName}
                  onChange={updateField}
                  placeholder="NCR Recipient Company Name"
                  required
                  style={{width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "4px"}}
                />
              </div>
              <div>
                <label>Incident Date *</label>
                <input
                  type="date"
                  name="incidentDate"
                  value={form.incidentDate}
                  onChange={updateField}
                  required
                  style={{width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "4px"}}
                />
              </div>
              <div>
                <label>Incident Type *</label>
                <select
                  name="incidentType"
                  value={form.incidentType}
                  onChange={updateField}
                  required
                  style={{width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "4px"}}
                >
                  {incidentTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label>Contact Person *</label>
                <input
                  type="email"
                  name="contactPerson"
                  value={form.contactPerson}
                  onChange={updateField}
                  placeholder="Contact Person email address"
                  required
                  style={{width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "4px"}}
                />
              </div>
              <div>
                <label>Incident Number</label>
                <input
                  type="text"
                  name="incidentNumber"
                  value={form.incidentNumber}
                  onChange={updateField}
                  placeholder="NCR Reference Number"
                  readOnly
                  style={{width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "4px", background: "#f5f5f5"}}
                />
              </div>
              <div>
                <label>Order Reference No.</label>
                <input
                  type="text"
                  name="orderReference"
                  value={form.orderReference}
                  onChange={updateField}
                  placeholder="POxxxxxx/Sxxxx"
                  style={{width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "4px"}}
                />
              </div>
              <div>
                <label>Return/Delivery note No.</label>
                <input
                  type="text"
                  name="returnDeliveryNote"
                  value={form.returnDeliveryNote}
                  onChange={updateField}
                  placeholder="General alpha-numeric"
                  style={{width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "4px"}}
                />
              </div>
            </div>
          </div>

          {/* Initiator/Reporter Details */}
          <div className="form-section" style={{marginBottom: "30px"}}>
            <h3>Initiator/Reporter Details</h3>
            <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px"}}>
              <div>
                <label>Company Name *</label>
                <input
                  type="text"
                  name="initiatorCompanyName"
                  value={form.initiatorCompanyName}
                  onChange={updateField}
                  required
                  style={{width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "4px"}}
                />
              </div>
              <div>
                <label>Affected Department *</label>
                <select
                  name="affectedDepartment"
                  value={form.affectedDepartment}
                  onChange={updateField}
                  required
                  style={{width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "4px"}}
                >
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              <div>
                <label>Initiator/Reporter *</label>
                <input
                  type="text"
                  name="initiatorReporter"
                  value={form.initiatorReporter}
                  onChange={updateField}
                  placeholder="Name of person who initiated the NCR"
                  required
                  style={{width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "4px"}}
                />
              </div>
              <div>
                <label>Report Date *</label>
                <input
                  type="date"
                  name="reportDate"
                  value={form.reportDate}
                  onChange={updateField}
                  required
                  style={{width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "4px"}}
                />
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="form-section" style={{marginBottom: "30px"}}>
            <h3>Product Details</h3>
            <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px"}}>
              <div>
                <label>Product Number</label>
                <input
                  type="text"
                  name="productNumber"
                  value={form.productNumber}
                  onChange={updateField}
                  placeholder="Product number (M-xxx-xxx-xx-Vx)"
                  style={{width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "4px"}}
                />
              </div>
              <div>
                <label>Product Description</label>
                <input
                  type="text"
                  name="productDescription"
                  value={form.productDescription}
                  onChange={updateField}
                  placeholder="Product Description"
                  style={{width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "4px"}}
                />
              </div>
              <div>
                <label>Part Number</label>
                <input
                  type="text"
                  name="partNumber"
                  value={form.partNumber}
                  onChange={updateField}
                  placeholder="Part number (M-xxx-xxx-xx-Vx)"
                  style={{width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "4px"}}
                />
              </div>
              <div>
                <label>Part Description</label>
                <input
                  type="text"
                  name="partDescription"
                  value={form.partDescription}
                  onChange={updateField}
                  placeholder="Part Description"
                  style={{width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "4px"}}
                />
              </div>
              <div>
                <label>Serial / UID / Batch No</label>
                <input
                  type="text"
                  name="serialUidBatch"
                  value={form.serialUidBatch}
                  onChange={updateField}
                  placeholder="Multiple alpha-numeric references"
                  style={{width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "4px"}}
                />
              </div>
              <div>
                <label>Affected Quantity</label>
                <input
                  type="number"
                  name="affectedQuantity"
                  value={form.affectedQuantity}
                  onChange={updateField}
                  placeholder="QTY"
                  style={{width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "4px"}}
                />
              </div>
            </div>
          </div>

          {/* NCR Content Sections */}
          <div className="form-section" style={{marginBottom: "30px"}}>
            <h3>Non-Conformance Description/Summary</h3>
            <textarea
              name="nonConformanceDescription"
              value={form.nonConformanceDescription}
              onChange={updateField}
              placeholder="Describe the non-conformance in detail..."
              rows={4}
              style={{width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "4px", resize: "vertical"}}
            />
          </div>

          <div className="form-section" style={{marginBottom: "30px"}}>
            <h3>Desired Outcome</h3>
            <textarea
              name="desiredOutcome"
              value={form.desiredOutcome}
              onChange={updateField}
              placeholder="Describe what solution you prefer..."
              rows={3}
              style={{width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "4px", resize: "vertical"}}
            />
          </div>

          <div className="form-section" style={{marginBottom: "30px"}}>
            <h3>Root Cause Analysis (RCA)</h3>
            <textarea
              name="rootCauseAnalysis"
              value={form.rootCauseAnalysis}
              onChange={updateField}
              placeholder="Describe the issue (WHO, WHAT, WHERE, WHEN, HOW, WHY)..."
              rows={4}
              style={{width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "4px", resize: "vertical"}}
            />
          </div>

          <div className="form-section" style={{marginBottom: "30px"}}>
            <h3>Corrective & Preventive Actions (CAPA)</h3>
            <textarea
              name="correctivePreventiveActions"
              value={form.correctivePreventiveActions}
              onChange={updateField}
              placeholder="How will correction & future prevention be done?..."
              rows={4}
              style={{width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "4px", resize: "vertical"}}
            />
          </div>

          <div className="form-section" style={{marginBottom: "30px"}}>
            <h3>Additional Comments</h3>
            <textarea
              name="additionalComments"
              value={form.additionalComments}
              onChange={updateField}
              placeholder="Any additional information..."
              rows={3}
              style={{width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "4px", resize: "vertical"}}
            />
          </div>

          {/* Approval & Follow-up */}
          <div className="form-section" style={{marginBottom: "30px"}}>
            <h3>Approval & Follow-up</h3>
            <div style={{display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px"}}>
              <div>
                <label>Initiator/Reporter</label>
                <input
                  type="text"
                  name="initiatorSignature"
                  value={form.initiatorSignature}
                  onChange={updateField}
                  placeholder="Name & Signature"
                  style={{width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "4px"}}
                />
                <input
                  type="date"
                  name="initiatorSignDate"
                  value={form.initiatorSignDate}
                  onChange={updateField}
                  style={{width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "4px", marginTop: "5px"}}
                />
              </div>
              <div>
                <label>NCR Recipient</label>
                <input
                  type="text"
                  name="recipientSignature"
                  value={form.recipientSignature}
                  onChange={updateField}
                  placeholder="Name & Signature"
                  style={{width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "4px"}}
                />
                <input
                  type="date"
                  name="recipientSignDate"
                  value={form.recipientSignDate}
                  onChange={updateField}
                  style={{width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "4px", marginTop: "5px"}}
                />
              </div>
              <div>
                <label>Approved By</label>
                <input
                  type="text"
                  name="approvedBySignature"
                  value={form.approvedBySignature}
                  onChange={updateField}
                  placeholder="Name & Signature"
                  style={{width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "4px"}}
                />
                <input
                  type="date"
                  name="approvedBySignDate"
                  value={form.approvedBySignDate}
                  onChange={updateField}
                  style={{width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "4px", marginTop: "5px"}}
                />
              </div>
              <div>
                <label>Follow-up</label>
                <input
                  type="text"
                  name="followUpDate"
                  value={form.followUpDate}
                  onChange={updateField}
                  placeholder="Date"
                  style={{width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "4px"}}
                />
                <input
                  type="date"
                  name="closureDate"
                  value={form.closureDate}
                  onChange={updateField}
                  placeholder="Closure date"
                  style={{width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "4px", marginTop: "5px"}}
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions" style={{display: "flex", gap: "10px", justifyContent: "flex-end"}}>
            <button
              type="button"
              onClick={() => setForm(initialForm)}
              style={{padding: "10px 20px", border: "1px solid #ddd", borderRadius: "4px", background: "#f5f5f5"}}
            >
              Clear Form
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: "10px 20px",
                border: "none",
                borderRadius: "4px",
                background: isSubmitting ? "#ccc" : "#007bff",
                color: "white",
                cursor: isSubmitting ? "not-allowed" : "pointer"
              }}
            >
              {isSubmitting ? "Creating NCR..." : "Create NCR"}
            </button>
          </div>

          {/* Message Display */}
          {message && (
            <div style={{
              marginTop: "20px",
              padding: "10px",
              borderRadius: "4px",
              background: message.type === "error" ? "#f8d7da" : "#d4edda",
              color: message.type === "error" ? "#721c24" : "#155724",
              border: `1px solid ${message.type === "error" ? "#f5c6cb" : "#c3e6cb"}`
            }}>
              {message.text}
            </div>
          )}
        </form>

        {/* Recent NCRs */}
        {savedNCRs.length > 0 && (
          <div style={{marginTop: "40px"}}>
            <h3>Recent NCRs ({savedNCRs.length})</h3>
            <div style={{overflowX: "auto"}}>
              <table style={{width: "100%", border: "1px solid #ddd", borderCollapse: "collapse"}}>
                <thead>
                  <tr style={{background: "#f8f9fa"}}>
                    <th style={{padding: "10px", border: "1px solid #ddd", textAlign: "left"}}>NCR Number</th>
                    <th style={{padding: "10px", border: "1px solid #ddd", textAlign: "left"}}>Type</th>
                    <th style={{padding: "10px", border: "1px solid #ddd", textAlign: "left"}}>Company</th>
                    <th style={{padding: "10px", border: "1px solid #ddd", textAlign: "left"}}>Date</th>
                    <th style={{padding: "10px", border: "1px solid #ddd", textAlign: "left"}}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {savedNCRs.slice(-5).reverse().map(ncr => (
                    <tr key={ncr.id}>
                      <td style={{padding: "10px", border: "1px solid #ddd"}}>{ncr.incidentNumber}</td>
                      <td style={{padding: "10px", border: "1px solid #ddd"}}>{ncr.incidentType}</td>
                      <td style={{padding: "10px", border: "1px solid #ddd"}}>{ncr.recipientCompanyName}</td>
                      <td style={{padding: "10px", border: "1px solid #ddd"}}>{new Date(ncr.createdAt).toLocaleDateString()}</td>
                      <td style={{padding: "10px", border: "1px solid #ddd"}}>
                        <span style={{
                          padding: "2px 8px",
                          borderRadius: "12px",
                          fontSize: "12px",
                          background: ncr.status === "PENDING" ? "#fff3cd" : "#d4edda",
                          color: ncr.status === "PENDING" ? "#856404" : "#155724"
                        }}>
                          {ncr.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </article>
    </section>
  );
}

export default NCRForm;
