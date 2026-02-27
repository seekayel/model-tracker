# Galaga Clone

A simple, browser-based clone of the classic arcade game Galaga, created using TypeScript and Vite.

## How to Play

### Controls
-   **Move Left:** Left Arrow Key
-   **Move Right:** Right Arrow Key
-   **Shoot:** Spacebar
-   **Start/Restart Game:** Enter Key

### Gameplay
-   Dodge enemy ships and bullets.
-   Shoot all enemies in a wave to advance.
-   The game is over when you run out of lives.

## Development

This project uses `npm` for package management.

### Prerequisites
-   [Node.js](https://nodejs.org/) (which includes npm)

### Setup
1.  Clone the repository.
2.  Navigate to the project directory.
3.  Install dependencies:
    ```sh
    npm install
    ```

### Running the Game
-   **Development Server:** To run the game in a local development server with hot-reloading:
    ```sh
    npm run dev
    ```
-   **Preview Production Build:** To preview the production-ready build locally:
    ```sh
    npm run preview
    ```

### Building for Production
To build the static assets for production:
```sh
npm run build
```
This command will generate a `dist/` directory containing the static HTML, CSS, and JavaScript files for the game. These files can be hosted on any static web server.
