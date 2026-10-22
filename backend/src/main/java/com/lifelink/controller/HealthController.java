package com.lifelink.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class HealthController {

    @Autowired(required = false)
    private DataSource dataSource;

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> getHealth() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("application", "LIFE-LINK Disaster Response Backend");
        response.put("version", "1.0.0-spring-boot-mysql");
        response.put("timestamp", Instant.now().toString());

        String dbStatus = "DISCONNECTED";
        if (dataSource != null) {
            try (Connection connection = dataSource.getConnection()) {
                if (connection.isValid(2)) {
                    dbStatus = "CONNECTED";
                }
            } catch (Exception e) {
                dbStatus = "FAILED: " + e.getMessage();
            }
        }
        response.put("database", dbStatus);

        return ResponseEntity.ok(response);
    }
}
