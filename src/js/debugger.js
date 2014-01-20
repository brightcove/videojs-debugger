/*
  Originally based on Blackbird
  MIT License - Copyright (c) Blackbird Project <http://blackbirdjs.googlecode.com/>
*/
(function(videojs, window, undefined) {
  'use strict';

  function debuggerWindow(options) {

    var
      NAMESPACE = 'log',
      bbird,
      outputList,
      cache = [],
      emailArray = [],
      state = getState(),
      classes = {},
      profiler = {},
      currentTime,

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

    videojs.oldLog = videojs.log;
    videojs.log = addMessage;

    function generateMarkup() { //build markup
      var type, spans = [];
      for (type in messageTypes) {
        spans.push(['<span class="', type, '" type="', type, '"></span>'].join(''));
      }

      var newNode = document.createElement('DIV');
      newNode.id = IDs.blackbird;
      newNode.style.display = 'none';
      newNode.innerHTML = [
        '<div class="header">',
          '<div class="left">',
            '<div id="', IDs.filters, '" class="filters" title="click to filter by message type">', spans.join(''),
            '</div>',
          '</div>',
          '<div class="right">',
            '<div id="', IDs.controls, '" class="controls">',
              '<span id="', IDs.size ,'" title="contract" op="resize"></span>',
              '<span class="clear" title="clear" op="clear"></span>',
              '<span class="close" title="close" op="close"></span>',
            '</div>',
          '</div>',
        '</div>',
        '<div class="main">',
          '<div class="left">',
            '</div><div class="mainBody">',
              '<ol>', cache.join(''), '</ol>',
            '</div>',
          '<div class="right">',
          '</div>',
        '</div>',
        '<div class="footer">',
           '<div class="left">',
             '<label for="', IDs.sendEmail, '">',
               '<input type="button" id="', IDs.sendEmail, '" />Email Debugger Log',
             '</label>',
           '</div>',
           '<div class="right">',
           '</div>',
        '</div>'
      ].join('');
      return newNode;
    };

    function addMessage(type, content) { //adds a message to the output list
      //content = (content.constructor == Array) ? content.join('') : content;
      if (outputList) {
        var newMsg = document.createElement('LI');
        newMsg.className = type;
        newMsg.innerHTML = [returnCurrentTime(), type, content].join('');
        outputList.appendChild(newMsg);
        scrollToBottom();
      } else {
        cache.push(['<li>', returnCurrentTime(), type,  content, '</li>'].join(''));
      }
                  emailArray.push([returnCurrentTime(), type,  content].join(''));

    };

    function clear() { //clear list output
      outputList.innerHTML = '';
    };

    function clickControl(evt) {
      if (!evt) {
                      evt = window.event;
                  }
      var el = (evt.target) ? evt.target : evt.srcElement;

      if (el.tagName == 'SPAN') {
        switch (el.getAttributeNode('op').nodeValue) {
          case 'resize': resize(); break;
          case 'clear':  clear();  break;
          case 'close':  hide();   break;
        }
      }
    };

    function clickFilter(evt) { //show/hide a specific message type
      if (!evt) {
                      evt = window.event;
                  }
      var span = (evt.target) ? evt.target : evt.srcElement;

      if (span && span.tagName == 'SPAN') {

        var type = span.getAttributeNode('type').nodeValue;

        if (evt.altKey) {
          var filters = document.getElementById(IDs.filters).getElementsByTagName('SPAN');

          var active = 0;
          for (entry in messageTypes) {
            if (messageTypes[entry]) active++;
          }
          var oneActiveFilter = (active == 1 && messageTypes[type]);

          for (var i = 0; filters[i]; i++) {
            var spanType = filters[i].getAttributeNode('type').nodeValue;

            filters[i].className = (oneActiveFilter || (spanType == type)) ? spanType : spanType + 'Disabled';
            messageTypes[spanType] = oneActiveFilter || (spanType == type);
          }
        }
        else {
          messageTypes[type] = ! messageTypes[type];
          span.className = (messageTypes[type]) ? type : type + 'Disabled';
              }

        //build outputList's class from messageTypes object
        var disabledTypes = [];
        for (type in messageTypes) {
          if (! messageTypes[type]) disabledTypes.push(type);
        }
        disabledTypes.push('');
        outputList.className = disabledTypes.join('Hidden ');

        scrollToBottom();
      }
    };

    function clickSendEmail(evt) {
      if (!evt) {
        evt = window.event;
      }
      var el = (evt.target) ? evt.target : evt.srcElement;
      window.open('mailto:email@example.com?subject=Brightcove Player Debugger Log&body=' + emailArray);
    };

    function scrollToBottom() { //scroll list output to the bottom
      outputList.scrollTop = outputList.scrollHeight;
    };

    function isVisible() { //determine the visibility
      return (bbird.style.display == 'block');
    }

    function hide() {
      bbird.style.display = 'none';
    };

    function show() {
      var body = document.getElementsByTagName('BODY')[0];
      body.removeChild(bbird);
      body.appendChild(bbird);
      bbird.style.display = 'block';
    };

    //sets the position
    function reposition(position) {
      if (position === undefined || position == null) {
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
    };

    function resize(size) {
      if (size === undefined || size === null) {
        size = (state && state.size == null) ? 0 : (state.size + 1) % 2;
        }

      classes[1] = (size === 0) ? 'bbSmall' : 'bbLarge'

      var span = document.getElementById(IDs.size);
      span.title = (size === 1) ? 'small' : 'large';
      span.className = span.title;

      state.size = size;
      setState();
      scrollToBottom();
    };

    function setState() {
      var entry, word, props = [], newClass = [], expiration = new Date();
      for (entry in state) {
        var value = (state[entry] && state[entry].constructor === String) ? '"' + state[entry] + '"' : state[entry];
        props.push(entry + ':' + value);
      }
      props = props.join(',');

      expiration.setDate(expiration.getDate() + 14);
      document.cookie = ['blackbird={', props, '}; expires=', expiration.toUTCString() ,';'].join('');

      for (word in classes) {
        newClass.push(classes[word]);
      }
      bbird.className = newClass.join(' ');
    };

    function getState() {
      var re = new RegExp(/blackbird=({[^;]+})(;|\b|$)/);
      var match = re.exec(document.cookie);
      return (match && match[1]) ? eval('(' + match[1] + ')') : { pos:null, size:null, load:null };
    };

    //event handler for 'keyup' event for window
    function readKey(evt) {
      if (!evt) evt = window.event;
      var code = 113; //F2 key

      if (evt && evt.keyCode == code) {

        var visible = isVisible();

        if (visible && evt.shiftKey && evt.altKey) clear();
        else if   (visible && evt.shiftKey) reposition();
        else if (!evt.shiftKey && !evt.altKey) {
          (visible) ? hide() : show();
        }
      }
    };

    //event handler for 'touchmove' event for window
    function readGesture(evt) {
      if (!evt) {
        evt = window.event;
        evt.preventDefault();
      }
      var visible = isVisible();
      if (visible) {
        hide();
      } else {
        show();
      }
    };

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

    window[NAMESPACE] = {
      toggle:
        function() { addEvent(window, window.event.shiftKey); },
      resize:
        function() { resize(); },
      clear:
        function() { clear(); },
      move:
        function() { reposition(); },
      debug:
        function(msg) { addMessage('debug: ', msg); },
      warn:
        function(msg) { addMessage('warn:  ', msg); },
      info:
        function(msg) { addMessage('info:  ', msg); },
      error:
        function(msg) { addMessage('error: ', msg); },
      profile:
        function(label) {
          currentTime = new Date(); //record the current time when profile() is executed
          if (label == undefined || label == '') {
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
        }
    }

    var returnCurrentTime = function() {
      var month, day, minutes, seconds;
      currentTime = new Date();
      month = currentTime.getMonth() + 1;
      if(month < 10) { month = "0" + month };
      day = currentTime.getDay();
      if(day < 10) { day = "0" + day };
      minutes = currentTime.getMinutes();
      seconds = currentTime.getSeconds();
      if(minutes < 10) { minutes = "0" + minutes; }
      if(seconds < 10) { seconds = "0" + seconds; }

      return currentTime.getFullYear() +"-" +
             month + "-" +
             day + " " +
             currentTime.getHours() + ":" +
             minutes + ":" +
             seconds + " ";
    };

    var body = document.getElementsByTagName('BODY')[0];
    bbird = body.appendChild(generateMarkup());
    outputList = bbird.getElementsByTagName('OL')[0];

    //add events
    addEvent(IDs.sendEmail, 'click', clickSendEmail);
    addEvent(IDs.filters, 'click', clickFilter);
    addEvent(IDs.controls, 'click', clickControl);
    addEvent(document, 'keyup', readKey);
    addEvent(document, 'touchmove', readGesture);

    resize(state.size);
    reposition(state.pos);
    if (state.load) {
      show();
    }

    scrollToBottom();

    window[NAMESPACE].init = function() {
      show();
      window[NAMESPACE].error(['<b>', NAMESPACE, '</b> can only be initialized once']);
    }

    addEvent(window, 'unload', function() {
      removeEvent(IDs.sendEmail, 'click', clickSendEmail);
      removeEvent(IDs.filters, 'click', clickFilter);
      removeEvent(IDs.controls, 'click', clickControl);
      removeEvent(document, 'keyup', readKey);
      removeEvent(document, 'touchmove', readGesture);
    });

    show();
  };

  videojs.plugin('debuggerWindow', debuggerWindow);
})(videojs, window);
