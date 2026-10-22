package com.lifelink.controller;

import com.lifelink.model.Incident;
import com.lifelink.repository.IncidentRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/incidents")
public class IncidentController {

    @Autowired
    private IncidentRepository incidentRepository;

    @GetMapping
    public ResponseEntity<List<Incident>> getAllIncidents(
            @RequestParam(required = false) String district,
            @RequestParam(required = false) String severity) {
        if (district != null && !district.equalsIgnoreCase("All Districts")) {
            return ResponseEntity.ok(incidentRepository.findByDistrictIgnoreCase(district));
        }
        if (severity != null) {
            return ResponseEntity.ok(incidentRepository.findBySeverity(severity));
        }
        return ResponseEntity.ok(incidentRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Incident> getIncidentById(@PathVariable String id) {
        return incidentRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Incident> createIncident(@Valid @RequestBody Incident incident) {
        if (incident.getId() == null || incident.getId().trim().isEmpty()) {
            incident.setId("INC-TN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        }
        if (incident.getReportedAt() == null) {
            incident.setReportedAt(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")));
        }
        Incident saved = incidentRepository.save(incident);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Incident> updateIncidentStatus(
            @PathVariable String id,
            @RequestBody Map<String, String> payload) {
        Optional<Incident> opt = incidentRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Incident inc = opt.get();
        if (payload.containsKey("status")) {
            inc.setStatus(payload.get("status"));
        }
        if (payload.containsKey("assignedTeam")) {
            inc.setAssignedTeam(payload.get("assignedTeam"));
        }
        Incident updated = incidentRepository.save(inc);
        return ResponseEntity.ok(updated);
    }
}
