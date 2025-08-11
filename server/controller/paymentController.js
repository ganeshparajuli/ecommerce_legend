const Payment = require("../model/paymentModel");

exports.createCustomer = async (req, res) => {
  try {
    const { email, name } = req.body;

    // Create a customer in Stripe
    const customer = await Payment.create({
      email,
      name,
    });

    res.status(200).json({ success: true, customerId: customer.id });
  } catch (error) {
    console.error("Error creating customer:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.addPaymentMethod = async (req, res) => {
  try {
    const { customerId, paymentMethodId, userId } = req.body;

    // Attach the payment method to the customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });

    // Set as default payment method
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    // Save in database
    await Payment.savePaymentInfo(userId, customerId, paymentMethodId);

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error adding payment method:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

