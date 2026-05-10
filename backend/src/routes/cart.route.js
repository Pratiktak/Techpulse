const express = require('express');
const cartController = require('../controllers/cart.controller.js');
const authMiddleware = require('../middleware/auth.middleware.js');

const router = express.Router();

// cart api
router.post('/', 
    authMiddleware.protectRoute,
    cartController.addToCart
);

router.get('/', 
    authMiddleware.protectRoute,
    cartController.getCart
);

router.delete('/', 
    authMiddleware.protectRoute,
    cartController.removeFromCart
);

router.put('/', 
    authMiddleware.protectRoute,
    cartController.updateCartItem
);

module.exports = router;