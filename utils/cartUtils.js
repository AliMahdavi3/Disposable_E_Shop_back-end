
const formatPrice = (price) => {
    return new Intl.NumberFormat('fa-IR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(price);
};

const calculateTotals = (items) => {
    let totalPrice = 0;
    let totalQuantity = 0;

    items.forEach((item) => {
        const price = item.product.price;
        const quantity = parseInt(item.quantity, 10);

        if (!isNaN(price) && !isNaN(quantity)) {
            totalPrice += price * quantity;
            totalQuantity += quantity;
        }
    });

    return {
        totalPrice,
        totalQuantity,
        formattedPrice: formatPrice(totalPrice),
    };
};

module.exports = {
    formatPrice,
    calculateTotals,
};