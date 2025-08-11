const { v4: uuidv4 } = require("uuid");
const db = require("../config/database");

class Review {
  constructor({
    product_id,
    reviewer_name,
    rating,
    comment,
    created_at,
    updated_at
  }) {
    this.id = uuidv4();
    this.product_id = product_id;
    this.reviewer_name = reviewer_name;
    this.rating = rating;
    this.comment = comment;
    this.created_at = created_at || new Date();
    this.updated_at = updated_at || new Date();
  }

  static async findByProductId(productId) {
    const query = "SELECT * FROM reviews WHERE product_id = ?";
    const [rows] = await db.execute(query, [productId]);
    return rows;
  }

  static async findAll() {
    const [rows] = await db.execute("SELECT * FROM reviews");
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.execute("SELECT * FROM reviews WHERE id = ?", [id]);
    return rows[0];
  }

  static async create(reviewData) {
    const {
      id,
      product_id,
      reviewer_name,
      rating,
      comment,
      created_at,
      updated_at
    } = new Review(reviewData);

    const query = `
      INSERT INTO reviews 
        (id, product_id, reviewer_name, rating, comment, created_at, updated_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    await db.execute(query, [
      id,
      product_id,
      reviewer_name,
      rating,
      comment,
      created_at,
      updated_at
    ]);

    return { id };
  }

  static async delete(id) {
    const query = "DELETE FROM reviews WHERE id = ?";
    await db.execute(query, [id]);
  }

  static async update(id, updateData) {
    const { rating, comment } = updateData;
    const updated_at = new Date();
    const query = "UPDATE reviews SET rating = ?, comment = ?, updated_at = ? WHERE id = ?";
    await db.execute(query, [rating, comment, updated_at, id]);
  }
}

module.exports = Review;

