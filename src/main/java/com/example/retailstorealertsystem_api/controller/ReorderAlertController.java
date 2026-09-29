package com.example.retailstorealertsystem_api.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.example.retailstorealertsystem_api.model.ReorderAlert;
import com.example.retailstorealertsystem_api.service.ReorderAlertService;

@RestController
@RequestMapping("/api/reorder-alerts")
public class ReorderAlertController {

    private ReorderAlertService reorderalertservice;

    public ReorderAlertController(ReorderAlertService reorderalertservice) {
        this.reorderalertservice = reorderalertservice;
    }

    @GetMapping
    public List<ReorderAlert> getAllAlerts() {
        return reorderalertservice.getAllAlerts();
    }

    @GetMapping("/product/{productId}")
    public List<ReorderAlert> getAlertsByProduct(
            @PathVariable Long productId) {

        return reorderalertservice.getAlertsByProduct(productId);
    }

    @PutMapping("/{alertId}/fulfill")
    public ReorderAlert fulfillAlert(
            @PathVariable Long alertId) {

        return reorderalertservice.fulfillAlert(alertId);
    }
}