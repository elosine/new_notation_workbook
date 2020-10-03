// GLOBAL VARIABLES ----------------------------------------------------- //
// CLOCK ------------------------- >
var framect = 0;
var delta = 0.0;
var lastFrameTimeMs = 0.0;
// TIMING ------------------------ >
var FRAMERATE = 60.0;
var MSPERFRAME = 1000.0 / FRAMERATE;
////////////////////////////////////////////////////////////////////////////

// *********************************
// START UP SEQUENCE ---------------------------------------------------- //
// 01 START TIME SYNC ENGINE ----- >
var ts = timesync.create({
  //server: 'https://safe-plateau-48516.herokuapp.com/timesync',
  server: '/timesync',
  interval: 1000
});
// *********************************

// START PIECE ---------------------------------------------------------- //
//run to start animation
function startPiece() {
  startClockSync();
  requestAnimationFrame(animationEngine);
}
////////////////////////////////////////////////////////////////////////////

// *********************************
// CLOCK SYNC ---------------------------------------------------------- //
function startClockSync() {
  var t_now = new Date(ts.now());
  lastFrameTimeMs = t_now.getTime();
}
////////////////////////////////////////////////////////////////////////////
// *********************************

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
