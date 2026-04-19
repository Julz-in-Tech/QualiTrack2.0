/**
 * Utility functions for formatting data
 */

export function formatStatus(status) {
  return status.toLowerCase().replace(/\s+/g, "-");
}

export function formatDate(value) {
  if (!value) {
    return "Just now";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat("en-ZA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function generateIncidentNumber() {
  return `ME-SCF-${Math.floor(Math.random() * 10000).toString().padStart(4, "0")}`;
}
