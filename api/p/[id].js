import escapeHtml from "escape-html"
import { connectDB } from "../../lib/db.js"
import Paste from "../../lib/Paste.js"
import { getNow } from "../../lib/time.js"

export default async function handler(req, res) {
  await connectDB(process.env.MONGO_URI)

  const paste = await Paste.findById(req.query.id)
  if (!paste) return res.status(404).send("Not Found")

  const now = getNow(req)

  if (paste.expiresAt && now >= paste.expiresAt)
    return res.status(404).send("Not Found")

  if (paste.maxViews !== null && paste.views >= paste.maxViews)
    return res.status(404).send("Not Found")

  res.status(200).send(`
    <html>
      <body>
        <pre>${escapeHtml(paste.content)}</pre>
      </body>
    </html>
  `)
}
