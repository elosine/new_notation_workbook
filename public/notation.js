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
  // server: 'https://safe-plateau-48516.herokuapp.com/timesync',
  server: '/timesync',
  interval: 1000
});
// NOTATION OBJECTS ///////////////////////////////////////////////////////
var notationObjects = {};
var notationObjectsIx = 0;
// START UP /////////////////////////////////////////////////////////////
mkPc(notationObjectsIx, "Pulse Cycle 001", 300, 300, 89, 12);
notationObjectsIx++;
startPiece();
// FUNCTION: animationEngine ---------------------------------------------- //
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

// UPDATE --------------------------------------------------------------- //
var tlastDeg = 0;
var t = true;
var markersOn = [];
var markerDur = 80;
var bigMarkerSz = 9;
// FUNCTION: minMarkerAnime -------------------------------------------------- //
function minMarkerAnime(currtime) {
  for (var i = 0; i < markersOn.length; i++) {
    var tnoKey = markersOn[i][0];
    var tmarkerNo = markersOn[i][1];
    var tmkStTime = markersOn[i][2];
    var tTimeElapsed = currtime - tmkStTime;
      if (tTimeElapsed < markerDur) {
        var tteNorm = scale(tTimeElapsed, 0, markerDur, 2, bigMarkerSz);
        notationObjects[tnoKey][5][tmarkerNo][0].setAttributeNS(null, "stroke-width", tteNorm.toString());
      }
  }
}

function update(aMSPERFRAME, currTimeMS) {
  for (var key in notationObjects) {
    //ANIMATE DIAL //////////////////////////
    var tpie = notationObjects[key][1];
    var tr = parseFloat(tpie.getAttribute('r')); //radius
    var tdial = notationObjects[key][2];
    var tc = parseFloat(tdial.getAttribute('x1')); //center coord
    var tdialspd = notationObjects[key][4];
    var t_currDeg = notationObjects[key][3];
    t_currDeg += tdialspd;
    var tx2 = tr * Math.cos(rads(t_currDeg)) + tc;
    var ty2 = tr * Math.sin(rads(t_currDeg)) + tc;
    var tdialVec = new Victor(tx2, ty2);
    tdial.setAttributeNS(null, "x2", tx2);
    tdial.setAttributeNS(null, "y2", ty2);
    notationObjects[key][3] = t_currDeg;
    // MINUTE MARKER COLLITION
    for (var i = 0; i < notationObjects[key][5].length; i++) {
      var tgate = notationObjects[key][5][i][2];
      if (tgate) {
        var tminSvg = notationObjects[key][5][i][0];
        var tMinX2 = parseFloat(tminSvg.getAttribute('x2'));
        var tMinY2 = parseFloat(tminSvg.getAttribute('y2'));
        var tbBox = 2;
        var tMinX2a = tMinX2 - tbBox;
        var tMinX2b = tMinX2 + tbBox;
        var tMinY2a = tMinY2 - tbBox;
        var tMinY2b = tMinY2 + tbBox;
        var tminVec = new Victor(tMinX2, tMinY2);
        var tdist = Math.abs(tdialVec.distance(tminVec));
        // MINUTE/BEAT EVENTS TRIGGER
        if (tx2 >= tMinX2a && tx2 <= tMinX2b && ty2 >= tMinY2a && ty2 <= tMinY2b) {
          notationObjects[key][5][i][2] = false; //close gate
          if (i != 0) {
            notationObjects[key][5][i - 1][2] = true; //open previous gate
            for(var j=0;j<markersOn.length;j++){
              if(markersOn[j][1] == (i-1)){
                notationObjects[key][5][i - 1][0].setAttributeNS(null, "stroke-width", "2");
                markersOn.splice(j,1);
              }
            }
          } else {
            notationObjects[key][5][notationObjects[key][5].length - 1][2] = true; //open previous gate
            for(var j=0;j<markersOn.length;j++){
              if(markersOn[j][1] == (notationObjects[key][5].length - 1)){
                notationObjects[key][5][notationObjects[key][5].length - 1][0].setAttributeNS(null, "stroke-width", "2");
                markersOn.splice(j,1);
              }
            }
          }
          // EVENTS //////////////////////////
          markersOn.push([key, i, currTimeMS]);
          break;
        }
      }
    }
    tlastDeg = t_currDeg;
  }
  //animate minute markers
  minMarkerAnime(currTimeMS)
  framect++;
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

function mkPc(myix, mytitle, w, h, ibpm, numBtsPerCyc) {
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
  var numDegPerBeat = 360 / numBtsPerCyc;
  var numBeatsPerFrame = ibpm / (60 * FRAMERATE);
  var degPerFrame = numDegPerBeat * numBeatsPerFrame;
  tno.push(degPerFrame); //DIAL SPEED;
  //MAKE BEAT MINUTE-MARKERS ---------------------------------------------- //
  var tmins = [];
  for (var i = 0; i < numBtsPerCyc; i++) {
    var tlnDeg = [];
    var tdeg = -90 + (numDegPerBeat * i);
    var tix1 = (tr - 20) * Math.cos(rads(tdeg)) + tcx;
    var tiy1 = (tr - 20) * Math.sin(rads(tdeg)) + tcy;
    var tix2 = tr * Math.cos(rads(tdeg)) + tcx;
    var tiy2 = tr * Math.sin(rads(tdeg)) + tcy;
    var tmin = document.createElementNS(SVG_NS, "line");
    tmin.setAttributeNS(null, "x1", tix1);
    tmin.setAttributeNS(null, "y1", tiy1);
    tmin.setAttributeNS(null, "x2", tix2);
    tmin.setAttributeNS(null, "y2", tiy2);
    tmin.setAttributeNS(null, "stroke", "rgb(255, 131, 0)");
    tmin.setAttributeNS(null, "stroke-width", 2);
    var tminid = "min" + myix.toString() + "-" + i;
    tmin.setAttributeNS(null, "id", tminid);
    tsvgCanvas.appendChild(tmin);
    tlnDeg.push(tmin);
    tlnDeg.push(tdeg);
    tlnDeg.push(true); //trigger gate
    tmins.push(tlnDeg);
  }
  tno.push(tmins); //minute markers
  // Rhythmic NOTATION ///////////////////////////////////////////////////////////
  // var t_notationSVG = document.createElementNS(SVG_NS, "image");
  // t_notationSVG.setAttributeNS(SVG_XLINK, 'xlink:href', value[j][1]);
  // t_notationSVGw = notationContW.toString() * 0.5;
  // t_notationSVG.setAttributeNS(null, 'width', t_notationSVGw.toString());
  // var t_svgH = notationContH * 0.3333333;
  // t_notationSVG.setAttributeNS(null, 'height', t_svgH.toString());
  // var t_pitchX = notationContCenterX - (t_notationSVGw / 2);
  // var t_pitchY = notationContH * 0.67;
  // t_notationSVG.setAttributeNS(null, "transform", "translate(" + t_pitchX.toString() + "," + t_pitchY.toString() + ")");
  // t_notationSVG.setAttributeNS(null, "id", key + j.toString());
  // t_notationSVG.setAttributeNS(null, 'visibility', 'visible');
  // t_notationSVGs.push(t_notationSVG);
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
        var t_currDeg = notationObjects[tkey][3];
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



//notationObjects -> [ svgCanvas, pie, dial, dialDeg, dialspd, mins   jsPanel]

/*
Make pulsing beat markers
add rhythmic notation

*/
