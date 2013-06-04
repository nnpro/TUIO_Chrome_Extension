var TuioCursor = function(id, x, y) {

  var time = new Date();     // defined globally
  this.created = time.getTime();
  this.minTime = 100;
  this.showing = false;
  
  this.id = id;
  this.update(x, y);
};
TuioCursor.prototype.ready = function() {
  var time = new Date();     // defined globally
  if (time.getTime() - this.created >= this.minTime) {
    return true;
  }
  return false;
};
TuioCursor.prototype.update = function(x, y) {

  this.x = x * window.innerWidth;
  this.y = y * window.innerHeight;
};
/*
var TuioHand = function(id, x, y, vx, vy, fid1, fid2, fid3, fid4, fid5, a1, a2, a3, a4, a5) {
  this.id = id;
  this.fingers = new Array();
  this.angles = new Array();
  this.update(x, y, vx, vy, fid1, fid2, fid3, fid4, fid5, a1, a2, a3, a4, a5);
}
TuioHand.prototype.update = function(x, y, vx, vy, fid1, fid2, fid3, fid4, fid5, a1, a2, a3, a4, a5) {
  this.x = x;
  this.y = y;
  this.vx = vx;
  this.vy = vy;
  this.fingers[0] = TuioManager.cursors[fid1];
  this.fingers[1] = TuioManager.cursors[fid2];
  this.fingers[2] = TuioManager.cursors[fid3];
  this.fingers[3] = TuioManager.cursors[fid4];
  this.fingers[4] = TuioManager.cursors[fid5];
  this.angles[0] = a1;
  this.angles[1] = a2;
  this.angles[2] = a3;
  this.angles[3] = a4;
  this.angles[4] = a5;
} */ 

var TuioFiducial = function(id, x, y, angle) {

  var time = new Date();     // defined globally
  this.created = time.getTime();
  this.showing = false;

  this.id = id;
  this.update(x, y, angle);
};
TuioFiducial.prototype.update = function(x, y, angle) {

  this.x = x * screen.width;
  this.y = y * screen.height;
  this.angle = angle;  
};

// ============================== TUIO LIB ===============================================

TuioManager = {

  fiducials: {},
  cursors: {},
  hands: {},

  addListener: function(event, callback) {
    if (TuioManager.listeners[event]!==undefined) {
      TuioManager.listeners[event] = callback;
    }
  },

  listeners: {
    fiducialAdded: function(fiducial) {},
    fiducialUpdated: function(fiducial) {},
    fiducialRemoved: function(fiducial) {},
    cursorAdded: function(cursor) {},
    cursorUpdated: function(cursor) {},
    cursorRemoved: function(cursor) {}
    //handAdded: function(hand) {},
    //handUpdated: function(hand) {},
    //handRemoved: function(hand) {}
  },

      // cursors
  _addCursor: function(id, x, y) {

    TuioManager.cursors[id] = new TuioCursor(id, x, y);
    //TuioManager.listeners.cursorAdded(TuioManager.cursors[id]);

  },
  _updateCursor: function(id, x, y) {
    var cursor = TuioManager.cursors[id];
    if (cursor===undefined) return;

    if (cursor.showing === false) {
      if (cursor.ready()) {
        cursor.update(x, y);
        TuioManager.listeners.cursorAdded(cursor);
        cursor.showing = true;
      }
    } else { 
      cursor.update(x, y);
      TuioManager.listeners.cursorUpdated(cursor);
    }
  },
  _removeCursor: function(id) {
    var cursor = TuioManager.cursors[id];

    if (cursor===undefined) return;

    if (cursor.showing === true) {
      TuioManager.listeners.cursorRemoved(cursor);
    }

    delete TuioManager.cursors[id];
  },

  // fiducials
  _addFiducial: function(id, x, y, angle) {

    TuioManager.fiducials[id] = new TuioFiducial(id, x, y, angle);
    TuioManager.listeners.fiducialAdded(TuioManager.fiducials[id]);
  },
  _updateFiducial: function(id, x, y, angle) {

    if (TuioManager.fiducials[id]===undefined) return;

    TuioManager.fiducials[id].update(x, y, angle);
    TuioManager.listeners.fiducialUpdated(TuioManager.fiducials[id]);
  },
  _removeFiducial: function(id) {

    if (TuioManager.fiducials[id]===undefined) return;

    TuioManager.listeners.fiducialRemoved(TuioManager.fiducials[id]);
    delete TuioManager.fiducials[id];
  }
};

//=======================================================================