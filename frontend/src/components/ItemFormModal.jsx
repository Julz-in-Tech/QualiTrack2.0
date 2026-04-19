import { INITIAL_ITEM } from "../constants/forms";

export function ItemFormModal({
  showItemForm,
  setShowItemForm,
  currentItem,
  updateItemField,
  addItem,
  showBarcodeScanner,
  setShowBarcodeScanner,
  setCurrentItem
}) {
  if (!showItemForm) return null;

  return (
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
        padding: "24px",
        borderRadius: "12px",
        width: "90%",
        maxWidth: "700px",
        maxHeight: "90vh",
        overflowY: "auto"
      }}>
        <h3 style={{
          fontSize: "20px",
          fontWeight: "600",
          marginBottom: "20px",
          color: "#1f2937"
        }}>
          {currentItem.id ? "Edit Item" : "Add New Item"}
        </h3>
        
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "20px",
          marginBottom: "20px"
        }}>
          <div>
            <label style={{
              display: "block",
              marginBottom: "5px",
              fontWeight: "500",
              color: "#374151"
            }}>
              Part Number *
            </label>
            <input
              type="text"
              name="partNumber"
              value={currentItem.partNumber}
              onChange={updateItemField}
              placeholder="PCB-CTRL-001"
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
              Barcode
            </label>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                type="text"
                name="barcode"
                value={currentItem.barcode}
                onChange={updateItemField}
                placeholder="Scan or enter barcode"
                style={{
                  flex: 1,
                  padding: "10px",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  fontSize: "14px"
                }}
              />
              <button
                type="button"
                onClick={() => setShowBarcodeScanner(true)}
                style={{
                  padding: "10px",
                  background: "#f3f4f6",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  cursor: "pointer"
                }}
              >
                Scan
              </button>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label style={{
            display: "block",
            marginBottom: "5px",
            fontWeight: "500",
            color: "#374151"
          }}>
            Description
          </label>
          <textarea
            name="description"
            value={currentItem.description}
            onChange={updateItemField}
            placeholder="Item description..."
            rows={2}
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

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: "20px",
          marginBottom: "20px"
        }}>
          <div>
            <label style={{
              display: "block",
              marginBottom: "5px",
              fontWeight: "500",
              color: "#374151"
            }}>
              Qty Ordered
            </label>
            <input
              type="number"
              name="qtyOrdered"
              value={currentItem.qtyOrdered}
              onChange={updateItemField}
              placeholder="100"
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
              Qty Received *
            </label>
            <input
              type="number"
              name="qtyReceived"
              value={currentItem.qtyReceived}
              onChange={updateItemField}
              placeholder="100"
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
              Qty Good
            </label>
            <input
              type="number"
              name="qtyGood"
              value={currentItem.qtyGood}
              onChange={updateItemField}
              placeholder="100"
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
              Qty Bad
            </label>
            <input
              type="number"
              name="qtyBad"
              value={currentItem.qtyBad}
              onChange={updateItemField}
              placeholder="0"
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

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "20px",
          marginBottom: "20px"
        }}>
          <div>
            <label style={{
              display: "block",
              marginBottom: "5px",
              fontWeight: "500",
              color: "#374151"
            }}>
              Batch Number
            </label>
            <input
              type="text"
              name="batchNumber"
              value={currentItem.batchNumber}
              onChange={updateItemField}
              placeholder="Batch #"
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
              Expiry Date
            </label>
            <input
              type="date"
              name="expiryDate"
              value={currentItem.expiryDate}
              onChange={updateItemField}
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

        <div style={{ marginBottom: "20px" }}>
          <label style={{
            display: "block",
            marginBottom: "5px",
            fontWeight: "500",
            color: "#374151"
          }}>
            Serial Numbers
          </label>
          <textarea
            name="serialNumbers"
            value={currentItem.serialNumbers}
            onChange={updateItemField}
            placeholder="Enter serial numbers (comma separated)..."
            rows={2}
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

        <div style={{ marginBottom: "20px" }}>
          <label style={{
            display: "block",
            marginBottom: "5px",
            fontWeight: "500",
            color: "#374151"
          }}>
            Storage Location
          </label>
          <input
            type="text"
            name="location"
            value={currentItem.location}
            onChange={updateItemField}
            placeholder="Storage location..."
            style={{
              width: "100%",
              padding: "10px",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              fontSize: "14px"
            }}
          />
        </div>

        <div style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "12px",
          paddingTop: "20px",
          borderTop: "1px solid #e5e7eb"
        }}>
          <button
            type="button"
            onClick={() => {
              setShowItemForm(false);
              setCurrentItem(INITIAL_ITEM);
            }}
            style={{
              padding: "10px 20px",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              background: "#f9fafb",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500"
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={addItem}
            style={{
              padding: "10px 20px",
              border: "none",
              borderRadius: "6px",
              background: "#3b82f6",
              color: "white",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500"
            }}
          >
            {currentItem.id ? "Update Item" : "Add Item"}
          </button>
        </div>
      </div>
    </div>
  );
}
