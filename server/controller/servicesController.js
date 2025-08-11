// controllers/servicesController.js
const Services = require('../model/servicesModel');

exports.getAllServices = (req, res) => {
  Services.getAll((err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
};

exports.getServiceById = (req, res) => {
  const id = req.params.id;
  Services.getById(id, (err, result) => {
    if (err) return res.status(500).send(err);
    if (!result.length) return res.status(404).send('Service not found');
    res.json(result[0]);
  });
};

exports.createService = (req, res) => {
  const data = req.body;
  Services.create(data, (err, result) => {
    if (err) return res.status(500).send(err);
    res.status(201).send({ id: result.insertId, ...data });
  });
};

exports.updateService = (req, res) => {
  const id = req.params.id;
  const data = req.body;
  Services.update(id, data, (err) => {
    if (err) return res.status(500).send(err);
    res.send({ id, ...data });
  });
};

exports.deleteService = (req, res) => {
  const id = req.params.id;
  Services.delete(id, (err) => {
    if (err) return res.status(500).send(err);
    res.send({ message: 'Service deleted successfully' });
  });
};
