const crypto = require('crypto');

const hashPassword = (password) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

const verifyPassword = (password, hashedPassword) => {
  const hash = hashPassword(password);
  return hash === hashedPassword;
};

const generateSalt = () => {
  return crypto.randomBytes(16).toString('hex');
};

const hashPasswordWithSalt = (password, salt) => {
  return crypto.createHash('sha256').update(password + salt).digest('hex');
};

module.exports = {
  hashPassword,
  verifyPassword,
  generateSalt,
  hashPasswordWithSalt
};