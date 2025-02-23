
# SaveDontStress

**SaveDontStress** (also known as **GemGrocery**) is a web application that helps users find the cheapest grocery item near a specified location. The front end uses **React** (with **Google Places Autocomplete** for addresses) and displays the resulting store data in a table and chart. The back end is a **Node/Express** server that calls **Google Places** for store listings and **Gemini (Generative Language API)** to produce JSON code blocks with approximate prices or placeholders.

## Table of Contents
- [Overview](#overview)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Usage](#usage)
- [Troubleshooting](#troubleshooting)
- [License](#license)

## Overview
- **User Input**: 
  - Address (with fallback geocoding if not selected from the dropdown).
  - Grocery item (e.g., “milk”).
  
- **Back End**:
  1. Calls **Google Places** to find up to 10 grocery stores near the specified latitude and longitude.
  2. Builds a prompt for **Gemini**, asking it to return a JSON code block with store prices.
  3. Parses the code block and returns a simplified JSON of store data.

- **Front End**:
  - Displays a table sorted from cheapest to most expensive grocery item prices.
  - Shows a bar chart with prices.

  If disclaimers or no valid JSON are returned, the raw text from Gemini is shown.

## Project Structure
A simplified look at your repository:

```
SaveDontStress/
  ├── backend/
  │   ├── index.js        // Main Express server
  │   ├── package.json
  │   └── ...other files (e.g., .env, node_modules, etc.)
  ├── frontend/
  │   ├── src/
  │   │   ├── App.js      // Main React logic
  │   │   └── App.css     // Styling for table, chart, etc.
  │   ├── public/
  │   ├── package.json
  │   └── ...other files
  └── README.md
```

## Prerequisites
- **Node.js** (v14+ recommended)
- **npm** or **yarn** (latest stable)
- **Google Cloud credentials**:
  - A server or unrestricted key for **Google Places**.
  - A **Generative Language API** key for **Gemini** (not a service account).
  - *(Optional)* A browser key for **Google Maps Autocomplete** if you restrict your front-end domain.

## Installation
1. Clone this repository:
   ```bash
   git clone https://github.com/KrishnaM0310/SaveDontStress.git
   ```

2. Navigate into the project folder:
   ```bash
   cd SaveDontStress
   ```

3. Install dependencies for the **backend**:
   ```bash
   cd backend
   npm install
   # or yarn
   ```

4. Install dependencies for the **frontend**:
   ```bash
   cd ../frontend
   npm install
   # or yarn
   ```

## Environment Variables
Create a `.env` file in the **backend** folder containing the following:

```env
GOOGLE_MAPS_KEY="YOUR_GOOGLE_PLACES_SERVER_KEY"
GEMINI_API_KEY="YOUR_GENERATIVE_LANGUAGE_KEY"
```

### Notes:
- **GOOGLE_MAPS_KEY**: A Places API key with **“API restrictions: Places API”** and **“Application restrictions: None”** or **“IP addresses”** for your Node server.
- **GEMINI_API_KEY**: A Generative Language API key restricted to **generativelanguage.googleapis.com**.
- *(Optional)* If your front-end's fallback geocode uses a browser key, you can embed it in **App.js** or in a `.env` file for React as `REACT_APP_GOOGLE_KEY`.

## Running the Application
After installing and configuring `.env`, open two terminals:

### 1. Start the Backend:
```bash
cd backend
npm start
```
The backend typically runs on [http://localhost:3001](http://localhost:3001). Check the console for “Backend running on http://localhost:3001.”

### 2. Start the Front End:
```bash
cd ../frontend
npm start
```
By default, the React dev server runs on [http://localhost:3000](http://localhost:3000). The front end calls the back end at `localhost:3001/api/cheapest-item`.

## Usage
1. Open your browser at [http://localhost:3000](http://localhost:3000).
2. **Enter an address**:
   - You can type or pick from **Google Places Autocomplete**.
   - If you type without selecting from the dropdown, it falls back to a geocode call.
   
3. **Enter a grocery item** (e.g., “milk”).
4. Click **Search**.
5. **Observe the results**:
   - If the backend finds stores, it calls **Gemini** for a JSON code block.
   - The front end sorts the store data by price and displays:
     - A **table** (striped, hover effect, etc.).
     - A **bar chart** with ascending prices.
   - If disclaimers or no valid JSON are returned, you’ll see the raw text from Gemini in a `<pre>` block.

## Troubleshooting
- **REQUEST_DENIED from Places**: Ensure your **GOOGLE_MAPS_KEY** is a server key with **“Places API”** enabled and billing is on.
- **API key not valid for Gemini**: Ensure **GEMINI_API_KEY** is a Generative Language key with **“API restrictions: generativelanguage.googleapis.com”**.
- **text.match is not a function**: Your code has a fallback that extracts strings from objects. Make sure the **LLM** actually returns a code block or fallback.
- **No grocery stores found**: Increase the radius from 5000 to 10000 in the backend or verify that your latitude and longitude are correct.


---

Congratulations! You can now run **SaveDontStress** from scratch by installing dependencies, setting up `.env`, and starting both servers. If you have any questions, feel free to open an issue or pull request on this repo.
```

