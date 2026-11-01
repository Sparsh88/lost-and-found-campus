# 🎓 Campus Lost & Found – P04

> **A Next.js & React-based campus Lost and Found Management System developed as a group project.**

A full-featured web application connecting students who lose belongings with people who find them and campus security authorities — across a 600-acre university campus.

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Module Ownership](#-module-ownership)
- [Getting Started](#-getting-started)
- [Running the Application](#-running-the-application)
- [Team Collaboration Guide](#-team-collaboration-guide)
- [Git Branch Strategy](#-git-branch-strategy)
- [GitHub Setup & Pushing](#-github-setup--pushing)
- [Inviting Collaborators](#-inviting-collaborators)
- [MongoDB Integration](#-mongodb-integration-future)
- [Contributing Guidelines](#-contributing-guidelines)

---

## 🌟 Project Overview

| Feature | Description |
|---|---|
| **Project Code** | P04 |
| **Project Title** | Lost on a 600-Acre Campus: Lost-and-Found Management System |
| **Type** | College Group Project |
| **Framework** | Next.js 14 (App Router) |
| **Database** | MongoDB (integration-ready) |

### Modules

| Module | Service | Status |
|---|---|---|
| **Module 1** | Lost Item Service | 🔧 In Progress (Teammate 1) |
| **Module 2** | Found Item Service | ✅ Implemented (You) |
| **Module 3** | Claim & Verification Service | 🔧 In Progress (Teammate 3) |

---

## 🛠 Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 14 (App Router), React 18 |
| **Language** | JavaScript (ES2022+) |
| **Styling** | Tailwind CSS |
| **Icons** | Lucide React |
| **Backend** | Node.js (Next.js API Routes) |
| **Database** | MongoDB + Mongoose (integration-ready) |
| **Version Control** | Git & GitHub |

---

## 📁 Project Structure

```
campus-lost-and-found/
│
├── src/
│   ├── app/                          # Next.js App Router pages
│   │   ├── layout.js                 # Root layout (Navbar + Footer)
│   │   ├── page.js                   # Home / Landing page
│   │   ├── globals.css               # Global styles + Tailwind
│   │   │
│   │   ├── lost/                     # MODULE 1 – Lost Item Service
│   │   │   └── page.js               # Lost items listing (Teammate 1)
│   │   │
│   │   ├── found/                    # MODULE 2 – Found Item Service ✅
│   │   │   ├── page.js               # Found items listing + search + filters
│   │   │   ├── add/
│   │   │   │   └── page.js           # Report a found item form
│   │   │   └── [id]/
│   │   │       └── page.js           # Found item details page
│   │   │
│   │   ├── claims/                   # MODULE 3 – Claim & Verification
│   │   │   └── page.js               # Claims service (Teammate 3)
│   │   │
│   │   └── dashboard/
│   │       └── page.js               # Shared overview dashboard
│   │
│   ├── components/                   # Shared reusable components
│   │   ├── Navbar.jsx                # Navigation bar (all modules)
│   │   ├── Footer.jsx                # Footer (all modules)
│   │   └── ui/
│   │       ├── FoundItemCard.jsx     # Card for found items
│   │       ├── StatusBadge.jsx       # Status pill badge
│   │       └── CategoryBadge.jsx     # Category pill badge
│   │
│   ├── modules/                      # Module-specific business logic
│   │   ├── lost/                     # Teammate 1 – Lost module logic
│   │   │   └── index.js
│   │   ├── found/                    # You – Found module logic ✅
│   │   │   ├── data.js               # Mock data + constants
│   │   │   └── store.js              # In-memory state store
│   │   └── claims/                   # Teammate 3 – Claims module logic
│   │       └── index.js
│   │
│   └── lib/                          # Shared utilities & helpers
│       ├── mongodb.js                # MongoDB connection helper
│       └── utils.js                  # Shared utility functions
│
├── public/                           # Static assets (images, favicon)
├── .env.example                      # Environment variable template
├── .gitignore                        # Git ignore rules
├── jsconfig.json                     # Path aliases (@/...)
├── next.config.js                    # Next.js configuration
├── tailwind.config.js                # Tailwind CSS configuration
├── postcss.config.js                 # PostCSS configuration
├── package.json                      # Dependencies & scripts
└── README.md                         # This file
```

---

## 👥 Module Ownership

| Branch | Module | Owner | Pages |
|---|---|---|---|
| `module-1-lost` | Module 1 – Lost Item Service | **Teammate 1** | `/lost`, `/lost/add`, `/lost/[id]` |
| `module-2-found` | Module 2 – Found Item Service | **You (Me)** | `/found`, `/found/add`, `/found/[id]` |
| `module-3-claims` | Module 3 – Claim & Verification | **Teammate 3** | `/claims`, `/claims/[id]` |

> **Important:** Each teammate should only modify files inside their own module folder (`src/modules/<module>/`) and their own app pages (`src/app/<module>/`). Shared components (`src/components/`) should only be modified by mutual agreement.

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- **Node.js** v18 or later — [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** — [Download](https://git-scm.com/)

Check your versions:

```bash
node --version    # Should be v18+
npm --version     # Should be 9+
git --version
```

### 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/campus-lost-and-found.git
cd campus-lost-and-found
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

```bash
# Copy the example file
cp .env.example .env.local

# Edit .env.local and add your MongoDB URI (optional for now)
# MONGODB_URI=mongodb+srv://...
```

### 4. Switch to Your Branch

```bash
# Teammate 1
git checkout module-1-lost

# You (Module 2)
git checkout module-2-found

# Teammate 3
git checkout module-3-claims
```

---

## ▶️ Running the Application

### Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

The page auto-updates when you save changes.

### Production Build

```bash
npm run build
npm run start
```

### Lint Check

```bash
npm run lint
```

---

## 🤝 Team Collaboration Guide

### Step-by-Step Workflow for Each Teammate

#### 1. Clone the Repository (first time only)

```bash
git clone https://github.com/<repo-owner>/campus-lost-and-found.git
cd campus-lost-and-found
npm install
```

#### 2. Switch to Your Branch

```bash
# Always work on YOUR module branch — never commit directly to main
git checkout module-1-lost       # Teammate 1
git checkout module-2-found      # You
git checkout module-3-claims     # Teammate 3
```

#### 3. Pull Latest Changes Before Starting Work

```bash
# Pull the latest from your branch
git pull origin module-2-found   # (replace with your branch name)

# Also sync with main occasionally
git fetch origin
git merge origin/main
```

#### 4. Make Your Changes

Edit only files in your module:
- `src/app/<your-module>/` — Page files
- `src/modules/<your-module>/` — Module logic

#### 5. Stage and Commit Your Changes

```bash
# See what changed
git status

# Stage specific files (recommended)
git add src/app/found/page.js
git add src/modules/found/data.js

# Or stage everything (use carefully)
git add .

# Commit with a meaningful message
git commit -m "feat(module-2): add search functionality to found items listing"
```

**Commit Message Convention:**
```
feat(module-2): short description      ← new feature
fix(module-2): short description       ← bug fix
refactor(module-2): short description  ← code improvement
docs: update README                    ← documentation
```

#### 6. Push Your Branch to GitHub

```bash
git push origin module-2-found   # (replace with your branch name)
```

#### 7. Create a Pull Request

1. Go to the GitHub repository in your browser.
2. Click **"Compare & pull request"** (shown after a push).
3. Set **base branch** to `main` and **compare** to your module branch.
4. Add a clear title and description of your changes.
5. Request a review from a teammate.
6. Click **"Create pull request"**.

#### 8. Merge Approved Code into Main

After all reviewers approve:
1. Click **"Merge pull request"** on GitHub.
2. Choose **"Squash and merge"** for a clean history.
3. Delete the feature branch after merging (optional).

#### 9. Sync Your Branch with Main After a Merge

```bash
git checkout module-2-found
git fetch origin
git merge origin/main
git push origin module-2-found
```

---

## 🌿 Git Branch Strategy

```
main                    ← Stable, tested, integrated code only
  │
  ├── module-1-lost     ← Teammate 1: Lost Item Service
  ├── module-2-found    ← You: Found Item Service
  └── module-3-claims   ← Teammate 3: Claim & Verification
```

**Rules:**
- ❌ Never commit directly to `main`
- ✅ Always work on your module branch
- ✅ Create a Pull Request to merge into `main`
- ✅ At least one teammate must review before merging

---

## 📤 GitHub Setup & Pushing

### First-Time Push (Repository Owner)

```bash
# 1. Initialize git (already done)
git init

# 2. Add all files
git add .

# 3. Initial commit
git commit -m "feat: initial project setup with Next.js App Router and Module 2 foundation"

# 4. Rename branch to main
git branch -M main

# 5. Add GitHub remote (replace with your actual repo URL)
git remote add origin https://github.com/<your-username>/campus-lost-and-found.git

# 6. Push to GitHub
git push -u origin main

# 7. Create and push module branches
git checkout -b module-1-lost
git push origin module-1-lost

git checkout -b module-2-found
git push origin module-2-found

git checkout -b module-3-claims
git push origin module-3-claims

# 8. Switch back to module-2-found to start your work
git checkout module-2-found
```

---

## 👤 Inviting Collaborators

To give your teammates access to the repository:

1. Go to your repository on GitHub: `https://github.com/<your-username>/campus-lost-and-found`
2. Click the **Settings** tab (top right of the repository page)
3. In the left sidebar, click **Collaborators** (under "Access")
4. Click **"Add people"**
5. Enter your teammate's **GitHub username or email address**
6. Select the **role** — choose **"Write"** so they can push branches
7. Click **"Add [username] to this repository"**
8. Your teammate will receive an email invitation — they must **accept it**

> 💡 For a university group project, "Write" access is recommended. Avoid "Admin" unless necessary.

---

## 🗄 MongoDB Integration (Future)

When you are ready to add a real database:

### 1. Install Mongoose

```bash
npm install mongoose
```

### 2. Add Connection String

Create `.env.local`:
```
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/campus-lost-and-found
```

### 3. Enable the Connection Helper

Open `src/lib/mongodb.js` and uncomment the Mongoose code.

### 4. Create API Routes

Example for Found Items:
- `src/app/api/found-items/route.js` — GET all, POST new
- `src/app/api/found-items/[id]/route.js` — GET one, PUT update, DELETE

### 5. Update Store Functions

In `src/modules/found/store.js`, replace the in-memory functions with `fetch()` calls to your API routes.

---

## 📐 Contributing Guidelines

1. **Work only on your module** — don't modify other teammates' pages.
2. **Shared components** (`src/components/`) — discuss before modifying.
3. **Write clean code** with comments for beginner readability.
4. **Test before pushing** — run `npm run dev` and check your pages.
5. **Use meaningful commit messages** following the convention above.
6. **Never push `.env.local`** — it contains secrets.
7. **Create Pull Requests** for all changes to `main`.

---

## 📄 License

This project is created for educational purposes as part of a college group assignment.

---

*Built with ❤️ using Next.js · React · Tailwind CSS · Node.js · MongoDB*

