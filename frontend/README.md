# 🧩 Modern Frontend with Vite, TypeScript, Sui Wallet & Google OAuth 2.0

A modern frontend application built with Vite and TypeScript, integrating Sui Wallet and Google OAuth 2.0 for blockchain interaction and user authentication.

---

## 📁 Features

- ⚡️ Fast and modern development with Vite  
- 🔐 Seamless authentication via Google OAuth 2.0  
- 🔗 Native support for Sui Wallet extension  
- 🔧 Organized project structure with reusable components  

---

## 🚀 Getting Started

Follow the steps below to set up and run the project locally.

---

### 🧰 Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v16 or newer)  
- npm or pnpm  
- A modern web browser (e.g., Chrome, Edge, Firefox)  
- Sui Wallet browser extension  

---

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd <project-folder>
```

---

### 2. Install Dependencies

Using **npm**:

```bash
npm install
```

Or using **pnpm**:

```bash
pnpm install
```

---

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

Refer to `.env.example` for a sample format.

> ⚠️ **Important:** Never commit your actual `.env` file.

---

### 4. Run the Development Server

```bash
npm run dev
```

Then open your browser and visit:  
[http://localhost:8080](http://localhost:8080)

---

### 5. Build for Production (Optional)

To generate an optimized production build:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

---

## 🔐 Google Authentication

This project uses **Google OAuth 2.0** for signing in users.  
Make sure your `VITE_GOOGLE_CLIENT_ID` matches the one in your Google Cloud Console.  
Ensure the redirect URI is configured correctly (typically `http://localhost:8080` during development).

---

## 🔗 Sui Wallet Integration

To interact with the Sui blockchain, users must have the **Sui Wallet browser extension** installed.

On first load, the app will prompt wallet connection to enable blockchain interactions.