const pool = require("../config/db");
const buildNcrNumber = require("../utils/buildNcrNumber");

let openAiClient = null;
let hasLoggedOpenAiWarning = false;

function getOpenAiClient() {
  const apiKey = process.env.OPENAI_API_KEY || process.env.MyAPIKey;

  if (!apiKey) {
    return null;
  }

  if (openAiClient) {
    return openAiClient;
  }

  try {
    const { OpenAI } = require("openai");

    openAiClient = new OpenAI({
      apiKey,
    });

    return openAiClient;
  } catch (error) {
    if (!hasLoggedOpenAiWarning) {
      console.warn(
        "OpenAI SDK is not installed. NCR AI suggestions are disabled until `npm install openai` is run.",
      );
      hasLoggedOpenAiWarning = true;
    }

    return null;
  }
}

function normalizePhotoUrls(photoUrls) {
  if (Array.isArray(photoUrls)) {
    return photoUrls.filter(Boolean);
  }

  return [];
}

function validateIncomingPayload(payload) {
  const errors = [];
  const qtyReceived = Number(payload.qtyReceived);
  const qtyPassed = Number(payload.qtyPassed);
  const qtyFailed = Number(payload.qtyFailed);

  if (!payload.poNumber || !payload.poNumber.trim()) {
    errors.push("PO number is required.");
  }

  if (!payload.partNumber || !payload.partNumber.trim()) {
    errors.push("Part number is required.");
  }

  if (!Number.isInteger(Number(payload.supplierId)) || Number(payload.supplierId) <= 0) {
    errors.push("Supplier ID must be a positive number.");
  }

  if (!Number.isInteger(Number(payload.inspectorId)) || Number(payload.inspectorId) <= 0) {
    errors.push("Inspector ID must be a positive number.");
  }

  if (![qtyReceived, qtyPassed, qtyFailed].every(Number.isFinite)) {
    errors.push("Quantities must be numeric.");
  }

  if (qtyReceived < 0 || qtyPassed < 0 || qtyFailed < 0) {
    errors.push("Quantities cannot be negative.");
  }

  if (qtyPassed + qtyFailed > qtyReceived) {
    errors.push("Passed and failed quantities cannot exceed the received quantity.");
  }

  return errors;
}

async function getAiSuggestedRootCause(partNumber, comments) {
  if (!comments) {
    return null;
  }

  const openai = getOpenAiClient();

  if (!openai) {
    return null;
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a quality engineering assistant. Based on inspection comments, provide a concise, technical suggestion for the root cause of the defect." },
        { role: "user", content: `Part: ${partNumber}. Comments: ${comments}` }
      ],
      max_tokens: 100,
    });
    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return null;
  }
}

async function createIncomingQC(req, res, next) {
  const payload = {
    poNumber: req.body.poNumber,
    supplierId: req.body.supplierId,
    partNumber: req.body.partNumber,
    qtyReceived: req.body.qtyReceived,
    qtyPassed: req.body.qtyPassed,
    qtyFailed: req.body.qtyFailed,
    inspectorId: req.body.inspectorId,
    comments: req.body.comments || "",
    photoUrls: normalizePhotoUrls(req.body.photoUrls),
  };

  const errors = validateIncomingPayload(payload);

  if (errors.length > 0) {
    return res.status(400).json({ message: "Validation failed.", errors });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const qcInsert = await client.query(
      `
        INSERT INTO incoming_qc (
          po_number,
          supplier_id,
          part_number,
          qty_received,
          qty_passed,
          qty_failed,
          inspector_id,
          comments,
          photo_urls,
          status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `,
      [
        payload.poNumber.trim(),
        Number(payload.supplierId),
        payload.partNumber.trim(),
        Number(payload.qtyReceived),
        Number(payload.qtyPassed),
        Number(payload.qtyFailed),
        Number(payload.inspectorId),
        payload.comments.trim(),
        payload.photoUrls,
        Number(payload.qtyFailed) > 0 ? "Rejected" : "Accepted",
      ],
    );

    let createdNcr = null;

    if (Number(payload.qtyFailed) > 0) {
      const ncrNumber = buildNcrNumber(qcInsert.rows[0].id);
      
      // Use the API to generate a professional NCR description
      const aiSuggestion = await getAiSuggestedRootCause(payload.partNumber, payload.comments);
      const ncrDescription = aiSuggestion || `${payload.qtyFailed} item(s) failed inspection for PO ${payload.poNumber.trim()}.`;

      const ncrInsert = await client.query(
        `
          INSERT INTO ncrs (
            ncr_number,
            type,
            linked_module,
            linked_record_id,
            description,
            status
          )
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING *
        `,
        [
          ncrNumber,
          "Supplier",
          "incoming_qc",
          qcInsert.rows[0].id,
          ncrDescription,
          "Open",
        ],
      );

      createdNcr = ncrInsert.rows[0];
    }

    await client.query("COMMIT");

    return res.status(201).json({
      message: "Incoming QC record created successfully.",
      data: {
        inspection: qcInsert.rows[0],
        ncr: createdNcr,
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");

    if (error.code === "23503") {
      return res.status(400).json({
        message: "Supplier, part, or inspector could not be found. Load master data first.",
      });
    }

    return next(error);
  } finally {
    client.release();
  }
}

async function getIncomingSummary(_req, res, next) {
  try {
    const [statsResult, recentResult] = await Promise.all([
      pool.query(
        `
          SELECT
            COUNT(*)::INT AS total_inspections,
            COALESCE(SUM(qty_received), 0)::INT AS total_received,
            COALESCE(SUM(qty_failed), 0)::INT AS total_failed,
            COALESCE(SUM(CASE WHEN status = 'Accepted' THEN 1 ELSE 0 END), 0)::INT AS accepted_count
          FROM incoming_qc
        `,
      ),
      pool.query(
        `
          SELECT
            iq.id,
            iq.po_number,
            iq.part_number,
            iq.qty_received,
            iq.qty_failed,
            iq.status,
            iq.created_at,
            s.name AS supplier_name,
            u.full_name AS inspector_name
          FROM incoming_qc iq
          INNER JOIN suppliers s ON s.id = iq.supplier_id
          INNER JOIN users u ON u.id = iq.inspector_id
          ORDER BY iq.created_at DESC
          LIMIT 5
        `,
      ),
    ]);

    return res.json({
      stats: statsResult.rows[0],
      recentInspections: recentResult.rows,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createIncomingQC,
  getIncomingSummary,
};
