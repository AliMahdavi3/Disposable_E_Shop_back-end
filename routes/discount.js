const express = require('express');
const discountControllers = require('../controllers/discount');
const authenticate = require('../middlewares/authentication');
const router = express.Router();


router.post('/discount', authenticate, discountControllers.addDiscountCode);
router.get('/discounts', authenticate, discountControllers.listDiscountCodes);
router.get('/discount/validate/:code', authenticate, discountControllers.validateDiscountCode);
router.put('/discount/:discountId', authenticate, discountControllers.updateDiscountCode);
router.delete('/discount/:discountId', authenticate, discountControllers.deleteDiscountCode);

router.post('/apply-discount', authenticate, discountControllers.applyDiscount);

module.exports = router;