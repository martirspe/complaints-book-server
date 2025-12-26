// Data Models
const { User, Customer, Tutor, ConsumptionType, ClaimType, Currency, Claim, UserTenant } = require('../models');

// Utilities
const { formatDate, prepareEmailData } = require('../utils/emailUtils');

// Email Service
const sendEmail = require('../services/emailService');

// Create a new claim
exports.createClaim = async (req, res) => {
  try {
    const { customer_id, tutor_id, claim_type_id, consumption_type_id, currency_id, ...claimData } = req.body;
    const tenantId = req.tenant?.id;

    if (!tenantId) {
      return res.status(400).json({ message: 'Tenant context requerido' });
    }

    // Find all related records at once (customer and tutor must belong to the same tenant)
    const [customer, tutor, consumptionType, claimType, currency] = await Promise.all([
      Customer.findOne({ where: { id: customer_id, tenant_id: tenantId } }),
      tutor_id ? Tutor.findOne({ where: { id: tutor_id, tenant_id: tenantId } }) : null,
      ConsumptionType.findByPk(consumption_type_id),
      ClaimType.findByPk(claim_type_id),
      Currency.findByPk(currency_id)
    ]);

    // Check if all necessary records exist and belong to the tenant
    if (!customer) {
      return res.status(404).json({ message: 'Cliente no encontrado en este tenant' });
    }
    if (tutor_id && !tutor) {
      return res.status(404).json({ message: 'Tutor no encontrado en este tenant' });
    }
    if (!consumptionType || !claimType || !currency) {
      return res.status(404).json({ message: 'Uno o más registros de catálogo no fueron encontrados' });
    }

    // Handle attachment
    if (req.fileInfo) {
      claimData.attachment = req.fileInfo.filePath;
    }

    // Create the claim
    const claim = await Claim.create({
      customer_id,
      tutor_id,
      consumption_type_id,
      claim_type_id,
      currency_id,
      tenant_id: tenantId,
      ...claimData
    });

    // Generate claim code
    const currentYear = new Date().getFullYear();
    const prefix = claimType.name.substring(0, 3).toUpperCase();
    const sequential = String(claim.id).padStart(6, '0'); // human-friendly, fixed width
    claim.code = `${prefix}-${currentYear}-${sequential}`;
    await claim.save();

    // Reload the claim with relations to prepare email data
    const completeClaim = await Claim.findByPk(claim.id, {
      include: [{ model: Customer }, { model: ConsumptionType }, { model: ClaimType }, { model: Currency }]
    });

    // Prepare data for email sending
    const emailData = {
      ...prepareEmailData(completeClaim),
      creationDate: formatDate(completeClaim.creation_date)
    };

    // Prepare attachments for email
    const attachments = req.fileInfo ? [{ filename: req.file.originalname, path: req.fileInfo.filePath }] : [];

    // Send email when creating a claim
    await sendEmail(
      customer.email,
      'Nuevo Reclamo Registrado',
      `Hola ${customer.first_name}, se ha registrado su reclamo con el código: ${claim.code}.`,
      'newClaim',
      emailData,
      attachments,
      { tenant: req.tenant }
    );

    res.status(201).json({
      message: 'Tu reclamo fue registrado correctamente',
      fileInfo: req.fileInfo
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all claims
exports.getClaims = async (req, res) => {
  try {
    const tenantId = req.tenant?.id;
    const claims = await Claim.findAll({
      where: { tenant_id: tenantId },
      include: [{ model: Customer }, { model: Tutor }, { model: ConsumptionType }, { model: ClaimType }, { model: Currency }]
    });

    // Check if there are registered claims
    if (claims.length === 0) {
      return res.status(404).json({ message: 'No hay reclamos registrados' });
    }

    res.status(200).json(claims);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a claim by ID
exports.getClaimById = async (req, res) => {
  try {
    const tenantId = req.tenant?.id;
    const claim = await Claim.findOne({
      where: { id: req.params.id, tenant_id: tenantId },
      include: [{ model: Customer }, { model: Tutor }, { model: ConsumptionType }, { model: ClaimType }, { model: Currency }]
    });

    if (!claim) {
      return res.status(404).json({ message: 'El reclamo no fue encontrado' });
    }

    res.status(200).json(claim);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a claim
exports.updateClaim = async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenant?.id;
    const claimData = req.body;

    // Handle attachment
    if (req.fileInfo) {
      claimData.attachment = req.fileInfo.filePath;
    }

    const [updated] = await Claim.update(claimData, { where: { id, tenant_id: tenantId } });
    if (!updated) {
      return res.status(404).json({ message: 'El reclamo no fue encontrado' });
    }

    const updatedClaim = await Claim.findOne({
      where: { id, tenant_id: tenantId },
      include: [{ model: Customer }, { model: ConsumptionType }, { model: ClaimType }, { model: Currency }]
    });

    const emailData = {
      ...prepareEmailData(updatedClaim),
      updateDate: formatDate(updatedClaim.update_date)
    };

    // Prepare attachments for email
    const attachments = req.file ? [{ filename: req.file.originalname, path: req.file.path }] : [];

    // Send email when updating a claim
    await sendEmail(
      updatedClaim.Customer.email,
      'Reclamo Actualizado',
      `Hola ${updatedClaim.Customer.first_name}, su reclamo con el código: ${updatedClaim.code} ha sido actualizado.`,
      'updatedClaim',
      emailData,
      attachments,
      { tenant: req.tenant }
    );

    return res.status(200).json({
      message: 'Tu reclamo fue actualizado correctamente',
      fileInfo: req.fileInfo
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a claim
exports.deleteClaim = async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenant?.id;
    const deleted = await Claim.destroy({ where: { id, tenant_id: tenantId } });
    if (deleted) {
      return res.status(200).json({ message: 'El reclamo fue eliminado correctamente' });
    }
    throw new Error('Claim not found');
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el reclamo: ' + error.message });
  }
};

// Assign a claim
exports.assignClaim = async (req, res) => {
  try {
    const { id } = req.params;
    const { assigned_user } = req.body;
    const tenantId = req.tenant?.id;

    // Find the claim and assigned user simultaneously
    const [claim, user] = await Promise.all([
      Claim.findOne({
        where: { id, tenant_id: tenantId },
        include: [{ model: Customer }, { model: ConsumptionType }, { model: ClaimType }, { model: Currency }]
      }),
      User.findByPk(assigned_user)
    ]);

    if (!claim) {
      return res.status(404).json({ message: 'El reclamo no fue encontrado' });
    }

    if (!user) {
      return res.status(404).json({ message: 'El usuario no fue encontrado' });
    }

    const assigneeMembership = await UserTenant.findOne({ where: { user_id: user.id, tenant_id: tenantId } });
    if (!assigneeMembership) {
      return res.status(403).json({ message: 'El usuario asignado no pertenece a este tenant' });
    }

    claim.assigned_user = assigned_user;
    claim.assignment_date = new Date(); // Save the assignment date
    await claim.save();

    // Prepare data for email sending
    const emailData = {
      ...prepareEmailData(claim),
      assignedName: user.first_name,
      creationDate: formatDate(claim.creation_date),
      assignmentDate: formatDate(claim.assignment_date)
    };

    // Send email when assigning a claim
    await sendEmail(
      user.email,
      'Reclamo Asignado',
      `Hola ${user.first_name}, se le ha asignado el reclamo con el código: ${claim.code}.`,
      'claimAssigned',
      emailData,
      [],
      { tenant: req.tenant }
    );

    res.status(200).json({
      message: `El reclamo ha sido asignado a ${user.first_name} ${user.last_name}`,
      assignedUser: {
        id: user.id,
        name: `${user.first_name} ${user.last_name}`
      }
    });
  } catch (error) {
    res.status(400).json({ message: 'Error al asignar el reclamo: ' + error.message });
  }
};

// Resolve a claim
exports.resolveClaim = async (req, res) => {
  try {
    const { id } = req.params;
    const { response, resolved } = req.body;
    const tenantId = req.tenant?.id;

    const claim = await Claim.findOne({
      where: { id, tenant_id: tenantId },
      include: [{ model: Customer }, { model: ConsumptionType }, { model: ClaimType }, { model: Currency }]
    });

    if (!claim) {
      return res.status(404).json({ message: 'El reclamo no fue encontrado' });
    }

    claim.response = response;
    claim.resolved = resolved;
    claim.response_date = new Date(); // Make sure to set the response date

    // Handle attachment
    if (req.fileInfo) {
      claim.response_attachment = req.fileInfo.filePath;
    }

    await claim.save();

    // Prepare data for email sending
    const emailData = {
      ...prepareEmailData(claim),
      claimResponse: claim.response,
      creationDate: formatDate(claim.creation_date),
      responseDate: formatDate(claim.response_date)
    };

    // Prepare attachments for email
    const attachments = req.fileInfo ? [{ filename: req.file.originalname, path: req.fileInfo.filePath }] : [];

    // Send email when resolving a claim
    await sendEmail(
      claim.Customer.email,
      'Reclamo Resuelto',
      `Hola ${claim.Customer.first_name}, su reclamo con el código: ${claim.code} ha sido resuelto.`,
      'claimResolved',
      emailData,
      attachments,
      { tenant: req.tenant }
    );

    res.status(200).json({
      message: 'Tu reclamo ha sido resuelto correctamente',
      fileInfo: req.fileInfo
    });
  } catch (error) {
    res.status(400).json({ message: 'Error al resolver el reclamo: ' + error.message });
  }
};