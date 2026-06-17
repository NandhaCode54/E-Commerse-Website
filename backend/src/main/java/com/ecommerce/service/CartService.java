package com.ecommerce.service;

import com.ecommerce.entity.Cart;
import com.ecommerce.entity.CartItem;
import com.ecommerce.entity.Product;
import com.ecommerce.exception.CartItemNotFoundException;
import com.ecommerce.exception.CartNotFoundException;
import com.ecommerce.exception.InsufficientStockException;
import com.ecommerce.exception.ProductNotFoundException;
import com.ecommerce.repository.CartItemRepository;
import com.ecommerce.repository.CartRepository;
import com.ecommerce.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class CartService {
    
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    
    @Autowired
    public CartService(CartRepository cartRepository, 
                       CartItemRepository cartItemRepository,
                       ProductRepository productRepository) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
    }
    
    /**
     * Get or create cart for a user
     */
    public Cart getOrCreateCart(Long userId) {
        return cartRepository.findByUserIdWithItems(userId)
                .orElseGet(() -> {
                    Cart newCart = new Cart(userId);
                    return cartRepository.save(newCart);
                });
    }
    
    /**
     * Get cart by user ID (with items loaded)
     */
    public Cart getCartByUserId(Long userId) {
        return cartRepository.findByUserIdWithItems(userId)
                .orElseThrow(() -> new CartNotFoundException(userId));
    }
    
    /**
     * Add product to cart
     */
    public Cart addProductToCart(Long userId, Long productId, Integer quantity) {
        // Validate quantity
        if (quantity <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than 0");
        }
        
        // Validate product exists
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ProductNotFoundException(productId));
        
        // Validate stock availability
        if (product.getStock() < quantity) {
            throw new InsufficientStockException(productId, quantity, product.getStock());
        }
        
        // Get or create cart (with items loaded)
        Cart cart = getOrCreateCart(userId);
        
        // Check if product already exists in cart
        CartItem existingItem = cart.getCartItems().stream()
                .filter(item -> item.getProductId().equals(productId))
                .findFirst()
                .orElse(null);
        
        if (existingItem != null) {
            // Update quantity if item exists
            int newQuantity = existingItem.getQuantity() + quantity;
            
            // Validate stock for new total quantity
            if (product.getStock() < newQuantity) {
                throw new InsufficientStockException(productId, newQuantity, product.getStock());
            }
            
            existingItem.setQuantity(newQuantity);
            existingItem.calculateSubtotal(product.getPrice());
            cartItemRepository.save(existingItem);
        } else {
            // Create new cart item
            CartItem cartItem = new CartItem(productId, quantity);
            cartItem.calculateSubtotal(product.getPrice());
            cart.addCartItem(cartItem);
            cartItemRepository.save(cartItem);
        }
        
        // Recalculate cart total
        cart.calculateTotalPrice();
        return cartRepository.save(cart);
    }
    
    /**
     * Remove product from cart
     */
    public Cart removeProductFromCart(Long userId, Long productId) {
        Cart cart = getCartByUserId(userId);
        
        CartItem cartItem = cart.getCartItems().stream()
                .filter(item -> item.getProductId().equals(productId))
                .findFirst()
                .orElseThrow(() -> new CartItemNotFoundException(productId));
        
        cart.removeCartItem(cartItem);
        cartItemRepository.delete(cartItem);
        cartRepository.save(cart);
        
        return cart;
    }
    
    /**
     * Update product quantity in cart
     */
    public Cart updateProductQuantity(Long userId, Long productId, Integer quantity) {
        // Validate quantity
        if (quantity <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than 0");
        }
        
        // Validate product exists and check stock
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ProductNotFoundException(productId));
        
        if (product.getStock() < quantity) {
            throw new InsufficientStockException(productId, quantity, product.getStock());
        }
        
        Cart cart = getCartByUserId(userId);
        
        CartItem cartItem = cart.getCartItems().stream()
                .filter(item -> item.getProductId().equals(productId))
                .findFirst()
                .orElseThrow(() -> new CartItemNotFoundException(productId));
        
        cartItem.setQuantity(quantity);
        cartItem.calculateSubtotal(product.getPrice());
        cartItemRepository.save(cartItem);
        
        cart.calculateTotalPrice();
        return cartRepository.save(cart);
    }
    
    /**
     * Get all items in user's cart
     * Returns empty cart if cart doesn't exist (creates one if needed)
     */
    public Cart getCartItems(Long userId) {
        return getOrCreateCart(userId);
    }
    
    /**
     * Clear cart
     */
    public void clearCart(Long userId) {
        Cart cart = getCartByUserId(userId);
        cart.clearCart();
        cartItemRepository.deleteByCartId(cart.getId());
        cartRepository.save(cart);
    }
    
    /**
     * Delete cart
     */
    public void deleteCart(Long userId) {
        Cart cart = getCartByUserId(userId);
        cartRepository.delete(cart);
    }
}

