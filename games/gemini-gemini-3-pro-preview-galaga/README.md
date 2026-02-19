# Galaga Clone

A simple browser-based Galaga clone built with Vanilla JS and Vite.

## Controls

*   **Arrow Left / Right**: Move Ship
*   **Space**: Shoot / Start Game / Restart

## Setup

1.  Install dependencies:
    ```bash
    npm install
    ```

2.  Run development server:
    ```bash
    npm run dev
    ```

3.  Build for production:
    ```bash
    npm run build
    ```

4.  Preview production build:
    ```bash
    npm run preview
    ```

## Logic

The game uses a simple Entity-Component style structure (without the strict architecture) where the `Game` class manages the loop and entities (`Player`, `Enemy`, `Bullet`). Rendering is done via HTML5 Canvas.
