# Architecture Notes

## Traceability Strategy

QualiTrack uses operational identifiers to connect records across modules:

- `po_number` links supplier deliveries to incoming inspection.
- `part_number` connects inspection outcomes to inventory and future production usage.
- `sales_order` and `serial_number` will be introduced in later modules for end-to-end product traceability.

## Current MVP Boundary

The first usable slice of the system includes:

- Users
- Suppliers
- Parts
- Incoming QC
- NCRs

This keeps the MVP small enough to build while preserving the enterprise traceability model.

## Backend Design

- Express handles the API layer.
- PostgreSQL enforces relationships and quantity rules.
- Transactions ensure QC and NCR records stay consistent.

## Frontend Design

- React powers the data-entry UI.
- The current app is centered around an Incoming QC command screen.
- The UI is structured so dashboards and additional modules can be added without rewriting the shell.
