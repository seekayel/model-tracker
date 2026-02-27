# CivClone

A simple, browser-based, client-side clone of Civilization, built with Phaser and Vite.

## How to Play

- **Objective**: Explore the world and found cities to increase your score.
- **Controls**:
    - **Arrow Keys**: Pan the camera across the map.
    - **Mouse Click**: 
        - Click on a unit to select it.
        - Click on a tile to move the selected unit.
    - **B Key**: If a 'settler' unit is selected, press 'B' to found a new city. This will consume the settler.
    - **Spacebar**: End your turn. This resets the movement points for all your units.
- **UI**:
    - **Top-Left**: Shows the current turn, your score, and details about the selected unit.
    - **Top-Right**: An "End Turn" button (can also use Spacebar).

## Development

### Prerequisites

- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/) (comes with Node.js)

### Setup

1.  Clone the repository.
2.  Install dependencies:
    ```bash
    npm install
    ```

### Running the Development Server

To run the game locally with hot-reloading:

```bash
npm run dev
```

This will start a development server, and you can open the provided URL in your browser to play.

## Build

To create a production build of the game:

```bash
npm run build
```

This command will bundle the game into the `dist/` directory. The output consists of static HTML, CSS, and JavaScript files that can be hosted on any static web server.

## Preview

To preview the production build locally:

```bash
npm run preview
```

This will serve the `dist/` directory, allowing you to test the final built version of the game.
