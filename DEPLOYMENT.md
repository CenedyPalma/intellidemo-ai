# 🚀 IntelliDemo Deployment Guide

## Deploy to Render (Recommended - Free)

### Prerequisites

- GitHub account
- Render account (free at render.com)

---

## Step 1: Push to GitHub

```bash
# In project root
git init
git add .
git commit -m "Ready for deployment"
git remote add origin https://github.com/YOUR_USERNAME/intellidemo-ai.git
git push -u origin main
```

---

## Step 2: Deploy on Render

1. Go to [render.com](https://render.com) → **New** → **Web Service**
2. Connect your GitHub repo
3. Configure:
   - **Name**: `intellidemo-ai`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

4. Add Environment Variables:
   | Key | Value |
   |-----|-------|
   | `NODE_ENV` | `production` |
   | `MONGO_URI` | `your_mongodb_connection_string` |
   | `GROQ_API_KEY` | `your_groq_api_key` |

5. Click **Deploy**

---

## Step 3: Access Your Live Site

After deployment (~5 mins), your site will be live at:

```
https://intellidemo-ai.onrender.com
```

---

## Architecture

```
Render Server
├── Node.js Backend (Express + Socket.IO)
├── MongoDB Atlas (Database)
├── Groq AI (LLM API)
└── Static Frontend (React Build)
```

## Troubleshooting

| Issue                 | Solution                                             |
| --------------------- | ---------------------------------------------------- |
| Build fails           | Check Node version (should be 18+)                   |
| Socket not connecting | Ensure Render allows WebSockets (it does by default) |
| MongoDB error         | Whitelist 0.0.0.0/0 in MongoDB Atlas Network Access  |
