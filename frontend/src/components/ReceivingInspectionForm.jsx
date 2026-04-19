import { formatStatus, formatDate } from "../utils/formatters";

export function ReceivingInspectionForm({ 
  form, 
  updateField, 
  isSubmitting, 
  handleSubmit, 
  items,
  calculateFailureRate,
  setShowItemForm 
}) {
  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: "800px", margin: "0 auto" }}>
      <div style={{
        background: "white",
        padding: "30px",
        borderRadius: "12px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        border: "1px solid #e5e7eb"
      }}>
        <h2 style={{
          fontSize: "24px",
          fontWeight: "600",
          marginBottom: "25px",
          color: "#1f2937",
          borderBottom: "2px solid #3b82f6",
          paddingBottom: "10px"
        }}>
          Receiving Inspection
        </h2>

        {/* Basic Information */}
        <div style={{ marginBottom: "30px" }}>
          <h3 style={{
            fontSize: "18px",
            fontWeight: "500",
            marginBottom: "15px",
            color: "#374151"
          }}>
            Basic Information
          </h3>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "20px"
          }}>
            <div>
              <label style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: "500",
                color: "#374151"
              }}>
                Purchase Order Number *
              </label>
              <input
                type="text"
                name="poNumber"
                value={form.poNumber}
                onChange={updateField}
                placeholder="PO-2026-0042"
                required
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  fontSize: "14px"
                }}
              />
            </div>

            <div>
              <label style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: "500",
                color: "#374151"
              }}>
                Supplier ID *
              </label>
              <input
                type="number"
                name="supplierId"
                min="1"
                value={form.supplierId}
                onChange={updateField}
                required
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  fontSize: "14px"
                }}
              />
            </div>

            <div>
              <label style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: "500",
                color: "#374151"
              }}>
                Delivery Date *
              </label>
              <input
                type="date"
                name="deliveryDate"
                value={form.deliveryDate}
                onChange={updateField}
                required
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  fontSize: "14px"
                }}
              />
            </div>

            <div>
              <label style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: "500",
                color: "#374151"
              }}>
                Inspector ID *
              </label>
              <input
                type="number"
                name="inspectorId"
                min="1"
                value={form.inspectorId}
                onChange={updateField}
                required
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  fontSize: "14px"
                }}
              />
            </div>
          </div>
        </div>

        {/* Items Section */}
        <div style={{ marginBottom: "30px" }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "15px"
          }}>
            <h3 style={{
              fontSize: "18px",
              fontWeight: "500",
              color: "#374151",
              margin: 0
            }}>
              Items ({items.length})
            </h3>
            <button
              type="button"
              onClick={() => setShowItemForm(true)}
              style={{
                padding: "8px 16px",
                background: "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500"
              }}
            >
              Add Item
            </button>
          </div>

          {/* Items List */}
          <div style={{
            display: "grid",
            gap: "15px",
            maxHeight: "400px",
            overflowY: "auto"
          }}>
            {items.map((item) => (
              <div
                key={item.id}
                style={{
                  padding: "15px",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  background: "#f9fafb"
                }}
              >
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start"
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: "16px",
                      fontWeight: "500",
                      color: "#1f2937",
                      marginBottom: "5px"
                    }}>
                      {item.partNumber}
                    </div>
                    {item.description && (
                      <div style={{
                        fontSize: "14px",
                        color: "#6b7280",
                        marginBottom: "8px"
                      }}>
                        {item.description}
                      </div>
                    )}
                    {item.barcode && (
                      <div style={{
                        fontSize: "12px",
                        color: "#9ca3af",
                        marginBottom: "8px"
                      }}>
                        Barcode: {item.barcode}
                      </div>
                    )}
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
                      gap: "10px",
                      fontSize: "13px"
                    }}>
                      <div>
                        <span style={{ color: "#6b7280" }}>Ordered: </span>
                        <span style={{ fontWeight: "500" }}>{item.qtyOrdered || "N/A"}</span>
                      </div>
                      <div>
                        <span style={{ color: "#6b7280" }}>Received: </span>
                        <span style={{ fontWeight: "500" }}>{item.qtyReceived}</span>
                      </div>
                      <div>
                        <span style={{ color: "#6b7280" }}>Good: </span>
                        <span style={{ color: "#059669", fontWeight: "500" }}>{item.qtyGood}</span>
                      </div>
                      <div>
                        <span style={{ color: "#6b7280" }}>Bad: </span>
                        <span style={{ color: "#dc2626", fontWeight: "500" }}>{item.qtyBad}</span>
                      </div>
                    </div>
                    {item.serialNumbers && (
                      <div style={{ marginTop: "8px" }}>
                        <span style={{ color: "#6b7280", fontSize: "12px" }}>Serial: </span>
                        <span style={{ fontSize: "12px" }}>{item.serialNumbers}</span>
                      </div>
                    )}
                    {item.batchNumber && (
                      <div style={{ marginTop: "5px" }}>
                        <span style={{ color: "#6b7280", fontSize: "12px" }}>Batch: </span>
                        <span style={{ fontSize: "12px" }}>{item.batchNumber}</span>
                      </div>
                    )}
                    {item.expiryDate && (
                      <div style={{ marginTop: "5px" }}>
                        <span style={{ color: "#6b7280", fontSize: "12px" }}>Expiry: </span>
                        <span style={{ fontSize: "12px" }}>{item.expiryDate}</span>
                      </div>
                    )}
                    {item.location && (
                      <div style={{ marginTop: "5px" }}>
                        <span style={{ color: "#6b7280", fontSize: "12px" }}>Location: </span>
                        <span style={{ fontSize: "12px" }}>{item.location}</span>
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      type="button"
                      onClick={() => editItem(item)}
                      style={{
                        padding: "4px 8px",
                        background: "#10b981",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
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
                        padding: "4px 8px",
                        background: "#ef4444",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "12px"
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Comments */}
        <div style={{ marginBottom: "30px" }}>
          <label style={{
            display: "block",
            marginBottom: "5px",
            fontWeight: "500",
            color: "#374151"
          }}>
            Comments
          </label>
          <textarea
            name="comments"
            value={form.comments}
            onChange={updateField}
            placeholder="Enter any additional comments about this inspection..."
            rows={4}
            style={{
              width: "100%",
              padding: "10px",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              fontSize: "14px",
              resize: "vertical"
            }}
          />
        </div>

        {/* Submit Button */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingTop: "20px",
          borderTop: "1px solid #e5e7eb"
        }}>
          <div style={{ fontSize: "14px", color: "#6b7280" }}>
            {items.length > 0 && (
              <span>Failure Rate: <strong>{calculateFailureRate()}%</strong></span>
            )}
          </div>
          <button
            type="submit"
            disabled={isSubmitting || items.length === 0}
            style={{
              padding: "12px 24px",
              background: isSubmitting || items.length === 0 ? "#9ca3af" : "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: isSubmitting || items.length === 0 ? "not-allowed" : "pointer",
              fontSize: "16px",
              fontWeight: "500"
            }}
          >
            {isSubmitting ? "Submitting..." : "Submit Inspection"}
          </button>
        </div>
      </div>
    </form>
  );
}
