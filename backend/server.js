import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch'; 
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
dotenv.config();
const app = express();
app.use(express.json());
app.use(cors({ origin: '*' })); 

// Variable Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  mobile: { type: String, required: true, unique: true },
  password: { type: String, required: true }, 
  role: { type: String, enum: ['donor', 'volunteer'], required: true },
  createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', userSchema);
const listingSchema = new mongoose.Schema({
  hallName: { type: String, required: true },
  foodDetails: { type: String, required: true },
  totalServings: { type: Number, required: true },       
  servingsAvailable: { type: Number, required: true },   
  location: { type: String, required: true },
  contact: { type: String, required: true },
  isVeg: { type: Boolean, default: true },
  isPacked: { type: Boolean, default: false },
  donorId: { type: String, default: null },
  volunteerId: { type: String, default: null },
  volunteerName: { type: String, default: '' }, 
  status: { type: String, enum: ['available', 'claimed', 'completed'], default: 'available' }, 
  proofPhotoUrl: { type: String, default: null },
  createdAt: { type: Date, default: Date.now }
});
const Listing = mongoose.model('Listing', listingSchema);

// Temporary OTP
const otpSchema = new mongoose.Schema({
  mobile: { type: String, required: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 300 } 
});
const OTP = mongoose.model('OTP', otpSchema);
// DB INTERACTION BRIDGE
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Production Database Handshake Established');
    pollTelegramUpdates();
  })
  .catch(err => console.error('CRITICAL DATABASE FAULT:', err));
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: "Access token omitted." });
  jwt.verify(token, process.env.JWT_SECRET || 'FALLBACK_LOCAL_SECRET_CHAIN', (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid context token handshake expired." });
    req.user = user;
    next();
  });
};

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, mobile, password, role } = req.body;
    if(!name || !mobile || !password) return res.status(400).json({ error: "Missing required node telemetry fields." });
    const existingUser = await User.findOne({ mobile });
    if (existingUser) return res.status(400).json({ error: "Identifier sequence already claimed." });
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({ name, mobile, password: hashedPassword, role });
    await newUser.save();
    const token = jwt.sign({ id: newUser._id, role: newUser.role }, process.env.JWT_SECRET || 'FALLBACK_LOCAL_SECRET_CHAIN', { expiresIn: '7d' });
    res.status(201).json({ token, user: { _id: newUser._id, name: newUser.name, mobile: newUser.mobile, role: newUser.role } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.post('/api/auth/login', async (req, res) => {
  try {
    const { mobile, password } = req.body;
    const user = await User.findOne({ mobile });
    if (!user) return res.status(400).json({ error: "Node credentials context unverified." });
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: "Invalid authentication pairing match." });
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'FALLBACK_LOCAL_SECRET_CHAIN', { expiresIn: '7d' });
    res.status(200).json({ token, user: { _id: user._id, name: user.name, mobile: user.mobile, role: user.role } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.put('/api/users/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.id !== req.params.id) return res.status(403).json({ error: "Unauthorized write state sequence block." });
    const { name, mobile } = req.body;
    const updatedUser = await User.findByIdAndUpdate(req.params.id, { name, mobile }, { new: true }).select('-password');
    res.status(200).json(updatedUser);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/listings', async (req, res) => {
  try {
    const data = await Listing.find().sort({ createdAt: -1 });
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.post('/api/listings', authenticateToken, async (req, res) => {
  try {
    const newListing = new Listing({
      hallName: req.body.hallName,
      foodDetails: req.body.foodDetails,
      totalServings: Number(req.body.totalServings),
      servingsAvailable: Number(req.body.totalServings),
      location: req.body.location,
      contact: req.body.contact,
      isVeg: req.body.isVeg,
      isPacked: req.body.isPacked,
      donorId: req.user.id
    });
    await newListing.save();
    const telegramMsg = `🚨 *FOOD SURPLUS ALERT* 🚨\n\n*Venue:* ${newListing.hallName}\n*Food:* ${newListing.foodDetails}\n*Servings / Plates:* ~${newListing.totalServings} Plates\n🌱 *Food Details:* ${newListing.isVeg ? '🌱 Pure Veg' : '🍗 Non-Veg'}\n*Location:* ${newListing.location}\n*Contact:* ${newListing.contact}\n\n👉 *Claim this donation instantly:*\n[Click here to open ShareMeal Dashboard](https://https://sharemeal-app.vercel.app/)`;
    //const telegramMsg = `🚨 *FOOD SURPLUS ALERT* 🚨\n\n*Venue:* ${newListing.hallName}\n*Food:* ${newListing.foodDetails}\n*Servings / Plates:* ~${newListing.totalServings} Plates\n🌱 *Food Details:* ${newListing.isVeg ? '🌱 Pure Veg' : '🍗 Non-Veg'}\n*Location:* ${newListing.location}\n*Contact:* ${newListing.contact}\n\nReply to this message with "*Claimed [Venue Name]*" once your're ready to collect.\n*Thank You 😊*`;
    if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
      await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: process.env.TELEGRAM_CHAT_ID, text: telegramMsg, parse_mode: 'Markdown' })
      }).catch(err => console.error("Telegram notify failed :", err));
    }
    res.status(201).json(newListing);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.patch('/api/listings/:id/claim', authenticateToken, async (req, res) => {
  try {
    const updated = await Listing.findByIdAndUpdate(
      req.params.id, 
      { status: 'claimed', servingsAvailable: 0, volunteerId: req.user.id, volunteerName: req.body.volunteerName || 'Web Volunteer' }, 
      { new: true }
    );
    res.json(updated);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.patch('/api/listings/:id/complete', authenticateToken, async (req, res) => {
  try {
    const completedListing = await Listing.findByIdAndUpdate(req.params.id, { status: 'completed', proofPhotoUrl: req.body.photoUrl }, { new: true });
    const completionMessage = `*RESCUE SUCCESS CONFIRMED* 🎉\n\n✅ Supply from *${completedListing.hallName}* completely allocated.\n🤝 Assigned Courier Node: *${completedListing.volunteerName}*\n📸 Verification image secured safely.`;
    if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
      await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: process.env.TELEGRAM_CHAT_ID, text: completionMessage, parse_mode: 'Markdown' })
      }).catch(err => console.error("Telegram completion logging failed :", err));
    }
    res.json(completedListing);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
let lastUpdateId = 0;
async function pollTelegramUpdates() {
  if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID) return;
  // try {
  //   const response = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getUpdates?offset=${lastUpdateId + 1}`);
  //   const data = await response.json();
  //   if (data.ok && data.result.length > 0) {
  //     for (const update of data.result) {
  //       lastUpdateId = update.update_id;
  //       const msg = update.message || update.channel_post;
  //       if (msg && msg.text) {
  //         const incomingText = msg.text.toLowerCase();
  //         if (incomingText.includes('bought') || incomingText.includes('claimed') || incomingText.includes('collected')) {
  //           const activeEvents = await Listing.find({ status: 'available' });
  //           for (const event of activeEvents) {
  //             if (incomingText.includes(event.hallName.toLowerCase())) {
  //               const responderName = msg.from ? msg.from.first_name : 'Telegram Channel Client';
  //               event.status = 'claimed';
  //               event.servingsAvailable = 0; 
  //               event.volunteerName = responderName;
  //               await event.save();
                
  //               const ack = `*ORDER CLAIMED* Food on Venue *${event.hallName}* successfully CLAIMED by user *${responderName}* via Telegram Interlock.\n\n*We kindly request you to take a picture of the order and post it in the App to complete the order.*\n\n*THANK YOU*`;
  //               await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
  //                 method: 'POST',
  //                 headers: { 'Content-Type': 'application/json' },
  //                 body: JSON.stringify({ chat_id: process.env.TELEGRAM_CHAT_ID, text: ack, parse_mode: 'Markdown' })
  //               });
  //             }
  //           }
  //         }
  //       }
  //     }
  //   }
  // } 
  catch (err) { console.error("Polling system interface warning caught:", err); }
  setTimeout(pollTelegramUpdates, 4000);
}
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Secure Core Engine online on active distribution framework node ${PORT}`));
