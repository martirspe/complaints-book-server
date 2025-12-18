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
      return res.status(409).json({ message: 'User with this email already exists' });
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

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.findAll();

    // Verify if there are registered users
    if (users.length === 0) {
      return res.status(404).json({ message: 'No users found' });
    }

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    // Verify if the user exists
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
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
        return res.status(409).json({ message: 'Email is already in use' });
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
      return res.status(200).json(updatedUser);
    }

    throw new Error('User not found');
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await User.destroy({ where: { id } });

    // Show a message if the user is deleted
    if (deleted) {
      return res.status(200).json({ message: "User deleted successfully" });
    }

    throw new Error("User not found");
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// User login
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    // Show a message if user data is incorrect
    if (!user) {
      return res.status(401).json({ message: "Incorrect email or password" });
    }

    // Compare the received password with the hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect email or password" });
    }

    // Generate and return a JWT
    const token = generateJWT(user);

    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};