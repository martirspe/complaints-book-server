// Data Model
const { User } = require('../models');

// Bcrypt library for JWT
const bcrypt = require('bcrypt');

// Import the JWT generate utility
const { generateJWT } = require('../utils/jwtUtils');

// Create a new user
exports.createUser = async (req, res) => {
  try {
    const { first_name, last_name, email, password, license_type, license_expiration_date, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'Este correo ya está registrado' });
    }

    // Hash the password before saving the user
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      first_name,
      last_name,
      email,
      password: hashedPassword,
      license_type,
      license_expiration_date,
      role
    });

    res.status(201).json({ message: 'Usuario registrado correctamente', data: user });
  } catch (error) {
    res.status(500).json({ message: 'Error al registrar el usuario: ' + error.message });
  }
};

// Get all users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.findAll();

    // Verify if there are registered users
    if (users.length === 0) {
      return res.status(404).json({ message: 'No hay usuarios registrados' });
    }

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener usuarios: ' + error.message });
  }
};

// Get a user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    // Verify if the user exists
    if (!user) {
      return res.status(404).json({ message: "El usuario no fue encontrado" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el usuario: ' + error.message });
  }
};

// Update a user
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, password } = req.body;

    // Verify if email is already in use by another user (if provided)
    if (email) {
      const existingEmail = await User.findOne({ where: { email } });
      if (existingEmail && existingEmail.id !== parseInt(id)) {
        return res.status(409).json({ message: 'Este correo electrónico ya está registrado' });
      }
    }

    // If a new password is provided, hash it before saving
    if (password) {
      req.body.password = await bcrypt.hash(password, 10);
    }

    // Update the user with the provided data
    const [updated] = await User.update(req.body, { where: { id } });
    if (updated) {
      const updatedUser = await User.findByPk(id);
      return res.status(200).json({ message: 'Usuario actualizado correctamente', data: updatedUser });
    }

    throw new Error('User not found');
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el usuario: ' + error.message });
  }
};

// Delete a user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await User.destroy({ where: { id } });

    // Show a message if the user is deleted
    if (deleted) {
      return res.status(200).json({ message: "El usuario fue eliminado correctamente" });
    }

    throw new Error("User not found");
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el usuario: ' + error.message });
  }
};

// User login
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    // Show a message if user data is incorrect
    if (!user) {
      return res.status(401).json({ message: "Correo o contraseña incorrectos" });
    }

    // Compare the received password with the hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Correo o contraseña incorrectos" });
    }

    // Generate and return a JWT
    const token = generateJWT(user);

    res.status(200).json({ message: 'Sesión iniciada correctamente', token, user });
  } catch (error) {
    res.status(500).json({ message: 'Error al iniciar sesión: ' + error.message });
  }
};