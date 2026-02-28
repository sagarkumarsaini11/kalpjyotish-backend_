const { RtcTokenBuilder, RtcRole } = require("agora-access-token");

const APP_ID = process.env.AGORA_APP_ID || "16f64b220e674c889cde3c902251061d";
const APP_CERTIFICATE =
  process.env.AGORA_APP_CERT || "12386e74119843c1a1abda591abb37f2";

const buildTokenPayload = ({ channelName, role, uid }) => {
  if (!channelName) {
    throw new Error("channelName is required");
  }

  const parsedUid = Number(uid ?? 0);
  const agoraRole = role === "publisher" ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;
  const expiresIn = 3600;
  const currentTs = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTs + expiresIn;

  const token = RtcTokenBuilder.buildTokenWithUid(
    APP_ID,
    APP_CERTIFICATE,
    channelName,
    parsedUid,
    agoraRole,
    privilegeExpiredTs
  );

  return {
    token,
    appId: APP_ID,
    channelName,
    uid: parsedUid,
    role: agoraRole === RtcRole.PUBLISHER ? "publisher" : "subscriber",
    expiresIn,
  };
};

const generateAgoraToken = (req, res) => {
  try {
    const payload = buildTokenPayload({
      channelName: req.params.channelName,
      role: req.params.role,
      uid: req.params.uid,
    });
    return res.status(200).json({ ...payload, message: "Token generated successfully" });
  } catch (error) {
    return res.status(400).json({ error: error.message || "Failed to generate token" });
  }
};

const generateAgoraTokenFromBody = (req, res) => {
  try {
    const payload = buildTokenPayload({
      channelName: req.body?.channelName,
      role: req.body?.role || "publisher",
      uid: req.body?.uid ?? 0,
    });
    return res.status(200).json({ ...payload, message: "Token generated successfully" });
  } catch (error) {
    return res.status(400).json({ error: error.message || "Failed to generate token" });
  }
};

module.exports = { generateAgoraToken, generateAgoraTokenFromBody };

