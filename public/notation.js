//TIMING  //////////////////////////////////////////////////
var FRAMERATE = 60.0;
var MSPERFRAME = 1000.0 / FRAMERATE;
var SECPERFRAME = 1.0 / FRAMERATE;
var PXPERSEC = 150.0;
var PXPERMS = PXPERSEC / 1000.0;
var PXPERFRAME = PXPERSEC / FRAMERATE;
// NOTATION SVGS /////////////////////////////////////////////////////////
var SVG_NS = "http://www.w3.org/2000/svg";
var SVG_XLINK = 'http://www.w3.org/1999/xlink';
// CLOCK /////////////////////////////////////////////////////////////
var framect = 0;
var delta = 0.0;
var lastFrameTimeMs = 0.0;
var ts = timesync.create({
  server: 'https://safe-plateau-48516.herokuapp.com/timesync',
  interval: 1000
});
// NOTATION OBJECTS ///////////////////////////////////////////////////////
var notationObjects = {};
var notationObjectsIx = 0;
// START UP /////////////////////////////////////////////////////////////
mkPc(notationObjectsIx, "Pulse Cycle 001", 300, 300, 93.5);
notationObjectsIx++;
startPiece();
// FUNCTION: animationEngine ---------------------------------------------- //
function animationEngine(timestamp) {
  var t_now = new Date(ts.now());
  var t_lt = t_now.getTime();
  delta += t_lt - lastFrameTimeMs;
  lastFrameTimeMs = t_lt;
  while (delta >= MSPERFRAME) {
    update(MSPERFRAME);
    delta -= MSPERFRAME;
  }
  requestAnimationFrame(animationEngine);
}

// UPDATE --------------------------------------------------------------- //
function update(aMSPERFRAME) {
  framect++;
  var tpie = notationObjects["no0"][1];
  var tr = parseFloat(tpie.getAttribute('r'));
  var tdial = notationObjects["no0"][2];
  var tc = parseFloat(tdial.getAttribute('x1'));
  var tdialspd = notationObjects.no0[4];
  var t_currDeg = notationObjects.no0[3];
  t_currDeg += tdialspd;
  var tx2 = tr * Math.cos(rads(t_currDeg)) + tc;
  var ty2 = tr * Math.sin(rads(t_currDeg)) + tc;
  tdial.setAttributeNS(null, "x2", tx2);
  tdial.setAttributeNS(null, "y2", ty2);

  notationObjects.no0[3] = t_currDeg;
}
// FUNCTION: startPiece -------------------------------------------------- //
function startPiece() {
  startClockSync();
  requestAnimationFrame(animationEngine);
}
// FUNCTION: startClockSync -------------------------------------------- //
function startClockSync() {
  var t_now = new Date(ts.now());
  lastFrameTimeMs = t_now.getTime();
}

function mkPc(myix, mytitle, w, h, ibpm) {
  var tno = [];
  var tkey = "no" + myix;
  //MAKE SVG CANVAS ------------------------------------------ //
  var tsvgCanvas = document.createElementNS(SVG_NS, "svg");
  tsvgCanvas.setAttributeNS(null, "width", w);
  tsvgCanvas.setAttributeNS(null, "height", h);
  var tcvsid = "svgcanvas" + myix.toString();
  tsvgCanvas.setAttributeNS(null, "id", tcvsid);
  // tsvgCanvas.setAttributeNS(null, "transform", "translate(10, 10)");
  tsvgCanvas.style.backgroundColor = "black";
  tno.push(tsvgCanvas);
  //MAKE PIE -------------------------------------------------- //
  var tpieSzRatio = 0.4;
  var tcx = w / 2;
  var tcy = h / 2;
  var tr = w / 2 * tpieSzRatio;
  var tcirc = document.createElementNS(SVG_NS, "circle");
  tcirc.setAttributeNS(null, "cx", tcx);
  tcirc.setAttributeNS(null, "cy", tcy);
  tcirc.setAttributeNS(null, "r", tr);
  tcirc.setAttributeNS(null, "stroke", "rgb(153, 255, 0)");
  tcirc.setAttributeNS(null, "stroke-width", 4);
  tcirc.setAttributeNS(null, "fill", "none");
  var tpieid = "pie" + myix.toString();
  tcirc.setAttributeNS(null, "id", tpieid);
  tsvgCanvas.appendChild(tcirc);
  tno.push(tcirc);
  //MAKE DIAL -------------------------------------------------- //
  var tix2 = tr * Math.cos(rads(-90)) + tcx;
  var tiy2 = tr * Math.sin(rads(-90)) + tcy;
  var tdial = document.createElementNS(SVG_NS, "line");
  tdial.setAttributeNS(null, "x1", tcx);
  tdial.setAttributeNS(null, "y1", tcy);
  tdial.setAttributeNS(null, "x2", tix2);
  tdial.setAttributeNS(null, "y2", tiy2);
  tdial.setAttributeNS(null, "stroke", "rgb(153, 255, 0)");
  tdial.setAttributeNS(null, "stroke-width", 4);
  var tdialid = "dial" + myix.toString();
  tdial.setAttributeNS(null, "id", tdialid);
  tsvgCanvas.appendChild(tdial);
  tno.push(tdial);
  tno.push(-90); //dial degree;
  var numDegPerBeat = 360 / 12;
  var numBeatsPerFrame = ibpm / (60 * FRAMERATE);
  var degPerFrame = numDegPerBeat * numBeatsPerFrame;
  tno.push(degPerFrame); //DIAL SPEED;
  //MAKE jsPanel ------------------------------------ //
  jsPanel.create({
    // position: "left-top",
    id: "panel" + 0,
    contentSize: "300 300",
    header: 'auto-show-hide',
    headerControls: {
      minimize: 'remove',
      smallify: 'remove',
      maximize: 'remove',
      close: 'remove'
    },
    contentOverflow: 'hidden',
    headerTitle: mytitle,
    theme: "light",
    content: tsvgCanvas,
    resizeit: {
      aspectRatio: 'content',
      resize: function(panel, paneldata, e) {
        //Resize SVG Canvas --------------------------------- //
        this.content.children[0].setAttributeNS(null, "width", paneldata.width.toString());
        this.content.children[0].setAttributeNS(null, "height", paneldata.width.toString());
        //Resize Pie --------------------------------------- //
        var tc = paneldata.width / 2;
        var tr = paneldata.width / 2 * tpieSzRatio;
        this.content.children[0].children[0].setAttributeNS(null, "r", tr);
        this.content.children[0].children[0].setAttributeNS(null, "cx", tc);
        this.content.children[0].children[0].setAttributeNS(null, "cy", tc);
        //Resize Dial -------------------------------------- //
        var t_currDeg = notationObjects.tkey[3];
        var tx2 = tr * Math.cos(rads(t_currDeg)) + tc;
        var ty2 = tr * Math.sin(rads(t_currDeg)) + tc;
        tdial.setAttributeNS(null, "x1", tc);
        tdial.setAttributeNS(null, "y1", tc);
        tdial.setAttributeNS(null, "x2", tx2);
        tdial.setAttributeNS(null, "y2", ty2);
      }
    },
    callback: function() {
      tno.push(this);
    }
  });
  notationObjects[tkey] = tno;
}



//notationObjects -> [ svgCanvas, pie, dial, dialDeg, dialspd    jsPanel]

/*
Make pulsing beat markers
add rhythmic notation

*/
