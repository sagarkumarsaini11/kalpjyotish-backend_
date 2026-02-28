const crypto = require("crypto");

module.exports = (u1, u2) => {
  return crypto
    .createHash("sha256")
    .update([u1, u2].sort().join("-"))
    .digest("hex");
};
