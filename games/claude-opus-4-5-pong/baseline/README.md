# Pong

A classic Pong game clone built with vanilla JavaScript and HTML5 Canvas.

## Controls

| Player | Action | Key |
|--------|--------|-----|
| Player 1 (Left) | Move Up | W |
| Player 1 (Left) | Move Down | S |
| Player 2 (Right) | Move Up | Arrow Up |
| Player 2 (Right) | Move Down | Arrow Down |
| Both | Start/Pause | Space |

## Gameplay

- Two players compete by controlling paddles on opposite sides of the screen
- Use your paddle to hit the ball back to your opponent
- Score a point when the ball passes your opponent's paddle
- First player to reach 11 points wins

## Development

### Prerequisites

- Node.js (v16 or later recommended)
- npm

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

This starts a local development server with hot reload.

### Build for Production

```bash
npm run build
```

This creates a `dist/` directory with static files ready for deployment.

### Preview Production Build

```bash
npm run preview
```

This serves the production build locally for testing.

## Project Structure

```
├── index.html          # HTML entry point
├── package.json        # Project configuration
├── vite.config.js      # Vite build configuration
├── src/
│   ├── main.js         # Application entry point
│   ├── game.js         # Game logic and state management
│   ├── paddle.js       # Paddle entity class
│   ├── ball.js         # Ball entity class
│   ├── input.js        # Keyboard input handling
│   ├── renderer.js     # Canvas rendering
│   ├── constants.js    # Game constants and configuration
│   └── style.css       # Styles
└── dist/               # Production build output (generated)
```

## Technical Details

- Built with vanilla JavaScript (ES6 modules)
- Renders using HTML5 Canvas API
- Uses Vite for fast development and optimized production builds
- All assets use relative URLs for nested path deployment
