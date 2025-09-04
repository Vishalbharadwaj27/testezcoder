# EZ-AI-Coder

## Project Description

EZ-AI-Coder is a web-based application that allows users to write and execute code directly in their browser. It features a VSCode-like interface for the frontend and a robust backend powered by Docker for secure and isolated code execution. This project supports multiple programming languages, providing a seamless development and testing environment.

## Supported Languages

*   JavaScript
*   Python
*   Java
*   C++

## Setup and Installation

This project consists of two main parts: the **Frontend** (React application) and the **Backend** (Express server). Both need to be set up and run independently.

### Prerequisites

*   Node.js (LTS version recommended)
*   npm (Node Package Manager) or Yarn
*   Docker Desktop (or Docker Engine) installed and running on your system.

### 1. Backend Setup

The backend is responsible for handling code execution requests by spinning up Docker containers.

**Navigate to the backend directory:**

```bash
cd server
```

**Install dependencies:**

```bash
npm install
```

**Run the backend in development mode:**

```bash
npm run dev
```
The backend server will start on `http://localhost:8000`.

### 2. Frontend Setup

The frontend provides the user interface, including the code editor and terminal.

**Navigate to the project root directory (where `package.json` is located):**

```bash
cd .. # If you are still in the 'server' directory
```

**Install dependencies:**

```bash
npm install
```

**Run the frontend in development mode:**

```bash
npm run dev
```
The frontend application will typically open in your browser at `http://localhost:5173` (or another available port).

## How to Run the Application

To run the full application, you need to start both the backend and the frontend.

1.  **Start the Backend:**
    Open your terminal or command prompt.
    ```bash
    cd server
    npm run dev
    ```
    Leave this terminal window open and running.

2.  **Start the Frontend:**
    Open a **new** terminal or command prompt.
    ```bash
    cd .. # Navigate to the project root if you are not already there
    npm run dev
    ```
    This will open the application in your default web browser.

Now you can write code in the editor, select the language, and execute it. The output will appear in the integrated terminal.

## Important Notes

*   **Docker:** Ensure Docker Desktop (or Docker Engine) is running before starting the backend server. The backend relies on Docker to create isolated environments for code execution.
*   **Java Execution:** For Java code, your main class must be named `Main` and the file saved as `Main.java` for successful compilation and execution on the backend.
*   **Port Usage:**
    *   Backend: `http://localhost:8000`
    *   Frontend: Typically `http://localhost:5173` (Vite's default)