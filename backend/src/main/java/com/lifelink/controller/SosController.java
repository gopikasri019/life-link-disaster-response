package com.lifelink.controller;

import com.lifelink.model.SosRequest;
import com.lifelink.repository.SosRequestRepository;
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
@RequestMapping("/api/sos")
public class SosController {

    @Autowired
    private SosRequestRepository sosRequestRepository;

    @GetMapping
    public ResponseEntity<List<SosRequest>> getAllSos(
            @RequestParam(required = false) String district,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String status) {
        if (district != null && !district.equalsIgnoreCase("All Districts")) {
            return ResponseEntity.ok(sosRequestRepository.findByDistrictIgnoreCase(district));
        }
        if (priority != null) {
            return ResponseEntity.ok(sosRequestRepository.findByPriority(priority));
        }
        if (status != null) {
            return ResponseEntity.ok(sosRequestRepository.findByStatus(status));
        }
        return ResponseEntity.ok(sosRequestRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SosRequest> getSosById(@PathVariable String id) {
        return sosRequestRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/track/{trackingCode}")
    public ResponseEntity<SosRequest> getSosByTrackingCode(@PathVariable String trackingCode) {
        return sosRequestRepository.findByTrackingCode(trackingCode)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<SosRequest> createSos(@Valid @RequestBody SosRequest sos) {
        if (sos.getId() == null || sos.getId().trim().isEmpty()) {
            sos.setId("SOS-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        }
        if (sos.getTrackingCode() == null || sos.getTrackingCode().trim().isEmpty()) {
            String hex = UUID.randomUUID().toString().substring(0, 4).toUpperCase();
            String distPrefix = (sos.getDistrict() != null && !sos.getDistrict().isEmpty())
                    ? sos.getDistrict().substring(0, 1).toUpperCase()
                    : "X";
            sos.setTrackingCode("LL-SOS-" + hex + "-" + distPrefix);
        }
        if (sos.getReportedAt() == null) {
            sos.setReportedAt(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")));
        }
        if (sos.getStatus() == null) {
            sos.setStatus("Pending Triage");
        }
        SosRequest saved = sosRequestRepository.save(sos);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<SosRequest> updateSosStatus(
            @PathVariable String id,
            @RequestBody Map<String, String> payload) {
        Optional<SosRequest> opt = sosRequestRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        SosRequest req = opt.get();
        if (payload.containsKey("status")) {
            req.setStatus(payload.get("status"));
        }
        if (payload.containsKey("assignedUnit")) {
            req.setAssignedUnit(payload.get("assignedUnit"));
        }
        SosRequest updated = sosRequestRepository.save(req);
        return ResponseEntity.ok(updated);
    }
}
