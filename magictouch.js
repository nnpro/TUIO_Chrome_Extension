// ========================== Magic Touch ===================================

// Framework for simulating touch events without a mobile device
// Trying to be compatible with
//  http://dvcs.w3.org/hg/webevents/raw-file/tip/touchevents.html
// TODO: support more of the touch API: touch{enter, leave, cancel}

var tuio_touch = {
  cursors: [],

  // Data structure for associating cursors with objects
  _data: {},

  _touchstart:    function(touch) {
    // Create a touchstart event
    this._create_event('touchstart', touch, {});
  },

  _touchmove: function(touch) {
    // Create a touchmove event
    this._create_event('touchmove', touch, {});
  },

  _touchend: function(touch) {
    // Create a touchend event
    this._create_event('touchend', touch, {});
  },

  _create_event: function(name, touch, attrs) {
    // Creates a custom DOM event
    var evt = document.createEvent('CustomEvent');
    evt.initEvent(name, true, true);
    // Attach basic touch lists
    evt.touches = this.cursors;
    // Get targetTouches on the event for the element
    evt.targetTouches = this._get_target_touches(touch.target);
    evt.changedTouches = [touch];
    // Attach custom attrs to the event
    for (var attr in attrs) {
      if (attrs.hasOwnProperty(attr)) {
        evt[attr] = attrs[attr];
      }
    }
    // Dispatch the event
    if (touch.target) {
      touch.target.dispatchEvent(evt);
    } else {
      document.dispatchEvent(evt);
    }
  },

  _get_target_touches: function(element) {
    var targetTouches = [];
    for (var i = 0; i < this.cursors.length; i++) {
      var touch = this.cursors[i];
      if (touch.target == element) {
        targetTouches.push(touch);
      }
    }
    return targetTouches;
  },

  // Callback from the main event handler
  callback: function(type, sid, fid, x, y, angle) {
    //console.log('callback type: ' + type + ' sid: ' + sid + ' fid: ' + fid);
    //console.log('x: ' + x + ' y: ' + y + ' angle: ' + angle);
    if (!TOUCH) {
      return false;
    }
    
    var data;

    if (type !== 3) {
      data = this._data[sid];
    } else {
      data = {
        sid: sid,
        fid: fid
      };
      this._data[sid] = data;
    }

    // Some properties
    // See http://dvcs.w3.org/hg/webevents/raw-file/tip/touchevents.html
    data.identifier = sid;
    data.pageX = window.innerWidth * x;
    data.pageY = window.innerHeight * y;
    data.target = document.elementFromPoint(data.pageX, data.pageY);

    switch (type) {
      case 3:
        this.cursors.push(data);
        this._touchstart(data);
        break;

      case 4:
        this._touchmove(data);
        break;

      case 5:
        this.cursors.splice(this.cursors.indexOf(data), 1);
        this._touchend(data);
        break;

      default:
        break;
    }

    if (type === 5) {
      delete this._data[sid];
    }
  }
};

// ---------------------------------------------------------------------------------------
// Generated by CoffeeScript 1.4.0
/*
Eventr.simulate(element, eventName[, options]) -> DOMElement

- element: element to fire event on
- eventName: name of event to fire (only MouseEvents and HTMLEvents interfaces are supported)
- options: optional object to fine-tune event properties - pointerX, pointerY, ctrlKey, etc.

  Eventr.simulate($('#foo'),'click'); // => fires "click" event on an element with id=foo
*/

var Eventr,
  __slice = [].slice;

Eventr = (function() {

  function Eventr() {}

  Eventr.extend = function() {
    var dst, k, o, src, v, _i, _len;
    dst = arguments[0], src = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    for (_i = 0, _len = src.length; _i < _len; _i++) {
      o = src[_i];
      for (k in o) {
        v = o[k];
        dst[k] = v;
      }
    }
    return dst;
  };

  Eventr.eventMatchers = {
    HTMLEvents: /^(?:load|unload|abort|error|select|change|submit|reset|focus|blur|resize|scroll)$/i,
    MouseEvents: /^(?:click|dblclick|mouse(?:down|up|over|move|out))$/i
  };

  Eventr.defaults = {
    pointerX: 0,
    pointerY: 0,
    button: 0,
    ctrlKey: false,
    altKey: false,
    shiftKey: false,
    metaKey: false,
    bubbles: true,
    cancelable: true
  };

  Eventr.simulate = function(target, eventName, options) {
    var eventType, evt, matcher, name, oEvent, _ref;
    if (options === null) {
      options = {};
    }
    _ref = this.eventMatchers;
    for (name in _ref) {
      matcher = _ref[name];
      if (matcher.test(eventName)) {
        eventType = name;
        break;
      }
    }
    if (!eventType) {
      throw new SyntaxError('Only HTMLEvents and MouseEvents interfaces are supported');
    }
    eventName = eventName.toLowerCase();
    options = this.extend({}, this.defaults, options);
    if (document.createEvent) {
      evt = document.createEvent(eventType);
      switch (eventType) {
        case 'HTMLEvents':
          evt.initEvent(eventName, options.bubbles, options.cancelable);
          break;
        default:
          evt.initMouseEvent(eventName, options.bubbles, options.cancelable, document.defaultView, options.button, options.pointerX, options.pointerY, options.pointerX, options.pointerY, options.ctrlKey, options.altKey, options.shiftKey, options.metaKey, options.button, target);
      }
      target.dispatchEvent(evt);
    } else {
      options.clientX = options.pointerX;
      options.clientY = options.pointerY;
      delete options.pointerX;
      delete options.pointerY;
      evt = document.createEventObject();
      oEvent = this.extend(evt, options);
      target.fireEvent("on" + eventName, oEvent);
    }
    return target;
  };

  return Eventr;

})();