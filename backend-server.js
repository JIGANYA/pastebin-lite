import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import { nanoid } from 'nanoid'
import Paste from './lib/Paste.js'
import { getNow } from './lib/time.js'
import escapeHtml from 'escape-html'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = 3001

// Middleware
app.use(cors())
app.use(express.json())

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err))

// Health check
app.get('/api/healthz', async (req, res) => {
  try {
    await mongoose.connection.db.admin().ping()
    res.json({ ok: true })
  } catch {
    res.json({ ok: false })
  }
})

// Create paste
app.post('/api/pastes', async (req, res) => {
  const { content, ttl_seconds, max_views } = req.body

  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'Invalid content' })
  }

  const id = nanoid(8)
  const now = Date.now()

  await Paste.create({
    _id: id,
    content,
    createdAt: now,
    expiresAt: ttl_seconds ? now + ttl_seconds * 1000 : null,
    maxViews: max_views ?? null,
    views: 0
  })

  res.status(201).json({
    id,
    url: `http://localhost:3001/p/${id}`
  })
})

// Get paste JSON
app.get('/api/pastes/:id', async (req, res) => {
  const paste = await Paste.findById(req.params.id)
  
  if (!paste) {
    return res.status(404).json({ error: 'Not found' })
  }

  const now = Date.now()

  if (paste.expiresAt && now >= paste.expiresAt) {
    return res.status(404).json({ error: 'Expired' })
  }

  if (paste.maxViews !== null && paste.views >= paste.maxViews) {
    return res.status(404).json({ error: 'Limit reached' })
  }

  paste.views += 1
  await paste.save()

  res.json({
    content: paste.content,
    remaining_views: paste.maxViews === null ? null : paste.maxViews - paste.views,
    expires_at: paste.expiresAt ? new Date(paste.expiresAt).toISOString() : null
  })
})

// Get paste HTML
app.get('/p/:id', async (req, res) => {
  const paste = await Paste.findById(req.params.id)
  
  if (!paste) {
    return res.status(404).send('Not Found')
  }

  const now = Date.now()

  if (paste.expiresAt && now >= paste.expiresAt) {
    return res.status(404).send('Not Found')
  }

  if (paste.maxViews !== null && paste.views >= paste.maxViews) {
    return res.status(404).send('Not Found')
  }

  res.send(`
    <html>
      <body>
        <pre>${escapeHtml(paste.content)}</pre>
      </body>
    </html>
  `)
})

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`)
})