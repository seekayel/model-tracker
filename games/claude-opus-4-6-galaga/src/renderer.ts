// ── Canvas renderer & sprite drawing helpers ──

import { GAME_W, GAME_H } from "./types";

let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;

export function initRenderer(): CanvasRenderingContext2D {
  canvas = document.getElementById("game") as HTMLCanvasElement;
  canvas.width = GAME_W;
  canvas.height = GAME_H;
  ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = false;

  function resize() {
    const scaleX = window.innerWidth / GAME_W;
    const scaleY = window.innerHeight / GAME_H;
    const scale = Math.min(scaleX, scaleY);
    canvas.style.width = `${GAME_W * scale}px`;
    canvas.style.height = `${GAME_H * scale}px`;
    canvas.style.marginTop = `${(window.innerHeight - GAME_H * scale) / 2}px`;
  }

  resize();
  window.addEventListener("resize", resize);
  return ctx;
}

export function clear() {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, GAME_W, GAME_H);
}

export function getCtx(): CanvasRenderingContext2D {
  return ctx;
}
