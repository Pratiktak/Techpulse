const express = require('express');
const productController = require('../controllers/product.controller.js');
const authMiddleware = require("../middleware/auth.middleware.js");

const router = express.Router();
// by default express cannot read file comming from frontend
const multer = require('multer'); // multur is used to read files 

const upload = multer({
    storage: multer.memoryStorage(),
});

// product api
// create product route
// POST /api/product/ [protected]
router.post('/', 
    authMiddleware.protectRoute, 
    authMiddleware.isPartner, 
    upload.single("image"), 
    productController.createProduct
);

// update product route
// PUT /api/product/:id [protected]
router.put('/:id', 
    authMiddleware.protectRoute, 
    authMiddleware.isPartner, 
    upload.single("image"), 
    productController.updateProduct
);

// delete product route
// DELETE /api/product/:id [protected]
router.delete('/:id', 
    authMiddleware.protectRoute, 
    authMiddleware.isPartner,  
    productController.deleteProduct
);

// public routes any one can access

// get all products route
// GET /api/product/
router.get('/', productController.getProducts);

router.get("/my-products", authMiddleware.protectRoute, authMiddleware.isPartner, productController.getMyProducts);

// get product by id route
// GET /api/product/:id
router.get('/:id', productController.getProductById);


module.exports = router;