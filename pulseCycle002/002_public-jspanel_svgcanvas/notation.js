// GLOBAL VARIABLES ----------------------------------------------------- //
// CLOCK ------------------------- >
var framect = 0;
var delta = 0.0;
var lastFrameTimeMs = 0.0;
// TIMING ------------------------ >
var FRAMERATE = 60.0;
var MSPERFRAME = 1000.0 / FRAMERATE;
// SVG --------------------------- >
var SVG_NS = "http://www.w3.org/2000/svg";
////////////////////////////////////////////////////////////////////////////


// START UP SEQUENCE ---------------------------------------------------- //
// 01: START TIME SYNC ENGINE ---------------- >
var ts = timesync.create({
  //server: 'https://safe-plateau-48516.herokuapp.com/timesync',
  server: '/timesync',
  interval: 1000
});
// 02: MAKE SVG CANVAS FOR PANEL ------------- >
//mkSVGcanvas(ix, w, h);
var svgCanvas = mkSVGcanvas(0, 200, 200);
// 03: MAKE PANEL ---------------------------- >
// mkpanel(ix, canvas, x, y, w, h, title);
mkpanel(0, svgCanvas, 150, 50, 200, 200, "Test Panel");
// LAST: START TIME SYNC ENGINE -------------- >
  requestAnimationFrame(animationEngine);
////////////////////////////////////////////////////////////////////////////


// MAKE SVG CANVAS ------------------------------------------------------ //
function mkSVGcanvas(ix, w, h) {
  var tsvgCanvas = document.createElementNS(SVG_NS, "svg");
  tsvgCanvas.setAttributeNS(null, "width", w);
  tsvgCanvas.setAttributeNS(null, "height", h);
  var tcvsid = "svgcanvas" + ix.toString();
  tsvgCanvas.setAttributeNS(null, "id", tcvsid);
  tsvgCanvas.style.backgroundColor = "black";
  return tsvgCanvas;
}
////////////////////////////////////////////////////////////////////////////


// MAKE JSPANEL ------------------------------------------------------ //
function mkpanel(ix, svgcanvas, posx, posy, w, h, title) {
  var tpanel;
  jsPanel.create({
    position: 'center-top',
    id: "panel" + ix,
    contentSize: w.toString() + " " + h.toString(),
    header: 'auto-show-hide',
    headerControls: {
      minimize: 'remove',
      smallify: 'remove',
      maximize: 'remove',
      close: 'remove'
    },
    contentOverflow: 'hidden',
    headerTitle: title,
    theme: "light",
    content: svgcanvas,
    resizeit: {
      aspectRatio: 'content',
      resize: function(panel, paneldata, e) {}
    },
    callback: function() {
      tpanel = this;
    }
  });
  return tpanel;
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
