package com.ecommerce.exception;

public class CartItemNotFoundException extends RuntimeException {
    
    public CartItemNotFoundException(String message) {
        super(message);
    }
    
    public CartItemNotFoundException(Long productId) {
        super("Cart item not found for product id: " + productId);
    }
}

