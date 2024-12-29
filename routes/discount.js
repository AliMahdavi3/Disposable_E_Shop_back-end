const express = require('express');
const discountControllers = require('../controllers/discount');
const authenticate = require('../middlewares/authentication');
const router = express.Router();


router.post('/discount', authenticate, discountControllers.addDiscountCode);
router.get('/discounts', authenticate, discountControllers.listDiscountCodes);

router.post('/apply-discount', authenticate, discountControllers.applyDiscount);
router.post('/apply-discount/all', authenticate, discountControllers.applyDiscountToAllProducts);
router.post('/apply-discount/specific', authenticate, discountControllers.applyDiscountToSpecificProducts);

router.get('/discount/validate/:code', authenticate, discountControllers.validateDiscountCode);
router.get('/discount/:discountId', authenticate, discountControllers.getSingleDiscountCode);
router.put('/discount/:discountId', authenticate, discountControllers.updateDiscountCode);
router.delete('/discount/:discountId', authenticate, discountControllers.deleteDiscountCode);




module.exports = router;