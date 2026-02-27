# Gauntlet Clone

A simple, browser-based Gauntlet clone built with JavaScript and HTML5 Canvas.

## Requirements

- [Node.js](https://nodejs.org/) and [npm](https://www.npmjs.com/)

## Installation

1.  Clone the repository or download the source code.
2.  Navigate to the project directory.
3.  Install dependencies:
    ```bash
    npm install
    ```

## How to Play

### Running the Game

-   **Development Mode:**
    To run the game with a live-reloading development server:
    ```bash
    npm run dev
    ```
    Open your browser to the URL provided by Vite (usually `http://localhost:5173`).

-   **Production Build:**
    To build the static files for production:
    ```bash
    npm run build
    ```
    This will create a `dist` directory with the optimized game files.

-   **Previewing the Build:**
    To preview the production build locally:
    ```bash
    npm run preview
    ```

### Controls

-   **Move:** Arrow Keys (`ArrowUp`, `ArrowDown`, `ArrowLeft`, `ArrowRight`)
-   **Shoot:** Spacebar (` `)

## Gameplay

-   You are the blue square.
-   Enemies (white and red squares) will chase you.
-   Shoot enemies to score points.
-   Touching an enemy will drain your health.
-   The game ends when your health reaches zero.
-   Survive as long as you can and get the highest score!
