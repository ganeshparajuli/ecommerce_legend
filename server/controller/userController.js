const User = require("../model/userModel");
const bcrypt = require("bcrypt");
const authToken = require("../middlewares/authToken");
// const upload = require("../utils/Upload");

// register user
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    // check if user already exists
    const user = await User.findByEmail(email);
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }
    // Get image path from request
    const image = req.file ? `/uploads/${req.file.filename}` : null;
    // create new user
    const newUser = new User(name, email, password, "user", image, phone);
    await newUser.save();
    return authToken(newUser, 201, res, "User created successfully");
  } catch (error) {
    console.error("Error registering user: ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// add user
exports.addUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    // check if user already exists
    const user = await User.findByEmail(email);
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }
    // Get image path from request
    const image = req.file ? `/uploads/${req.file.filename}` : null;
    // create new user
    const newUser = new User(name, email, password, role, image);
    await newUser.save();
    return authToken(newUser, 201, res, "User created successfully");
  } catch (error) {
    console.error("Error registering user: ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }
    
    // check if user exists
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    
    // verify password
    const validPassword = await User.validatePassword(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    
    // CHECK: Verify if user account is active before issuing token
    if (user.active !== 1) {
      return res.status(401).json({ 
        success: false,
        message: "Account has been deactivated. Please contact support." 
      });
    }
    
    return authToken(user, 200, res, "Login successful");
  } catch (error) {
    console.error("Error logging in user: ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// get user profile
exports.profile = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res
      .status(200)
      .json({ success: true, messaage: "User Fetched Successful", user });
  } catch (error) {
    console.error("Error getting user profile: ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// get all user
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.findAll();
    res.status(200).json({ message: "Users fetched successfully", users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to retrieve users" });
  }
};

// update user image
exports.updateImage = async (req, res) => {
  try {
    const { id } = req.params;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;
    const result = await User.updateImage(id, imagePath);
    if (result) {
      return res
        .status(200)
        .json({ message: "Image updated successfully", updatedUser: result });
    } else {
      return res.status(400).json({ message: "Image not updated" });
    }
  } catch (error) {
    console.error("Error updating image: ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const fields = req.body;

    // Check if any fields are present
    if (!fields || Object.keys(fields).length === 0) {
      return res.status(400).json({ message: "No fields provided to update" });
    }

    const user = await User.updateUser(id, fields);
    if (user.affectedRows > 0) {
      return res.status(200).json({ message: "User updated successsfully" });
    } else {
      return res.status(400).json({ message: "User not updated" });
    }
  } catch (error) {
    console.error("Error updating user profile: ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Delete user
exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await User.deleteUser(id);
    if (result.affectedRows > 0) {
      res.status(200).json({ message: "User deleted successfully" });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Failed to delete user" });
  }
};

// change password
exports.changePassword = async (req, res, next) => {
  try {
    const { id, oldPassword, newPassword } = req.body;
    const user = await User.findById(id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Use validatePassword method to check if old password matches
    const isMatch = await User.validatePassword(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid old password" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    const result = await User.updatePassword(id, hashedPassword);
    if (result.affectedRows > 0) {
      res.status(200).json({ message: "Password updated successfully" });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ message: "Failed to change password" });
  }
};

// reset password
exports.resetPassword = async (req, res, next) => {
  try {
    const { id, newPassword } = req.body;
    const user = await User.findById(id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    // Update user password
    const result = await User.resetPassword(id, hashedPassword);
    if (result.affectedRows > 0) {
      res.status(200).json({ message: "Password reset successfully" });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ message: "Failed to reset password" });
  }
};