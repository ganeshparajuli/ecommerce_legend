const Contact = require("../model/contactModel");

// Create a new contact message
exports.createContact = async (req, res) => {
  try {
    const { name,phone, email, subject, message } = req.body;

    if (!name || !phone ||  !email || !subject || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const contact = new Contact(name, phone, email, subject, message);
    await contact.save();

    res.status(201).json({ message: "Message sent successfully" });
  } catch (error) {
    console.error("Error creating contact message:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get all contact messages
exports.getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.findAll();
    res.status(200).json(contacts);
  } catch (error) {
    console.error("Error fetching contact messages:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get a contact message by ID
exports.getContactById = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({ message: "Message not found" });
    }

    res.status(200).json(contact);
  } catch (error) {
    console.error("Error fetching contact message:", error);
    res.status(500).json({ error: error.message });
  }
};

// Update a contact message
exports.updateContact = async (req, res) => {
  try {
    const { name, email,phone, subject, message } = req.body;
    const fields = {};

    if (name) fields.name = name;
    if (email) fields.email = email;
    if (phone) fields.phone = phone;
    if (subject) fields.subject = subject;
    if (message) fields.message = message;

    if (Object.keys(fields).length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    await Contact.updateContact(req.params.id, fields);
    res.status(200).json({ message: "Message updated successfully" });
  } catch (error) {
    console.error("Error updating contact message:", error);
    res.status(500).json({ error: error.message });
  }
};

// Delete a contact message
exports.deleteContact = async (req, res) => {
  try {
    await Contact.deleteContact(req.params.id);
    res
      .status(200)
      .json({ success: true, message: "Message deleted successfully" });
  } catch (error) {
    console.error("Error deleting contact message:", error);
    res.status(500).json({ error: error.message });
  }
};
