// controller/newsletterController.js
console.log('🔧 Loading Newsletter model...');
const Newsletter = require("../model/newsletterModel");
console.log('✅ Newsletter model loaded successfully');

// Controller methods for handling newsletter subscription operations
const newsletterController = {
  // Subscribe to newsletter
  subscribe: async (req, res) => {
    console.log('📧 Newsletter subscribe called with:', req.body);
    console.log('📧 Request headers:', req.headers);
    
    try {
      const { email } = req.body;

      if (!email) {
        console.log('❌ No email provided');
        return res.status(400).json({
          success: false,
          message: "Email is required",
        });
      }

      console.log('📧 Checking if email exists:', email);
      // Check if email already exists
      const existingSubscription = await Newsletter.findByEmail(email);
      if (existingSubscription) {
        console.log('❌ Email already exists:', email);
        return res.status(409).json({
          success: false,
          message: "Email is already subscribed",
        });
      }

      console.log('📧 Creating new subscription for:', email);
      // Create and save new subscription
      const newsletter = new Newsletter(email);
      const newSubscription = await newsletter.save();

      console.log('✅ Newsletter subscription successful:', newSubscription);
      return res.status(201).json({
        success: true,
        message: "Successfully subscribed to the newsletter",
        data: newSubscription,
      });
    } catch (error) {
      console.error("❌ Error in subscribe:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while subscribing to the newsletter",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Get all subscriptions
  getAllSubscriptions: async (req, res) => {
    console.log('📧 getAllSubscriptions called');
    try {
      const subscriptions = await Newsletter.findAll();
      console.log('✅ Found subscriptions:', subscriptions.length);

      return res.status(200).json({
        success: true,
        count: subscriptions.length,
        data: subscriptions,
      });
    } catch (error) {
      console.error("❌ Error in getAllSubscriptions:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while retrieving subscriptions",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Get subscription by ID
  getSubscriptionById: async (req, res) => {
    console.log('📧 getSubscriptionById called with id:', req.params.id);
    try {
      const { id } = req.params;

      const subscription = await Newsletter.findById(id);

      if (!subscription) {
        console.log('❌ Subscription not found:', id);
        return res.status(404).json({
          success: false,
          message: "Subscription not found",
        });
      }

      console.log('✅ Found subscription:', subscription);
      return res.status(200).json({
        success: true,
        data: subscription,
      });
    } catch (error) {
      console.error("❌ Error in getSubscriptionById:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while retrieving the subscription",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Update subscription
  updateSubscription: async (req, res) => {
    console.log('📧 updateSubscription called with id:', req.params.id, 'email:', req.body.email);
    try {
      const { id } = req.params;
      const { email } = req.body;

      if (!email) {
        console.log('❌ No email provided for update');
        return res.status(400).json({
          success: false,
          message: "Email is required",
        });
      }

      // Check if subscription exists
      const subscription = await Newsletter.findById(id);
      if (!subscription) {
        console.log('❌ Subscription not found for update:', id);
        return res.status(404).json({
          success: false,
          message: "Subscription not found",
        });
      }

      // Check if new email already exists for another subscription
      if (email !== subscription.email) {
        const existingEmail = await Newsletter.findByEmail(email);
        if (existingEmail && existingEmail.id !== id) {
          console.log('❌ Email already exists for another subscription:', email);
          return res.status(409).json({
            success: false,
            message: "Email is already subscribed",
          });
        }
      }

      const updatedSubscription = await Newsletter.updateSubscription(id, email);

      if (!updatedSubscription) {
        console.log('❌ Failed to update subscription:', id);
        return res.status(404).json({
          success: false,
          message: "Failed to update subscription",
        });
      }

      console.log('✅ Subscription updated successfully:', updatedSubscription);
      return res.status(200).json({
        success: true,
        message: "Subscription updated successfully",
        data: updatedSubscription,
      });
    } catch (error) {
      console.error("❌ Error in updateSubscription:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while updating the subscription",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Unsubscribe (delete subscription)
  unsubscribe: async (req, res) => {
    console.log('📧 unsubscribe called with id:', req.params.id);
    try {
      const { id } = req.params;

      const deleted = await Newsletter.deleteSubscription(id);

      if (!deleted) {
        console.log('❌ Subscription not found for deletion:', id);
        return res.status(404).json({
          success: false,
          message: "Subscription not found",
        });
      }

      console.log('✅ Successfully unsubscribed:', id);
      return res.status(200).json({
        success: true,
        message: "Successfully unsubscribed from the newsletter",
      });
    } catch (error) {
      console.error("❌ Error in unsubscribe:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while unsubscribing",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },
};

console.log('📧 Newsletter controller methods configured');
module.exports = newsletterController;