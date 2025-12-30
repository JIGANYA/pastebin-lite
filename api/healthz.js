import { connectDB } from "../lib/db.js"

export default async function handler(req, res) {
  try {
    await connectDB(process.env.MONGO_URI)
    res.status(200).json({ ok: true })
  } catch {
    res.status(200).json({ ok: false })
  }
}
