CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(30) NOT NULL CHECK (
        role IN ('Procurement', 'QC', 'Production', 'Technician', 'QA', 'Dispatch', 'Admin')
    ),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS suppliers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(160) NOT NULL,
    contact_name VARCHAR(120),
    contact_email VARCHAR(120),
    contact_phone VARCHAR(40),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(160) NOT NULL,
    contact_name VARCHAR(120),
    contact_email VARCHAR(120),
    contact_phone VARCHAR(40),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS parts (
    part_number VARCHAR(60) PRIMARY KEY,
    description TEXT NOT NULL,
    unit_of_measure VARCHAR(20) NOT NULL DEFAULT 'pcs',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS incoming_qc (
    id SERIAL PRIMARY KEY,
    po_number VARCHAR(60) NOT NULL,
    supplier_id INT NOT NULL REFERENCES suppliers(id),
    part_number VARCHAR(60) NOT NULL REFERENCES parts(part_number),
    qty_received INT NOT NULL CHECK (qty_received >= 0),
    qty_passed INT NOT NULL CHECK (qty_passed >= 0),
    qty_failed INT NOT NULL CHECK (qty_failed >= 0),
    inspector_id INT NOT NULL REFERENCES users(id),
    comments TEXT,
    photo_urls TEXT[] NOT NULL DEFAULT '{}',
    status VARCHAR(20) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Accepted', 'Rejected', 'On Hold')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT incoming_qc_qty_check CHECK (qty_passed + qty_failed <= qty_received)
);

CREATE TABLE IF NOT EXISTS ncrs (
    id SERIAL PRIMARY KEY,
    ncr_number VARCHAR(40) UNIQUE NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('Supplier', 'Internal', 'Customer')),
    linked_module VARCHAR(30) NOT NULL,
    linked_record_id INT NOT NULL,
    description TEXT NOT NULL,
    root_cause TEXT,
    action_taken TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'In Review', 'Closed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_incoming_qc_po_number ON incoming_qc(po_number);
CREATE INDEX IF NOT EXISTS idx_incoming_qc_part_number ON incoming_qc(part_number);
CREATE INDEX IF NOT EXISTS idx_ncrs_linked_record ON ncrs(linked_module, linked_record_id);
