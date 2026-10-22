package com.lifelink.repository;

import com.lifelink.model.Incident;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IncidentRepository extends JpaRepository<Incident, String> {
    List<Incident> findByDistrictIgnoreCase(String district);
    List<Incident> findBySeverity(String severity);
    List<Incident> findByStatus(String status);
}
