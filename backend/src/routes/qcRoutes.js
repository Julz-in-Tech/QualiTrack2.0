const { Router } = require("express");
const { createIncomingQC, getIncomingSummary } = require("../controllers/qcController");

const router = Router();

router.get("/incoming/summary", getIncomingSummary);
router.post("/incoming", createIncomingQC);

module.exports = router;
