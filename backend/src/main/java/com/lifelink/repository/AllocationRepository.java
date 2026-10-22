package com.lifelink.repository;

import com.lifelink.model.Allocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AllocationRepository extends JpaRepository<Allocation, String> {
    List<Allocation> findByIncidentId(String incidentId);
    List<Allocation> findByDepotId(String depotId);
    List<Allocation> findByStatus(String status);
}
