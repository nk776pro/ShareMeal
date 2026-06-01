import mongoose from 'mongoose';

const listingSchema = new mongoose.Schema({
  hallName: { type: String, required: true },
  foodDetails: { type: String, required: true },
  servings: { type: Number, required: true },
  location: { type: String, required: true },
  contact: { type: String, required: true },
  isClaimed: { type: Boolean, default: false },
  
  // NEW DEVELOPMENT FIELDS ADDED BELOW:
  
  // 1. For the Auto-Expiry Timer
  expiresAt: { type: Date, required: true }, 
  
  // 2. For User Auth & Analytics (We will leave these optional for now until Phase 3)
  donorId: { type: String, default: 'anonymous' }, 
  claimedBy: { type: String, default: null }       
  
}, { timestamps: true });

export default mongoose.model('Listing', listingSchema);
