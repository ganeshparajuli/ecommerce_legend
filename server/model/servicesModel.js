// models/servicesModel.js
const db = require('../config/database'); // adjust this if your DB connection file is elsewhere

const Services = {
  getAll: (callback) => {
    db.query('SELECT * FROM services', callback);
  },

  getById: (id, callback) => {
    db.query('SELECT * FROM services WHERE id = ?', [id], callback);
  },

  create: (data, callback) => {
    db.query('INSERT INTO services (title, description) VALUES (?, ?)', [data.title, data.description], callback);
  },

  update: (id, data, callback) => {
    db.query('UPDATE services SET title = ?, description = ? WHERE id = ?', [data.title, data.description, id], callback);
  },

  delete: (id, callback) => {
    db.query('DELETE FROM services WHERE id = ?', [id], callback);
  }
};

module.exports = Services;
