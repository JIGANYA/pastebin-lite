import mongoose from "mongoose"

const PasteSchema = new mongoose.Schema({
  _id: String,
  content: String,
  createdAt: Number,
  expiresAt: Number,
  maxViews: Number,
  views: { type: Number, default: 0 }
})

export default mongoose.models.Paste || mongoose.model("Paste", PasteSchema)
