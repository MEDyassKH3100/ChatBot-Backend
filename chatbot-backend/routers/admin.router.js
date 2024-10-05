const express = require('express');
const router = express.Router();
const auth = require("../auth");
const adminController = require('../controller/admin.controller');
const adminauth = require("../adminauth");
router.get('/total-users', auth, adminauth, adminController.getTotalUsers);
router.get('/total-admins', auth, adminauth, adminController.getTotalAdmins);
router.get('/total-attestations', auth, adminauth, adminController.getTotalAttestations);
router.get('/total-reclamations', auth, adminauth, adminController.getTotalReclamations);
router.get('/activities', auth, adminauth, adminController.getUserActivities);
router.get('/filter-users', auth, adminauth, adminController.filterUsers);

module.exports = router;
