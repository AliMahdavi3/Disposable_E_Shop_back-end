const express = require('express');
const discountControllers = require('../controllers/discount');
const authenticate = require('../middlewares/authentication');
const router = express.Router();


router.post('/discount', authenticate, discountControllers.addDiscountCode);
router.get('/discounts', authenticate, discountControllers.getDiscountCodesList);
router.post('/apply-discount', authenticate, discountControllers.applyDiscount);
router.get('/discount/validate/:code', authenticate, discountControllers.validateDiscountCode);
router.get('/discount/:discountId', authenticate, discountControllers.getSingleDiscountCode);
router.put('/discount/:discountId', authenticate, discountControllers.updateDiscountCode);
router.delete('/discount/:discountId', authenticate, discountControllers.deleteDiscountCode);




module.exports = router;