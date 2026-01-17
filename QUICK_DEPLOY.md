# Quick Deploy to Render - Command Reference

## Step 1: Initialize Git (if not done)
git init
git add .
git commit -m "Initial commit - TypeScript chat app ready for Render"

## Step 2: Create GitHub Repository
# Go to: https://github.com/new
# Repository name: typescript-chat-app
# Visibility: Public or Private
# DO NOT initialize with README

## Step 3: Push to GitHub
git remote add origin https://github.com/YOUR_USERNAME/typescript-chat-app.git
git branch -M main
git push -u origin main

## Step 4: Configure MongoDB Atlas
# Go to: https://cloud.mongodb.com/
# Network Access → Add IP Address → Allow Access from Anywhere (0.0.0.0/0)

## Step 5: Deploy on Render
# Go to: https://dashboard.render.com/
# New + → Web Service → Connect GitHub → Select repository

### Build Settings:
# Build Command: npm install && npm run build
# Start Command: npm start

### Environment Variables (set in Render dashboard):
# NODE_ENV=production
# PORT=4000
# MONGO_URI=mongodb+srv://cofficeup_db_user:123654@cluster0.sr976mi.mongodb.net/chat-app?retryWrites=true&w=majority&appName=Cluster0

## Step 6: Deploy & Monitor
# Click "Create Web Service"
# Wait 2-5 minutes for deployment
# Access your app at: https://your-service-name.onrender.com

## Quick Checks:
✓ .env file is in .gitignore (never commit it!)
✓ MongoDB Atlas allows 0.0.0.0/0
✓ All environment variables set in Render
✓ Build command includes "npm run build"
✓ Start command is "npm start"

## Update & Redeploy:
git add .
git commit -m "Update description"
git push origin main
# Render auto-deploys on push!
