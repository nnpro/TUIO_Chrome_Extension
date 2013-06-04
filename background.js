
$(document.body).append("<object id='tuio' type='application/x-tuio'>Plugin FAILED to load</object>");

// MESSGAE  -----------

chrome.tabs.onActivated.addListener( function(obj) {
  console.log(obj);
});

chrome.runtime.onConnect.addListener( function(port) {
  console.assert(port.name == "tuio");
  
  console.log('Connected to Tab:');
  console.log(port);

  TuioManager.addListener("cursorAdded", function (tuioObject) {
    port.postMessage({message: "cursorAdded", obj : tuioObject});
  });
  TuioManager.addListener("cursorUpdated", function (tuioObject) {
    port.postMessage({message: "cursorUpdated", obj : tuioObject});
  });
  TuioManager.addListener("cursorRemoved", function (tuioObject) {
    port.postMessage({message: "cursorRemoved", obj : tuioObject});
  });

  TuioManager.addListener("fiducialAdded", function (tuioObject) {
    port.postMessage({message: "fiducialAdded", obj : tuioObject});
  });
  TuioManager.addListener("fiducialUpdated", function (tuioObject) {
    port.postMessage({message: "fiducialUpdated", obj : tuioObject});
  });
  TuioManager.addListener("fiducialRemoved", function (tuioObject) {
    port.postMessage({message: "fiducialRemoved", obj : tuioObject});
  });

});

// -------- TUIO --------------------------------

var TuioCursor = function(id, x, y) {
  this.id = id;
  this.update(x, y);
};
TuioCursor.prototype.update = function(x, y) {
  this.x = x;
  this.y = y;
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
  this.id  = id;
  this.update(x, y, angle);
};
TuioFiducial.prototype.update = function(x, y, angle) {
  this.x = x;
  this.y = y;
  this.angle = angle;  
};


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
    TuioManager.listeners.cursorAdded(TuioManager.cursors[id]);

  },
  _updateCursor: function(id, x, y) {
    if (TuioManager.cursors[id]===undefined) return;
    TuioManager.cursors[id].update(x, y);
    TuioManager.listeners.cursorUpdated(TuioManager.cursors[id]);

  },
  _removeCursor: function(id) {
    if (TuioManager.cursors[id]===undefined) return;
    TuioManager.listeners.cursorRemoved(TuioManager.cursors[id]);
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
  _removeFiducial: function(id, x, y, angle) {

    if (TuioManager.fiducials[id]===undefined) return;

    TuioManager.listeners.fiducialRemoved(TuioManager.fiducials[id]);
    delete TuioManager.fiducials[id];
  }
};

function tuio_callback_cursor(type, sid, x, y, a) {
  switch (type) {
    case 3: TuioManager._addCursor(sid, x, y); break;
    case 4: TuioManager._updateCursor(sid, x, y); break;
    case 5: TuioManager._removeCursor(sid); break;
  }
}
function tuio_callback_fiducial(type, sid, fid, x, y, a) {
  switch (type) {
    case 0: TuioManager._addFiducial    (sid, x, y, a); break;
    case 1: TuioManager._updateFiducial (sid, x, y, a); break;
    case 2: TuioManager._removeFiducial (sid, x, y, a); break;
  }
}
function tuio_callback_hand(type, sid, x, y, a, vx, vy, fid1, fid2, fid3, fid4, fid5, a1, a2, a3, a4, a5) {
  // x *= $(document).width();
  // y *= $(document).height();
  // switch (type) {
  //   case 6: TuioManager._addHand(sid, x, y, vx, vy, fid1, fid2, fid3, fid4, fid5, a1, a2, a3, a4, a5); break;
  //   case 7: TuioManager._updateHand(sid, x, y, vx, vy, fid1, fid2, fid3, fid4, fid5, a1, a2, a3, a4, a5); break;
  //   case 8: TuioManager._removeHand(sid, x, y, vx, vy); break;
  // }
}