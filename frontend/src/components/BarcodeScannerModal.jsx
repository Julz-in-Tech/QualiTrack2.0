export function BarcodeScannerModal({ 
  showBarcodeScanner, 
  setShowBarcodeScanner, 
  handleBarcodeScan 
}) {
  if (!showBarcodeScanner) return null;

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
        maxWidth: "400px",
        textAlign: "center"
      }}>
        <h3 style={{
          fontSize: "18px",
          fontWeight: "600",
          marginBottom: "16px",
          color: "#1f2937"
        }}>
          Barcode Scanner
        </h3>
        
        <div style={{
          padding: "32px",
          border: "2px dashed #d1d5db",
          borderRadius: "8px",
          background: "#f9fafb",
          marginBottom: "20px"
        }}>
          <div style={{
            width: "48px",
            height: "48px",
            margin: "0 auto 12px",
            background: "#3b82f6",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: "20px"
          }}>
            ¼
          </div>
          <p style={{
            margin: "0 0 16px 0",
            fontSize: "14px",
            color: "#6b7280"
          }}>
            Position the barcode in the scanner
          </p>
          <input
            type="text"
            placeholder="Or enter barcode manually"
            autoFocus
            style={{
              width: "100%",
              padding: "12px",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              fontSize: "14px",
              textAlign: "center"
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.target.value.trim()) {
                handleBarcodeScan(e.target.value.trim());
              }
            }}
          />
        </div>

        <div style={{
          display: "flex",
          justifyContent: "center",
          gap: "12px"
        }}>
          <button
            onClick={() => setShowBarcodeScanner(false)}
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
            onClick={() => {
              const input = document.querySelector('input[placeholder="Or enter barcode manually"]');
              if (input && input.value.trim()) {
                handleBarcodeScan(input.value.trim());
              }
            }}
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
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
