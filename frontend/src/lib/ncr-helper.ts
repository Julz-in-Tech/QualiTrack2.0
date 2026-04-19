import { type InspectionItem, type NcrPrefill } from "./receiving-types";

export function buildNcrPrefill(item: InspectionItem, form: { supplierId: string; poNumber: string; deliveryDate: string }): NcrPrefill {
  const ordered = parseInt(item.qtyOrdered, 10) || 0;
  const received = parseInt(item.qtyReceived, 10) || 0;
  const bad = parseInt(item.qtyBad, 10) || 0;
  const missing = Math.max(0, ordered - received);

  let issueType = "";
  let description = "";
  if (bad > 0 && missing > 0) {
    issueType = "Defective and missing items";
    description = `Item ${item.partNumber}: ${bad} of ${received} units rejected, and ${missing} units missing from delivery (ordered ${ordered}, received ${received}).`;
  } else if (bad > 0) {
    issueType = "Defective items";
    description = `Item ${item.partNumber} failed receiving inspection. ${bad} out of ${received} units were rejected.`;
  } else {
    issueType = "Missing items";
    description = `Item ${item.partNumber}: ${missing} units missing from delivery (ordered ${ordered}, received ${received}).`;
  }

  return {
    incidentType: "SUPPLIER",
    recipientCompanyName: `Supplier ${form.supplierId}`,
    incidentDate: form.deliveryDate || new Date().toISOString().split("T")[0],
    incidentNumber: `ME-SCF-${Math.floor(Math.random() * 10000).toString().padStart(4, "0")}`,
    orderReference: form.poNumber,
    initiatorReporter: "Current User",
    initiatorCompanyName: "QualiTrack Company",
    affectedDepartment: "PRODUCTION",
    reportDate: new Date().toISOString().split("T")[0],
    productNumber: item.partNumber,
    productDescription: item.description,
    partNumber: item.partNumber,
    partDescription: item.description,
    serialUidBatch: item.serialNumbers,
    affectedQuantity: (bad + missing).toString(),
    nonConformanceDescription: description,
    desiredOutcome: missing > 0
      ? "Ship missing units and replace defective items with conforming products"
      : "Replace failed items with conforming products",
    rootCauseAnalysis: `${issueType} detected during receiving inspection`,
    correctivePreventiveActions:
      "Notify supplier, return/replace non-conforming items, and reinforce incoming quality checks",
  };
}
