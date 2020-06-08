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
// pulsecycles:[
//   pie,
//   btCyclesArr:[ cycle:[ btMarkerLoc_dict:{deg, x1, y1, x2, y2, triggerGate} ] ],
//   btMarkersSVGsArr:[ btMarkerSVG:[svg,deg] ]
// ]

// </editor-fold> ----
// ANIMATE BEAT MARKERS -----------------------------
var t = true;
// if(t)console.log(currDegsAllDials);t=false;
function animateBtMarkers(noix) {
  // Get Current deg for all dials
  var tcurrDeg = notationObjects[noix]['dials'][0][1];
  // Get Curr Cycle
  var tcurrCyc;
  for (var i = 1; i < cycleStartDegs.length; i++) {
    if (tcurrDeg >= cycleStartDegs[i - 1] && tcurrDeg < cycleStartDegs[i]) {
      tcurrCyc = i - 1;
      break;
    }
  }
  // MAIN LOOP
  for (var i = 0; i < notationObjects[noix]['pulsecycles'].length; i++) {
    // Get current cycle of beatMarkers
    var tcurrBtCyclesArr = notationObjects[noix]['pulsecycles'][i][1][tcurrCyc];
    for (var j = 0; j < tcurrBtCyclesArr.length; j++) {
      if (tcurrBtCyclesArr[j]['triggerGate']) {
        //START HERE WAND/BEATMARKER COLLISION 
        // var tbBox = 2;
        //       var tMinX2a = tMinX2 - tbBox;
        //       var tMinX2b = tMinX2 + tbBox;
        //       var tMinY2a = tMinY2 - tbBox;
        //       var tMinY2b = tMinY2 + tbBox;
        //       var tminVec = new Victor(tMinX2, tMinY2);
        //       var tdist = Math.abs(tdialVec.distance(tminVec));
        //       // MINUTE/BEAT EVENTS TRIGGER
        //       if (tx2 >= tMinX2a && tx2 <= tMinX2b && ty2 >= tMinY2a && ty2 <= tMinY2b) {
        //         notationObjects[key][5][i][2] = false; //close gate
        //         if (i != 0) {
        //           notationObjects[key][5][i - 1][2] = true; //open previous gate
        //           for (var j = 0; j < markersOn.length; j++) {
        //             if (markersOn[j][1] == (i - 1)) {
        //               notationObjects[key][5][i - 1][0].setAttributeNS(null, "stroke-width", "2");
        //               markersOn.splice(j, 1);
        //             }
        //           }
        //         } else {
        //           notationObjects[key][5][notationObjects[key][5].length - 1][2] = true; //open previous gate
        //           for (var j = 0; j < markersOn.length; j++) {
        //             if (markersOn[j][1] == (notationObjects[key][5].length - 1)) {
        //               notationObjects[key][5][notationObjects[key][5].length - 1][0].setAttributeNS(null, "stroke-width", "2");
        //               markersOn.splice(j, 1);
        //             }
        //           }
        //         }
        //         // EVENTS //////////////////////////
        //         markersOn.push([key, i, currTimeMS]);
        //         break;
        //       }
        //     }
        //   }
        //   tlastDeg = t_currDeg;

      }
    }
  }

  /*
// COLLITION DETECTION FIRST
//     if (tgate) {
//       var tminSvg = notationObjects[key][5][i][0];
//       var tMinX2 = parseFloat(tminSvg.getAttribute('x2'));
//       var tMinY2 = parseFloat(tminSvg.getAttribute('y2'));
//       var tbBox = 2;
//       var tMinX2a = tMinX2 - tbBox;
//       var tMinX2b = tMinX2 + tbBox;
//       var tMinY2a = tMinY2 - tbBox;
//       var tMinY2b = tMinY2 + tbBox;
//       var tminVec = new Victor(tMinX2, tMinY2);
//       var tdist = Math.abs(tdialVec.distance(tminVec));
//       // MINUTE/BEAT EVENTS TRIGGER
//       if (tx2 >= tMinX2a && tx2 <= tMinX2b && ty2 >= tMinY2a && ty2 <= tMinY2b) {
//         notationObjects[key][5][i][2] = false; //close gate
//         if (i != 0) {
//           notationObjects[key][5][i - 1][2] = true; //open previous gate
//           for (var j = 0; j < markersOn.length; j++) {
//             if (markersOn[j][1] == (i - 1)) {
//               notationObjects[key][5][i - 1][0].setAttributeNS(null, "stroke-width", "2");
//               markersOn.splice(j, 1);
//             }
//           }
//         } else {
//           notationObjects[key][5][notationObjects[key][5].length - 1][2] = true; //open previous gate
//           for (var j = 0; j < markersOn.length; j++) {
//             if (markersOn[j][1] == (notationObjects[key][5].length - 1)) {
//               notationObjects[key][5][notationObjects[key][5].length - 1][0].setAttributeNS(null, "stroke-width", "2");
//               markersOn.splice(j, 1);
//             }
//           }
//         }
//         // EVENTS //////////////////////////
//         markersOn.push([key, i, currTimeMS]);
//         break;
//       }
//     }
//   }
//   tlastDeg = t_currDeg;
// }


  // Get Current deg for all dials
  // Note: Can have cascading pulse cycles and one dial or
  // cycle length pulse cycle with multiple dials
  // BUT NOT BOTH
  /*
  var tcurrDeg = notationObjects[noix]['dials'][0][1];
  // Get Curr Cycle
  var tcurrCyc;
  for (var i = 1; i < cycleStartDegs.length; i++) {
    if (tcurrDeg >= cycleStartDegs[i - 1] && tcurrDeg < cycleStartDegs[i]) {
      tcurrCyc = i - 1;
      break;
    }
  }
  // Update beatMarker locations - update previous marker
  //// Count back; Go back to previous cycle if necessary
  //// When you get to begining of next cycle, you have to add
  //// The last mark of your cycle to the end + any ADDITIONAL
  //// marks since the last one you added
  // <editor-fold -> NOTATION OBJECTS DICTIONARY LEGEND <-
  // notationObjects -> {
  // ix:ix,
  // canvas:canvas,
  // panel:panel,
  // dials: [ [ dialSVG, deg, degPerFrame, bpm, btsPerCyc ] ],
  // pulsecycles:[
  //   pie,
  //   btCyclesArr:[ cycle:[ btMarkerLoc_dict:{deg, x1, y1, x2, y2} ] ],
  //   btMarkersSVGsArr:[ btMarkerSVG:[svg,deg] ]
  // ]

  // </editor-fold> ----
  if (tcurrCyc > 0) {
    for (var i = 0; i < notationObjects[noix]['pulsecycles'].length; i++) {
      // Get current cycle of beatMarkers
      var tcurrBtCyclesArr = notationObjects[noix]['pulsecycles'][i][1][tcurrCyc];
      // Find out which tick you are on
      var tticknum = 0;
      for (var j = 1; j < tcurrBtCyclesArr.length; j++) {
        if (tcurrDeg >= tcurrBtCyclesArr[j - 1]['deg'] && tcurrDeg < tcurrBtCyclesArr[j]['deg']) {
          tticknum = j - 1;
        }
      }
      // For first tick in cycle need to update the previous tick
      // which is the last tick in the previous cycle to
      // the last tick in the current cycle
      // figure out how to add additional ticks for longer cycles
      if (tticknum != 0) {
        //coordinates dict of previous tick in next cycle dict:{deg, x1, y1, x2, y2}
        var tlocDict = notationObjects[noix]['pulsecycles'][i][1][tcurrCyc + 1][tticknum - 1];
        var tdisGt = tlocDict['triggerGate'];
        if (tdisGt) {
          tlocDict['triggerGate'] = false;
          //get svg of this tick
          var ttickSvg = notationObjects[noix]['pulsecycles'][i][2][tticknum - 1][0];
          //update previous tick's location
          ttickSvg.setAttributeNS(null, "x1", tlocDict['x1']);
          ttickSvg.setAttributeNS(null, "y1", tlocDict['y1']);
          ttickSvg.setAttributeNS(null, "x2", tlocDict['x2']);
          ttickSvg.setAttributeNS(null, "y2", tlocDict['y2']);
        }
      }
      // if (tticknum == 0)
      // else {
      //   var tlastMkofCycIx = notationObjects[noix]['pulsecycles'][i][1][tcurrCyc].length - 1;
      //   //coordinates dict of last tick in current cycle dict:{deg, x1, y1, x2, y2}
      //   var tlocDict = notationObjects[noix]['pulsecycles'][i][1][tcurrCyc][tlastMkofCycIx];
      //   //get svg of this last tick
      //   var ttickSvg = notationObjects[noix]['pulsecycles'][i][2][tlastMkofCycIx][0];
      //   //update previous tick's location
      //   ttickSvg.setAttributeNS(null, "x1", tlocDict['x1']);
      //   ttickSvg.setAttributeNS(null, "y1", tlocDict['y1']);
      //   ttickSvg.setAttributeNS(null, "x2", tlocDict['x2']);
      //   ttickSvg.setAttributeNS(null, "y2", tlocDict['y2']);
      // }
    }
  }
  */
}
//   // MINUTE MARKER COLLITION
//   for (var i = 0; i < notationObjects[noix]['pulsecycles'].length; i++) {
//     var tpieSVG = notationObjects[noix]['pulsecycles'][i][0];
//     var tbtCyclesArr = notationObjects[noix]['pulsecycles'][i][1];
//     var tbtMarkersArr = notationObjects[noix]['pulsecycles'][i][2];
//     // Determine which cycle you are on
//
//
//
//
//     var tgate = notationObjects[key][5][i][2];
//     if (tgate) {
//       var tminSvg = notationObjects[key][5][i][0];
//       var tMinX2 = parseFloat(tminSvg.getAttribute('x2'));
//       var tMinY2 = parseFloat(tminSvg.getAttribute('y2'));
//       var tbBox = 2;
//       var tMinX2a = tMinX2 - tbBox;
//       var tMinX2b = tMinX2 + tbBox;
//       var tMinY2a = tMinY2 - tbBox;
//       var tMinY2b = tMinY2 + tbBox;
//       var tminVec = new Victor(tMinX2, tMinY2);
//       var tdist = Math.abs(tdialVec.distance(tminVec));
//       // MINUTE/BEAT EVENTS TRIGGER
//       if (tx2 >= tMinX2a && tx2 <= tMinX2b && ty2 >= tMinY2a && ty2 <= tMinY2b) {
//         notationObjects[key][5][i][2] = false; //close gate
//         if (i != 0) {
//           notationObjects[key][5][i - 1][2] = true; //open previous gate
//           for (var j = 0; j < markersOn.length; j++) {
//             if (markersOn[j][1] == (i - 1)) {
//               notationObjects[key][5][i - 1][0].setAttributeNS(null, "stroke-width", "2");
//               markersOn.splice(j, 1);
//             }
//           }
//         } else {
//           notationObjects[key][5][notationObjects[key][5].length - 1][2] = true; //open previous gate
//           for (var j = 0; j < markersOn.length; j++) {
//             if (markersOn[j][1] == (notationObjects[key][5].length - 1)) {
//               notationObjects[key][5][notationObjects[key][5].length - 1][0].setAttributeNS(null, "stroke-width", "2");
//               markersOn.splice(j, 1);
//             }
//           }
//         }
//         // EVENTS //////////////////////////
//         markersOn.push([key, i, currTimeMS]);
//         break;
//       }
//     }
//   }
//   tlastDeg = t_currDeg;
// }

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
  ////// each cycle is an array of dictionaries //////
  //  btCyclesArr:[ cycle:[ btMarkerLoc_dict:{deg, x1, y1, x2, y2, triggerGate} ] ],
  //  btMarkersSVGsArr:[ btMarkerSVG:[svg,deg] ]
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
  // canvas.appendChild(tcirc);
  pulseCycleArr.push(tcirc);
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
      tbtLocAr['triggerGate'] = true;
      tbtcyc.push(tbtLocAr);
    }
  }
  pulseCycleArr.push(tbtCycles);
  // CREATE MAX NUMBER OF SVG LINES & DRAW FIRST CYCLE -- >
  // Find max number of beat markers per cycle
  var tmaxNumBtsPerCyc = 0;
  var tbtMarkersSVGs = [];
  //Find the max beats of any cycle
  for (var i = 0; i < tbtCycles.length; i++) {
    if (tbtCycles[i].length > tmaxNumBtsPerCyc) tmaxNumBtsPerCyc = tbtCycles[i].length;
  }
  // Make first cycle of beat markers
  for (var i = 0; i < tbtCycles[0].length; i++) {
    var btMarkerArr = [];
    var tbeatMarker = document.createElementNS(SVG_NS, "line");
    tbeatMarker.setAttributeNS(null, "x1", tbtCycles[0][i].x1);
    tbeatMarker.setAttributeNS(null, "y1", tbtCycles[0][i].y1);
    tbeatMarker.setAttributeNS(null, "x2", tbtCycles[0][i].x2);
    tbeatMarker.setAttributeNS(null, "y2", tbtCycles[0][i].y2);
    tbeatMarker.setAttributeNS(null, "stroke", "rgb(255, 131, 0)");
    tbeatMarker.setAttributeNS(null, "stroke-width", 2);
    var tbeatMarkerid = "no" + ix.toString() + "pc" + pcix + "bmkr" + i;
    tbeatMarker.setAttributeNS(null, "id", tbeatMarkerid);
    tbeatMarker.setAttributeNS(null, 'visibility', 'visible');
    canvas.appendChild(tbeatMarker);
    btMarkerArr.push(tbeatMarker);
    btMarkerArr.push(tdeg);
    tbtMarkersSVGs.push(btMarkerArr);
  }
  // Create any additional marker lines and make invisible
  var tnumExtraMarks = tmaxNumBtsPerCyc - tbtCycles[0].length;
  for (var i = 0; i < tnumExtraMarks; i++) {
    var btMarkerArr = [];
    var tbeatMarker = document.createElementNS(SVG_NS, "line");
    tbeatMarker.setAttributeNS(null, "x1", tbtCycles[0][0].x1);
    tbeatMarker.setAttributeNS(null, "y1", tbtCycles[0][0].y1);
    tbeatMarker.setAttributeNS(null, "x2", tbtCycles[0][0].x2);
    tbeatMarker.setAttributeNS(null, "y2", tbtCycles[0][0].y2);
    tbeatMarker.setAttributeNS(null, "stroke", "rgb(255, 131, 0)");
    tbeatMarker.setAttributeNS(null, "stroke-width", 2);
    var tix = i + tbtCycles[0].length - 1;
    var tbeatMarkerid = "no" + ix.toString() + "pc" + pcix + "bmkr" + tix;
    tbeatMarker.setAttributeNS(null, "id", tbeatMarkerid);
    t_notationSVG.setAttributeNS(null, 'visibility', 'hidden');
    canvas.appendChild(tbeatMarker);
    btMarkerArr.push(tbeatMarker);
    btMarkerArr.push(tdeg);
    tbtMarkersSVGs.push(btMarkerArr);
  }
  pulseCycleArr.push(tbtMarkersSVGs);
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


/* NOTES

// Note: Can have cascading pulse cycles and one dial or
// cycle length pulse cycle with multiple dials
// BUT NOT BOTH
*/
/*
BEAT MARKER ANIMATION
ANIMATE DIAL TO GLOW EACH BEAT
ADD ADDITIONAL PULSE CYCLES
MOVING MARKERS EACH CYCLE
Practice it
Resize later

*/
