INSERT INTO users (full_name, email, password_hash, role)
VALUES
    (
        'System Admin',
        'admin@qualitrack.local',
        'quali_admin_salt:e7bb37ffe1c4e54bfc60ff20ddf9fee6542efdb0afea742b5bc87a4bcc97f71de2ec168b7fb99d36f4d93bcabcc3943d77f9bf1408adea1b037e5f39bf14f05a',
        'Admin'
    ),
    (
        'Quality Inspector',
        'inspector@qualitrack.local',
        'quali_inspector_salt:de9563339015a1725fcdb57c59a0945174c1efded9f74726bc30c171b0da61b12147d8408628e17feceda0e4f949b5bc0637275315b84645c68422789afc9519',
        'QC'
    )
ON CONFLICT (email) DO NOTHING;

INSERT INTO suppliers (name, contact_name, contact_email, contact_phone)
VALUES
    ('Precision Components Ltd', 'A. Ncube', 'supply@precision-components.com', '+27 11 555 0199'),
    ('Northline Electronics', 'M. Khumalo', 'orders@northline-electronics.com', '+27 10 555 0123')
ON CONFLICT DO NOTHING;

INSERT INTO parts (part_number, description, unit_of_measure)
VALUES
    ('PCB-CTRL-001', 'Main controller PCB', 'pcs'),
    ('CAB-ASSY-004', 'Power cable assembly', 'pcs')
ON CONFLICT (part_number) DO NOTHING;
