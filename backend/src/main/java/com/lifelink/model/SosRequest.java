package com.lifelink.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

@Entity
@Table(name = "sos_requests")
public class SosRequest {

    @Id
    private String id;

    @Column(name = "tracking_code", unique = true)
    @NotBlank
    private String trackingCode;

    @Column(name = "emergency_category")
    @NotBlank
    private String emergencyCategory;

    @Column(columnDefinition = "TEXT")
    @NotBlank
    private String description;

    @Column(name = "citizen_name")
    @NotBlank
    private String citizenName;

    @Column(name = "contact_phone")
    @NotBlank
    private String contactPhone;

    @NotBlank
    private String district;

    @NotBlank
    private String location;

    @NotNull
    private BigDecimal latitude;

    @NotNull
    private BigDecimal longitude;

    @Column(name = "people_affected")
    private Integer peopleAffected = 1;

    @Column(name = "injured_count")
    private Integer injuredCount = 0;

    @Column(name = "medical_requirements")
    private String medicalRequirements;

    @Column(name = "special_needs")
    private String specialNeeds;

    @NotBlank
    private String priority;

    @NotBlank
    private String status;

    @Column(name = "reported_at")
    private String reportedAt;

    @Column(name = "assigned_unit")
    private String assignedUnit;

    public SosRequest() {}

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTrackingCode() { return trackingCode; }
    public void setTrackingCode(String trackingCode) { this.trackingCode = trackingCode; }

    public String getEmergencyCategory() { return emergencyCategory; }
    public void setEmergencyCategory(String emergencyCategory) { this.emergencyCategory = emergencyCategory; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCitizenName() { return citizenName; }
    public void setCitizenName(String citizenName) { this.citizenName = citizenName; }

    public String getContactPhone() { return contactPhone; }
    public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }

    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public BigDecimal getLatitude() { return latitude; }
    public void setLatitude(BigDecimal latitude) { this.latitude = latitude; }

    public BigDecimal getLongitude() { return longitude; }
    public void setLongitude(BigDecimal longitude) { this.longitude = longitude; }

    public Integer getPeopleAffected() { return peopleAffected; }
    public void setPeopleAffected(Integer peopleAffected) { this.peopleAffected = peopleAffected; }

    public Integer getInjuredCount() { return injuredCount; }
    public void setInjuredCount(Integer injuredCount) { this.injuredCount = injuredCount; }

    public String getMedicalRequirements() { return medicalRequirements; }
    public void setMedicalRequirements(String medicalRequirements) { this.medicalRequirements = medicalRequirements; }

    public String getSpecialNeeds() { return specialNeeds; }
    public void setSpecialNeeds(String specialNeeds) { this.specialNeeds = specialNeeds; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getReportedAt() { return reportedAt; }
    public void setReportedAt(String reportedAt) { this.reportedAt = reportedAt; }

    public String getAssignedUnit() { return assignedUnit; }
    public void setAssignedUnit(String assignedUnit) { this.assignedUnit = assignedUnit; }
}
