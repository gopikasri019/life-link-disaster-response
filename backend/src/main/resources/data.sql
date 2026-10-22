-- LIFE-LINK Disaster Response Seed Data (Tamil Nadu Coastal Command)

INSERT IGNORE INTO users (id, name, email, role, district, phone, organization) VALUES
('USR-001', 'Dr. S. Ramanathan, IAS', 'commissioner.dm@tn.gov.in', 'ADMIN', 'Chennai', '+91 94440 12345', 'Tamil Nadu State Disaster Management Authority (TNSDMA)'),
('USR-002', 'Kavitha Anbarasan', 'kavitha.cuddalore@citizen.org', 'CITIZEN', 'Cuddalore', '+91 98410 99881', 'Citizen Public'),
('USR-003', 'Dr. M. Soundararajan, MS', 'medsupt.rgggh@tn.gov.in', 'HOSPITAL', 'Chennai', '+91 94441 23456', 'Rajiv Gandhi Government General Hospital (RGGGH)'),
('USR-004', 'J. Victor Das', 'fieldcoord@redcross-tn.org', 'NGO', 'Nagapattinam', '+91 97890 55443', 'Indian Red Cross Society'),
('USR-005', 'Aravind K., B.Tech (ADS)', 'aravind.volunteer@eec.edu.in', 'VOLUNTEER', 'Chennai', '+91 91760 33221', 'Easwari Engineering College Volunteer Taskforce');

INSERT IGNORE INTO incidents (id, title, description, category, severity, district, location, latitude, longitude, reported_at, affected_population, status, assigned_team, food_packets, water_liters, medical_kits, rescue_boats, shelter_tents, ambulances) VALUES
('INC-TN-2026-081', 'Adyar River Basin Inundation & Storm Surge Alert', 'Excess discharge of 14,000 cusecs from Chembarambakkam, inundating low ground in Saidapet & Jafferkhanpet.', 'Flood', 'Critical', 'Chennai', 'Saidapet & Jafferkhanpet Low Ground', 13.015800, 80.221200, '2026-10-14 18:30', 14200, 'Response Underway', 'NDRF 04 Battalion & TN Fire Unit', 6000, 15000, 450, 14, 80, 6),
('INC-TN-2026-082', 'Gadilam River Flash Inundation & Embankment Breach', 'Embankment breach along Gadilam river inundating hamlets in Devanampattinam.', 'Heavy rainfall', 'High', 'Cuddalore', 'Devanampattinam Coastal Ward 12', 11.754400, 79.768100, '2026-10-14 19:45', 8500, 'Active', 'Cuddalore Fishermen Rescue Taskforce', 4500, 9000, 220, 18, 60, 4),
('INC-TN-2026-083', 'Bay of Bengal Deep Depression Cyclonic Wind Shear', 'Squally winds reaching 85 kmph with intense coastal storm swell in Velankanni & Vedaranyam.', 'Cyclone', 'High', 'Nagapattinam', 'Velankanni Coastal Line & Vedaranyam Coast', 10.682800, 79.849400, '2026-10-14 16:15', 11800, 'Response Underway', 'Coast Guard Unit Karaikal & Nagapattinam SDRF', 5000, 12000, 300, 10, 120, 5);

INSERT IGNORE INTO sos_requests (id, tracking_code, emergency_category, description, citizen_name, contact_phone, district, location, latitude, longitude, people_affected, injured_count, medical_requirements, special_needs, priority, status, reported_at, assigned_unit) VALUES
('SOS-2026-901', 'LL-SOS-7892-A', 'Trapped on Rooftop / Rapid Inundation', 'Water level reached 6.5ft on ground floor. 3 senior citizens and 1 pregnant mother trapped on terrace.', 'M. Senthilkumar', '+91 94448 87123', 'Chennai', 'Door 14, 2nd Main Road, River View Colony, Jafferkhanpet', 13.023200, 80.208900, 7, 1, 'Insulin supply and pregnancy kit', 'Elderly stretcher required', 'Life-Threatening', 'Rescue In Progress', '2026-10-14 20:10', 'NDRF Boat Unit 4'),
('SOS-2026-902', 'LL-SOS-8831-C', 'Medical Emergency / Oxygen Shortage', 'Elderly patient with chronic respiratory failure running on battery inverter oxygen with 30 mins left.', 'P. Anandhavalli', '+91 98402 11993', 'Cuddalore', 'Subhash Chandra Bose Street, Devanampattinam', 11.758800, 79.771200, 4, 1, 'Cylinder Oxygen O2 regulator immediately', 'Wheelchair bound COPD patient', 'Life-Threatening', 'Assigned', '2026-10-14 20:45', '108 Marine Emergency Ambulance - Cuddalore');

INSERT IGNORE INTO depots (id, name, district, location, contact_person, contact_phone, latitude, longitude) VALUES
('DEP-TN-CHE-01', 'State Central Relief Supply Depot - Chennai Central', 'Chennai', 'Koyambedu Wholesale Complex Warehouse 4, Chennai', 'Thiru R. Jagadeesan, Joint Director', '+91 94450 71001', 13.069400, 80.194800),
('DEP-TN-CUD-02', 'District Disaster Supply Warehouse - Cuddalore', 'Cuddalore', 'District Collectorate Campus, Cuddalore Port Road', 'Selvi Anitha, Tahsildar (Disaster)', '+91 94450 72004', 11.748000, 79.771400),
('DEP-TN-NAG-03', 'Coastal Logistics & Relief Center - Nagapattinam', 'Nagapattinam', 'Nagapattinam Fishing Harbour Road, Port Trust Area', 'Thiru S. Balakrishnan, DRO', '+91 94450 73008', 10.765600, 79.843600);

INSERT IGNORE INTO inventory_items (id, depot_id, name, category, quantity, unit, reorder_threshold, last_updated) VALUES
('INV-101', 'DEP-TN-CHE-01', 'Ready-to-Eat Food Packets (Chapati/Pongal Meal)', 'Food & Nutrition', 28400, 'Packets', 10000, '2026-10-14 20:00'),
('INV-102', 'DEP-TN-CHE-01', 'Packaged Mineral Water (1L Bottled)', 'Clean Water', 54000, 'Liters', 20000, '2026-10-14 20:15'),
('INV-103', 'DEP-TN-CHE-01', 'Comprehensive Trauma & First Aid Kit', 'Medical', 1850, 'Kits', 500, '2026-10-14 19:30'),
('INV-104', 'DEP-TN-CHE-01', 'Rigid Inflatable Motorized Rescue Boats (with 40HP OBM)', 'Rescue Equipment', 32, 'Units', 10, '2026-10-14 18:40'),
('INV-201', 'DEP-TN-CUD-02', 'Ready-to-Eat Food Packets (Chapati/Pongal Meal)', 'Food & Nutrition', 6200, 'Packets', 8000, '2026-10-14 19:50'),
('INV-202', 'DEP-TN-CUD-02', 'Packaged Mineral Water (1L Bottled)', 'Clean Water', 14200, 'Liters', 15000, '2026-10-14 19:55');

INSERT IGNORE INTO hospitals (id, name, district, location, contact_phone, total_beds, available_beds, icu_total, icu_available, emergency_facilities, ambulance_available, medical_supplies_status, last_updated, latitude, longitude) VALUES
('HOS-CHE-01', 'Rajiv Gandhi Government General Hospital (RGGGH)', 'Chennai', 'EVR Periyar Salai, Park Town, Chennai', '+91 44 2530 5000', 2800, 412, 250, 28, '["Level 1 Trauma Center", "Hyperbaric Decompression Chamber", "Advanced Dialysis"]', 14, 'Adequate', '2026-10-14 20:30', 13.081800, 80.277400),
('HOS-CUD-03', 'Cuddalore Government District Headquarter Hospital', 'Cuddalore', 'Hospital Road, Cuddalore Port', '+91 4142 230 450', 650, 72, 45, 4, '["Emergency Resuscitation Unit", "Maternal Emergency", "Snakebite Antivenom"]', 4, 'Limited', '2026-10-14 20:45', 11.751200, 79.764500);

INSERT IGNORE INTO shelters (id, name, district, location, capacity, occupancy, facilities, special_assistance, status, contact_phone, latitude, longitude) VALUES
('SHL-CHE-01', 'Saidapet Model Higher Secondary School Relief Camp', 'Chennai', 'Jones Road, Saidapet, Chennai', 1200, 940, '["Community Kitchen", "Clean RO Water", "Separate Dormitories"]', '["Elderly Wheelchair Ramps", "Infant Nutrition Room"]', 'Near Capacity', '+91 44 2435 9012', 13.020500, 80.222400),
('SHL-CUD-03', 'Devanampattinam Multi-Purpose Cyclone Shelter', 'Cuddalore', 'Beach Road, Devanampattinam, Cuddalore', 1500, 1380, '["Elevated RCC Stilt", "Diesel Generator 125kVA", "Underground Sump 40kL"]', '["Quarantine Room", "Geriatric Assistance"]', 'Near Capacity', '+91 4142 284 550', 11.759200, 79.774500);
