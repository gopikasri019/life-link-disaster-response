package com.lifelink.repository;

import com.lifelink.model.SosRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SosRequestRepository extends JpaRepository<SosRequest, String> {
    Optional<SosRequest> findByTrackingCode(String trackingCode);
    List<SosRequest> findByDistrictIgnoreCase(String district);
    List<SosRequest> findByPriority(String priority);
    List<SosRequest> findByStatus(String status);
}
