-- LIFE-LINK Disaster Response & Community Resilience Database Schema
-- Database: lifelink_db (MySQL 8)

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL,
    district VARCHAR(100) NOT NULL,
    phone VARCHAR(50),
    organization VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS incidents (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    severity VARCHAR(50) NOT NULL,
    district VARCHAR(100) NOT NULL,
    location VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 6) NOT NULL,
    longitude DECIMAL(10, 6) NOT NULL,
    reported_at VARCHAR(50) NOT NULL,
    affected_population INT NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL,
    assigned_team VARCHAR(255),
    food_packets INT DEFAULT 0,
    water_liters INT DEFAULT 0,
    medical_kits INT DEFAULT 0,
    rescue_boats INT DEFAULT 0,
    shelter_tents INT DEFAULT 0,
    ambulances INT DEFAULT 0,
    INDEX idx_incident_district (district),
    INDEX idx_incident_status (status),
    INDEX idx_incident_severity (severity)
);

CREATE TABLE IF NOT EXISTS sos_requests (
    id VARCHAR(64) PRIMARY KEY,
    tracking_code VARCHAR(64) UNIQUE NOT NULL,
    emergency_category VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    citizen_name VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(50) NOT NULL,
    district VARCHAR(100) NOT NULL,
    location VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 6) NOT NULL,
    longitude DECIMAL(10, 6) NOT NULL,
    people_affected INT NOT NULL DEFAULT 1,
    injured_count INT NOT NULL DEFAULT 0,
    medical_requirements VARCHAR(255),
    special_needs VARCHAR(255),
    priority VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    reported_at VARCHAR(50) NOT NULL,
    assigned_unit VARCHAR(255),
    INDEX idx_sos_district (district),
    INDEX idx_sos_priority (priority),
    INDEX idx_sos_status (status)
);

CREATE TABLE IF NOT EXISTS risk_warnings (
    id VARCHAR(64) PRIMARY KEY,
    hazard_type VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    risk_score INT NOT NULL,
    risk_level VARCHAR(50) NOT NULL,
    forecast_period VARCHAR(150) NOT NULL,
    contributing_factors JSON,
    recommended_actions JSON,
    created_at VARCHAR(50) NOT NULL,
    data_freshness VARCHAR(150),
    is_simulated_estimate BOOLEAN DEFAULT TRUE,
    INDEX idx_risk_district (district)
);

CREATE TABLE IF NOT EXISTS depots (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    district VARCHAR(100) NOT NULL,
    location VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(50) NOT NULL,
    latitude DECIMAL(10, 6) NOT NULL,
    longitude DECIMAL(10, 6) NOT NULL
);

CREATE TABLE IF NOT EXISTS inventory_items (
    id VARCHAR(64) PRIMARY KEY,
    depot_id VARCHAR(64) NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    unit VARCHAR(50) NOT NULL,
    reorder_threshold INT NOT NULL DEFAULT 100,
    last_updated VARCHAR(50) NOT NULL,
    FOREIGN KEY (depot_id) REFERENCES depots(id) ON DELETE CASCADE,
    INDEX idx_inventory_depot (depot_id)
);

CREATE TABLE IF NOT EXISTS allocations (
    id VARCHAR(64) PRIMARY KEY,
    incident_id VARCHAR(64) NOT NULL,
    incident_title VARCHAR(255) NOT NULL,
    depot_id VARCHAR(64) NOT NULL,
    depot_name VARCHAR(255) NOT NULL,
    resource_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    unit VARCHAR(50) NOT NULL,
    priority VARCHAR(50) NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(50) NOT NULL,
    assigned_team VARCHAR(255) NOT NULL,
    timestamp VARCHAR(50) NOT NULL,
    distance_km DECIMAL(6, 2) DEFAULT 0.0,
    INDEX idx_allocation_status (status)
);

CREATE TABLE IF NOT EXISTS hospitals (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    district VARCHAR(100) NOT NULL,
    location VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(50) NOT NULL,
    total_beds INT NOT NULL,
    available_beds INT NOT NULL,
    icu_total INT NOT NULL,
    icu_available INT NOT NULL,
    emergency_facilities JSON,
    ambulance_available INT NOT NULL DEFAULT 0,
    medical_supplies_status VARCHAR(50) NOT NULL,
    last_updated VARCHAR(50) NOT NULL,
    latitude DECIMAL(10, 6) NOT NULL,
    longitude DECIMAL(10, 6) NOT NULL,
    INDEX idx_hospital_district (district)
);

CREATE TABLE IF NOT EXISTS rescue_teams (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    contact_person VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(50) NOT NULL,
    district VARCHAR(100) NOT NULL,
    personnel_count INT NOT NULL,
    capabilities JSON,
    status VARCHAR(50) NOT NULL,
    current_assignment VARCHAR(255),
    last_updated VARCHAR(50) NOT NULL,
    latitude DECIMAL(10, 6) NOT NULL,
    longitude DECIMAL(10, 6) NOT NULL
);

CREATE TABLE IF NOT EXISTS shelters (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    district VARCHAR(100) NOT NULL,
    location VARCHAR(255) NOT NULL,
    capacity INT NOT NULL,
    occupancy INT NOT NULL DEFAULT 0,
    facilities JSON,
    special_assistance JSON,
    status VARCHAR(50) NOT NULL,
    contact_phone VARCHAR(50) NOT NULL,
    latitude DECIMAL(10, 6) NOT NULL,
    longitude DECIMAL(10, 6) NOT NULL
);

CREATE TABLE IF NOT EXISTS volunteers (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(50) NOT NULL,
    district VARCHAR(100) NOT NULL,
    skills JSON,
    availability_status VARCHAR(50) NOT NULL,
    assigned_task VARCHAR(255),
    shift_status VARCHAR(50) NOT NULL,
    completed_tasks_count INT NOT NULL DEFAULT 0
);
