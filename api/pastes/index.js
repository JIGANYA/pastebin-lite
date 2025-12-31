import { nanoid } from "nanoid"
import { connectDB } from "../../lib/db.js"
import Paste from "../../lib/Paste.js"
import { getNow } from "../../lib/time.js"

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" })

  const { content, ttl_seconds, max_views } = req.body

  if (!content || !content.trim())
    return res.status(400).json({ error: "Invalid content" })

  await connectDB(process.env.MONGO_URI)

  const id = nanoid(8)
  const now = getNow(req)

  await Paste.create({
    _id: id,
    content,
    createdAt: now,
    expiresAt: ttl_seconds ? now + ttl_seconds * 1000 : null,
    maxViews: max_views ?? null,
    views: 0
  })

  // Use the request origin/host to generate URL
  const protocol = req.headers['x-forwarded-proto'] || 'https'
  const host = req.headers['x-forwarded-host'] || req.headers.host
  const baseUrl = `${protocol}://${host}`
  res.status(201).json({
    id,
    url: `${baseUrl}/p/${id}`
  })
}
