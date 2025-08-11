const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");

const db = require("../config/database");

class User {
  constructor(
    name,
    email,
    password,
    role,
    image,
    phone = null,
    address = null,
    active = 1
  ) {
    this.id = uuidv4(); // generate a unique id
    this.name = name;
    this.email = email;
    this.password = password;
    this.role = role;
    this.image = image;
    this.phone = phone;
    this.address = address;
    this.active = active;
  }

  async save() {
    try {
      const hashedPassword = await bcrypt.hash(this.password, 10);
      const sql = `INSERT INTO users (id, name, email, password, role, image, phone, address,active, created_at) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?,?, NOW())`;
      const [newUser, _] = await db.execute(sql, [
        this.id,
        this.name,
        this.email,
        hashedPassword,
        this.role,
        this.image,
        this.phone,
        this.address,
        this.active,
      ]);
      return newUser;
    } catch (error) {
      console.error("Error saving user: ", error);
      throw error;
    }
  }
  //  Update user image
  static async updateImage(userId, imagePath) {
    try {
      const sql = `UPDATE users SET image = ? WHERE id = ?`;
      await db.execute(sql, [imagePath, userId]);
      return true;
    } catch (error) {
      console.error("Error updating image: ", error);
      throw error;
    }
  }
  // find user by email
  static async findByEmail(email) {
    try {
      const sql = `SELECT * FROM users WHERE email = ?`;
      const [user, _] = await db.execute(sql, [email]);
      return user[0];
    } catch (error) {
      console.error("Error finding user by email: ", error);
      throw error;
    }
  }

  //   Find all
  // find all users
  static async findAll() {
    const sql = `SELECT * FROM users`;
    const [result, _] = await db.execute(sql);
    return result;
  }

  // find user by id
  static async findById(id) {
    try {
      const sql = `SELECT * FROM users WHERE id = ?`;
      const [user, _] = await db.execute(sql, [id]);
      if (user.length === 0) {
        return null;
      }
      return user[0];
    } catch (error) {
      console.error("Error finding user by id: ", error);
      throw error;
    }
  }

  // verify password
  static async validatePassword(inputPassword, storedHash) {
    try {
      return await bcrypt.compare(inputPassword, storedHash);
    } catch (error) {
      console.error("Error validating password:", error);
      throw error;
    }
  }
  // reset password
  static async resetPassword(id, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const sql = `UPDATE users SET password = ? WHERE id = ?`;
    try {
      const [result, _] = await db.execute(sql, [hashedPassword, id]);
      return result;
    } catch (error) {
      console.error("Error resetting password:", error);
      throw error;
    }
  }

  // Generate authentication token
  static getAuthToken(userId) {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET_KEY, {
      expiresIn: process.env.JWT_EXPIRE + "s",
    });
  }
  // Hard Delete User
  static async deleteUser(id) {
    const sql = `DELETE FROM users WHERE id = ?`;
    try {
      const [result, _] = await db.execute(sql, [id]);
      return result;
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  }
  // soft delete user
  static async softDeleteUser(id) {
    const sql = `UPDATE users SET active = 0 WHERE id = ?`;
    try {
      const [result, _] = await db.execute(sql, [id]);
      return result;
    } catch (error) {
      console.error("Error soft deleting user:", error);
      throw error;
    }
  }

  static async updateUser(id, fields) {
    // Check if fields object is empty
    if (Object.keys(fields).length === 0) {
      throw new Error("No fields to update");
    }

    // Construct the SET clause
    const updates = Object.entries(fields)
      .map(([key, value]) => `${key} = ?`)
      .join(", ");

    // Prepare the values array
    const values = [...Object.values(fields), id];

    // Construct the SQL query
    const sql = `UPDATE users SET ${updates} WHERE id = ?`;

    try {
      const [result, _] = await db.execute(sql, values);
      return result;
    } catch (error) {
      console.error("Error updating user:", error.message);
      throw error;
    }
  }
}

module.exports = User;
