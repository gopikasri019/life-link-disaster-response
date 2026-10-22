package com.lifelink.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

@Entity
@Table(name = "allocations")
public class Allocation {

    @Id
    private String id;

    @Column(name = "incident_id")
    @NotBlank
    private String incidentId;

    @Column(name = "incident_title")
    private String incidentTitle;

    @Column(name = "depot_id")
    @NotBlank
    private String depotId;

    @Column(name = "depot_name")
    private String depotName;

    @Column(name = "resource_name")
    @NotBlank
    private String resourceName;

    @NotNull
    private Integer quantity;

    @NotBlank
    private String unit;

    @NotBlank
    private String priority;

    @Column(columnDefinition = "TEXT")
    private String reason;

    @NotBlank
    private String status;

    @Column(name = "assigned_team")
    private String assignedTeam;

    private String timestamp;

    @Column(name = "distance_km")
    private BigDecimal distanceKm = BigDecimal.ZERO;

    public Allocation() {}

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getIncidentId() { return incidentId; }
    public void setIncidentId(String incidentId) { this.incidentId = incidentId; }

    public String getIncidentTitle() { return incidentTitle; }
    public void setIncidentTitle(String incidentTitle) { this.incidentTitle = incidentTitle; }

    public String getDepotId() { return depotId; }
    public void setDepotId(String depotId) { this.depotId = depotId; }

    public String getDepotName() { return depotName; }
    public void setDepotName(String depotName) { this.depotName = depotName; }

    public String getResourceName() { return resourceName; }
    public void setResourceName(String resourceName) { this.resourceName = resourceName; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getAssignedTeam() { return assignedTeam; }
    public void setAssignedTeam(String assignedTeam) { this.assignedTeam = assignedTeam; }

    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }

    public BigDecimal getDistanceKm() { return distanceKm; }
    public void setDistanceKm(BigDecimal distanceKm) { this.distanceKm = distanceKm; }
}
