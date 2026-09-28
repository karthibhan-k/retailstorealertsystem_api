package com.example.retailstorealertsystem_api.service;

import java.util.List;

import com.example.retailstorealertsystem_api.model.Product;

public interface ProductService {

    Product createProduct(Product product);

    List<Product> getAllProducts();

    Product getProductById(Long id);

    Product updateProduct(Long id, Product product);

    void deleteProduct(Long id);
}