// <editor-fold ******** GLOBAL VARIABLES *********************** //
// TIMING ------------------------ >
var FRAMERATE = 60.0;
var MSPERFRAME = 1000.0 / FRAMERATE;
var SECPERFRAME = 1.0 / FRAMERATE;
var PXPERSEC = 150.0;
var PXPERMS = PXPERSEC / 1000.0;
var PXPERFRAME = PXPERSEC / FRAMERATE;
var DEGPERBEAT = 360 / 12; // baseline based on 12 beats/cycle
// SVG --------------------------- >
var SVG_NS = "http://www.w3.org/2000/svg";
var SVG_XLINK = 'http://www.w3.org/1999/xlink';
// CLOCK ------------------------- >
var framect = 0;
var delta = 0.0;
var lastFrameTimeMs = 0.0;
// NOTATION OBJECTS -------------- >
var notationObjects = [];
var notationObjectsIx = 0;
var cycleStartDegs = [];
for (var i = 0; i < 9999; i++) {
  cycleStartDegs.push(-90 + (360 * i));
}
// </editor-fold> *********************************************** //
// <editor-fold ******** START UP SEQUENCE ********************** //
// 01 START TIME SYNC ENGINE ----- >
var ts = timesync.create({
  //server: 'https://safe-plateau-48516.herokuapp.com/timesync',
  server: '/timesync',
  interval: 1000
});
// 02 MAKE NOTATION OBJECTS ------ >
mkNotationObject(0, 'pulsecycle', 200, 100, 500, 500, 'Pulse Cycle 9:13:21', 92, 12);
notationObjectsIx++;
// 03 START CLOCK SYNC ----------- >
startClockSync();
// 04 BEGIN ANIMATION ------------ >
requestAnimationFrame(animationEngine);
// </editor-fold> *********************************************** //
// <editor-fold ********* NOTATION OBJECTS ********************** //
// <editor-fold -> NOTATION OBJECTS DICTIONARY LEGEND <-
//  notationObjects -> {
// ix:ix,
// canvas:canvas,
// panel:panel,
// dials: [ [ dialSVG, deg, degPerFrame, bpm, btsPerCyc ] ],
// pulseCycleArr[
//  pie,
//  dataArr: [ dict:{deg, x1, y1, x2, y2, triggerGate, svgline} ],
// tnumTicksInFirstCyc,
// addTickIx,
// removeTickIx,
// ]

// </editor-fold> ----
// ANIMATE BEAT MARKERS -----------------------------
function animateBtMarkers(noix) {
  // Get Current deg  and x/y for all dials
  var t_currDeg = notationObjects[noix]['dials'][0][1];
  var tdialx1 = notationObjects[noix]['dials'][0][0].getAttribute('x1');
  var tdialy1 = notationObjects[noix]['dials'][0][0].getAttribute('y1');
  // MAIN LOOP
  // START HERE TROUBLE SHOOT - MAYBE RETHINK CYCLE IDEA JUST LONG LIST OF TICK DEGREE & LOCATIONS NO CYCLES
  for (var i = 0; i < notationObjects[noix]['pulsecycles'].length; i++) {
    var t_pcR = notationObjects[noix]['pulsecycles'][i][0].getAttribute('r');
    var t_halfCyc = notationObjects[noix]['pulsecycles'][i][2] / 2;
    var t_tickIxToAdd = notationObjects[noix]['pulsecycles'][i][3]; //initially next tick after first cycle then incremented
    var t_tickIxToRmv = notationObjects[noix]['pulsecycles'][i][4]; // then incremented
    var tdialx2 = (t_pcR * Math.cos(rads(t_currDeg))) + parseFloat(tdialx1);
    var tdialy2 = (t_pcR * Math.sin(rads(t_currDeg))) + parseFloat(tdialy1);
    var t_tickArray = notationObjects[noix]['pulsecycles'][i][1];
    // COLLISION DETECTION
    for (var j = 0; j < t_tickArray.length; j++) {
      var t_tickDeg = t_tickArray[j]['deg'];
      if (t_tickDeg <= t_currDeg && t_tickDeg >= (t_currDeg - 360)) {
        if (t_tickArray[j]['triggerGate']) { //to keep tick from being triggered more than once
          var tbBox = 2; // size of bounding box around tick for detection
          var tx2a = t_tickArray[j]['x1'] - tbBox;
          var tx2b = t_tickArray[j]['x1'] + tbBox;
          var ty2a = t_tickArray[j]['y1'] - tbBox;
          var ty2b = t_tickArray[j]['y1'] + tbBox;
          // collision detection
          if (tdialx2 >= tx2a && tdialx2 < tx2b && tdialy2 >= ty2a && tdialy2 < ty2b) {
            t_tickArray[j]['triggerGate'] = false;
            console.log(j);
            //grow current tick
            var tcurrTickSVG = t_tickArray[j]['svgline'];
            tcurrTickSVG.setAttributeNS(null, "stroke-width", "8");
            if (j > 0) {
              //restore previous tick to thin size
              var tprevTickSVG = t_tickArray[j - 1]['svgline'];
              tprevTickSVG.setAttributeNS(null, "stroke-width", "2");
            }
            if (j > t_halfCyc) {
              // delete tick half cycle ago
              var t_tickToRemove = document.getElementById(t_tickArray[t_tickIxToRmv]['svgline'].getAttribute('id'));
              t_tickToRemove.parentNode.removeChild(t_tickToRemove);
              t_tickIxToRmv++;
              notationObjects[noix]['pulsecycles'][i][4] = t_tickIxToRmv;
              //   //Add next tick
              notationObjects[noix]['canvas'].appendChild(t_tickArray[t_tickIxToAdd]['svgline']);
              t_tickIxToAdd++;
              notationObjects[noix]['pulsecycles'][i][3] = t_tickIxToAdd;
            }
            break;
          }
        }
      }
    }
  }
}
// MAKE NOTATION OBJECT -----------------------------
function mkNotationObject(ix, type, x, y, w, h, title, bpm, btsPerCyc) {
  var tno = {};
  tno['ix'] = ix;
  var tcvs = mkSVGcanvas(ix, w, h);
  tno['canvas'] = tcvs;
  tno['panel'] = mkpanel(ix, tcvs, x, y, w, h, title);
  switch (type) {
    case 'pulsecycle': // -------- >
      // Dials ---- >
      var tdials = [];
      var tidial = mkdial(ix, w, h, tcvs, bpm, btsPerCyc);
      tdials.push(tidial);
      tno['dials'] = tdials;
      // Pulse Cycles ---- >
      var tpulsecycles = [];
      var tpulsecycle = mkpulsecycle(ix, 0, w, h, tcvs, 0, 30, btsPerCyc, (13 / 9));
      tpulsecycles.push(tpulsecycle);
      tno['pulsecycles'] = tpulsecycles;
      break;
  }
  notationObjects.push(tno);
}
// MAKE PULSE CYCLE ---------------------------------
function mkpulsecycle(ix, pcix, w, h, canvas, ringnum, ringsz, btsPerCyc, ratioToBaseline) {
  //pulseCycleArr[
  //  pie,
  //  dataArr: [ dict:{deg, x1, y1, x2, y2, triggerGate, svgline} ],
  // tnumTicksInFirstCyc,
  // addTickIx,
  // removeTickIx,
  // ]
  var pulseCycleArr = [];
  // MAKE PIE -------------------- >
  var tcx = w / 2;
  var tcy = h / 2;
  var t_ring0_SizeRatio = 0.33;
  var tr = (tcx * t_ring0_SizeRatio) + (ringsz * ringnum);
  var tcirc = document.createElementNS(SVG_NS, "circle");
  tcirc.setAttributeNS(null, "cx", tcx);
  tcirc.setAttributeNS(null, "cy", tcy);
  tcirc.setAttributeNS(null, "r", tr);
  tcirc.setAttributeNS(null, "stroke", "rgb(153, 255, 0)");
  tcirc.setAttributeNS(null, "stroke-width", 4);
  tcirc.setAttributeNS(null, "fill", "none");
  var tpieid = "no" + ix.toString() + "pcCirc" + pcix.toString();
  tcirc.setAttributeNS(null, "id", tpieid);
  pulseCycleArr.push(tcirc);
  // MAKE Beat Markers ----------- >
  // Generate long array with a dict of degrees, x, y and svg
  var tdegPerBt = (360 / btsPerCyc) * ratioToBaseline;
  var ttickDataArr = [];
  for (var i = 0; i < 39600; i++) {
    var ttickDict = {}; //[deg, x1, y1, x2, y2]
    var tdeg = -90 + (tdegPerBt * i);
    var tx1 = tr * Math.cos(rads(tdeg)) + tcx;
    var ty1 = tr * Math.sin(rads(tdeg)) + tcy;
    var tx2 = (tr - ringsz) * Math.cos(rads(tdeg)) + tcx;
    var ty2 = (tr - ringsz) * Math.sin(rads(tdeg)) + tcy;
    ttickDict['deg'] = tdeg;
    ttickDict['x1'] = tx1;
    ttickDict['y1'] = ty1;
    ttickDict['x2'] = tx2;
    ttickDict['y2'] = ty2;
    ttickDict['triggerGate'] = true;
    var tbeatMarker = document.createElementNS(SVG_NS, "line");
    tbeatMarker.setAttributeNS(null, "x1", tx1);
    tbeatMarker.setAttributeNS(null, "y1", ty1);
    tbeatMarker.setAttributeNS(null, "x2", tx2);
    tbeatMarker.setAttributeNS(null, "y2", ty2);
    tbeatMarker.setAttributeNS(null, "stroke", "rgb(255, 131, 0)");
    tbeatMarker.setAttributeNS(null, "stroke-width", 2);
    var tbeatMarkerid = "no" + ix.toString() + "pc" + pcix + "bmkr" + i;
    tbeatMarker.setAttributeNS(null, "id", tbeatMarkerid);
    ttickDict['svgline'] = tbeatMarker;
    ttickDataArr.push(ttickDict);
  }
  pulseCycleArr.push(ttickDataArr);
  //draw first cycle
  var tnumTicksInFirstCyc = Math.ceil(360 / tdegPerBt);
  pulseCycleArr.push(tnumTicksInFirstCyc);
  pulseCycleArr.push(tnumTicksInFirstCyc);
  pulseCycleArr.push(0);
  for (var i = 0; i < tnumTicksInFirstCyc; i++) {
    canvas.appendChild(ttickDataArr[i]['svgline'])
  }
  canvas.appendChild(tcirc); //so circ draws over btMarkers
  return pulseCycleArr;
}
// MAKE DIAL ----------------------------------------
function mkdial(ix, w, h, canvas, bpm, btsPerCyc) {
  //dialArr[dial, deg, degPerFrame, r, bpm, btsPerCyc]
  var tDialArr = []
  var canvasRadius = w / 2;
  var tcx = w / 2;
  var tcy = h / 2;
  var tix2 = canvasRadius * Math.cos(rads(-90)) + tcx;
  var tiy2 = canvasRadius * Math.sin(rads(-90)) + tcy;
  var tdial = document.createElementNS(SVG_NS, "line");
  tdial.setAttributeNS(null, "x1", tcx);
  tdial.setAttributeNS(null, "y1", tcy);
  tdial.setAttributeNS(null, "x2", tix2);
  tdial.setAttributeNS(null, "y2", tiy2);
  tdial.setAttributeNS(null, "stroke", "rgb(153, 255, 0)");
  tdial.setAttributeNS(null, "stroke-width", 4);
  var tdialid = "no" + ix + "dial" + 0;
  tdial.setAttributeNS(null, "id", tdialid);
  canvas.appendChild(tdial);
  tDialArr.push(tdial);
  tDialArr.push(-90); //initial dial degree;
  // Calculate Dial based on 12 beats per cycle --- >
  var numDegPerBeat = 360 / btsPerCyc;
  var numBeatsPerFrame = bpm / (60 * FRAMERATE);
  var degPerFrame = numDegPerBeat * numBeatsPerFrame;
  tDialArr.push(degPerFrame); //DIAL SPEED;
  tDialArr.push(bpm);
  tDialArr.push(btsPerCyc);
  return tDialArr;
}
// MAKE SVG CANVAS ----------------------------------
function mkSVGcanvas(ix, w, h) {
  var tsvgCanvas = document.createElementNS(SVG_NS, "svg");
  tsvgCanvas.setAttributeNS(null, "width", w);
  tsvgCanvas.setAttributeNS(null, "height", h);
  var tcvsid = "svgcanvas" + ix.toString();
  tsvgCanvas.setAttributeNS(null, "id", tcvsid);
  tsvgCanvas.style.backgroundColor = "black";
  return tsvgCanvas;
}
// MAKE JSPANEL -------------------------------------
function mkpanel(ix, svgcanvas, posx, posy, w, h, title) {
  var tpanel;
  jsPanel.create({
    // position: "left-top",
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
// DIAL ANIMATION -----------------------------
function animateDial(noix) {
  for (var j = 0; j < notationObjects[noix]['dials'].length; j++) {
    var tdialSVG = notationObjects[noix]['dials'][j][0];
    var tcurrDeg = notationObjects[noix]['dials'][j][1];
    var tdegPerFrame = notationObjects[noix]['dials'][j][2];
    var tradius = parseFloat(notationObjects[noix]['canvas'].getAttribute('width')) / 2;
    var tcenterCoord = parseFloat(tdialSVG.getAttribute('x1'));
    tcurrDeg += tdegPerFrame;
    var tx2 = tradius * Math.cos(rads(tcurrDeg)) + tcenterCoord;
    var ty2 = tradius * Math.sin(rads(tcurrDeg)) + tcenterCoord;
    var tdialVec = new Victor(tx2, ty2);
    tdialSVG.setAttributeNS(null, "x2", tx2);
    tdialSVG.setAttributeNS(null, "y2", ty2);
    notationObjects[noix]['dials'][j][1] = tcurrDeg;
  }
}
// </editor-fold> *********************************************** //
// <editor-fold ********* ANIMATION ENGINE ********************** //
// UPDATE -------------------------------------------
function update(aMSPERFRAME, currTimeMS) {
  for (var i = 0; i < notationObjects.length; i++) {
    // ANIMATE DIAL --------------- >
    animateDial(i);
    // ANIMATE BEAT MARKERS ------- >
    animateBtMarkers(i);
  }
  framect++;
}
// ANIMATION ENGINE ---------------------------------
function animationEngine(timestamp) {
  var t_now = new Date(ts.now());
  var t_lt = t_now.getTime();
  delta += t_lt - lastFrameTimeMs;
  lastFrameTimeMs = t_lt;
  while (delta >= MSPERFRAME) {
    update(MSPERFRAME, t_lt);
    delta -= MSPERFRAME;
  }
  requestAnimationFrame(animationEngine);
}
// </editor-fold> *********************************************** //
// <editor-fold ******** START UP FUNCTIONS ********************* //
// START PIECE ----------------------------------------
function startPiece() {
  startClockSync();
  requestAnimationFrame(animationEngine);
}
// CLOCK SYNC -----------------------------------------
function startClockSync() {
  var t_now = new Date(ts.now());
  lastFrameTimeMs = t_now.getTime();
}
// </editor-fold> *********************************************** //



/* NOTES
var t = true;
// if(t)console.log(currDegsAllDials);t=false;
// Note: Can have cascading pulse cycles and one dial or
// cycle length pulse cycle with multiple dials
// BUT NOT BOTH
*/
/*
BEAT MARKER ANIMATION
ANIMATE DIAL TO GLOW EACH BEAT
ADD ADDITIONAL PULSE CYCLES - DIFFERENT COLOR TICKS
ADD SUBDIVISION
Practice it
Resize later

*/
