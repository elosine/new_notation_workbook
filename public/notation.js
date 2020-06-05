// NOTATION SVGS /////////////////////////////////////////////////////////
var SVG_NS = "http://www.w3.org/2000/svg";
var SVG_XLINK = 'http://www.w3.org/1999/xlink';

function mkPulseCycleElements() {
  var tsvgCanvas = document.createElementNS(SVG_NS, "svg");
  tsvgCanvas.setAttributeNS(null, "width", 300);
  tsvgCanvas.setAttributeNS(null, "height", 300);
  // var tcvsid = "svgcanvas" + myix.toString();
  // tsvgCanvas.setAttributeNS(null, "id", tcvsid);
  console.log(tsvgCanvas);
  // tsvgCanvas.setAttributeNS(null, "transform", "translate(10, 10)");
  tsvgCanvas.style.backgroundColor = "black";
  this.content.append(tsvgCanvas);
}

function drwCirc() {
  var tcirc = document.createElementNS(SVG_NS, "circle");
  tcirc.setAttributeNS(null, "cx", 100);
  tcirc.setAttributeNS(null, "cy", 100);
  tcirc.setAttributeNS(null, "r", 50);
  tcirc.setAttributeNS(null, "stroke", "rgb(153, 255, 0)");
  tcirc.setAttributeNS(null, "stroke-width", 4);
  tcirc.setAttributeNS(null, "fill", "none");
  tcirc.setAttributeNS(null, "id", "circ1");
  // tcirc.setAttributeNS(null, "transform", "translate( 50, 50)");
  var tsvgcvs = document.getElementById('svgcanvas');
  tsvgcvs.appendChild(tcirc);
}

var notationObjects = [];
var notationObjectsIx = 0;
mkPc(notationObjectsIx, "Pulse Cycle 001", 300, 300);
notationObjectsIx++;



function mkPc(myix, mytitle, w, h) {
  var tno = [];
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
  var tcx = w/2;
  var tcy = h/2;
  var tr = w/2 * tpieSzRatio;
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
        // this.content.innerHTML = '<p>Current: width ' + paneldata.width + ', height ' + paneldata.height + '</p>';
        //Resize SVG Canvas
        this.content.children[0].setAttributeNS(null, "width", paneldata.width.toString());
        this.content.children[0].setAttributeNS(null, "height", paneldata.width.toString());
        // //Resize Pie
        var tc = paneldata.width/2;
        var tr = paneldata.width/2 * tpieSzRatio;
        this.content.children[0].children[0].setAttributeNS(null, "r", tr);
        this.content.children[0].children[0].setAttributeNS(null, "cx", tc);
        this.content.children[0].children[0].setAttributeNS(null, "cy", tc);
      }
    },
    callback: function() {
      tno.push(this);
    }
  });
  notationObjects.push(tno);
}



//notationObjects -> [ svgCanvas, pie, jsPanel, ]

/*
MAKE ANIMATED DIAL

*/
