const db = require("../config/database");
const { v4: uuidv4 } = require("uuid");

class Payment {
  static savePaymentInfo(userId) {
    return new Promise((resolve, reject) => {
      const paymentMethodId = uuidv4();
      const query = `
        INSERT INTO payment_methods (id, user_id, created_at)
        VALUES (?, ?, NOW())
      `;

      db.execute(query, [paymentMethodId, userId], (err) => {
        if (err) {
          return reject(err);
        }
        resolve(paymentMethodId);
      });
    });
  }

  static saveTransaction(orderId, amount, status) {
    return new Promise((resolve, reject) => {
      const transactionId = uuidv4();
      const query = `
        INSERT INTO transactions (id, order_id, amount, status, created_at)
        VALUES (?, ?, ?, ?, ?, NOW())
      `;

      db.query(
        query,
        [transactionId, orderId, amount, status],
        (err, results) => {
          if (err) {
            return reject(err);
          }
          resolve(transactionId);
        }
      );
    });
  }
}

module.exports = Payment;
