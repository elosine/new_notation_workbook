// ##################### GLOBAL VARIABLES ####################### //
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
// ##################### START UP SEQUENCE ###################### //
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
// ###################### NOTATION OBJECTS ###################### //
/* notationObjects -> {
ix:ix, canvas:canvas, panel:panel,
 dialArr[dial, deg, spd, r],  mins   jsPanel]
*/
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
      var tpulsecycle = mkpulsecycle(ix, 0, w, h, tcvs, 0, 30, btsPerCyc, 1);
      tdials.push(tidial);
      tno['dials'] = tdials;
      break;
  }
  notationObjects.push(tno);
}
// MAKE PULSE CYCLE ---------------------------------
function mkpulsecycle(ix, pcix, w, h, canvas, ringnum, ringsz, btsPerCyc, ratioToBaseline) {
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
  canvas.appendChild(tcirc);
  // MAKE Beat Markers ----------- >
  // Generate long array of degrees
  var tdegPerBt = (360 / btsPerCyc) * ratioToBaseline;
  var tbtDegLocs = [];
  for (var i = 0; i < 9999; i++) {
    tbtDegLocs.push(-90 + (tdegPerBt * i));
  }
  // Organize into cycles
  var tcycix = 1;
  var tbtCycles = [];
  var tbtcyc = [];
  for (var i = 0; i < tbtDegLocs.length; i++) {
    if (tbtDegLocs[i] < cycleStartDegs[tcycix]) {
      var tbtLocAr = {}; //[deg, x1, y1, x2, y2]
      var tdeg = tbtDegLocs[i];
      tbtLocAr['deg'] = tdeg;
      tbtLocAr['x1'] = tr * Math.cos(rads(tdeg)) + tcx;
      tbtLocAr['y1'] = tr * Math.sin(rads(tdeg)) + tcy;
      tbtLocAr['x2'] = (tr - ringsz) * Math.cos(rads(tdeg)) + tcx;
      tbtLocAr['y2'] = (tr - ringsz) * Math.sin(rads(tdeg)) + tcy;
      tbtcyc.push(tbtLocAr);
    } else {
      tbtCycles.push(tbtcyc);
      tbtcyc = [];
      tcycix++;
      var tbtLocAr = {}; //[deg, x1, y1, x2, y2]
      var tdeg = tbtDegLocs[i];
      tbtLocAr['deg'] = tdeg;
      tbtLocAr['x1'] = tr * Math.cos(rads(tdeg)) + tcx;
      tbtLocAr['y1'] = tr * Math.sin(rads(tdeg)) + tcy;
      tbtLocAr['x2'] = (tr - ringsz) * Math.cos(rads(tdeg)) + tcx;
      tbtLocAr['y2'] = (tr - ringsz) * Math.sin(rads(tdeg)) + tcy;
      tbtcyc.push(tbtLocAr);
    }
  }
  // CREATE MAX NUMBER OF SVG LINES & DRAW FIRST CYCLE -- >
  // Find max number of beat markers per cycle
  var tmaxNumBtsPerCyc = 0;
  for (var i = 0; i < tbtCycles.length; i++) {
    if (tbtCycles[i].length > tmaxNumBtsPerCyc) tmaxNumBtsPerCyc = tbtCycles[i].length;
  }
  // Make first cycle of beat markers
  for (var i = 0; i < tbtCycles[0].length; i++) {
    var tbeatMarker = document.createElementNS(SVG_NS, "line");
    tbeatMarker.setAttributeNS(null, "x1", tbtCycles[0][i].x1);
    tbeatMarker.setAttributeNS(null, "y1", tbtCycles[0][i].y1);
    tbeatMarker.setAttributeNS(null, "x2", tbtCycles[0][i].x2);
    tbeatMarker.setAttributeNS(null, "y2", tbtCycles[0][i].y2);
    tbeatMarker.setAttributeNS(null, "stroke", "rgb(255, 131, 0)");
    tbeatMarker.setAttributeNS(null, "stroke-width", 2);
    var tbeatMarkerid = "no" + ix.toString() + "pc" + pcix + "bmkr" + i;
    tbeatMarker.setAttributeNS(null, "id", tbeatMarkerid);
    canvas.appendChild(tbeatMarker);
    // tlnDeg.push(tbeatMarker);
    // tlnDeg.push(tdeg);
    // tlnDeg.push(true); //trigger gate
    // tbeatMarkers.push(tlnDeg);
  }
  // Create any additional marker lines and make invisible
  var tnumExtraMarks = tmaxNumBtsPerCyc - tbtCycles[0].length;
  for (var i = 0; i < tnumExtraMarks; i++) {

  }
  // var maxNumBtsPerCyc = (360 / tdegPerBt);
  // var tbeatMarkers = [];
  // for (var i = 0; i < numBtsPerCyc; i++) {
  //   var tlnDeg = [];
  //   var tdeg = -90 + (numDegPerBeat * i);
  //   var tix1 = (tr - 20) * Math.cos(rads(tdeg)) + tcx;
  //   var tiy1 = (tr - 20) * Math.sin(rads(tdeg)) + tcy;
  //   var tix2 = tr * Math.cos(rads(tdeg)) + tcx;
  //   var tiy2 = tr * Math.sin(rads(tdeg)) + tcy;
  //   var tbeatMarker = document.createElementNS(SVG_NS, "line");
  //   tbeatMarker.setAttributeNS(null, "x1", tix1);
  //   tbeatMarker.setAttributeNS(null, "y1", tiy1);
  //   tbeatMarker.setAttributeNS(null, "x2", tix2);
  //   tbeatMarker.setAttributeNS(null, "y2", tiy2);
  //   tbeatMarker.setAttributeNS(null, "stroke", "rgb(255, 131, 0)");
  //   tbeatMarker.setAttributeNS(null, "stroke-width", 2);
  //   var tbeatMarkerid = "beatMarker" + ix.toString() + "-" + i;
  //   tbeatMarker.setAttributeNS(null, "id", tbeatMarkerid);
  //   tcvs.appendChild(tbeatMarker);
  //   tlnDeg.push(tbeatMarker);
  //   tlnDeg.push(tdeg);
  //   tlnDeg.push(true); //trigger gate
  //   tbeatMarkers.push(tlnDeg);
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
  tDialArr.push(canvasRadius);
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
// ###################### ANIMATION ENGINE ###################### //
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
// UPDATE -------------------------------------------
function update(aMSPERFRAME, currTimeMS) {
  framect++;
}
// ########################## START UP ########################## //
// START PIECE --------------------------------------
function startPiece() {
  startClockSync();
  requestAnimationFrame(animationEngine);
}
// FUNCTION: startClockSync ---------------------------
function startClockSync() {
  var t_now = new Date(ts.now());
  lastFrameTimeMs = t_now.getTime();
}









// var tlastDeg = 0;
// var t = true;
// var markersOn = [];
// var markerDur = 80;
// var bigMarkerSz = 9;
// // FUNCTION: minMarkerAnime -------------------------------------------------- //
// function minMarkerAnime(currtime) {
//   for (var i = 0; i < markersOn.length; i++) {
//     var tnoKey = markersOn[i][0];
//     var tmarkerNo = markersOn[i][1];
//     var tmkStTime = markersOn[i][2];
//     var tTimeElapsed = currtime - tmkStTime;
//     if (tTimeElapsed < markerDur) {
//       var tteNorm = scale(tTimeElapsed, 0, markerDur, 2, bigMarkerSz);
//       notationObjects[tnoKey][5][tmarkerNo][0].setAttributeNS(null, "stroke-width", tteNorm.toString());
//     }
//   }
// }

// for (var key in notationObjects) {
//   //ANIMATE DIAL //////////////////////////
//   var tpie = notationObjects[key][1];
//   var tdial = notationObjects[key][2][0];
//   var tr = notationObjects[key][2][3]; //radius
//   var tc = parseFloat(tdial.getAttribute('x1')); //center coord
//   var tdialspd = notationObjects[key][
//     [2][2];
//     var t_currDeg = notationObjects[key][2][1];
//     t_currDeg += tdialspd;
//     var tx2 = tr * Math.cos(rads(t_currDeg)) + tc;
//     var ty2 = tr * Math.sin(rads(t_currDeg)) + tc;
//     var tdialVec = new Victor(tx2, ty2);
//     tdial.setAttributeNS(null, "x2", tx2);
//     tdial.setAttributeNS(null, "y2", ty2);
//     notationObjects[key][3] = t_currDeg;
//     // MINUTE MARKER COLLITION
//     for (var i = 0; i < notationObjects[key][5].length; i++) {
//       var tgate = notationObjects[key][5][i][2];
//       if (tgate) {
//         var tminSvg = notationObjects[key][5][i][0];
//         var tMinX2 = parseFloat(tminSvg.getAttribute('x2'));
//         var tMinY2 = parseFloat(tminSvg.getAttribute('y2'));
//         var tbBox = 2;
//         var tMinX2a = tMinX2 - tbBox;
//         var tMinX2b = tMinX2 + tbBox;
//         var tMinY2a = tMinY2 - tbBox;
//         var tMinY2b = tMinY2 + tbBox;
//         var tminVec = new Victor(tMinX2, tMinY2);
//         var tdist = Math.abs(tdialVec.distance(tminVec));
//         // MINUTE/BEAT EVENTS TRIGGER
//         if (tx2 >= tMinX2a && tx2 <= tMinX2b && ty2 >= tMinY2a && ty2 <= tMinY2b) {
//           notationObjects[key][5][i][2] = false; //close gate
//           if (i != 0) {
//             notationObjects[key][5][i - 1][2] = true; //open previous gate
//             for (var j = 0; j < markersOn.length; j++) {
//               if (markersOn[j][1] == (i - 1)) {
//                 notationObjects[key][5][i - 1][0].setAttributeNS(null, "stroke-width", "2");
//                 markersOn.splice(j, 1);
//               }
//             }
//           } else {
//             notationObjects[key][5][notationObjects[key][5].length - 1][2] = true; //open previous gate
//             for (var j = 0; j < markersOn.length; j++) {
//               if (markersOn[j][1] == (notationObjects[key][5].length - 1)) {
//                 notationObjects[key][5][notationObjects[key][5].length - 1][0].setAttributeNS(null, "stroke-width", "2");
//                 markersOn.splice(j, 1);
//               }
//             }
//           }
//           // EVENTS //////////////////////////
//           markersOn.push([key, i, currTimeMS]);
//           break;
//         }
//       }
//     }
//     tlastDeg = t_currDeg;
//   }
//   //animate minute markers
//   minMarkerAnime(currTimeMS)
//   framect++;

//notationObjects = [noix, type(pulseCycle...), notationObjName(pc9-11-13), svgCanvas, jspanel, ]







// //MAKE DIAl ------------------------------------------ //
// function mkdial(cix, dix, w, h, canvas, bpm) {
//   //dialArr[dial, deg, spd, r]
//   var tDialArr = []
//   var canvasRadius = w / 2;
//   var tcx = w / 2;
//   var tcy = h / 2;
//   var tix2 = canvasRadius * Math.cos(rads(-90)) + tcx;
//   var tiy2 = canvasRadius * Math.sin(rads(-90)) + tcy;
//   var tdial = document.createElementNS(SVG_NS, "line");
//   tdial.setAttributeNS(null, "x1", tcx);
//   tdial.setAttributeNS(null, "y1", tcy);
//   tdial.setAttributeNS(null, "x2", tix2);
//   tdial.setAttributeNS(null, "y2", tiy2);
//   tdial.setAttributeNS(null, "stroke", "rgb(153, 255, 0)");
//   tdial.setAttributeNS(null, "stroke-width", 4);
//   var tdialid = "canvas" + cix + "dial" + dix.toString();
//   tdial.setAttributeNS(null, "id", tdialid);
//   canvas.appendChild(tdial);
//   tDialArr.push(tdial);
//   tDialArr.push(-90); //initial dial degree;
//   //Calculate Dial based on 12 beats per cycle
//   var numDegPerBeat = 360 / 12;
//   var numBeatsPerFrame = bpm / (60 * FRAMERATE);
//   var degPerFrame = numDegPerBeat * numBeatsPerFrame;
//   tDialArr.push(degPerFrame); //DIAL SPEED;
//   tDialArr.push(canvasRadius);
//   return tDialArr;
// }

// function mkPulseCycle(ix, mytitle, w, h, bpm, numBtsPerCyc) {
//   var tno = {};
//   var tkey = "no" + ix;
//   // Make Canvas //
//   var tcvs = mkSVGcanvas(ix, w, h);
//   tno['canvas'] = tcvs;
//   // Make Dial //
//   var tdialArr = [];
//   mkdial(cix, 0, w, h, tcvs, bpm);
//   //MAKE PIE -------------------------------------------------- //
//   var tpieSzRatio = 0.4;
//   var tcx = w / 2;
//   var tcy = h / 2;
//   var tr = w / 2 * tpieSzRatio;
//   var tcirc = document.createElementNS(SVG_NS, "circle");
//   tcirc.setAttributeNS(null, "cx", tcx);
//   tcirc.setAttributeNS(null, "cy", tcy);
//   tcirc.setAttributeNS(null, "r", tr);
//   tcirc.setAttributeNS(null, "stroke", "rgb(153, 255, 0)");
//   tcirc.setAttributeNS(null, "stroke-width", 4);
//   tcirc.setAttributeNS(null, "fill", "none");
//   var tpieid = "pie" + ix.toString();
//   tcirc.setAttributeNS(null, "id", tpieid);
//   tcvs.appendChild(tcirc);
//   tno.push(tcirc);
//   //MAKE BEAT MINUTE-MARKERS ---------------------------------------------- //
//   var tmins = [];
//   for (var i = 0; i < numBtsPerCyc; i++) {
//     var tlnDeg = [];
//     var tdeg = -90 + (numDegPerBeat * i);
//     var tix1 = (tr - 20) * Math.cos(rads(tdeg)) + tcx;
//     var tiy1 = (tr - 20) * Math.sin(rads(tdeg)) + tcy;
//     var tix2 = tr * Math.cos(rads(tdeg)) + tcx;
//     var tiy2 = tr * Math.sin(rads(tdeg)) + tcy;
//     var tmin = document.createElementNS(SVG_NS, "line");
//     tmin.setAttributeNS(null, "x1", tix1);
//     tmin.setAttributeNS(null, "y1", tiy1);
//     tmin.setAttributeNS(null, "x2", tix2);
//     tmin.setAttributeNS(null, "y2", tiy2);
//     tmin.setAttributeNS(null, "stroke", "rgb(255, 131, 0)");
//     tmin.setAttributeNS(null, "stroke-width", 2);
//     var tminid = "min" + ix.toString() + "-" + i;
//     tmin.setAttributeNS(null, "id", tminid);
//     tcvs.appendChild(tmin);
//     tlnDeg.push(tmin);
//     tlnDeg.push(tdeg);
//     tlnDeg.push(true); //trigger gate
//     tmins.push(tlnDeg);
//   }
//   tno.push(tmins); //minute markers
//   // Rhythmic NOTATION ///////////////////////////////////////////////////////////
//   // var t_notationSVG = document.createElementNS(SVG_NS, "image");
//   // t_notationSVG.setAttributeNS(SVG_XLINK, 'xlink:href', value[j][1]);
//   // t_notationSVGw = notationContW.toString() * 0.5;
//   // t_notationSVG.setAttributeNS(null, 'width', t_notationSVGw.toString());
//   // var t_svgH = notationContH * 0.3333333;
//   // t_notationSVG.setAttributeNS(null, 'height', t_svgH.toString());
//   // var t_pitchX = notationContCenterX - (t_notationSVGw / 2);
//   // var t_pitchY = notationContH * 0.67;
//   // t_notationSVG.setAttributeNS(null, "transform", "translate(" + t_pitchX.toString() + "," + t_pitchY.toString() + ")");
//   // t_notationSVG.setAttributeNS(null, "id", key + j.toString());
//   // t_notationSVG.setAttributeNS(null, 'visibility', 'visible');
//   // t_notationSVGs.push(t_notationSVG);
//   //MAKE jsPanel ------------------------------------ //
//
//   notationObjects[tkey] = tno;
// }




/*
DIAL MOVEMENT IN UPDATE
BEAT MARKER ANIMATION
ADD ADDITIONAL PULSE CYCLES
MOVING MARKERS EACH CYCLE
Practice it
Resize later

*/
