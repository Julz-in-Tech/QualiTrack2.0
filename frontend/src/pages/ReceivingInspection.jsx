import { useEffect } from "react";
import { useReceivingInspection } from "../hooks/useReceivingInspection";
import { ReceivingInspectionForm } from "../components/ReceivingInspectionForm";
import { ReceivingInspectionSummary } from "../components/ReceivingInspectionSummary";
import { ItemFormModal } from "../components/ItemFormModal";
import { BarcodeScannerModal } from "../components/BarcodeScannerModal";

export default function ReceivingInspection({ setCurrentPage }) {
  const {
    // State
    form,
    summary,
    isSubmitting,
    isLoading,
    message,
    showItemForm,
    currentItem,
    items,
    showBarcodeScanner,
    
    // Actions
    updateField,
    updateItemField,
    addItem,
    removeItem,
    editItem,
    handleBarcodeScan,
    handleSubmit,
    setShowItemForm,
    setShowBarcodeScanner,
    setMessage,
    setCurrentItem,
    
    // Utilities
    calculateFailureRate,
    getProductTrends,
    loadSummary,
    shouldRedirectToNCR
  } = useReceivingInspection();

  // Handle NCR redirect
  useEffect(() => {
    if (shouldRedirectToNCR) {
      const timer = setTimeout(() => {
        setCurrentPage("ncr");
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [shouldRedirectToNCR, setCurrentPage]);

  return (
    <section style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "30px"
      }}>
        <h1 style={{
          fontSize: "28px",
          fontWeight: "700",
          color: "#1f2937",
          margin: 0
        }}>
          Receiving Inspection
        </h1>
        <div style={{ display: "flex", gap: "15px" }}>
          <button
            onClick={() => setCurrentPage("incoming")}
            style={{
              padding: "8px 16px",
              background: "#6b7280",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px"
            }}
          >
            ← Incoming QC
          </button>
          <button
            onClick={() => setCurrentPage("internal")}
            style={{
              padding: "8px 16px",
              background: "#6b7280",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px"
            }}
          >
            Internal Inspection →
          </button>
          <button
            onClick={() => setCurrentPage("ncr")}
            style={{
              padding: "8px 16px",
              background: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px"
            }}
          >
            NCR Forms
          </button>
        </div>
      </div>

      {/* Message Display */}
      {message && (
        <div style={{
          padding: "12px 16px",
          margin: "0 0 20px 0",
          borderRadius: "6px",
          background: message.type === "success" ? "#d4edda" : "#f8d7da",
          border: `1px solid ${message.type === "success" ? "#c3e6cb" : "#f5c6cb"}`,
          color: message.type === "success" ? "#155724" : "#721c24"
        }}>
          {message.text}
        </div>
      )}

      {/* Main Content */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 300px",
        gap: "30px"
      }}>
        {/* Form Section */}
        <div>
          <ReceivingInspectionForm
            form={form}
            updateField={updateField}
            isSubmitting={isSubmitting}
            handleSubmit={handleSubmit}
            items={items}
            calculateFailureRate={calculateFailureRate}
            setShowItemForm={setShowItemForm}
          />
          
          {/* Item Form Modal */}
          <ItemFormModal
            showItemForm={showItemForm}
            setShowItemForm={setShowItemForm}
            currentItem={currentItem}
            updateItemField={updateItemField}
            addItem={addItem}
            showBarcodeScanner={showBarcodeScanner}
            setShowBarcodeScanner={setShowBarcodeScanner}
            setCurrentItem={setCurrentItem}
          />
          
          {/* Barcode Scanner Modal */}
          <BarcodeScannerModal
            showBarcodeScanner={showBarcodeScanner}
            setShowBarcodeScanner={setShowBarcodeScanner}
            handleBarcodeScan={handleBarcodeScan}
          />
        </div>

        {/* Summary Section */}
        <div>
          <ReceivingInspectionSummary
            summary={summary}
            isLoading={isLoading}
            getProductTrends={getProductTrends}
          />
        </div>
      </div>
    </section>
  );
}
