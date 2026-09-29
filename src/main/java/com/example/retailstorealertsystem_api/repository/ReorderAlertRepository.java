package com.example.retailstorealertsystem_api.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.retailstorealertsystem_api.enums.AlertStatus;
import com.example.retailstorealertsystem_api.model.ReorderAlert;

public interface ReorderAlertRepository extends JpaRepository<ReorderAlert, Long> {

    Optional<ReorderAlert> findByProductProductIdAndStatus(
            Long productId, AlertStatus status);

    List<ReorderAlert> findByProductProductId(Long productId);
}