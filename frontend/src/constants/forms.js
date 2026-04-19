/**
 * Constants for form initial states and validation rules
 */

export const INITIAL_FORM = {
  poNumber: "",
  supplierId: "1",
  deliveryDate: "",
  inspectorId: "2",
  comments: "",
  items: []
};

export const INITIAL_ITEM = {
  partNumber: "",
  description: "",
  barcode: "",
  qtyOrdered: "",
  qtyReceived: "",
  qtyGood: "",
  qtyBad: "",
  serialNumbers: "",
  location: "",
  batchNumber: "",
  expiryDate: ""
};

export const REQUIRED_FIELDS = {
  form: ['poNumber', 'supplierId', 'deliveryDate', 'inspectorId'],
  item: ['partNumber', 'qtyReceived']
};

export const VALIDATION_MESSAGES = {
  partNumberRequired: "Part number is required",
  qtyReceivedRequired: "Quantity received is required"
};
