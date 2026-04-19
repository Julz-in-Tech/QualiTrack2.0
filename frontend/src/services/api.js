// Detect if we're in production (Vercel) vs development
const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
const API_BASE_URL = isProduction ? null : (window.__QUALITRACK_CONFIG__?.apiUrl || "http://127.0.0.1:5000/api");

async function readResponse(response) {
  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await response.json() : null;

  if (!response.ok) {
    const message =
      data?.errors?.join(" ") ||
      data?.message ||
      "The request failed. Please check the backend service.";
    throw new Error(message);
  }

  return data;
}

async function request(path, options) {
  // In production, return mock data since backend isn't deployed
  if (isProduction) {
    return getMockData(path, options);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, options);
    return readResponse(response);
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(`Cannot reach the backend at ${API_BASE_URL}. Make sure the API server is running.`);
    }

    throw error;
  }
}

function getMockData(path, options = {}) {
  // Mock data for production when backend isn't available
  if (path === "/qc/incoming/summary") {
    // Get stored inspections from localStorage
    const inspections = JSON.parse(localStorage.getItem('qualitrack_inspections') || '[]');
    
    // Debug: Log what we found
    console.log('LocalStorage inspections found:', inspections.length, inspections);
    
    // Calculate stats from stored inspections
    const stats = inspections.reduce((acc, inspection) => {
      acc.total_inspections += 1;
      
      // Calculate totals from individual items
      if (inspection.items && Array.isArray(inspection.items)) {
        inspection.items.forEach(item => {
          acc.total_received += parseInt(item.qtyReceived) || 0;
          acc.total_failed += parseInt(item.qtyBad) || 0;
        });
      }
      
      // Count inspections with any passed items
      const hasPassedItems = inspection.items && inspection.items.some(item => parseInt(item.qtyGood) > 0);
      acc.accepted_count += hasPassedItems ? 1 : 0;
      
      return acc;
    }, {
      total_inspections: 0,
      total_received: 0,
      total_failed: 0,
      accepted_count: 0,
    });

    console.log('Calculated stats:', stats);

    return {
      stats,
      recentInspections: inspections.slice(-10).reverse() // Last 10 inspections, newest first
    };
  }
  
  if (path === "/qc/incoming" && options.method === 'POST') {
    // Parse the request body to get form data
    const formData = JSON.parse(options.body || '{}');
    
    console.log('POST data received:', formData);
    
    // Create new inspection record with complete data
    const newInspection = {
      id: Date.now(),
      po_number: formData.poNumber || "Unknown PO",
      part_number: formData.partNumber || "Unknown Part",
      qtyReceived: formData.qtyReceived || 0,
      qtyPassed: formData.qtyPassed || 0,
      qtyFailed: formData.qtyFailed || 0,
      inspector_name: "Current User", // Would normally come from auth context
      created_at: new Date().toISOString(),
      status: "completed",
      // Store complete item data with barcodes and details
      items: formData.items || [],
      // Store additional fields for traceability
      supplierId: formData.supplierId,
      inspectorId: formData.inspectorId,
      barcode: formData.barcode,
      comments: formData.comments,
      deliveryDate: formData.deliveryDate,
      overallFailureRate: formData.overallFailureRate,
      productTrends: formData.productTrends
    };
    
    console.log('New inspection created:', newInspection);
    
    // Get existing inspections and add new one
    const inspections = JSON.parse(localStorage.getItem('qualitrack_inspections') || '[]');
    console.log('Existing inspections count:', inspections.length);
    inspections.push(newInspection);
    localStorage.setItem('qualitrack_inspections', JSON.stringify(inspections));
    
    // Verify it was saved
    const saved = JSON.parse(localStorage.getItem('qualitrack_inspections') || '[]');
    console.log('Total inspections after save:', saved.length);
    
    return {
      data: {
        id: newInspection.id,
        status: "created",
        message: "Inspection saved successfully with no NCR required.",
        ncr: null
      }
    };
  }

  // Handle receiving inspection endpoints
  if (path === "/qc/receiving/summary") {
    const inspections = JSON.parse(localStorage.getItem('qualitrack_inspections') || '[]');
    console.log('Receiving: Total inspections in storage:', inspections.length);
    
    const receivingInspections = inspections.filter(inspection => 
      inspection.items && inspection.items.some(item => item.inspectionType === "receiving")
    );
    
    console.log('Receiving: Filtered receiving inspections:', receivingInspections.length);
    
    const stats = receivingInspections.reduce((acc, inspection) => {
      acc.total_inspections += 1;
      
      // Calculate totals from individual items
      if (inspection.items && Array.isArray(inspection.items)) {
        inspection.items.forEach(item => {
          acc.total_received += parseInt(item.qtyReceived) || 0;
          acc.total_failed += parseInt(item.qtyBad) || 0;
        });
      }
      
      // Count inspections with any passed items
      const hasPassedItems = inspection.items && inspection.items.some(item => parseInt(item.qtyGood) > 0);
      acc.accepted_count += hasPassedItems ? 1 : 0;
      
      return acc;
    }, {
      total_inspections: 0,
      total_received: 0,
      total_failed: 0,
      accepted_count: 0,
    });

    console.log('Receiving: Calculated stats:', stats);

    return {
      stats,
      recentInspections: receivingInspections.slice(-10).reverse()
    };
  }
  
  if (path === "/qc/receiving" && options.method === 'POST') {
    const formData = JSON.parse(options.body || '{}');
    console.log('Receiving POST data received:', formData);
    
    const newInspection = {
      id: Date.now(),
      po_number: formData.poNumber || "Unknown PO",
      part_number: formData.partNumber || "Unknown Part",
      qtyReceived: formData.qtyReceived || 0,
      qtyPassed: formData.qtyPassed || 0,
      qtyFailed: formData.qtyFailed || 0,
      inspector_name: "Current User",
      created_at: new Date().toISOString(),
      status: "completed",
      items: formData.items || [],
      supplierId: formData.supplierId,
      inspectorId: formData.inspectorId,
      barcode: formData.barcode,
      comments: formData.comments,
      deliveryDate: formData.deliveryDate,
      overallFailureRate: formData.overallFailureRate,
      productTrends: formData.productTrends
    };
    
    console.log('Receiving: New inspection created:', newInspection);
    
    const inspections = JSON.parse(localStorage.getItem('qualitrack_inspections') || '[]');
    console.log('Receiving: Existing inspections count:', inspections.length);
    inspections.push(newInspection);
    localStorage.setItem('qualitrack_inspections', JSON.stringify(inspections));
    
    const saved = JSON.parse(localStorage.getItem('qualitrack_inspections') || '[]');
    console.log('Receiving: Total inspections after save:', saved.length);
    
    return { data: { id: newInspection.id, status: "created" } };
  }
  
  // Handle internal inspection endpoints
  if (path === "/qc/internal/summary") {
    const inspections = JSON.parse(localStorage.getItem('qualitrack_inspections') || '[]');
    console.log('Internal: Total inspections in storage:', inspections.length);
    
    const internalInspections = inspections.filter(inspection => 
      inspection.items && inspection.items.some(item => item.inspectionType === "internal")
    );
    
    console.log('Internal: Filtered internal inspections:', internalInspections.length);
    
    const stats = internalInspections.reduce((acc, inspection) => {
      acc.total_inspections += 1;
      
      // Calculate totals from individual items
      if (inspection.items && Array.isArray(inspection.items)) {
        inspection.items.forEach(item => {
          acc.total_received += parseInt(item.qtyReceived) || 0;
          acc.total_failed += parseInt(item.qtyBad) || 0;
        });
      }
      
      // Count inspections with any passed items
      const hasPassedItems = inspection.items && inspection.items.some(item => parseInt(item.qtyGood) > 0);
      acc.accepted_count += hasPassedItems ? 1 : 0;
      
      return acc;
    }, {
      total_inspections: 0,
      total_received: 0,
      total_failed: 0,
      accepted_count: 0,
    });

    console.log('Internal: Calculated stats:', stats);

    return {
      stats,
      recentInspections: internalInspections.slice(-10).reverse()
    };
  }
  
  if (path === "/qc/internal" && options.method === 'POST') {
    const formData = JSON.parse(options.body || '{}');
    console.log('Internal POST data received:', formData);
    
    const newInspection = {
      id: Date.now(),
      po_number: formData.poNumber || "Unknown PO",
      part_number: formData.partNumber || "Unknown Part",
      testType: formData.testType || "Unknown Test",
      inspector_name: "Current User",
      created_at: new Date().toISOString(),
      status: "completed",
      items: formData.items || [],
      linkedToReceiving: formData.linkedToReceiving || false,
      receivingInspectionId: formData.receivingInspectionId,
      overallFailureRate: formData.overallFailureRate
    };
    
    console.log('Internal: New inspection created:', newInspection);
    
    const inspections = JSON.parse(localStorage.getItem('qualitrack_inspections') || '[]');
    console.log('Internal: Existing inspections count:', inspections.length);
    inspections.push(newInspection);
    localStorage.setItem('qualitrack_inspections', JSON.stringify(inspections));
    
    const saved = JSON.parse(localStorage.getItem('qualitrack_inspections') || '[]');
    console.log('Internal: Total inspections after save:', saved.length);
    
    return { data: { id: newInspection.id, status: "created" } };
  }

  return null;
}

export async function fetchIncomingSummary() {
  return request("/qc/incoming/summary");
}

export async function createIncomingQC(payload) {
  return request("/qc/incoming", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export async function fetchReceivingSummary() {
  return request("/qc/receiving/summary");
}

export async function createReceivingQC(payload) {
  return request("/qc/receiving", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export async function fetchInternalSummary() {
  return request("/qc/internal/summary");
}

export async function createInternalQC(payload) {
  return request("/qc/internal", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}
