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
// 04: TEST ANIMATION ------------------------ >
mkSVGline();
// LAST: START TIME SYNC ENGINE -------------- >
requestAnimationFrame(animationEngine);
////////////////////////////////////////////////////////////////////////////


// ADD SVG ANIMATION ----------------------------------------------------- //
function mkSVGline (){
  //Create SVG Graphic
  var svgLine = document.createElementNS(SVG_NS, "line");
  svgLine.setAttributeNS(null, "x1", 100);
  svgLine.setAttributeNS(null, "y1", 0);
  svgLine.setAttributeNS(null, "x2", 100);
  svgLine.setAttributeNS(null, "y2", 200);
  svgLine.setAttributeNS(null, "stroke", '#DF00FE');
  svgLine.setAttributeNS(null, "stroke-width", 4);
  var svgLineId = "line" + "0";
  svgLine.setAttributeNS(null, "id", svgLineId);
  //Get Canvas
  var t_svgCvs = document.getElementById('svgcanvas0');
  t_svgCvs.appendChild(svgLine);
}

var lineX = 100;
var lineDir = 1;
function animateSVG (){
var t_svgLine = document.getElementById('line0');
t_svgLine.setAttributeNS(null, "x1", lineX);
t_svgLine.setAttributeNS(null, "x2", lineX);
  lineX = lineX + (1*lineDir);
  if(lineX>199) lineDir = -1;
  else if(lineX<1) lineDir = 1;
}
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
  animateSVG();
}
////////////////////////////////////////////////////////////////////////////


// DRAW ----------------------------------------------------------------- //
function draw() {}
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
