const orderModel = require('../models/order.model.js');
const cartModel = require('../models/cart.model.js');
const razorpay = require("../config/razorpay.js");
const crypto = require("crypto");

// order controllers
async function createOrder(req, res) {
    try {
        const { shippingAddress, paymentMethod } = req.body;

        // getting the cart data
        const cart = await cartModel
            .findOne({ user: req.user._id })
            .populate("items.product");

        // if cart is empty
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: "Cart is empty" });
        }

        // drop items whose product was deleted (populate returns null for those)
        const validItems = cart.items.filter(item => item.product && item.product._id);
        if (validItems.length === 0) {
            cart.items = [];
            await cart.save();
            return res.status(400).json({ message: "All items in your cart are no longer available. Cart has been cleared." });
        }

        const orderItems = validItems.map(item => ({
            product: item.product._id,
            quantity: item.quantity,
            price: item.product.price
        }));

        // calculating total price
        let totalPrice = 0;
        validItems.forEach(item => {
            totalPrice += item.product.price * item.quantity;
        });

        const order = await orderModel.create({
            user: req.user._id,
            items: orderItems,
            totalPrice,
            shippingAddress,
            paymentMethod,
            paymentStatus:
                paymentMethod === "COD"
                    ? "pending"
                    : "completed"
        });

        // clear cart
        cart.items = [];
        await cart.save();

        res.status(201).json({
            message: "Order placed successfully",
            order
        });
    } catch (error) {
        console.log("Error in createOrder controller: ", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}

async function getMyOrder(req, res) {
    try {
        const orders = await orderModel
            .find({ user: req.user._id })
            .populate("items.product");

        res.status(200).json({ orders });
    } catch (error) {
        console.log("Error in getMyOrder controller:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}

async function getAllOrders(req, res) {
    try {
        const orders = await orderModel
            .find({})
            .populate("user")
            .populate("items.product");

        res.status(200).json({ orders });
    } catch (error) {
        console.log("Error in getAllOrders controller:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}

async function updateOrderStatus(req, res) {
    const { status } = req.body;

    const order = await orderModel.findById(req.params.id);

    order.orderStatus = status;
    await order.save();

    res.status(200).json({
        message: "Status updated",
        order
    });
}

async function cancelOrder(req, res) {
    try {
        const order = await orderModel.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        if (String(order.user) !== String(req.user._id)) {
            return res.status(403).json({ message: "You can only cancel your own orders" });
        }
        if (!["pending", "processing"].includes(order.orderStatus)) {
            return res.status(400).json({ message: `Order cannot be cancelled once it is ${order.orderStatus}` });
        }
        order.orderStatus = "cancelled";
        await order.save();
        res.status(200).json({ message: "Order cancelled", order });
    } catch (error) {
        const desc = error?.message || JSON.stringify(error);
        console.log("Error in cancelOrder controller:", desc);
        res.status(500).json({ message: desc || "Failed to cancel order" });
    }
}

async function createRazorpayOrder(req, res) {
    try {
        // getting the cart data
        const cart = await cartModel
            .findOne({ user: req.user._id })
            .populate("items.product");

        // if cart is empty
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: "Cart is empty" });
        }

        // drop items whose product was deleted (populate returns null for those)
        const validItems = cart.items.filter(item => item.product && item.product._id);
        if (validItems.length === 0) {
            cart.items = [];
            await cart.save();
            return res.status(400).json({ message: "All items in your cart are no longer available. Cart has been cleared." });
        }

        // calculate total price
        let totalPrice = 0;
        validItems.forEach(item => {
            totalPrice += item.product.price * item.quantity;
        });

        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            console.log("Razorpay credentials missing in env");
            return res.status(500).json({ message: "Online payment is not configured. Please use Cash on Delivery." });
        }

        // create razorpay order
        const razorpayOrder = await razorpay.orders.create({
            amount: Math.round(totalPrice * 100),
            currency: "INR",
            receipt: "receipt_" + Date.now()
        });

        res.status(200).json({
            message: "Razorpay order created",
            razorpayOrder,
            totalPrice
        });
    } catch (error) {
        const desc = error?.error?.description || error?.message || JSON.stringify(error);
        console.log("Error in createRazorpayOrder controller:", desc, "| full:", JSON.stringify(error));
        res.status(500).json({ message: desc || "Failed to create Razorpay order" });
    }
}

async function verifyPayment(req, res) {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            shippingAddress,
            paymentMethod
        } = req.body;

        // generate signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");

        // compare signatures
        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({
                message: "Invalid payment signature"
            });
        }

        // getting the cart data
        const cart = await cartModel
            .findOne({ user: req.user._id })
            .populate("items.product");

        // if cart is empty
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: "Cart is empty" });
        }

        // drop items whose product was deleted
        const validItems = cart.items.filter(item => item.product && item.product._id);
        if (validItems.length === 0) {
            cart.items = [];
            await cart.save();
            return res.status(400).json({ message: "All items in your cart are no longer available." });
        }

        // create order items
        const orderItems = validItems.map(item => ({
            product: item.product._id,
            quantity: item.quantity,
            price: item.product.price
        }));

        // calculate total price
        let totalPrice = 0;
        orderItems.forEach(item => {
            totalPrice += item.price * item.quantity;
        });

        // creating order
        const order = await orderModel.create({
            user: req.user._id,
            items: orderItems,
            totalPrice,
            shippingAddress,
            paymentMethod,
            paymentId: razorpay_payment_id,
            razorpayOrderId: razorpay_order_id,
            paymentStatus: "completed",
            orderStatus: "pending"
        });

        // clear cart
        cart.items = [];
        await cart.save();

        res.status(201).json({
            message: "Payment verified and order created",
            order
        });
    } catch (error) {
        const desc = error?.error?.description || error?.message || JSON.stringify(error);
        console.log("Error in verifyPayment controller:", desc);
        res.status(500).json({ message: desc || "Failed to verify payment" });
    }
}

module.exports = {
    createOrder,
    createRazorpayOrder,
    verifyPayment,
    getMyOrder,
    getAllOrders,
    updateOrderStatus,
    cancelOrder
}