import { formatStatus, formatDate } from "../utils/formatters";

export function ReceivingInspectionSummary({ summary, isLoading, getProductTrends }) {
  if (isLoading) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "200px",
        color: "#6b7280"
      }}>
        Loading summary data...
      </div>
    );
  }

  const { stats, recentInspections } = summary;

  return (
    <div style={{ marginBottom: "40px" }}>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "20px",
        marginBottom: "30px"
      }}>
        <div style={{
          background: "white",
          padding: "20px",
          borderRadius: "8px",
          border: "1px solid #e5e7eb",
          textAlign: "center"
        }}>
          <div style={{
            fontSize: "24px",
            fontWeight: "600",
            color: "#3b82f6",
            marginBottom: "5px"
          }}>
            {stats.total_inspections}
          </div>
          <div style={{ fontSize: "14px", color: "#6b7280" }}>
            Total Inspections
          </div>
        </div>

        <div style={{
          background: "white",
          padding: "20px",
          borderRadius: "8px",
          border: "1px solid #e5e7eb",
          textAlign: "center"
        }}>
          <div style={{
            fontSize: "24px",
            fontWeight: "600",
            color: "#10b981",
            marginBottom: "5px"
          }}>
            {stats.total_received}
          </div>
          <div style={{ fontSize: "14px", color: "#6b7280" }}>
            Items Received
          </div>
        </div>

        <div style={{
          background: "white",
          padding: "20px",
          borderRadius: "8px",
          border: "1px solid #e5e7eb",
          textAlign: "center"
        }}>
          <div style={{
            fontSize: "24px",
            fontWeight: "600",
            color: "#ef4444",
            marginBottom: "5px"
          }}>
            {stats.total_failed}
          </div>
          <div style={{ fontSize: "14px", color: "#6b7280" }}>
            Failed Items
          </div>
        </div>

        <div style={{
          background: "white",
          padding: "20px",
          borderRadius: "8px",
          border: "1px solid #e5e7eb",
          textAlign: "center"
        }}>
          <div style={{
            fontSize: "24px",
            fontWeight: "600",
            color: "#8b5cf6",
            marginBottom: "5px"
          }}>
            {stats.accepted_count}
          </div>
          <div style={{ fontSize: "14px", color: "#6b7280" }}>
            Accepted Batches
          </div>
        </div>
      </div>

      {/* Recent Inspections */}
      <div style={{
        background: "white",
        padding: "24px",
        borderRadius: "12px",
        border: "1px solid #e5e7eb"
      }}>
        <h3 style={{
          fontSize: "18px",
          fontWeight: "600",
          marginBottom: "20px",
          color: "#1f2937"
        }}>
          Recent Inspections
        </h3>

        {recentInspections.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "40px",
            color: "#6b7280"
          }}>
            No recent inspections found
          </div>
        ) : (
          <div style={{
            display: "grid",
            gap: "16px"
          }}>
            {recentInspections.map((inspection, index) => (
              <div
                key={index}
                style={{
                  padding: "16px",
                  border: "1px solid #f3f4f6",
                  borderRadius: "8px",
                  background: "#fafafa"
                }}
              >
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "12px"
                }}>
                  <div>
                    <div style={{
                      fontSize: "16px",
                      fontWeight: "500",
                      color: "#1f2937",
                      marginBottom: "4px"
                    }}>
                      PO: {inspection.poNumber}
                    </div>
                    <div style={{
                      fontSize: "14px",
                      color: "#6b7280",
                      marginBottom: "4px"
                    }}>
                      Supplier: {inspection.supplierId}
                    </div>
                    <div style={{
                      fontSize: "12px",
                      color: "#9ca3af"
                    }}>
                      {formatDate(inspection.inspectionDate)}
                    </div>
                  </div>
                  <div style={{
                    padding: "4px 8px",
                    borderRadius: "12px",
                    fontSize: "12px",
                    fontWeight: "500",
                    background: inspection.status === "passed" 
                      ? "#d1fae5" 
                      : inspection.status === "failed"
                      ? "#fee2e2"
                      : "#fef3c7",
                    color: inspection.status === "passed"
                      ? "#065f46"
                      : inspection.status === "failed"
                      ? "#991b1b"
                      : "#92400e"
                  }}>
                    {inspection.status || "pending"}
                  </div>
                </div>

                {/* Display all items with their details */}
                {inspection.items && inspection.items.length > 0 && (
                  <div style={{
                    marginTop: "12px",
                    padding: "12px",
                    background: "white",
                    borderRadius: "6px",
                    border: "1px solid #e5e7eb"
                  }}>
                    <div style={{
                      fontSize: "13px",
                      fontWeight: "500",
                      color: "#374151",
                      marginBottom: "8px"
                    }}>
                      Items Inspected ({inspection.items.length}):
                    </div>
                    {inspection.items.map((item, itemIndex) => (
                      <div
                        key={itemIndex}
                        style={{
                          marginBottom: "8px",
                          padding: "8px",
                          background: "#f9fafb",
                          borderRadius: "4px",
                          fontSize: "12px"
                        }}
                      >
                        <div style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "4px"
                        }}>
                          <div>
                            <span style={{
                              fontWeight: "500",
                              color: "#3b82f6"
                            }}>
                              {item.partNumber}
                            </span>
                            {item.description && (
                              <span style={{ marginLeft: "8px", color: "#6b7280" }}>
                                - {item.description}
                              </span>
                            )}
                          </div>
                          <div style={{
                            display: "flex",
                            gap: "12px",
                            fontSize: "11px"
                          }}>
                            <span style={{ color: "#6b7280" }}>
                              R: {item.qtyReceived}
                            </span>
                            <span style={{ color: "#059669" }}>
                              G: {item.qtyGood}
                            </span>
                            <span style={{ color: "#dc2626" }}>
                              B: {item.qtyBad}
                            </span>
                          </div>
                        </div>
                        {item.barcode && (
                          <div style={{ color: "#9ca3af", fontSize: "11px" }}>
                            Barcode: {item.barcode}
                          </div>
                        )}
                        {item.serialNumbers && (
                          <div style={{ color: "#9ca3af", fontSize: "11px" }}>
                            Serial: {item.serialNumbers}
                          </div>
                        )}
                        {item.batchNumber && (
                          <div style={{ color: "#9ca3af", fontSize: "11px" }}>
                            Batch: {item.batchNumber}
                          </div>
                        )}
                        {item.location && (
                          <div style={{ color: "#9ca3af", fontSize: "11px" }}>
                            Location: {item.location}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {inspection.comments && (
                  <div style={{
                    marginTop: "8px",
                    padding: "8px",
                    background: "#f3f4f6",
                    borderRadius: "4px",
                    fontSize: "12px",
                    color: "#6b7280"
                  }}>
                    <strong>Comments:</strong> {inspection.comments}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
