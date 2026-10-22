package com.lifelink.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

@Entity
@Table(name = "incidents")
public class Incident {

    @Id
    private String id;

    @NotBlank(message = "Title is required")
    private String title;

    @Column(columnDefinition = "TEXT")
    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Category is required")
    private String category;

    @NotBlank(message = "Severity is required")
    private String severity;

    @NotBlank(message = "District is required")
    private String district;

    @NotBlank(message = "Location is required")
    private String location;

    @NotNull
    private BigDecimal latitude;

    @NotNull
    private BigDecimal longitude;

    @Column(name = "reported_at")
    private String reportedAt;

    @Column(name = "affected_population")
    private Integer affectedPopulation = 0;

    @NotBlank(message = "Status is required")
    private String status;

    @Column(name = "assigned_team")
    private String assignedTeam;

    @Column(name = "food_packets")
    private Integer foodPackets = 0;

    @Column(name = "water_liters")
    private Integer waterLiters = 0;

    @Column(name = "medical_kits")
    private Integer medicalKits = 0;

    @Column(name = "rescue_boats")
    private Integer rescueBoats = 0;

    @Column(name = "shelter_tents")
    private Integer shelterTents = 0;

    @Column(name = "ambulances")
    private Integer ambulances = 0;

    public Incident() {}

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }

    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public BigDecimal getLatitude() { return latitude; }
    public void setLatitude(BigDecimal latitude) { this.latitude = latitude; }

    public BigDecimal getLongitude() { return longitude; }
    public void setLongitude(BigDecimal longitude) { this.longitude = longitude; }

    public String getReportedAt() { return reportedAt; }
    public void setReportedAt(String reportedAt) { this.reportedAt = reportedAt; }

    public Integer getAffectedPopulation() { return affectedPopulation; }
    public void setAffectedPopulation(Integer affectedPopulation) { this.affectedPopulation = affectedPopulation; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getAssignedTeam() { return assignedTeam; }
    public void setAssignedTeam(String assignedTeam) { this.assignedTeam = assignedTeam; }

    public Integer getFoodPackets() { return foodPackets; }
    public void setFoodPackets(Integer foodPackets) { this.foodPackets = foodPackets; }

    public Integer getWaterLiters() { return waterLiters; }
    public void setWaterLiters(Integer waterLiters) { this.waterLiters = waterLiters; }

    public Integer getMedicalKits() { return medicalKits; }
    public void setMedicalKits(Integer medicalKits) { this.medicalKits = medicalKits; }

    public Integer getRescueBoats() { return rescueBoats; }
    public void setRescueBoats(Integer rescueBoats) { this.rescueBoats = rescueBoats; }

    public Integer getShelterTents() { return shelterTents; }
    public void setShelterTents(Integer shelterTents) { this.shelterTents = shelterTents; }

    public Integer getAmbulances() { return ambulances; }
    public void setAmbulances(Integer ambulances) { this.ambulances = ambulances; }
}
