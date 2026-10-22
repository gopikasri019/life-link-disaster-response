package com.lifelink.controller;

import com.lifelink.model.Allocation;
import com.lifelink.repository.AllocationRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/allocations")
public class AllocationController {

    @Autowired
    private AllocationRepository allocationRepository;

    @GetMapping
    public ResponseEntity<List<Allocation>> getAllAllocations() {
        return ResponseEntity.ok(allocationRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<?> createAllocation(@Valid @RequestBody Allocation allocation) {
        if (allocation.getQuantity() == null || allocation.getQuantity() <= 0) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Invalid quantity");
            error.put("message", "Quantity must be greater than zero");
            return ResponseEntity.badRequest().body(error);
        }

        if (allocation.getId() == null || allocation.getId().trim().isEmpty()) {
            allocation.setId("ALC-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        }
        if (allocation.getTimestamp() == null) {
            allocation.setTimestamp(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")));
        }
        if (allocation.getStatus() == null) {
            allocation.setStatus("Approved");
        }

        Allocation saved = allocationRepository.save(allocation);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }
}
