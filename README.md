Here's your updated `README.md` based on your provided details:

```markdown
# SaveDontStress

SaveDontStress (also known as “GemGrocery”) is a web application that helps users find the cheapest grocery item near a specified location. The front end uses React (with Google Places Autocomplete for addresses) and displays the resulting store data in a table and chart. The back end is a Node/Express server that calls Google Places for store listings and Gemini (Generative Language API) to produce JSON code blocks with approximate prices or placeholders.

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

1. **User Input:**
   - The user inputs an address (with fallback geocoding if the user doesn’t pick from the dropdown) and a grocery item (e.g., “milk”).
   
2. **Front End:**
   - Calls the back end (`/api/cheapest-item`) with the latitude, longitude, and item.

3. **Back End:**
   - Calls Google Places to find up to 10 grocery stores near the specified latitude and longitude.
   - Builds a prompt for Gemini, asking it to return a JSON code block with store prices.
   - Parses that code block and returns a simplified JSON of store data.

4. **Front End Displays:**
   - A table sorted from cheapest to most expensive.
   - A bar chart of prices.
   - If disclaimers or no valid JSON are found, it shows the raw text from Gemini.

## Project Structure

A simplified look at your repository:

```
SaveDontStress/
  ├─ backend/
  │   ├─ index.js          // Main Express server
  │   ├─ package.json
  │   └─ ...other files (e.g., .env, node_modules, etc.)
  ├─ frontend/
  │   ├─ src/
  │   │   ├─ App.js        // Main React logic
  │   │   └─ App.css       // Styling for table, chart, etc.
  │   ├─ public/
  │   ├─ package.json
  │   └─ ...other files
  └─ README.md
```

- **`backend/`**: Node/Express code for `/api/cheapest-item`. Calls Google Places and Gemini.
- **`frontend/`**: React application. Displays an address input (with Google Places Autocomplete) and item input, then renders results in a table + chart.

## Prerequisites

- Node.js (v14+ recommended)
- npm or yarn (latest stable)
- **Google Cloud credentials**:
  - A server or unrestricted key for Google Places (since you’re calling it from Node).
  - A Generative Language API key for Gemini (not a service account).
  - (Optional) A browser key for Google Maps Autocomplete if you restricted your front-end domain.

## Installation

1. Clone this repository:

   ```bash
   git clone https://github.com/KrishnaM0310/SaveDontStress.git
   ```

2. Navigate into the project folder:

   ```bash
   cd SaveDontStress
   ```

3. Install dependencies for the backend:

   ```bash
   cd backend
   npm install
   # or yarn
   ```

4. Install dependencies for the frontend:

   ```bash
   cd ../frontend
   npm install
   # or yarn
   ```

## Environment Variables

You’ll need a `.env` file in the backend folder containing at least:

```plaintext
GOOGLE_MAPS_KEY="YOUR_GOOGLE_PLACES_SERVER_KEY"
GEMINI_API_KEY="YOUR_GENERATIVE_LANGUAGE_KEY"
```

- `GOOGLE_MAPS_KEY`: A Places API key with “API restrictions: Places API” and “Application restrictions: None” or “IP addresses” for your Node server.
- `GEMINI_API_KEY`: A Generative Language API key restricted to `generativelanguage.googleapis.com`. Service accounts won’t work with the library you used; it needs a direct API key.

If your front end’s fallback geocode uses a browser key, you can embed that in `App.js` or in a `.env` file for React as `REACT_APP_GOOGLE_KEY`.

## Running the Application

After installing and configuring `.env`, open two terminals:

1. **Start the Backend**:
   - Navigate to the backend directory and start the server:

     ```bash
     cd backend
     npm start
     ```

     This typically runs on `http://localhost:3001`. Check the console for "Backend running on http://localhost:3001."

2. **Start the Front End**:
   - Navigate to the frontend directory and start the React app:

     ```bash
     cd ../frontend
     npm start
     ```

     By default, React's dev server runs on `http://localhost:3000`. The front end calls the backend at `localhost:3001/api/cheapest-item`.

## Usage

1. Open your browser at `http://localhost:3000`.
2. Enter an address:
   - You can type or pick from Google Places Autocomplete.
   - If you type without picking from the dropdown, it does a fallback geocode call.
3. Enter a grocery item (e.g., "milk").
4. Click **Search**.

The front end will display:
- A **table** of stores sorted by price.
- A **bar chart** with ascending prices.
- If there are disclaimers or no valid JSON, you’ll see the raw text from Gemini in a `<pre>` block.

## Troubleshooting

- **REQUEST_DENIED from Places**: Make sure your `GOOGLE_MAPS_KEY` is a server key with “Places API” enabled, and billing is on.
- **API key not valid for Gemini**: Ensure `GEMINI_API_KEY` is a Generative Language key with “API restrictions: generativelanguage.googleapis.com.”
- **text.match is not a function**: Your code has a fallback that extracts strings from objects. Make sure the LLM actually returns a code block or fallback.
- **No grocery stores found**: Increase radius from 5000 to 10000 in the backend or verify your lat/lng is correct.

## License

MIT License  
Copyright (c) 2025 ...  
Permission is hereby granted...
```

This should provide all the necessary instructions to run your project from scratch. You can customize the "License" section if needed or update any specific details.
