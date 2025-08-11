// Validator utilities for product-related operations

const validateProduct = (productData) => {
  const errors = [];

  // Required fields
  if (!productData.name) {
    errors.push("Product name is required");
  } else if (productData.name.length < 3 || productData.name.length > 100) {
    errors.push("Product name must be between 3 and 100 characters");
  }

  if (!productData.actualPrice) {
    errors.push("Actual price is required");
  } else if (
    isNaN(parseFloat(productData.actualPrice)) ||
    parseFloat(productData.actualPrice) <= 0
  ) {
    errors.push("Actual price must be a positive number");
  }

  if (
    productData.discountPrice &&
    (isNaN(parseFloat(productData.discountPrice)) ||
      parseFloat(productData.discountPrice) < 0)
  ) {
    errors.push("Discount price must be a non-negative number");
  }

  if (
    productData.discountPrice &&
    parseFloat(productData.discountPrice) >= parseFloat(productData.actualPrice)
  ) {
    errors.push(
      "Discount price cannot be greater than or equal to actual price"
    );
  }

  if (!productData.description) {
    errors.push("Product description is required");
  }

  if (!productData.category) {
    errors.push("Product category is required");
  }

  if (!productData.quantity) {
    errors.push("Product quantity is required");
  } else if (
    isNaN(parseInt(productData.quantity)) ||
    parseInt(productData.quantity) < 0
  ) {
    errors.push("Product quantity must be a non-negative integer");
  }

  return errors;
};

module.exports = {
  validateProduct,
};
    