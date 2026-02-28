require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require("http");
const { Server } = require("socket.io");

const privateChatSocket = require("./sockets/privateChat.socket");


require('./cron/walletCron');
const agoraRoutes = require('./routes/agoraRoutes');
const authRoutes = require("./routes/authRoutes");
const astrologerRoutes = require('./routes/astrologerRoutes'); //spellcheck
const dropdownRoutes = require('./routes/dropdownRoutes');
const transitRoutes = require('./routes/transitRoutes');
const poojaRoutes = require('./routes/poojaRoutes');
const productRoutes = require('./routes/productRoutes');
const faqRoutes = require('./routes/faqRoutes');
const adminRoutes = require('./routes/adminRoutes');
const communicationRoutes = require('./routes/communicationRoutes');
const SessionRoutes = require('./routes/sessionRoutes');
const walletRoutes = require('./routes/walletRoutes');
const notificationRoutes = require("./routes/notificationRoutes.js");
const ReviewRoutes = require("./routes/reviewRoutes.js");
const contactRoutes = require("./routes/contactRoutes");
const langRoutes = require('./routes/languageRoutes.js');
const clientRoutes = require('./routes/clientRoutes.js');
const otpRoutes = require("./routes/otpRoutes");
const moneyAddRoutes = require('./routes/moneyAddRoutes.js');
const astroRoutes = require("./routes/astroFormRoutes");
const astrologerRoutes_2 = require("./routes/astrologerRoutes_2");
const astroroutes = require("./routes/astroRoutes");
const transitRoute = require("./routes/transit.routes");

const authUserRoutes = require('./routes/authRoutes');

const privateChatRoutes = require("./routes/privateChat.routes.js");

const userDetailsRoutes = require("./routes/userDetailsRoutes.js")





const app = express();
const PORT = process.env.PORT || 5000;



const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
});
app.set("io", io);

privateChatSocket(io);

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use('/api/astrologer', astrologerRoutes);
app.use('/api', dropdownRoutes); 
const kundaliRoutes = require('./routes/kundaliRoutes');
app.use('/api/kundali', kundaliRoutes);
const bannerRoutes = require('./routes/bannerRoutes');
app.use('/api/banners', bannerRoutes);
app.use('/api', poojaRoutes);
app.use('/api/products', productRoutes);
app.use('/api/faqs', faqRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/communication', communicationRoutes);
app.use('/api/sessions', SessionRoutes);
app.use('/api/agora', agoraRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/wallet-money', walletRoutes);
app.use("/api/notification", notificationRoutes);
app.use("/api/review",ReviewRoutes);
app.use("/api/contact", contactRoutes);
app.use('/api', langRoutes);
app.use('/api/user',clientRoutes);
app.use("/api/otp", otpRoutes);
app.use('/api/money',moneyAddRoutes);
app.use("/api/astro-form", astroRoutes);
app.use("/api/astrologers-new", astrologerRoutes_2);
app.use("/api/astro",astroroutes);
app.use("/api/transits", transitRoute);
app.use("/api/chat", privateChatRoutes);

app.use("/api/userDetails", userDetailsRoutes)


app.use("/api/firebase", require("./routes/firebase.routes"));


const orderRoutes = require('./routes/orderRoutes');
app.use('/api/orders', orderRoutes);
const privacyPolicyRoutes = require('./routes/privacyPolicyRoutes');
app.use('/api', privacyPolicyRoutes);
const feedbackRoutes = require("./routes/feedbackRoutes");
app.use("/api/feedback", feedbackRoutes);
app.use("/api", require("./routes/followRoutes"));
app.use("/api/call",require("./routes/callRoutes.js"));
app.use("/api/start",require("./routes/chatRoutes.js"));
app.use('/api/ratings',require("./routes/ratingReviewRoutes.js"));



app.use('/api/auth/user', authUserRoutes);



app.use('/api/transits', transitRoutes);
// const authRoutes = require('./routes/auth');
// app.use('/api', authRoutes);


// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch((err) => console.error('❌ MongoDB connection failed:', err.message));

// ✅ Root route
app.get("/", (req, res) => {
  res.send("🌟 Kalp Jyotish backend is running!");
});

app.post("/test", (req, res) => {
  res.send("Test route works!");
  console.log(res);
});




const SIGNS = [
  "aries", "taurus", "gemini", "cancer", "leo", "virgo",
  "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"
];

const descriptions = [
  "A surprise is on its way to you today.",
  "Expect a moment of peace amidst chaos.",
  "You’ll find inspiration in unexpected places.",
  "Someone close has valuable advice.",
  "Now is the time to trust your instincts.",
  "A missed opportunity will return soon.",
  "Practice patience; rewards will follow.",
  "Focus on what truly matters to you.",
  "An old friend may reappear in your life.",
  "Let go of what no longer serves you.",
  "Your energy will attract positive people.",
  "You may discover a hidden talent today.",
  "Challenges will shape your character.",
  "Small steps will lead to major progress.",

  "Be bold – your courage will be rewarded.",
  "An emotional breakthrough is on the horizon.",
  "You’re more resilient than you think.",
  "Good news is closer than you expect.",
  "Honesty will strengthen your relationships.",
  "You’ll feel extra creative today – use it.",
  "Reevaluate your priorities and refocus.",
  "Romantic energy surrounds you today.",
  "Communication is the key to today’s success.",
  "A financial gain is possible soon.",
  "You’re ready to take a necessary risk.",
  "A short trip could refresh your soul.",
  "Avoid gossip – protect your peace.",
  "Today favors deep thinking and reflection.",
  "Your efforts are being noticed.",
  "You may get clarity about a past issue.",
  "Collaboration will be fruitful today.",
  "You're entering a cycle of abundance.",
  "It's okay to take a break and recharge.",
  "Helping someone else will lift your spirit.",
  "Forgiveness will set you free.",
  "A long-awaited answer is coming your way.",
  "Don’t be afraid to express your ideas.",
  "Focus on self-love and healing today.",
  "Something you've been hoping for will manifest.",
  "The universe is aligning in your favor.",
  "You are ready to grow beyond your limits.",
  "Let spontaneity guide you today.",
  "You might meet someone inspiring today.",
  "Try something new – it could be life-changing.",
  "Set boundaries for your well-being.",
  "Avoid making big decisions today.",
  "Today is perfect for setting goals.",
  "You’ll shine in a leadership role.",
  "An unexpected compliment will lift your mood.",
  "Time to step outside your comfort zone.",
  "Reconnect with something that brings joy.",
  "Gratitude will bring you more to be thankful for.",
  "Don’t compare yourself to others.",
  "Trust the timing of your life.",
  "You’re about to attract something amazing.",
  "Let intuition guide your actions today.",
  "The answer you seek lies within.",
  "Stay open-minded — something unusual is coming.",
  "You’re stronger than your doubts.",
  "Stand up for what you believe in.",
  "Take time to recharge your energy.",
  "A peaceful resolution is possible.",
  "Be mindful of your words today.",
  "Your curiosity will lead to success.",
  "A shift in your routine brings clarity.",
  "You may discover a new passion today.",
  "Listen before you speak today.",
  "Trust the journey, even if unclear.",
  "Don’t rush — everything unfolds in time.",
  "Your past efforts are about to pay off.",
  "Creative expression will be especially rewarding.",
  "It's a good day to ask questions.",
  "You’ll find power in staying calm.",
  "Today’s actions create tomorrow’s reality.",
  "New friendships may form unexpectedly.",
  "Use humor to diffuse a tense situation.",
  "Be open to change — it’s necessary.",
  "A long-held dream is within reach.",
  "Release control and trust the flow.",
  "Someone values you more than you realize.",
  "You have more choices than you think.",
  "Don’t fear mistakes — they teach growth.",
  "Start something you've been postponing.",
  "An opportunity may come from a stranger.",
  "Let compassion guide your interactions.",
  "You’re entering a powerful transformation phase.",
  "Be cautious of impulsive decisions.",
  "You're ready to level up spiritually.",
  "A lucky encounter may shift your direction.",
  "Your energy will uplift those around you.",
  "Today brings light to a hidden truth.",
  "You're ready to turn the page.",
  "Your consistency will soon be rewarded.",
  "Take the initiative on a lingering task.",
  "Nurture what you want to grow.",
  "Be patient — trust the slow bloom.",
  "Speak your truth — it will liberate you.",
  "Your mind is sharp — put it to work.",
  "Today favors bold thinking and clear action.",
  "Pay attention to your dreams tonight.",
  "You're moving closer to balance and harmony.",
  "The next step will reveal itself soon.",
  "Joy is found in being present.",
  "It’s a great day to forgive and move forward.",
  "Let your light shine unapologetically."
];

const moods = ["Happy", "Focused", "Adventurous", "Calm", "Romantic", "Tense", "Excited", "Reflective", "Energetic", "Peaceful"];
const colors = ["Red", "Blue", "Green", "Yellow", "Black", "White", "Purple", "Orange", "Pink", "Turquoise"];

function generateHoroscope(sign, period) {
  return {
    sign,
    period,
    description: descriptions[Math.floor(Math.random() * descriptions.length)],
    lucky_number: Math.floor(Math.random() * 100),
    mood: moods[Math.floor(Math.random() * moods.length)],
    color: colors[Math.floor(Math.random() * colors.length)],
    date: new Date().toLocaleDateString()
  };
}

app.get('/horoscope/:sign/:period', (req, res) => {
  const { sign, period } = req.params;
  const lowerSign = sign.toLowerCase();

  if (!SIGNS.includes(lowerSign)) {
    return res.status(400).json({ error: 'Invalid zodiac sign' });
  }

  if (!['daily', 'weekly'].includes(period.toLowerCase())) {
    return res.status(400).json({ error: 'Period must be "daily" or "weekly"' });
  }

  const result = generateHoroscope(lowerSign, period.toLowerCase());
  return res.json(result);
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});


app.use((err, req, res, next) => {
  console.error("GLOBAL ERROR:", err);

  res.status(500).json({
    message: err.message || "Something went wrong",
  });
});
