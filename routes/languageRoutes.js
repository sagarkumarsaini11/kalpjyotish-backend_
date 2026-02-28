// routes/languageRoutes.js
const express = require("express");
const router = express.Router();

// Languages of India as per Constitution (Eighth Schedule) + English
const languages = [
  { id: 1, language: "Assamese" },
  { id: 2, language: "Bengali" },
  { id: 3, language: "Gujarati" },
  { id: 4, language: "Hindi" },
  { id: 5, language: "Kannada" },
  { id: 6, language: "Kashmiri" },
  { id: 7, language: "Konkani" },
  { id: 8, language: "Malayalam" },
  { id: 9, language: "Manipuri" },
  { id: 10, language: "Marathi" },
  { id: 11, language: "Nepali" },
  { id: 12, language: "Odia" },
  { id: 13, language: "Punjabi" },
  { id: 14, language: "Sanskrit" },
  { id: 15, language: "Sindhi" },
  { id: 16, language: "Tamil" },
  { id: 17, language: "Telugu" },
  { id: 18, language: "Urdu" },
  { id: 19, language: "Bodo" },
  { id: 20, language: "Santhali" },
  { id: 21, language: "Maithili" },
  { id: 22, language: "Dogri" },
  { id: 23, language: "English" }
];

// GET API to fetch all languages
router.get("/lang", (req, res) => {
  const statusCode = 200;
  res.status(statusCode).json({
    statusCode,
    success: true,
    count: languages.length,
    data: languages,
  });
});

module.exports = router;
