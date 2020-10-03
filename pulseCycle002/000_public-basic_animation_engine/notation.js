// GLOBAL VARIABLES ----------------------------------------------------- //
// CLOCK ------------------------- >
var framect = 0;
var delta = 0.0;
var lastFrameTimeMs = 0.0;
// TIMING ------------------------ >
var FRAMERATE = 60.0;
var MSPERFRAME = 1000.0 / FRAMERATE;
////////////////////////////////////////////////////////////////////////////

startPiece();

// START PIECE ---------------------------------------------------------- //
//run to start animation
function startPiece() {
  requestAnimationFrame(animationEngine);
}
////////////////////////////////////////////////////////////////////////////

// UPDATE --------------------------------------------------------------- //
function update(aMSPERFRAME, currTimeMS) {
  framect++;
}
////////////////////////////////////////////////////////////////////////////

// DRAW ----------------------------------------------------------------- //
function draw() {
}
////////////////////////////////////////////////////////////////////////////

// ANIMATION ENGINE ----------------------------------------------------- //
function animationEngine(timestamp) {
  delta += timestamp - lastFrameTimeMs;
  lastFrameTimeMs = timestamp;
  while (delta >= MSPERFRAME) {
    update(MSPERFRAME);
    draw();
    delta -= MSPERFRAME;
  }
  requestAnimationFrame(animationEngine);
}
////////////////////////////////////////////////////////////////////////////
