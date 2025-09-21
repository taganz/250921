// p5.js — Círculos con noise + GUI + Paletas
// - Superposición con transparencia
// - Centros en una grid (gridSize)
// - Radio por noise
// - Desplazamiento de "cámara" en +x/+y por noise
// - GUI para ajustar todo en vivo

// 250921 - ve de 250920, he tret palette

// config:
const snapToGrid = true; // si es true, la cámara se mueve en saltos de gridSize

import { setupGUI, showGui, toogleGui } from './gui.js';
import { params } from './gui.js';

let canvas;


const paramsDefault1 = {  // rodones grosses
  gridSize: 15,   // 15, 6, 6
  rMin: 6,
  rMax: 6,
  alphaFill: 22,      
  tSpeed: 0.00,       
  scaleMove: 0.18, 
  moveSpeed: 3,  // 0.4
  scaleR: 0.022,
  scaleC: 0.002, 
  sat: 80,  
  hueBase: Math.floor(Math.random()*360), // base hue random

  palette: 'Twilight',
  seed: 0          
};


const paramsDefault = paramsDefault1;

let camX = 0, camY = 1000, camXsnap = 0, camYsnap = 0, t = 0;



function setup() {
  canvas = createCanvas(800, 800);
  colorMode(HSB, 360, 100, 100, 100);
  noStroke();
  background(0, 0, 0);

  //noiseDetail(4, 0.5);
  if (paramsDefault.seed && paramsDefault.seed !== 0) {
    randomSeed(paramsDefault.seed);
    noiseSeed(paramsDefault.seed);
  } 

  // activate gui
  setupGUI(params, clearCanvas, canvas, paramsDefault);
  console.log("params en setup:", params);
  showGui();

}

function draw() {

  moveCamera2()
  drawCircles();
  t += params.tSpeed;
}

function moveCamera() {
  // Decidir desplazamiento (+x o +y) y módulo del paso
  const dirNoise = noise(1000 + t * params.scaleMove);
  const dirNoise2 = noise(t * params.scaleMove * 5);
  if (dirNoise < 0.8) camX += params.moveSpeed;
  if (dirNoise2 < 0.5)
        camY += params.moveSpeed;
  else
        camY -= params.moveSpeed;

  // snap to grid
  camXsnap = round(camX / params.gridSize) * params.gridSize;
  camYsnap = round(camY / params.gridSize) * params.gridSize;

  if (!snapToGrid) {
    camXsnap = camX;
    camYsnap = camY;
  }

}

function moveCamera2() {
  // Encontrar la posición del círculo central en pantalla
  const centerX = width / 2;
  const centerY = height / 2;
  
  // Ajustar a la grid más cercana
  const centerGridX = Math.round(centerX / params.gridSize) * params.gridSize;
  const centerGridY = Math.round(centerY / params.gridSize) * params.gridSize;
  
  // Calcular coordenadas mundiales del centro
  const centerWx = centerGridX + camXsnap;
  const centerWy = centerGridY + camYsnap;
  
  // Calcular hue del círculo central
  const centerNc = noise(500 + centerWx * params.scaleC, 500 + centerWy * params.scaleC);
  const centerNHue = map(centerNc, 0, 1, 0, 360);
  const centerNHueRot = noise(500 + centerWx * 0.0001, 500 + centerWy * 0.0001) + params.hueBase;
  const centerHueRot = map(centerNHueRot, 0, 1, -60, 60);
  const centerHue = (centerHueRot + centerNHue) % 360;
  
  // Definir las 8 direcciones adyacentes
  const directions = [
    { dx: -1, dy: -1 }, { dx: 0, dy: -1 }, { dx: 1, dy: -1 },
    { dx: -1, dy:  0 },                    { dx: 1, dy:  0 },
    { dx: -1, dy:  1 }, { dx: 0, dy:  1 }, { dx: 1, dy:  1 }
  ];
  
  let bestDirection = { dx: 0, dy: 0 };
  let shortestDownwardDistance = 360;
  
  // Evaluar solo las direcciones hacia la derecha (dx >= 0)
  for (let dir of directions) {
    // Solo considerar direcciones que vayan hacia la derecha o verticalmente
    if (dir.dx < 0) {
      continue;
    }
    
    const adjWx = centerWx + (dir.dx * params.gridSize);
    const adjWy = centerWy + (dir.dy * params.gridSize);
    
    // Calcular hue del círculo adyacente
    const adjNc = noise(500 + adjWx * params.scaleC, 500 + adjWy * params.scaleC);
    const adjNHue = map(adjNc, 0, 1, 0, 360);
    const adjNHueRot = noise(500 + adjWx * 0.0001, 500 + adjWy * 0.0001) + params.hueBase;
    const adjHueRot = map(adjNHueRot, 0, 1, -60, 60);
    const adjHue = (adjHueRot + adjNHue) % 360;
    
    // Calcular distancia "hacia abajo" considerando circularidad
    let downwardDistance;
    if (adjHue <= centerHue) {
      // Caso normal: el hue adyacente es menor (vamos hacia abajo directamente)
      downwardDistance = centerHue - adjHue;
    } else {
      // Caso circular: el hue adyacente es mayor, pero podemos ir "hacia abajo" dando la vuelta
      downwardDistance = centerHue + (360 - adjHue);
    }
    
    // Elegir la dirección con la menor distancia hacia abajo
    if (downwardDistance < shortestDownwardDistance) {
      shortestDownwardDistance = downwardDistance;
      bestDirection = dir;
    }
  }
  
  // Mover la cámara en la dirección del círculo con hue más similar
  camX += bestDirection.dx * params.moveSpeed;
  camY += bestDirection.dy * params.moveSpeed;
  
  // snap to grid
  camXsnap = round(camX / params.gridSize) * params.gridSize;
  camYsnap = round(camY / params.gridSize) * params.gridSize;

  if (!snapToGrid) {
    camXsnap = camX;
    camYsnap = camY;
  }
}

function clearCanvas() {
  push();
  colorMode(HSB, 360, 100, 100, 100);
  background(0, 0, 0);
  pop();
  // Si también quieres reiniciar el tiempo/cámara, descomenta:
  // t = 0; camX = 0; camY = 0;
}

function drawCircles() {
  
  // Pintar la malla
  for (let y = 0; y < height+params.gridSize; y += params.gridSize) {
    for (let x = 0; x < width+params.gridSize; x += params.gridSize) {
      const wx = x + camXsnap;
      const wy = y + camYsnap;

      // Radio por noise
      const nr = noise(wx * params.scaleR, wy * params.scaleR, t);
      const r = map(nr, 0, 1, params.rMin, params.rMax);

      const nc = noise(500 + wx * params.scaleC, 500 + wy * params.scaleC);
      const nHue = map(nc, 0, 1, 0, 360);
      const nHueRot = noise(500 + wx * 0.0001, 500 + wy * 0.0001) + params.hueBase;
      const hueRot = map(nHueRot, 0, 1, -60, 60);
      // Con esto el tono global va rotando lentamente
      // y el local (nHue) va variando por la posición
      // final queda en [0,360]
      const hue = (hueRot + nHue) % 360; 
      const hue2 = (hueRot + nHue + 120) % 360; 
      const hue3 = (hueRot + nHue + 240) % 360; 
      const sat = params.sat;
      const bri = map(nc, 0, 1, 70, 100);
      const colorType = noise(wx * 0.01, wy * 0.01);
          
      if (colorType < 0.60) {
        fill(hue, sat, bri, params.alphaFill) // alpha 0–100 en HSB
      } else if (colorType < 0.80) {
        fill(hue2, sat, bri, params.alphaFill) // alpha 0–100 en HSB
      } else {
        fill(hue3, sat, bri, params.alphaFill)  // alpha 0–100 en HSB
      }

      markIfCenterCircle(x, y);

      circle(x, y, 2 * r);
    }
  }
}

function markIfCenterCircle(x, y) {
    // Detectar si es el círculo del centro
    const centerX = width / 2;
    const centerY = height / 2;
    const distanceToCenter = dist(x, y, centerX, centerY);
    const isCenter = distanceToCenter < params.gridSize / 2;

    if (isCenter) {
      // 60 es groc
      stroke((params.hueBase - 70) % 360, 50, 100); // <--- millorar 
      strokeWeight(4);
    } else {
      noStroke();
    }
}

function keyPressed() {
  if (key === '1') {
        toogleGui();
  }
  if (key === 'b' || key === 'B') clearCanvas();
  if (key === 's' || key === 'S') saveCanvas('circulos-noise', 'png');
}


// Bind p5’s globals
// p5js espera trobar els callbacks en window i si ho posem dins de moduls no ho troba 
window.setup        = setup;
window.draw         = draw;
//window.windowResized  = windowResized;
//window.redraw       = redraw;
window.keyPressed   = keyPressed;
//window.keyReleased  = keyReleased;
//window.mouseMoved   = mouseMoved;
