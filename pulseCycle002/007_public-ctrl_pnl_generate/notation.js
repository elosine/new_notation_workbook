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
var SVG_XLINK = 'http://www.w3.org/1999/xlink';
// NOTATION SVGs ----------------- >
var notationUrlSz = []; //[url, w, h]
var availableNotes = [
  "/notation/quintuplet_accent_76_46.svg",
  "/notation/eight_accent_2ndPartial_27_34.svg",
  "/notation/eight_accent_1stPartial_27_34.svg",
  "/notation/triplet_accent_1st_partial_45_45.svg",
  "/notation/quarter_accent_12_35.svg"
];
// DIAL NOTATION OBJECT ----------- >
var dial;
// BUTTONS ------------------------ >
var activateButtons = false;
////////////////////////////////////////////////////////////////////////////


// INIT -------------------------------------------------------------- //
function init() {
  // 01: START TIME SYNC ENGINE ---------------- >
  var ts = timesync.create({
    //server: 'https://safe-plateau-48516.herokuapp.com/timesync',
    server: '/timesync',
    interval: 1000
  });
  // 02: MAKE CONTROL PANEL ---------------- >
  mkCtrlPanel("ctrlPanel", 130, 300, "Control Panel");
  // 03: GET NOTATION SIZES ---------------- >
  availableNotes.forEach(function(it, ix) {
    getImageOgSize(it, function(size, url) {
      var sizeArr = [];
      sizeArr.push(url);
      sizeArr.push(size.w);
      sizeArr.push(size.h);
      notationUrlSz.push(sizeArr);
      // Activate Buttons after last image has been processed
      if (ix == (availableNotes.length - 1)) {
        activateButtons = true;
      }
    });
  });
  // MODIFY GENERATE NOTATION FUNCTION FOR NOTES LOOKUP
  // 04: GENERATE STATIC ELEMENTS ---------------- >
  dial = mkDialNO(0, 500, 500, 50, 5, 12, 100);
}
////////////////////////////////////////////////////////////////////////////



// LAST: START ANIMATION LOOP -------------- >
// requestAnimationFrame(animationEngine);


// FUNCTION GET ORIGINAL IMAGE SIZE ------------------------------------- //
function getImageOgSize(url, callback) {
  var newImg = new Image();
  newImg.src = url;
  newImg.onload = function() {
    var imgSize = {
      w: this.naturalWidth,
      h: this.naturalHeight
    };
    if (typeof callback !== "undefined") callback(imgSize, url);
  };
}
////////////////////////////////////////////////////////////////////////////


// FUNCTION MAKE DIAL NOTATION OBJECT ------------------------------------- //
function mkDialNO(ix, w, h, x, y, numTicks, bpm) {
  var cx = w / 2;
  var cy = h / 2;
  var innerRadius = 70;
  var noteSpace = 65;
  var midRadius = innerRadius + noteSpace;
  var defaultStrokeWidth = 4;
  var outerRadius = w / 2;
  var currDeg = -90;
  var lastDeg = currDeg;
  var tickBlinkTimes = []; //timer to blink ticks
  var notes = [];
  var noteBoxes = [];
  for (var i = 0; i < numTicks; i++) tickBlinkTimes.push(0); //populate w/0s
  // Calculate number of degrees per frame
  var beatsPerSec = bpm / 60;
  var beatsPerFrame = beatsPerSec / FRAMERATE;
  var degreesPerBeat = 360 / numTicks;
  var degreesPerFrame = degreesPerBeat * beatsPerFrame;
  // Create OBJECT
  var notationObj = {}; //returned object to add all elements and data
  // Generate ID
  var id = 'dial' + ix;
  notationObj['id'] = id;
  // Make SVG Canvas ------------- >
  var canvasID = id + 'canvas';
  var svgCanvas = mkSVGcanvas(canvasID, w, h); //see func below
  notationObj['canvas'] = svgCanvas;
  // Make jsPanel ----------------- >
  var panelID = id + 'panel';
  var panel = mkPanel(panelID, svgCanvas, x, y, w, h, 'Dial ' + ix); //see func below
  notationObj['panel'] = panel;
  // STATIC ELEMENTS ----------------------------- >
  //// Ring -------------------------------- //
  var ring = document.createElementNS(SVG_NS, "circle");
  ring.setAttributeNS(null, "cx", cx);
  ring.setAttributeNS(null, "cy", cy);
  ring.setAttributeNS(null, "r", innerRadius);
  ring.setAttributeNS(null, "stroke", "rgb(153, 255, 0)");
  ring.setAttributeNS(null, "stroke-width", defaultStrokeWidth);
  ring.setAttributeNS(null, "fill", "none");
  var ringID = id + 'ring';
  ring.setAttributeNS(null, "id", ringID);
  svgCanvas.appendChild(ring);
  notationObj['ring'] = ring;
  //// Dial ------------------------------- //
  var dialWidth = 2;
  var dial = document.createElementNS(SVG_NS, "line");
  dial.setAttributeNS(null, "x1", cx);
  dial.setAttributeNS(null, "y1", y);
  dial.setAttributeNS(null, "x2", cx);
  dial.setAttributeNS(null, "y2", cy);
  dial.setAttributeNS(null, "stroke", "rgb(153,255,0)");
  dial.setAttributeNS(null, "stroke-width", dialWidth);
  var dialID = id + 'dial';
  dial.setAttributeNS(null, "id", dialID);
  svgCanvas.appendChild(dial);
  notationObj['dial'] = dial;
  //// Ticks ------------------------------- //
  var ticks = [];
  var tickDegs = [];
  var tickRadius = innerRadius - (defaultStrokeWidth / 2) - 3; // ticks offset from dial 3px like a watch
  var tickLength = 11;
  var tickWidth = 2;
  for (var i = 0; i < numTicks; i++) {
    var tickDeg = -90 + (degreesPerBeat * i); //-90 is 12 o'clock
    tickDegs.push(tickDeg); //store degrees for collision detection later
    var x1 = midRadius * Math.cos(rads(tickDeg)) + cx;
    var y1 = midRadius * Math.sin(rads(tickDeg)) + cy;
    var x2 = (tickRadius - tickLength) * Math.cos(rads(tickDeg)) + cx;
    var y2 = (tickRadius - tickLength) * Math.sin(rads(tickDeg)) + cy;
    var tick = document.createElementNS(SVG_NS, "line");
    tick.setAttributeNS(null, "x1", x1);
    tick.setAttributeNS(null, "y1", y1);
    tick.setAttributeNS(null, "x2", x2);
    tick.setAttributeNS(null, "y2", y2);
    tick.setAttributeNS(null, "stroke", "rgb(255,128,0)");
    tick.setAttributeNS(null, "stroke-width", tickWidth);
    var tickID = id + 'tick' + i;
    tick.setAttributeNS(null, "id", tickID);
    svgCanvas.appendChild(tick);
    ticks.push(tick);
  }
  notationObj['ticks'] = ticks;
  // NOTATION CONTAINERS ------------------- //
  var rectSize = 36;
  var generatePieceFunc = function() {
    //Remove Previous Notation
    notes.forEach(function(it, ix) {
      if (it != 0) {
        it.parentNode.removeChild(it);
      }
    });
    noteBoxes.forEach(function(it, ix) {
      if (it != 0) {
        it.parentNode.removeChild(it);
      }
    });
    notes = [];
    noteBoxes = [];
    // Generate New Notation and Boxes
    for (var i = 0; i < tickDegs.length; i++) {
      var useNotation = probability(0.42);
      if (useNotation) {
        var notesArrIxSet = [0, 1, 2, 3, 4];
        var notesArrIx = chooseWeighted(notesArrIxSet, [0.13, 0.13, 0.13, 0.13, 0.48]);
        var notesArr = notationUrlSz[notesArrIx];
        var url = notesArr[0];
        var svgW = notesArr[1];
        var svgH = notesArr[2];
        var notationSVG = document.createElementNS(SVG_NS, "image");
        notationSVG.setAttributeNS(SVG_XLINK, 'xlink:href', url);
        var rectx = midRadius * Math.cos(rads(tickDegs[i])) + cx - (svgW / 2);
        var recty = midRadius * Math.sin(rads(tickDegs[i])) + cy - (svgH / 2);
        notationSVG.setAttributeNS(null, "transform", "translate( " + rectx.toString() + "," + recty.toString() + ")");
        var notationSVGID = id + 'notationSVG' + i;
        notationSVG.setAttributeNS(null, "id", notationSVGID);
        notationSVG.setAttributeNS(null, 'visibility', 'visible');
        notes.push(notationSVG);
        var noteBox = document.createElementNS(SVG_NS, "rect");
        noteBox.setAttributeNS(null, "width", svgW + 6);
        noteBox.setAttributeNS(null, "height", svgH + 6);
        var boxX = rectx - 3;
        var boxY = recty - 3;
        noteBox.setAttributeNS(null, "transform", "translate( " + boxX.toString() + "," + boxY.toString() + ")");
        var noteBoxID = id + 'noteBox' + i;
        noteBox.setAttributeNS(null, "id", canvasID);
        noteBox.setAttributeNS(null, 'visibility', 'visible');
        noteBox.setAttributeNS(null, "fill", "white");
        noteBoxes.push(noteBox);
        svgCanvas.appendChild(noteBox);
        svgCanvas.appendChild(notationSVG);
      } else { //not all ticks have a notation box. push 0 to empty ones
        notes.push(0);
        noteBoxes.push(0);
      }
    }
  }
  notationObj['generatePiece'] = generatePieceFunc;
  // ANIMATION -------------------------------------- >
  var tickBlinkDur = 150;
  var growTickLen = 5; //expand tick stroke-width by this amount
  var animateFunc = function() {
    var nowDate = new Date(ts.now()); //get current time each frame
    var nowTime = nowDate.getTime();
    // Animate Dial
    currDeg += degreesPerFrame; //advance degreesPerFrame
    var newDialX1 = outerRadius * Math.cos(rads(currDeg)) + cx;
    var newDialY1 = outerRadius * Math.sin(rads(currDeg)) + cy;
    dial.setAttributeNS(null, "x1", newDialX1);
    dial.setAttributeNS(null, "y1", newDialY1);
    // Animate Ticks
    var currDegMod = ((currDeg + 90) % 360) - 90; //do this hack so you are not mod negative number
    tickDegs.forEach(function(it, ix) {
      if (ix == 0) { //for tick at 12o'clock to accomodate for positive to negative transition
        if (lastDeg > 0 && currDegMod < 0) { //if last frame was pos and this frame neg
          ticks[ix].setAttributeNS(null, "stroke", "rgb(255,0,0)");
          ticks[ix].setAttributeNS(null, "stroke-width", tickWidth + growTickLen);
          tickBlinkTimes[ix] = (nowTime + tickBlinkDur); //set blink timer time for this tick
          // Note Boxes
          if (noteBoxes[ix] != 0) {
            noteBoxes[ix].setAttributeNS(null, "stroke", "rgb(255,0,0)");
            noteBoxes[ix].setAttributeNS(null, "stroke-width", 4);
          }
        }
      } else {
        if (it > lastDeg && it <= currDegMod) { //all other ticks looking to see that last frame dial was before this tick and in this frame dial is equal or past this tick
          ticks[ix].setAttributeNS(null, "stroke", "rgb(255,0,0)");
          ticks[ix].setAttributeNS(null, "stroke-width", tickWidth + growTickLen);
          tickBlinkTimes[ix] = (nowTime + tickBlinkDur); //set blink timer time for this tick
          // Note Boxes
          if (noteBoxes[ix] != 0) {
            noteBoxes[ix].setAttributeNS(null, "stroke", "rgb(255,0,0)");
            noteBoxes[ix].setAttributeNS(null, "stroke-width", 4);
          }
        }
      }
    });
    lastDeg = currDegMod;
    // Tick blink timer
    tickBlinkTimes.forEach(function(it, ix) {
      if (nowTime > it) {
        ticks[ix].setAttributeNS(null, "stroke", "rgb(255,128,0)");
        ticks[ix].setAttributeNS(null, "stroke-width", tickWidth);
        // Note Boxes
        if (noteBoxes[ix] != 0) {
          noteBoxes[ix].setAttributeNS(null, "stroke", "white");
          noteBoxes[ix].setAttributeNS(null, "stroke-width", 0);
        }
      }
    })
  }
  notationObj['animateFunc'] = animateFunc;
  return notationObj;
}
////////////////////////////////////////////////////////////////////////////


// MAKE SVG CANVAS ------------------------------------------------------ //
function mkSVGcanvas(canvasID, w, h) {
  var tsvgCanvas = document.createElementNS(SVG_NS, "svg");
  tsvgCanvas.setAttributeNS(null, "width", w);
  tsvgCanvas.setAttributeNS(null, "height", h);
  tsvgCanvas.setAttributeNS(null, "id", canvasID);
  tsvgCanvas.style.backgroundColor = "black";
  return tsvgCanvas;
}
////////////////////////////////////////////////////////////////////////////


// MAKE JSPANEL ------------------------------------------------------ //
function mkPanel(panelid, svgcanvas, posx, posy, w, h, title) {
  var tpanel;
  jsPanel.create({
    position: 'center-top',
    id: panelid,
    contentSize: w.toString() + " " + h.toString(),
    header: 'auto-show-hide',
    headerControls: {
      minimize: 'remove',
      // smallify: 'remove',
      maximize: 'remove',
      close: 'remove'
    },
    contentOverflow: 'hidden',
    headerTitle: title,
    theme: "light",
    content: svgcanvas, //svg canvas lives here
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

// MAKE CONTROL PANEL ------------------------------------------------------ //
function mkCtrlPanel(panelid, w, h, title) {
  var tpanel;
  //Container Div
  var ctrlPanelDiv = document.createElement("div");
  ctrlPanelDiv.style.width = w.toString() + "px";
  ctrlPanelDiv.style.height = h.toString() + "px";
  ctrlPanelDiv.setAttribute("id", "ctrlPanel");
  ctrlPanelDiv.style.backgroundColor = "black";
//Generate Piece
  var btnW = w - 18;
  var generateNotationButton = document.createElement("BUTTON");
  generateNotationButton.id = 'generateNotationButton';
  generateNotationButton.innerText = 'Generate Piece';
  generateNotationButton.className = 'btn btn-1';
  generateNotationButton.style.width = btnW.toString() + "px";
  generateNotationButton.addEventListener("click", function() {
    if (activateButtons) {
      dial.generatePiece();
    }
  });
  ctrlPanelDiv.appendChild(generateNotationButton);
//Load Piece
  var loadPieceBtn = document.createElement("BUTTON");
  loadPieceBtn.id = 'loadPieceBtn';
  loadPieceBtn.innerText = 'Load Piece';
  loadPieceBtn.className = 'btn btn-1';
  loadPieceBtn.style.width = btnW.toString() + "px";
  loadPieceBtn.addEventListener("click", function() {
    if (activateButtons) {

    }
  });
  ctrlPanelDiv.appendChild(loadPieceBtn);
// START
  var startBtn = document.createElement("BUTTON");
  startBtn.id = 'startBtn';
  startBtn.innerText = 'START';
  startBtn.className = 'btn btn-1';
  startBtn.style.width = btnW.toString() + "px";
  startBtn.style.height = "60px";
  startBtn.addEventListener("click", function() {
    if (activateButtons) {

    }
  });
  ctrlPanelDiv.appendChild(startBtn);
// jsPanel
  jsPanel.create({
    position: 'left-top',
    id: panelid,
    contentSize: w.toString() + " " + h.toString(),
    header: 'auto-show-hide',
    headerControls: {
      minimize: 'remove',
      // smallify: 'remove',
      maximize: 'remove',
      close: 'remove'
    },
    contentOverflow: 'hidden',
    headerTitle: '<small>' + title + '</small>',
    theme: "light",
    content: ctrlPanelDiv,
    resizeit: {
      aspectRatio: 'content',
      resize: function(panel, paneldata, e) {}
    },
    dragit: {
      disable: true
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
  dial.animateFunc(); //call the animate function from the notation object
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
