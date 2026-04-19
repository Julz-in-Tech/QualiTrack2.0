export type InspectionItem = {
  id: number;
  partNumber: string;
  description: string;
  barcode: string;
  qtyOrdered: string;
  qtyReceived: string;
  qtyGood: string;
  qtyBad: string;
  serialNumbers: string;
  location: string;
  batchNumber: string;
  expiryDate: string;
};

export type InspectionForm = {
  poNumber: string;
  supplierId: string;
  deliveryDate: string;
  inspectorId: string;
  comments: string;
};

export type NcrPrefill = {
  incidentType: string;
  recipientCompanyName: string;
  incidentDate: string;
  incidentNumber: string;
  orderReference: string;
  initiatorReporter: string;
  initiatorCompanyName: string;
  affectedDepartment: string;
  reportDate: string;
  productNumber: string;
  productDescription: string;
  partNumber: string;
  partDescription: string;
  serialUidBatch: string;
  affectedQuantity: string;
  nonConformanceDescription: string;
  desiredOutcome: string;
  rootCauseAnalysis: string;
  correctivePreventiveActions: string;
};

export const emptyItem: Omit<InspectionItem, "id"> = {
  partNumber: "", description: "", barcode: "", qtyOrdered: "",
  qtyReceived: "", qtyGood: "", qtyBad: "", serialNumbers: "",
  location: "", batchNumber: "", expiryDate: "",
};
