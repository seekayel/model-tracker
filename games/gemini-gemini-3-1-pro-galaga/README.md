# Galaga Clone

A simple, browser-based clone of the classic arcade game Galaga, built with vanilla JavaScript and Vite.

## Gameplay

- Use the **Arrow Keys** (`Left`, `Right`) or **A** and **D** keys to move your ship.
- Press the **Spacebar** to shoot.
- Your goal is to clear the screen of enemies.
- If an enemy collides with your ship, the game is over.

## Running the Game

### Prerequisites
- [Node.js](https://nodejs.org/) and `npm` must be installed.

### Development
To run the game in a local development server:

1. Clone the repository and navigate to the project directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open your browser and go to the URL provided by Vite (usually `http://localhost:5173`).

### Build
To create a production build of the game:

1. Run the build command:
   ```bash
   npm run build
   ```
2. The static files will be generated in the `dist/` directory.

### Preview
To preview the production build locally:

1. Run the preview command:
   ```bash
   npm run preview
   ```
2. Open your browser and go to the URL provided by Vite.
