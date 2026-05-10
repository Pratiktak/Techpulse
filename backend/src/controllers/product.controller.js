const productModel = require('../models/product.model.js');
const storageService = require('../config/cloudinary.js');

// controllers
async function createProduct(req, res) {
    // console.log(req.partner);

    // console.log(req.body); // gets form text fields
    // console.log(req.file); // gets files

    let { name, description, price, category } = req.body;

    try {
        // uplaod file to cloudinary and return back url
        const fileUploadResult = await storageService.uploadFile(req.file.buffer);

        const product = await productModel.create({
            name,
            image: fileUploadResult.secure_url,
            imagePublicId: fileUploadResult.public_id,
            description,
            price,
            category,
            partner: req.partner._id
        });

        res.status(201).json({
            message: "product created sucessfully",
            product
        })
    } catch (error) {
        console.log("Error in createProduct controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}

async function updateProduct(req, res) {

    let { name, description, price, category } = req.body;

    try {
        const product = await productModel.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // check ownership
        if (product.partner.toString() !== req.partner._id.toString()) {
            return res.status(403).json({ message: "Not authorized " });
        }

        if (req.file) {
            // delete existing image from cloudinary
            await storageService.deleteFile(product.imagePublicId);

            // upload new image to cloudinary
            const fileUploadResult = await storageService.uploadFile(req.file.buffer);

            // updating image fields
            product.image = fileUploadResult.secure_url;
            product.imagePublicId = fileUploadResult.public_id;
        }

        // updating other fields if provided
        if (name) product.name = name;
        if (description) product.description = description;
        if (price) product.price = price;
        if (category) product.category = category;

        const updatedProduct = await product.save();

        res.status(200).json({
            message: "product updated sucessfully",
            updatedProduct
        })

    } catch (error) {
        console.log("Error in updateProduct controller: ", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}

async function deleteProduct(req, res) {
    try {
        const product = await productModel.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // check ownership
        if (product.partner.toString() !== req.partner._id.toString()) {
            return res.status(403).json({ message: "Not authorized " });
        }

        // delete image from cloudinary
        await storageService.deleteFile(product.imagePublicId);

        // delete product
        const deletedProduct = await product.deleteOne();

        res.status(200).json({
            message: "Product deleted successfully"
        });
    } catch (error) {
        console.log("Error in deletProduct controller: ", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}

async function getProducts(req, res) {
    try {
        // get all products from db
        const products = await productModel.find({});

        // if db is empty
        if (products.length === 0) {
            return res.status(404).json({ message: "No product found" });
        }

        // sending all products to frontend
        res.status(200).json({
            message: "products fetched sucessfully",
            products
        });
    } catch (error) {
        console.log("Error in getAllProducts controller ", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}

async function getProductById(req, res) {
    try {
        // find product by id from db
        const product = await productModel.findById(req.params.id);

        // if db is empty
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // sending product to frontend
        res.status(200).json({
            message: "product fetched sucessfully",
            product
        });

    } catch (error) {
        console.log("Error in getProductById controller ", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}

async function getMyProducts(req, res) {

    try {

        const products = await productModel.find({
            partner: req.partner._id
        });

        res.status(200).json({
            products
        });

    } catch (error) {

        console.log(
            "Error in getMyProducts controller:",
            error.message
        );

        res.status(500).json({
            message: "Internal server error"
        });
    }
}

module.exports = {
    createProduct,
    updateProduct,
    deleteProduct,
    getProducts,
    getProductById,
    getMyProducts
}