// Data Models
const { Customer, DocumentType } = require('../models');

// Create a new customer
exports.createCustomer = async (req, res) => {
  try {
    const { document_type_id, document_number, email, phone } = req.body;

    // Check if the document_type_id exists in document_types
    const existingDocumentType = await DocumentType.findByPk(document_type_id);
    if (!existingDocumentType) {
      return res.status(404).json({ message: "El tipo de documento no existe" });
    }

    // Check if the document_number already exists for another customer
    const existingDocument = await Customer.findOne({ where: { document_number } });
    if (existingDocument) {
      return res.status(409).json({ message: 'Este número de documento ya está registrado' });
    }

    // Check if the email already exists for another customer
    const existingEmail = await Customer.findOne({ where: { email } });
    if (existingEmail) {
      return res.status(409).json({ message: 'Este correo electrónico ya está registrado' });
    }

    // Check if the phone number already exists for another customer
    const existingPhone = await Customer.findOne({ where: { phone } });
    if (existingPhone) {
      return res.status(409).json({ message: 'Este número de teléfono ya está registrado' });
    }

    // Create the customer if no duplicates exist
    const customer = await Customer.create(req.body);
    res.status(201).json({ message: 'Cliente registrado correctamente', data: customer });
  } catch (error) {
    res.status(500).json({ message: 'Error al registrar el cliente: ' + error.message });
  }
};

// Get all customers
exports.getCustomers = async (req, res) => {
  try {
    const customers = await Customer.findAll({
      include: [{ model: DocumentType }]
    });

    // Check if there are registered customers
    if (customers.length === 0) {
      return res.status(404).json({ message: 'No hay clientes registrados' });
    }

    res.status(200).json(customers);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener clientes: ' + error.message });
  }
};

// Get a client by document number
exports.getCustomerByDocument = async (req, res) => {
  try {
    const { document_number } = req.params;

    const customer = await Customer.findOne({
      where: { document_number },
      include: [{ model: DocumentType }]
    });

    if (!customer) {
      return res.status(404).json({ message: "El cliente no fue encontrado" });
    }

    res.status(200).json(customer);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el cliente: ' + error.message });
  }
};

// Get a customer by ID
exports.getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id, {
      include: [{ model: DocumentType }]
    });

    // Check if the customer exists
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.status(200).json(customer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a customer
exports.updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { document_number, email, phone } = req.body;

    // Check if the customer exists
    const customer = await Customer.findByPk(id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Check if the document_number is already in use by another customer (if sent)
    if (document_number) {
      const existingDocument = await Customer.findOne({ where: { document_number } });
      if (existingDocument && existingDocument.id !== parseInt(id)) {
        return res.status(400).json({ message: 'Document number is already in use' });
      }
    }

    // Check if the email is already in use by another customer (if sent)
    if (email) {
      const existingEmail = await Customer.findOne({ where: { email } });
      if (existingEmail && existingEmail.id !== parseInt(id)) {
        return res.status(400).json({ message: 'Email is already in use' });
      }
    }

    // Check if the phone is already in use by another customer (if sent)
    if (phone) {
      const existingPhone = await Customer.findOne({ where: { phone } });
      if (existingPhone && existingPhone.id !== parseInt(id)) {
        return res.status(400).json({ message: 'Phone number is already in use' });
      }
    }

    // Update the customer if no duplicates exist
    const [updated] = await Customer.update(req.body, { where: { id } });
    if (updated) {
      const updatedCustomer = await Customer.findByPk(id);
      return res.status(200).json(updatedCustomer);
    }

    throw new Error("Customer not found");
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a customer
exports.deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Customer.destroy({ where: { id } });

    // Show a message if the customer is deleted
    if (deleted) {
      return res.status(200).json({ message: "El cliente fue eliminado correctamente" });
    }

    throw new Error("Customer not found");
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};