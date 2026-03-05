# 🚀 SmartDash: Professional Utility Workspace

SmartDash is a high-performance, modular developer dashboard built for the modern era. It combines essential system utilities, a persistent knowledge vault, and ultra-fast AI assistance into a single, high-fidelity dark-themed interface.

![SmartDash Desktop Version](https://img.shields.io/badge/Status-V1.2.0--Stable-orange?style=for-the-badge)
![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)
![Tailwind](https://img.shields.io/badge/Tailwind-v4.2-38B2AC?style=for-the-badge&logo=tailwind-css)
![Groq](https://img.shields.io/badge/AI-Groq--Llama--3.3-orange?style=for-the-badge)

## ✨ Core Features

### 1. 🏠 Bento Dashboard
A high-density mission control center with real-time performance analytics, network diagnostics, and activity tracking. Optimized for desktop workstations and mobile responsiveness.

### 2. 🤖 AI Assistant (Pro)
Powered by **Groq Llama 3.3 70B**. Featuring:
- Persistent multi-conversation history.
- Context-aware technical support.
- Ultra-low latency responses.
- Renaming and individual session management.

### 3. 📒 Knowledge Vault
An advanced note-taking engine with:
- **AI Insight:** Let Groq summarize or analyze your concepts.
- **Pinning:** Keep mission-critical nodes at the top.
- **Split-Pane View:** IDE-style list and editor for desktop productivity.
- **Smart Cleanup:** Auto-removes empty fragments to prevent clutter.

### 4. ⚡ Number Converter
Precision tool for real-time bi-directional conversion between:
- Decimal (Base 10)
- Hexadecimal (Base 16)
- Binary (Base 2)
- Octal (Base 8)

### 5. 🛠️ Terminal Command Center
A CRT-styled CLI for power users.
- `status`: Pull real-time hardware telemetry.
- `net`: Network diagnostic reporting.
- `calc`: Rapid mathematical evaluation.
- Command history and phosphor-glow visual effects.

### 6. 📊 System Telemetry
Real-time monitoring of:
- Battery health and charging status.
- Network downlink/latency (RTT).
- Storage quota and usage estimation.
- JS Heap memory allocation.

---

## 🛠️ Tech Stack

- **Framework:** React 19 + TypeScript
- **Build Tool:** Vite 8 (Beta)
- **Styling:** TailwindCSS v4.2 + Framer Motion
- **Icons:** Lucide React
- **AI SDK:** Groq SDK
- **Persistence:** LocalStorage API

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- A Groq API Key

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/smart-utility-dashboard.git
   cd smart-utility-dashboard
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment:**
   Create a `.env` file in the root directory:
   ```env
   VITE_GROQ_API_KEY=your_groq_api_key_here
   ```

4. **Start Development Server:**
   ```bash
   npm run dev
   ```

---

## 📝 Session & Architecture
This project follows a **Feature-Based Modular Architecture**. All implementation logs and architectural decisions are persisted in `SMART_DASHBOARD_SESSION.md`.

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.
