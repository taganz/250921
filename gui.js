// ===================== GUI =====================

// config:
let guiVisible = false; // estado inicial


let canvas;
let ui = {};
let uiElements = [];   // guardamos todos los controles aquí
const CANVAS_ZONE_WIDTH = 320; // ancho reservado para los sliders --> CALCULAR
export let params = {};

export function setupGUI(params, clearCanvas, theCanvas, paramsDefault) {
  let y = 20, dy = 30;
  canvas = theCanvas;
  Object.assign(params, paramsDefault);  // copia objecte, no referencia

  function addSlider(name, min, max, val, step, y) {
    const s = createSlider(min, max, val, step);
    s.position(20, y);
    s.style('width', '160px');
    const lbl = createDiv(`${name} (${val})`);
    lbl.position(190, y - 5);
    lbl.style('color', 'black');

    // Actualiza el texto del label con el valor actual del slider
    s.input(() => {
      lbl.html(`${name} (${s.value()})`);
      clearCanvas();
    });

    // Guardar en el array para poder ocultar/mostrar
    uiElements.push(s, lbl);
    return s;
  }

  ui.gridSize  = addSlider('gridSize', 4, 40, params.gridSize, 1, y); y += dy;
  ui.rMin      = addSlider('rMin', 0, 40, params.rMin, 1, y); y += dy;
  ui.rMax      = addSlider('rMax', 1, 80, params.rMax, 1, y); y += dy;
  ui.alpha     = addSlider('alphaFill', 0, 30, params.alphaFill, 0.1, y); y += dy;
  ui.tSpeed    = addSlider('tSpeed', 0.000, 0.02, params.tSpeed, 0.001, y); y += dy;
  ui.scaleMove = addSlider('scaleMove', 0.05, 2.0, params.scaleMove, 0.01, y); y += dy;
  ui.moveSpeed = addSlider('moveSpeed', 0, 5.0, params.moveSpeed, 0.1, y); y += dy;
  ui.scaleR    = addSlider('scaleR', 0.002, 0.08, params.scaleR, 0.001, y); y += dy;
  ui.scaleC    = addSlider('scaleC', 0.001, 0.003, params.scaleC, 0.0001, y); y += dy;
  
  
  
  
}


export function toogleGui() {
    guiVisible = !guiVisible;
    showGui();
}




export function showGui() {
  uiElements.forEach(el => {
    if (guiVisible) el.show(); else el.hide();
  });
  // Mueve el canvas a la derecha de los sliders si los sliders están visibles
  if (canvas) {
    if (guiVisible) {
      canvas.position(CANVAS_ZONE_WIDTH, 20); // Ajusta 220 según el ancho de tu zona de sliders
    } else {
      canvas.position(20, 20); // Posición original
    }
  }
}



// Mantener params = valores UI
export function updateParamsFromUI() {
  params.gridSize  = ui.gridSize.value();
  params.rMin      = ui.rMin.value();
  params.rMax      = max(params.rMin + 1, ui.rMax.value()); // asegurar rMax > rMin
  params.alphaFill = ui.alpha.value();
  params.tSpeed    = ui.tSpeed.value();
  params.moveSpeed = ui.moveSpeed.value();
  params.scaleR    = ui.scaleR.value();
  params.scaleC    = ui.scaleC.value();
  params.scaleMove = ui.scaleMove.value();

}



// Hook al final del frame para leer UI (más fluido)
p5.prototype.registerMethod('post', function() {
  if (ui && ui.gridSize) updateParamsFromUI();
});
