import { useState, useEffect } from "react";
import { fetchIncomingSummary, createIncomingQC } from "../services/api";
import { INITIAL_FORM, INITIAL_ITEM, VALIDATION_MESSAGES } from "../constants/forms";
import { generateIncidentNumber, formatDate } from "../utils/formatters";

export function useReceivingInspection() {
  const [form, setForm] = useState(INITIAL_FORM);
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
  const [currentItem, setCurrentItem] = useState(INITIAL_ITEM);
  const [items, setItems] = useState([]);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [shouldRedirectToNCR, setShouldRedirectToNCR] = useState(false);

  // Load summary data
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

  // Form field updates
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
        qtyGood: Math.max(0, parseInt(current.qtyReceived) - parseInt(value)).toString(),
      }),
      ...(name === "qtyGood" && {
        qtyBad: Math.max(0, parseInt(current.qtyReceived) - parseInt(value)).toString(),
      }),
    }));
  }

  // Item management
  function addItem() {
    // Validation for required fields
    if (!currentItem.partNumber || currentItem.partNumber.trim() === "") {
      setMessage({
        type: "error",
        text: VALIDATION_MESSAGES.partNumberRequired,
      });
      return;
    }
    
    if (!currentItem.qtyReceived || currentItem.qtyReceived.trim() === "") {
      setMessage({
        type: "error",
        text: VALIDATION_MESSAGES.qtyReceivedRequired,
      });
      return;
    }
    
    const newItem = {
      ...currentItem,
      id: currentItem.id || Date.now(), // Keep existing ID if editing
      inspectionType: "receiving",
      inspectionDate: new Date().toISOString(),
    };
    
    if (currentItem.id) {
      // Update existing item
      setItems(items.map(item => item.id === currentItem.id ? newItem : item));
    } else {
      // Add new item
      setItems([...items, newItem]);
    }
    
    setCurrentItem(INITIAL_ITEM);
    setShowItemForm(false);
    
    // Update form totals
    const newItems = currentItem.id ? items.map(item => item.id === currentItem.id ? newItem : item) : [...items, newItem];
    const totalReceived = newItems.reduce((sum, item) => sum + (parseInt(item.qtyReceived) || 0), 0);
    const totalGood = newItems.reduce((sum, item) => sum + (parseInt(item.qtyGood) || 0), 0);
    const totalBad = newItems.reduce((sum, item) => sum + (parseInt(item.qtyBad) || 0), 0);
    
    setForm(prev => ({
      ...prev,
      qtyReceived: totalReceived.toString(),
      qtyPassed: totalGood.toString(),
      qtyFailed: totalBad.toString(),
    }));
  }

  function removeItem(itemId) {
    const updatedItems = items.filter(item => item.id !== itemId);
    setItems(updatedItems);
    
    // Recalculate totals
    const totalReceived = updatedItems.reduce((sum, item) => sum + (parseInt(item.qtyReceived) || 0), 0);
    const totalGood = updatedItems.reduce((sum, item) => sum + (parseInt(item.qtyGood) || 0), 0);
    const totalBad = updatedItems.reduce((sum, item) => sum + (parseInt(item.qtyBad) || 0), 0);
    
    setForm(prev => ({
      ...prev,
      qtyReceived: totalReceived.toString(),
      qtyPassed: totalGood.toString(),
      qtyFailed: totalBad.toString(),
    }));
  }

  function editItem(item) {
    setCurrentItem(item);
    setShowItemForm(true);
  }

  // Barcode scanning
  function handleBarcodeScan(barcode) {
    setCurrentItem(prev => ({
      ...prev,
      barcode
    }));
    setShowBarcodeScanner(false);
  }

  // Form submission
  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const qcData = {
        ...form,
        items: items,
        inspectionType: "receiving",
        inspectionDate: new Date().toISOString(),
      };

      const data = await createIncomingQC(qcData);

      // Check for failed items and navigate to NCR form
      const failedItems = items.filter(item => parseInt(item.qtyBad) > 0);
      
      if (failedItems.length > 0) {
        // Prepare pre-filled NCR data for the first failed item
        const failedItem = failedItems[0];
        const ncrData = {
          incidentType: "SUPPLIER",
          recipientCompanyName: `Supplier ${form.supplierId}`,
          incidentDate: form.deliveryDate || new Date().toISOString().split('T')[0],
          incidentNumber: generateIncidentNumber(),
          orderReference: form.poNumber,
          initiatorReporter: "Current User",
          initiatorCompanyName: "QualiTrack Company",
          affectedDepartment: "PRODUCTION",
          reportDate: new Date().toISOString().split('T')[0],
          productNumber: failedItem.partNumber,
          productDescription: failedItem.description,
          partNumber: failedItem.partNumber,
          partDescription: failedItem.description,
          serialUidBatch: failedItem.serialNumbers,
          affectedQuantity: failedItem.qtyBad,
          nonConformanceDescription: `Item ${failedItem.partNumber} failed receiving inspection. ${failedItem.qtyBad} out of ${failedItem.qtyReceived} units were rejected.`,
          desiredOutcome: "Replace failed items with conforming products",
          rootCauseAnalysis: "Receiving inspection revealed non-conformance to specifications",
          correctivePreventiveActions: "Return failed items to supplier and implement additional quality checks"
        };

        // Store NCR data in localStorage for pre-filling the form
        localStorage.setItem('qualitrack_ncr_prefill', JSON.stringify(ncrData));
        
        // Show success message and navigate to NCR form
        setMessage({
          type: "success",
          text: `Receiving inspection saved successfully. Overall failure rate: ${calculateFailureRate()}%. Redirecting to NCR form for failed items...`,
        });

        // Set redirect flag
        setShouldRedirectToNCR(true);
        
        return; // Don't reset form yet, let user complete NCR first
      }

      setMessage({
        type: "success",
        text: `Receiving inspection saved successfully. Overall failure rate: ${calculateFailureRate()}%.`,
      });

      // Reset form
      setForm(INITIAL_FORM);
      setItems([]);
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

  // Utility functions
  function calculateFailureRate() {
    const totalInspections = items.length;
    const failedItems = items.filter(item => parseInt(item.qtyBad) > 0).length;
    return totalInspections > 0 ? ((failedItems / totalInspections) * 100).toFixed(2) : 0;
  }

  function getProductTrends() {
    const productCounts = {};
    items.forEach(item => {
      const partNumber = item.partNumber || 'Unknown';
      productCounts[partNumber] = (productCounts[partNumber] || 0) + 1;
    });
    return Object.entries(productCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
  }

  return {
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
  };
}
