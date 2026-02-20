# Pong Clone

A classic Pong game created with HTML, CSS, and JavaScript.

## Getting Started

### Prerequisites

You need to have [Node.js](https://nodejs.org/) and `npm` installed to run this project.

### Installation

1.  Clone the repository or download the source code.
2.  Open a terminal in the project directory.
3.  Install the dependencies:
    ```bash
    npm install
    ```

## How to Play

### Running the Development Server

To start the game in a local development server, run:

```bash
npm run dev
```

This will open the game in your default browser, and it will automatically reload if you make changes to the code.

### Controls

-   **Player 1 (Left Paddle):**
    -   <kbd>ArrowUp</kbd> or <kbd>W</kbd>: Move Up
    -   <kbd>ArrowDown</kbd> or <kbd>S</kbd>: Move Down
-   **Start/Restart:**
    -   <kbd>Enter</kbd>: Start the game or restart after a game over.

The first player to score 5 points wins.

## Building for Production

To create a static build of the game, run:

```bash
npm run build
```

This will generate a `dist` folder in the project root containing the static files (`index.html`, CSS, and JavaScript).

### Previewing the Build

After building the project, you can preview the production version locally:

```bash
npm run preview
```
