(function(videojs, window, undefined) {
  var options,
      player,
      readKey,
      readGesture;

  //event management (thanks John Resig)
  function addEvent(obj, type, fn) {
    var obj = (obj.constructor === String) ? document.getElementById(obj) : obj;
    if (obj.attachEvent) {
      obj['e' + type + fn] = fn;
      obj[type + fn] = function(){ obj['e' + type + fn](window.event) };
      obj.attachEvent('on' + type, obj[type + fn]);
    } else {
      obj.addEventListener(type, fn, false);
    }
  };

  function removeEvent(obj, type, fn) {
    var obj = (obj.constructor === String) ? document.getElementById(obj) : obj;
    if (obj.detachEvent) {
      obj.detachEvent('on' + type, obj[type + fn]);
      obj[type + fn] = null;
    } else {
      obj.removeEventListener(type, fn, false);
    }
  };

  function unbindEvents() {
    removeEvent(document, 'keyup', readKey);
    removeEvent(document, 'touchend', readGesture);
  }

  function getEvents(callback) {
    return {
      readKey: function readKey(evt) {
        if (!evt) evt = window.event;
        var code = 113; //F2 key

        if (evt && evt.keyCode == code) {
          callback();
        }
      },

      readGesture: function readGesture(evt) {
        if (!evt) {
          evt = window.event;
          evt.preventDefault();
        }

        if (evt.targetTouches.length + evt.changedTouches.length > 2) {
          callback();
        }
      }
    };
  }

  function loadDebugger() {
    var s = document.createElement('script'),
        loaded = false;

    s.onload = s.onreadystatechange = function() {
      if (!loaded && (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete')) {
        loaded = true;
        s.onload = s.onreadystatechange = null;

        player.debuggerWindow();
        unbindEvents();
      }
    };

    s.src = options.url || "debugger.js";

    document.body.appendChild(s);
  }

  videojs.plugin("debuggerWindow", function(opts) {
    var events = getEvents(loadDebugger);

    options = opts;
    player = this;
    readKey = events.readKey;
    readGesture = events.readGesture;

    addEvent(document, 'keyup', readKey);
    addEvent(document, 'touchend', readGesture);

    addEvent(window, 'unload', function() {
      unbindEvents();
    });

    player.debuggerWindow.getEvents = getEvents;
  });
})(videojs, window);
