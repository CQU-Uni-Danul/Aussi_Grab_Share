const crypto = require('crypto');

// Generate 64 cryptographically secure random bytes for HS512
const buffer512 = crypto.randomBytes(64);

const jwtSecretHex512 = buffer512.toString('hex');
console.log('JWT Secret (Hex - 512-bit):', jwtSecretHex512); // Will be 128 characters long

const jwtSecretBase64Url512 = buffer512.toString('base64url');
console.log('JWT Secret (Base64url - 512-bit):', jwtSecretBase64Url512); // Will be ~86 characters long