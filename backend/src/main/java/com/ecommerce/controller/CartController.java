package com.ecommerce.controller;

import com.ecommerce.dto.AddToCartRequestDTO;
import com.ecommerce.dto.CartDTO;
import com.ecommerce.dto.CartItemDTO;
import com.ecommerce.dto.ProductDTO;
import com.ecommerce.entity.Cart;
import com.ecommerce.entity.Product;
import com.ecommerce.mapper.CartMapper;
import com.ecommerce.mapper.ProductMapper;
import com.ecommerce.repository.ProductRepository;
import com.ecommerce.service.CartService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/carts")
// A user may only act on their own cart; admins may act on any cart.
@PreAuthorize("hasRole('ADMIN') or #userId == authentication.principal.id")
public class CartController {
    
    private final CartService cartService;
    private final CartMapper cartMapper;
    private final ProductRepository productRepository;
    private final ProductMapper productMapper;
    
    @Autowired
    public CartController(CartService cartService, 
                         CartMapper cartMapper,
                         ProductRepository productRepository,
                         ProductMapper productMapper) {
        this.cartService = cartService;
        this.cartMapper = cartMapper;
        this.productRepository = productRepository;
        this.productMapper = productMapper;
    }
    
    /**
     * Get all items in user's cart
     * GET /api/carts/{userId}
     */
    @GetMapping("/{userId}")
    public ResponseEntity<CartDTO> getCart(@PathVariable Long userId) {
        Cart cart = cartService.getCartItems(userId);
        CartDTO cartDTO = cartMapper.toDTO(cart);
        
        // Enrich cart items with product details
        enrichCartItemsWithProductDetails(cartDTO);
        
        return ResponseEntity.ok(cartDTO);
    }
    
    /**
     * Add product to cart
     * POST /api/carts/{userId}/items
     */
    @PostMapping("/{userId}/items")
    public ResponseEntity<CartDTO> addProductToCart(
            @PathVariable Long userId,
            @Valid @RequestBody AddToCartRequestDTO request) {
        
        Cart cart = cartService.addProductToCart(userId, request.getProductId(), request.getQuantity());
        CartDTO cartDTO = cartMapper.toDTO(cart);
        
        // Enrich cart items with product details
        enrichCartItemsWithProductDetails(cartDTO);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(cartDTO);
    }
    
    /**
     * Remove product from cart
     * DELETE /api/carts/{userId}/items/{productId}
     */
    @DeleteMapping("/{userId}/items/{productId}")
    public ResponseEntity<Map<String, Object>> removeProductFromCart(
            @PathVariable Long userId,
            @PathVariable Long productId) {
        
        Cart cart = cartService.removeProductFromCart(userId, productId);
        CartDTO cartDTO = cartMapper.toDTO(cart);
        enrichCartItemsWithProductDetails(cartDTO);
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Product removed from cart successfully");
        response.put("cart", cartDTO);
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Update product quantity in cart
     * PUT /api/carts/{userId}/items/{productId}
     */
    @PutMapping("/{userId}/items/{productId}")
    public ResponseEntity<CartDTO> updateProductQuantity(
            @PathVariable Long userId,
            @PathVariable Long productId,
            @RequestParam Integer quantity) {
        
        Cart cart = cartService.updateProductQuantity(userId, productId, quantity);
        CartDTO cartDTO = cartMapper.toDTO(cart);
        
        // Enrich cart items with product details
        enrichCartItemsWithProductDetails(cartDTO);
        
        return ResponseEntity.ok(cartDTO);
    }
    
    /**
     * Clear cart
     * DELETE /api/carts/{userId}
     */
    @DeleteMapping("/{userId}")
    public ResponseEntity<Map<String, String>> clearCart(@PathVariable Long userId) {
        cartService.clearCart(userId);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Cart cleared successfully");
        response.put("userId", userId.toString());
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Helper method to enrich cart items with product details
     */
    private void enrichCartItemsWithProductDetails(CartDTO cartDTO) {
        if (cartDTO.getCartItems() != null) {
            List<CartItemDTO> enrichedItems = cartDTO.getCartItems().stream()
                    .map(item -> {
                        Product product = productRepository.findById(item.getProductId()).orElse(null);
                        if (product != null) {
                            ProductDTO productDTO = productMapper.toDTO(product);
                            item.setProduct(productDTO);
                        }
                        return item;
                    })
                    .collect(Collectors.toList());
            cartDTO.setCartItems(enrichedItems);
        }
    }
}

