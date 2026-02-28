// const Contact = require("../models/Contact");
// const twilio = require("twilio");
// require("dotenv").config();

// const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// exports.addContact = async (req, res) => {
//   try {
//     const { name, email, mobile, gender, dob_time, place_of_birth, query } = req.body;

//     // Validate inputs
//     if (!name || !email || !mobile || !gender || !dob_time || !place_of_birth || !query) {
//       return res.status(400).json({
//         success: false,
//         message: "All fields are required",
//       });
//     }

//     // Save in DB
//     const contact = await Contact.create({
//       name,
//       email,
//       mobile,
//       gender,
//       dob_time,
//       place_of_birth,
//       query,
//     });

//     // Prepare WhatsApp message
//     const messageBody = `
// 📩 *New Contact Form Submission*
// ━━━━━━━━━━━━━━━
// 👤 Name: ${name}
// 📧 Email: ${email}
// 📱 Mobile: ${mobile}
// ⚧ Gender: ${gender}
// 🎂 DOB + Time: ${dob_time}
// 📍 Place of Birth: ${place_of_birth}
// 🗒️ Query: ${query}
// ━━━━━━━━━━━━━━━
// ✅ Please follow up with this user.
// `;

//     // Send WhatsApp message to admin
//     const messageResponse = await client.messages.create({
//       from: process.env.TWILIO_WHATSAPP_NUMBER,
//       to: process.env.ADMIN_WHATSAPP_NUMBER,
//       body: messageBody,
//     });

   
//     console.log("✅ WhatsApp message sent! SID:", messageResponse.sid);

//     res.status(201).json({
//       success: true,
//       message: "Form submitted successfully and WhatsApp message sent!",
//       data: contact,
//     });
//   } catch (error) {
//     console.error("❌ Error submitting contact form:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//       error: error.message,
//     });
//   }
// };


const Contact = require("../models/Contact");
const nodemailer = require("nodemailer");
require("dotenv").config();

exports.addContact = async (req, res) => {
  try {
    const { name, email, mobile, gender, dob_time, place_of_birth, query } = req.body;

    // Validate inputs
    if (!name || !email || !mobile || !gender || !dob_time || !place_of_birth || !query) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Save contact in DB
    const contact = await Contact.create({
      name,
      email,
      mobile,
      gender,
      dob_time,
      place_of_birth,
      query,
    });

    // Create SMTP transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,          // e.g., "smtp.gmail.com"
      port: process.env.SMTP_PORT || 465,   // usually 465 for SSL or 587 for TLS
      secure: true,                         // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,        // your email address
        pass: process.env.SMTP_PASS,        // your email password or app password
      },
    });

    // Prepare email content
    const mailOptions = {
      from: `"Kalp Jyotish Contact Form" <${process.env.SMTP_USER}>`,
      to: "falitmantra15@gmail.com",
      subject: "📩 New Contact Form Submission",
      html: `
        <h2>New Contact Form Submission</h2>
        <hr/>
        <p><strong>👤 Name:</strong> ${name}</p>
        <p><strong>📧 Email:</strong> ${email}</p>
        <p><strong>📱 Mobile:</strong> ${mobile}</p>
        <p><strong>⚧ Gender:</strong> ${gender}</p>
        <p><strong>🎂 DOB + Time:</strong> ${dob_time}</p>
        <p><strong>📍 Place of Birth:</strong> ${place_of_birth}</p>
        <p><strong>🗒️ Query:</strong> ${query}</p>
        <hr/>
        <p>✅ Please follow up with this user.</p>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully to falitmantra15@gmail.com");

    res.status(201).json({
      success: true,
      message: "Form submitted successfully and email sent!",
      data: contact,
    });
  } catch (error) {
    console.error("❌ Error submitting contact form:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
