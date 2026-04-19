const crypto = require("crypto");

const legacyDemoPasswords = {
  "admin@qualitrack.local": "Admin123!",
  "inspector@qualitrack.local": "Inspect123!",
};

function hashPassword(password, salt) {
  return crypto.scryptSync(password, salt, 64).toString("hex");
}

function timingSafeEqual(a, b) {
  const first = Buffer.from(a, "hex");
  const second = Buffer.from(b, "hex");

  if (first.length !== second.length) {
    return false;
  }

  return crypto.timingSafeEqual(first, second);
}

function verifyPassword(password, storedHash, email) {
  if (!storedHash) {
    return false;
  }

  if (storedHash.includes(":")) {
    const [salt, expectedHash] = storedHash.split(":");

    if (!salt || !expectedHash) {
      return false;
    }

    const actualHash = hashPassword(password, salt);
    return timingSafeEqual(actualHash, expectedHash);
  }

  if (storedHash === "$2b$10$replace-with-real-hash") {
    return legacyDemoPasswords[email] === password;
  }

  return false;
}

module.exports = {
  verifyPassword,
};
