package com.ecommerce.exception;

public class CartNotFoundException extends RuntimeException {
    
    public CartNotFoundException(String message) {
        super(message);
    }
    
    public CartNotFoundException(Long userId) {
        super("Cart not found for user id: " + userId);
    }
}

