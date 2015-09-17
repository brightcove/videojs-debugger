/*
 * Originally based on Blackbird
 * MIT License - Copyright (c) Blackbird Project <http://blackbirdjs.googlecode.com/>
 */
(function(videojs, window, undefined) {
  'use strict';

  var events = videojs.getComponent('Player').prototype.debuggerWindow.getEvents;

  function reduce(arr, callback, initial) {
    var returnValue = initial,
        i = 0,
        l = arr.length;

    for (; i < l; i++) {
      returnValue = callback(returnValue, arr[i], i, arr);
    }

    return returnValue;
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


  function debuggerWindowMain(options) {

    var

      /* jshint -W040 */
      player = this,
      bbird,
      outputList,
      cache = [],
      emailArray = [],
      state = {
        pos: 1,
        size: 0
      },
      classes = [],
      profiler = {},
      currentTime,
      readKey,
      readGesture,
      logger,
      historyLogger,
      oldLog,
      history,

      IDs = {
        blackbird: 'blackbird',
        filters: 'bbFilters',
        controls: 'bbControls',
        size: 'bbSize',
        sendEmail: 'sendEmail'
      },

      messageTypes = { //order of these properties imply render order of filter controls
        debug: true,
        info: true,
        warn: true,
        error: true,
        profile: true
      };

    function pad(s, n) {
      return ((new Array(n+1)).join('0') + s).slice(-1*n);
    }
    function timeString() {
      var d = new Date();
      return [
        '[',
        [pad(d.getMonth() + 1, 2), pad(d.getDate(), 2)].join('/'),
        ' ',
        [pad(d.getHours(), 2), pad(d.getMinutes(), 2), pad(d.getSeconds(), 2)].join(':'),
        ']',
      ].join('');
    }

    function generateMarkup() { //build markup
      var type, spans = [];
      for (type in messageTypes) {
        spans.push(['<span class="fa ', type, '" type="', type, '" title="hide ', type, ' messages"></span>'].join(''));
      }

      var newNode = document.createElement('DIV');
      newNode.id = IDs.blackbird;
      newNode.style.display = 'none';
      newNode.innerHTML = [
        '<div class="header">',
          '<div class="left">',
            '<div id="', IDs.filters, '" class="filters">', spans.join(''),
            '</div>',
          '</div>',
          '<div class="right">',
            '<div id="', IDs.controls, '" class="controls">',
              '<span class="fa email" id="', IDs.sendEmail, '" title="Send log via email" op="email"></span>',
              '<span id="', IDs.size ,'" title="contract" op="resize"></span>',
              '<span class="fa clear" title="clear" op="clear"></span>',
              '<span class="fa close" title="close" op="close"></span>',
            '</div>',
          '</div>',
        '</div>',
        '<div class="main">',
          '<ol>', cache.join(''), '</ol>',
        '</div>',
        '<div class="footer">',
        '</div>'
      ].join('');
      return newNode;
    }

    function addMessage(type, content) { //adds a message to the output list
      var innerContent,
          allContent,
          timeStr = timeString(),
          newMsg;
      content = (content.constructor == Array) ? content.join('') : content;

      innerContent = [
        '<span class="fa ' + type + '" title="' + type + '"></span>',
        timeStr,
        content
      ].join(' ');

      allContent = ['<li class="', type, '">', innerContent, '</li>'].join('');

      if (outputList) {
        newMsg = document.createElement('LI');
        newMsg.className = type;
        newMsg.innerHTML = innerContent;
        outputList.appendChild(newMsg);
        scrollToBottom();
      } else {
        cache.push(allContent);
      }
      emailArray.push([timeStr, ' ', type, ': ', content].join(''));
    }

    function clear() { //clear list output
      outputList.innerHTML = '';
    }

    function clickControl(evt) {
      var el;

      if (!evt) {
        evt = window.event;
      }
      el = (evt.target) ? evt.target : evt.srcElement;

      if (el.tagName == 'SPAN') {
        switch (el.getAttributeNode('op').nodeValue) {
          case 'resize': resize(); break;
          case 'clear':  clear();  break;
          case 'close':  hide();   break;
        }
      }
    }

    function clickFilter(evt) { //show/hide a specific message type
      var entry, span, type, filters, active, oneActiveFilter, i, spanType, disabledTypes;

      if (!evt) {
        evt = window.event;
      }
      span = (evt.target) ? evt.target : evt.srcElement;

      if (span && span.tagName == 'SPAN') {

        type = span.getAttributeNode('type').nodeValue;

        if (evt.altKey) {
          filters = document.getElementById(IDs.filters).getElementsByTagName('SPAN');

          active = 0;
          for (entry in messageTypes) {
            if (messageTypes[entry]) active++;
          }
          oneActiveFilter = (active == 1 && messageTypes[type]);

          for (i = 0; filters[i]; i++) {
            spanType = filters[i].getAttributeNode('type').nodeValue;

            filters[i].className = 'fa ' + spanType + ((oneActiveFilter || (spanType == type)) ? '' : ' disabled');
            messageTypes[spanType] = oneActiveFilter || (spanType == type);
          }
        }
        else {
          messageTypes[type] = ! messageTypes[type];
          span.className = 'fa ' + type + ((messageTypes[type]) ? '' : ' disabled');
        }

        //build outputList's class from messageTypes object
        disabledTypes = [];
        for (type in messageTypes) {
          if (! messageTypes[type]) {
            disabledTypes.push(type);
          }
        }
        disabledTypes.push('');
        outputList.className = disabledTypes.join('Hidden ');

        scrollToBottom();
      }
    }

    function clickSendEmail(evt) {
      var el;
      if (!evt) {
        evt = window.event;
      }
      el = (evt.target) ? evt.target : evt.srcElement;
      window.open('mailto:email@example.com?subject=Brightcove Player Debugger Log&body=' + encodeURIComponent(emailArray.join('\n')));
    }

    function scrollToBottom() { //scroll list output to the bottom
      outputList.scrollTop = outputList.scrollHeight;
    }

    function isVisible() { //determine the visibility
      return (bbird.style.display == 'block');
    }

    function hide() {
      bbird.style.display = 'none';
    }

    function show() {
      document.body.removeChild(bbird);
      document.body.appendChild(bbird);
      bbird.style.display = 'block';
    }

    function toggleVisibility() {
      if (isVisible()) {
        hide();
      } else {
        show();
      }
    }

    //sets the position
    function reposition(position) {
      if (position === undefined || position === null) {
        //set to initial position ('topRight') or move to next position
        position = (state && state.pos === null) ? 1 : (state.pos + 1) % 4;
      }

      switch (position) {
        case 0: classes[0] = 'bbTopLeft'; break;
        case 1: classes[0] = 'bbTopRight'; break;
        case 2: classes[0] = 'bbBottomLeft'; break;
        case 3: classes[0] = 'bbBottomRight'; break;
      }
      state.pos = position;
      setState();
    }

    function resize(size) {
      var span;

      if (size === undefined || size === null) {
        size = (state && state.size === null) ? 0 : (state.size + 1) % 2;
      }

      classes[1] = (size === 0) ? 'bbSmall' : 'bbLarge';

      span = document.getElementById(IDs.size);
      span.title = (size === 1) ? 'small' : 'large';
      span.className = "fa " + span.title;

      state.size = size;
      setState();
      scrollToBottom();
    }

    function setState() {
      var touchClass = "";
      if (videojs.browser.TOUCH_ENABLED) {
        touchClass = 'vjs-touch ';
      }
      bbird.className = touchClass + classes.join(' ');
    }

    oldLog = videojs.log;
    videojs.log = {};
    videojs.log.oldLog = oldLog;

    logger = function(type, messages) {
      if (videojs.log.oldLog[type]) {
        videojs.log.oldLog[type].apply(null, arguments);
      }

      addMessage(type, reduce((messages || []), function(str, msg, i) {
        var sMsg;
        try {
          sMsg = JSON.stringify(msg);
        } catch (e) {
          sMsg = msg.toString();
        }
        return str + sMsg + (i === messages.length - 1 ? "" : ", ");
      }, ""));
    };
    historyLogger = function(type, messages) {
      (messages || []).forEach(function(arrgs) {
        var args = Array.prototype.slice.call(arrgs);
        logger(type, args);
      });
    };

    historyLogger("info", videojs.log.history);
    historyLogger("debug", videojs.log.debug.history);
    historyLogger("warn", videojs.log.warn.history);
    historyLogger("error", videojs.log.error.history);

    videojs.log = function() {
      var args = Array.prototype.slice.call(arguments);
      logger("info", args);

      videojs.log.oldLog.apply(videojs, arguments);
    };

    videojs.log.resize = function() { resize(); };
    videojs.log.clear = function() { clear(); };
    videojs.log.move = function() { reposition(); };
    videojs.log.debug = function() { logger('debug', arguments); };
    videojs.log.warn = function() { logger('warn', arguments); };
    videojs.log.info = videojs.log;
    videojs.log.error = function() { logger('error', arguments); };
    videojs.log.profile = function(label) {
      currentTime = new Date(); //record the current time when profile() is executed
      if (label === undefined || label === null || label === '') {
        addMessage('error', '<b>ERROR:</b> Please specify a label for your profile statement');
      }
      else if (profiler[label]) {
        addMessage('profile', [label, ': ', currentTime - profiler[label],  'ms'].join(''));
        delete profiler[label];
      }
      else {
        profiler[label] = currentTime;
        addMessage('profile', label);
      }
      return currentTime;
    };

    bbird = document.body.appendChild(generateMarkup());
    outputList = bbird.getElementsByTagName('OL')[0];

    events = (events || player.debuggerWindow.events)(toggleVisibility);
    readKey = events.readKey;
    readGesture = events.readGesture;

    addEvent(IDs.sendEmail, 'click', clickSendEmail);
    addEvent(IDs.filters, 'click', clickFilter);
    addEvent(IDs.controls, 'click', clickControl);
    addEvent(document, 'keyup', readKey);
    addEvent(document, 'touchend', readGesture);

    resize(state.size);
    reposition(state.pos);
    show();
    player.debuggerWindowMain.show = show;
    player.debuggerWindowMain.hide = hide;

    scrollToBottom();

    addEvent(window, 'unload', function() {
      removeEvent(IDs.sendEmail, 'click', clickSendEmail);
      removeEvent(IDs.filters, 'click', clickFilter);
      removeEvent(IDs.controls, 'click', clickControl);
      removeEvent(document, 'keyup', readKey);
      removeEvent(document, 'touchend', readGesture);
    });
  }

  videojs.plugin('debuggerWindowMain', debuggerWindowMain);
})(videojs, window);
