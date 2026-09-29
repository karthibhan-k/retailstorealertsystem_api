package com.example.retailstorealertsystem_api.service;

import java.util.List;

import com.example.retailstorealertsystem_api.model.ReorderAlert;

public interface ReorderAlertService {

    ReorderAlert checkAndCreateAlert(Long productId, Integer currentStock);

    List<ReorderAlert> getAllAlerts();

    List<ReorderAlert> getAlertsByProduct(Long productId);

    ReorderAlert fulfillAlert(Long alertId);

    ReorderAlert fulfillOpenAlertForProduct(Long productId);
}