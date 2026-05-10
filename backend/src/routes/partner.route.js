const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/auth.middleware.js');
const {
    approvePartner,
    rejectPartner,
    applyForPartner,
    getMyPartner,
    getAllPartners
} = require("../controllers/partner.controller.js");

// apply for partner
router.post("/apply", authMiddleware.protectRoute, applyForPartner)
// list all partner applications (admin)
router.get("/", authMiddleware.protectRoute, authMiddleware.isAdmin, getAllPartners);
// approve partner
router.put("/approve/:id", authMiddleware.protectRoute, authMiddleware.isAdmin, approvePartner);
// reject partner
router.put("/reject/:id", authMiddleware.protectRoute, authMiddleware.isAdmin, rejectPartner);
router.get("/me", authMiddleware.protectRoute, getMyPartner);

module.exports = router;