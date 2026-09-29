package com.example.retailstorealertsystem_api.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.retailstorealertsystem_api.enums.AlertStatus;
import com.example.retailstorealertsystem_api.exceptions.ProductNotFound;
import com.example.retailstorealertsystem_api.model.Product;
import com.example.retailstorealertsystem_api.model.ReorderAlert;
import com.example.retailstorealertsystem_api.repository.ProductRepository;
import com.example.retailstorealertsystem_api.repository.ReorderAlertRepository;

@Service
public class ReorderAlertServiceImpl implements ReorderAlertService {

    private ReorderAlertRepository reorderalertrepo;
    private ProductRepository productrepo;

    public ReorderAlertServiceImpl(
            ReorderAlertRepository reorderalertrepo,
            ProductRepository productrepo) {

        this.reorderalertrepo = reorderalertrepo;
        this.productrepo = productrepo;
    }

    @Override
    public ReorderAlert checkAndCreateAlert(Long productId, Integer currentStock) {

        Product product = productrepo.findById(productId)
                .orElseThrow(() ->
                        new ProductNotFound(
                                "Product not found with id: " + productId));

        if (currentStock <= product.getReorderThreshold()) {

            var existingAlert =
                    reorderalertrepo.findByProductProductIdAndStatus(
                            productId, AlertStatus.OPEN);

            if (existingAlert.isPresent()) {
                return existingAlert.get();
            }

            ReorderAlert alert = new ReorderAlert();

            alert.setProduct(product);
            alert.setStockAtAlert(currentStock);
            alert.setThreshold(product.getReorderThreshold());
            alert.setReorderQuantity(product.getReorderQuantity());
            alert.setStatus(AlertStatus.OPEN);
            alert.setCreatedAt(LocalDateTime.now());

            return reorderalertrepo.save(alert);
        }

        return null;
    }

    @Override
    public List<ReorderAlert> getAllAlerts() {
        return reorderalertrepo.findAll();
    }

    @Override
    public List<ReorderAlert> getAlertsByProduct(Long productId) {

        productrepo.findById(productId)
                .orElseThrow(() ->
                        new ProductNotFound(
                                "Product not found with id: " + productId));

        return reorderalertrepo.findByProductProductId(productId);
    }

    @Override
    public ReorderAlert fulfillAlert(Long alertId) {

        ReorderAlert alert = reorderalertrepo.findById(alertId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Reorder alert not found with id: " + alertId));

        alert.setStatus(AlertStatus.FULFILLED);
        alert.setFulfilledAt(LocalDateTime.now());

        return reorderalertrepo.save(alert);
    }

    @Override
    public ReorderAlert fulfillOpenAlertForProduct(Long productId) {

        var existingAlert =
                reorderalertrepo.findByProductProductIdAndStatus(
                        productId, AlertStatus.OPEN);

        if (existingAlert.isPresent()) {

            ReorderAlert alert = existingAlert.get();

            alert.setStatus(AlertStatus.FULFILLED);
            alert.setFulfilledAt(LocalDateTime.now());

            return reorderalertrepo.save(alert);
        }

        return null;
    }
}