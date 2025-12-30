import { connectDB } from "../../lib/db.js"
import Paste from "../../lib/Paste.js"
import { getNow } from "../../lib/time.js"

export default async function handler(req, res) {
  await connectDB(process.env.MONGO_URI)

  const paste = await Paste.findById(req.query.id)
  if (!paste) return res.status(404).json({ error: "Not found" })

  const now = getNow(req)

  if (paste.expiresAt && now >= paste.expiresAt)
    return res.status(404).json({ error: "Expired" })

  if (paste.maxViews !== null && paste.views >= paste.maxViews)
    return res.status(404).json({ error: "Limit reached" })

  paste.views += 1
  await paste.save()

  res.status(200).json({
    content: paste.content,
    remaining_views:
      paste.maxViews === null ? null : paste.maxViews - paste.views,
    expires_at: paste.expiresAt
      ? new Date(paste.expiresAt).toISOString()
      : null
  })
}
