const cartModel = require('../models/cart.model.js');
const productModel = require('../models/product.model.js');

// cart controllers
async function addToCart(req, res) {
    try {
        const { productId, quantity } = req.body;

        // check if product exists
        const product = await productModel.findById(productId);
        // if product not found 
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // check if cart exixts for that user
        let cart = await cartModel.findOne({ user: req.user._id });
        // create cart if not exists
        if (!cart) {
            cart = await cartModel.create({
                user: req.user._id,
                items: []
            });
        }

        // checking if product is already in cart
        const itemIndex = cart.items.findIndex(
            item => item.product.toString() === productId
        );

        if (itemIndex > -1) {
            // update quantity
            cart.items[itemIndex].quantity += quantity || 1;
        } else {
            // add new product
            cart.items.push({
                product: productId,
                quantity: quantity || 1
            });
        }

        await cart.save();

        res.status(200).json({
            message: "Product added to cart",
            cart
        });
    } catch (error) {
        console.log("Error in addToCart controller", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}

async function getCart(req, res) {
    try {
        // get products from cart
        const cart = await cartModel
            .findOne({ user: req.user._id })
            .populate("items.product");

        // self-heal: drop items whose product was deleted
        if (cart && cart.items.length) {
            const validItems = cart.items.filter(item => item.product && item.product._id);
            if (validItems.length !== cart.items.length) {
                cart.items = validItems;
                await cart.save();
            }
        }

        res.status(200).json({
            message: "products fetched from cart sucessfully",
            cart,
        });
    } catch (error) {
        console.log("Error in getCart controller: ", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}

async function removeFromCart(req, res) {
    try {
        const { productId } = req.body;

        const cart = await cartModel.findOne({ user: req.user._id });

        cart.items = cart.items.filter(
            item => item.product.toString() !== productId
        );

        await cart.save();

        res.json({
            message: "Item removed",
            cart
        });

    } catch (error) {
        console.log("Error in removeFromCart:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}

async function updateCartItem(req, res) {
    try {
        const { productId, quantity } = req.body;

        const cart = await cartModel.findOne({ user: req.user._id });

        const item = cart.items.find(
            item => item.product.toString() === productId
        );

        if (!item) {
            return res.status(404).json({ message: "Item not found" });
        }

        item.quantity = quantity;

        await cart.save();

        res.json({
            message: "Cart updated",
            cart
        });
    } catch (error) {
        console.log("Error in updateCartItem controller: ", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}

module.exports = {
    addToCart,
    getCart,
    removeFromCart,
    updateCartItem
}