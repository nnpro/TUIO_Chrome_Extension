// =========================== GLOBALS =============================

var SCROLL       = false;
var TRIGGERMOUSE = false;
var SHOWRINGS    = false;
var RINGSSTAY    = false;
var SHOWCURSOR   = false;
var TOUCH        = false;

//================= Keyboard shortcuts ==============================
$("body").keypress(function(event) {

  switch (event.charCode) {

    case 109: // m
      if (TRIGGERMOUSE) {
        TRIGGERMOUSE = false;
        messageView ("Mouse Emulator OFF");
      } else {
        TRIGGERMOUSE = true;
        messageView ("Mouse Emulator ON");
      }
      break;

    case 115: // s
      if (SCROLL) {
        SCROLL = false;
        messageView ("SCROLL OFF");
      } else {
        SCROLL = true;
        messageView ("SCROLL ON");
      }
      break;

    case 114: // r
      if (SHOWRINGS) {
        SHOWRINGS = false;
        messageView ("SHOWRINGS OFF");
        removeRings();
      } else {
        SHOWRINGS = true;
        messageView ("SHOWRINGS ON");
      }
      break;

    case 99: // c
      if (SHOWCURSOR) {
        SHOWCURSOR = false;
        messageView ("SHOWCURSOR OFF");
      } else {
        SHOWCURSOR = true;
        messageView ("SHOWCURSOR ON");
      }
      break;

    case 116: // t
      if (TOUCH) {
        TOUCH = false;
        messageView ("TOUCH EMULATOR OFF");
      } else {
        TOUCH = true;
        messageView ("TOUCH EMULATOR ON");
      }
      break;

    default:
      console.log(event.charCode);
  }
});
//====================EVENTS=================================

$(document).ready( function () {

  initTuioPort();
  window.active = true;

  // create draw touch button
  var draw = $("<div id='draw'></div>");
  $(document.body).append(draw);

  draw.click(function () {

    if (SHOWRINGS) {
      SHOWRINGS = false;
      messageView ("Rings OFF");
      removeRings();
    } else {
      SHOWRINGS = true;
      messageView ("Rings ON");
    }

  });

});

$(window).focus(function() {
  if (window.active !== true) {
    //console.log("Window is active");
    initTuioPort();
    window.active = true;
  }
});

$(window).blur(function() {
  window.active = false;
});

//======================== Messaging System =============================

var initTuioPort = function () {
  var port = chrome.runtime.connect({name: "tuio"});

  port.onMessage.addListener( function(msg) {

    switch (msg.message) {

      case "cursorAdded"   : TuioManager._addCursor(msg.obj.id, msg.obj.x, msg.obj.y); 
                             tuio_touch.callback(3, msg.obj.id, 1, msg.obj.x, msg.obj.y, 0); 
                             break;
      case "cursorUpdated" : TuioManager._updateCursor(msg.obj.id, msg.obj.x, msg.obj.y); 
                             tuio_touch.callback(4, msg.obj.id, 1, msg.obj.x, msg.obj.y, 0); 
                             break;
      case "cursorRemoved" : TuioManager._removeCursor(msg.obj.id); 
                             tuio_touch.callback(5, msg.obj.id, 1, msg.obj.x, msg.obj.y, 0); 
                             break;

      case "fiducialAdded"  : TuioManager._addFiducial(msg.obj.id, msg.obj.x, msg.obj.y, msg.obj.angle); break;
      case "fiducialUpdated": TuioManager._updateFiducial(msg.obj.id, msg.obj.x, msg.obj.y, msg.obj.angle); break;
      case "fiducialRemoved": TuioManager._removeFiducial(msg.obj.id); break;
    }

  });
};

// --------------------------TUIO LISTENERS----------------------------------------
// makers
TuioManager.addListener("fiducialAdded", function (marker) {
  //console.log("fiducialAdded");
  if (SHOWRINGS) {
    marker.view = new MarkerView( marker );
  }
});

TuioManager.addListener("fiducialUpdated", function (marker) {
  //console.log("fiducialUpdated");
  //console.log(marker.view);
  if (SHOWRINGS) {
    marker.view.update(marker);
  }
});

TuioManager.addListener("fiducialRemoved", function (marker) {
  //console.log("fiducialRemoved");
  if (SHOWRINGS) {
    marker.view.remove();
  }
});

// -------------------------- CURSOR ADDED -----------------------------------------

TuioManager.addListener("cursorAdded", function (obj) {

  obj.xStart = obj.x;
  obj.yStart = obj.y;

  obj.xTot = 0;
  obj.yTot = 0;

  if (TRIGGERMOUSE) {
    // get object here
    obj.el = document.elementFromPoint(obj.x, obj.y);

    if (obj.el !== null) {
      Eventr.simulate(obj.el,'mousedown', { pointerX : obj.x, 
                                            pointerY : obj.y,
                                            bubbles  : true,
                                            cancelable : false });
    }
  }
  if (SHOWCURSOR) {
    // create ring
    var css = {'border-color'    : "#f15d22",
               'background-color': '#888888',
               'opacity'         : 0.5 };
    obj.div = new CursorView(obj.id, obj.x, obj.y, css);
  }
});

//----------------------------- UPDATE ----------------------------------------------

TuioManager.addListener("cursorUpdated", function (obj) {

  var mag = 0.8;

  var scrollX = ( obj.xStart - obj.x ) * mag;
  var scrollY = ( obj.yStart - obj.y ) * mag;

  obj.xTot += scrollX;
  obj.yTot += scrollY;

  obj.xStart = obj.x;
  obj.yStart = obj.y;

  if (SCROLL) {
    window.scrollBy(scrollX, scrollY);
  }
  if (TRIGGERMOUSE) {

    var temp = document.elementFromPoint(obj.x, obj.y);

    if (temp !== null) {
      temp = document.body;
    }
    Eventr.simulate(temp,'mousemove', { pointerX : obj.x, 
                                            pointerY : obj.y,
                                            bubbles  : true,
                                            cancelable : false });
  }
  if (SHOWRINGS) {
    // create ring
    var css = {'border-width' : '0',
               'background-color': '#FC5B9C'};

    if (RINGSSTAY) {

      createRingView(obj.x, obj.y, css);

    } else {

      var a = new ExplodeView(obj.id, obj.x, obj.y, css);

    }
  }
  if (SHOWCURSOR) {
    obj.div.update(obj.x, obj.y);
  }
});

// ------------------------ REMOVE ----------------------------------------------

TuioManager.addListener("cursorRemoved", function (obj) {

  if (TRIGGERMOUSE) {
    var maxMove = 15;

    var temp = document.elementFromPoint(obj.x, obj.y);

    if (Math.abs(obj.xTot) <= maxMove && Math.abs(obj.yTot) <= maxMove) {
      //console.log("X: " + obj.x + " Y: "+ obj.y);
      //console.log(obj.el);

      if (obj.el !== null) {
        //console.log("Click");
        Eventr.simulate(obj.el,'click');
      }

    }
    Eventr.simulate(temp,'mouseup', { pointerX : obj.x, 
                                      pointerY : obj.y,
                                      bubbles  : true,
                                      cancelable : false });
  }
  if (SHOWCURSOR) {
    obj.div.remove();
  }
});