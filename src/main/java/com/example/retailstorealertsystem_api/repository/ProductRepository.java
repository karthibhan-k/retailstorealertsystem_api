package com.example.retailstorealertsystem_api.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.retailstorealertsystem_api.model.Product;

public interface ProductRepository extends JpaRepository<Product, Long> {

}