const FAQ = require("../model/faqModel");

// Create a new FAQ
exports.createFAQ = async (req, res) => {
  try {
    const { question, answer, order } = req.body;

    if (!question || !answer || order === undefined) {
      return res.status(400).json({
        message: "Question, answer and order are required",
      });
    }

    if (typeof order !== "number" || order < 0) {
      return res.status(400).json({
        message: "Order must be a non-negative number",
      });
    }

    const faq = new FAQ(question, answer, order);
    await faq.save();

    res.status(201).json({
      message: "FAQ added successfully",
      id: faq.id,
    });
  } catch (error) {
    console.error("Error creating FAQ:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get all FAQs
exports.getAllFAQs = async (req, res) => {
  try {
    const faqs = await FAQ.findAll();
    res.status(200).json(faqs);
  } catch (error) {
    console.error("Error fetching FAQs:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get FAQ by ID
exports.getFAQById = async (req, res) => {
  try {
    const faq = await FAQ.findById(req.params.id);

    if (!faq) {
      return res.status(404).json({ message: "FAQ not found" });
    }

    res.status(200).json(faq);
  } catch (error) {
    console.error("Error fetching FAQ:", error);
    res.status(500).json({ error: error.message });
  }
};

// Update FAQ
exports.updateFAQ = async (req, res) => {
  try {
    const faq = await FAQ.findById(req.params.id);
    if (!faq) {
      return res.status(404).json({ message: "FAQ not found" });
    }

    const { question, answer, order } = req.body;
    const fields = {};

    if (question) fields.question = question;
    if (answer) fields.answer = answer;
    if (order) fields.order = order;

    if (Object.keys(fields).length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    await FAQ.updateFAQ(req.params.id, fields);
    res.status(200).json({ message: "FAQ updated successfully" });
  } catch (error) {
    console.error("Error updating FAQ:", error);
    res.status(500).json({ error: error.message });
  }
};

// Delete FAQ
exports.deleteFAQ = async (req, res) => {
  try {
    await FAQ.deleteFAQ(req.params.id);
    res.status(200).json({ message: "FAQ deleted successfully" });
  } catch (error) {
    console.error("Error deleting FAQ:", error);
    res.status(500).json({ error: error.message });
  }
};
