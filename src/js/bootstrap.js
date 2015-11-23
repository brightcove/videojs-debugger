(function(videojs, window, undefined) {
  var options,
      player,
      readKey,
      readGesture;

  function filter(arr, callback, context) {
    var
      result = [],
      value,
      i = 0,
      l = arr.length;

    for (; i < l; i++) {
      if (arr.hasOwnProperty(i)) {
        value = arr[i];
        if (callback.call(context, value, i, arr)) {
          result.push(value);
        }
      }
    }

    return result;
  }

  //event management (thanks John Resig)
  function addEvent(obj, type, fn) {
    obj = (obj.constructor === String) ? document.getElementById(obj) : obj;
    if (obj.attachEvent) {
      obj['e' + type + fn] = fn;
      obj[type + fn] = function(){ obj['e' + type + fn](window.event); };
      obj.attachEvent('on' + type, obj[type + fn]);
    } else {
      obj.addEventListener(type, fn, false);
    }
  }

  function removeEvent(obj, type, fn) {
    obj = (obj.constructor === String) ? document.getElementById(obj) : obj;
    if (obj.detachEvent) {
      obj.detachEvent('on' + type, obj[type + fn]);
      obj[type + fn] = null;
    } else {
      obj.removeEventListener(type, fn, false);
    }
  }

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
    if (player.debuggerWindowMain) {
      return;
    }

    var s = document.createElement('script'),
        debuggerStyle = document.createElement('link'),
        fontawesome = document.createElement('link'),
        loaded = false;

    s.onload = s.onreadystatechange = function() {
      if (!loaded && (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete')) {
        loaded = true;
        s.onload = s.onreadystatechange = null;

        /* jshint -W021 */
        loadDebugger = function(){};

        player.debuggerWindowMain();
        unbindEvents();
      }
    };

    s.src = options.js || 'debugger.js';

    debuggerStyle.rel = 'stylesheet';
    fontawesome.rel = 'stylesheet';
    debuggerStyle.href = options.css || 'debugger.css';
    fontawesome.href = '//netdna.bootstrapcdn.com/font-awesome/4.0.3/css/font-awesome.css';

    document.body.appendChild(s);
    document.body.appendChild(debuggerStyle);
    document.body.appendChild(fontawesome);
  }

  videojs.plugin('debuggerWindow', function(opts) {
    var events = getEvents(loadDebugger),
        videoEvents = filter(videojs.getComponent('Html5').Events, function(event) { return event !== 'timeupdate' && event !== 'progress' && event !== 'suspend'; }),
        i = videoEvents.length,
        eventHandlerFunction;

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
    player.debuggerWindow.loadDebugger = loadDebugger;

    function makeCachedLogger(fn) {
      function logger() {
        if (fn) {
          fn.apply(null, arguments);
        }

        logger.history.push(arguments);
      }
      logger.history = [];
      return logger;
    }

    videojs.log.debug = makeCachedLogger();
    videojs.log.warn = makeCachedLogger(videojs.log.warn);
    videojs.log.info = makeCachedLogger(videojs.log);
    videojs.log.error = makeCachedLogger(videojs.log.error);

    eventHandlerFunction = function(event) {
      videojs.log.debug({
        type: event.type,
        time: new Date()
      });
    };

    while (i--) {
      player.on(videoEvents[i], eventHandlerFunction);
    }
  });
})(videojs, window);
