function buildNcrNumber(linkedRecordId) {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const day = String(now.getUTCDate()).padStart(2, "0");
  const suffix = String(linkedRecordId).padStart(4, "0");

  return `NCR-${year}${month}${day}-${suffix}`;
}

module.exports = buildNcrNumber;
