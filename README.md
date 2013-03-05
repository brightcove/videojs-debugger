videojs-debugger
================

<h4>How to use the Brightcove Videojs Player Debugger</h4>

In your page:<br>
1. Include the debugger.js file inside a <script> tag: <script src="http://url-to-debugger.js"></script><br>
2. Include the debugger.css file inside a &lt;link&gt; tag: &lt;link href="http://url-to-debugger.css" rel="stylesheet" type="text/css"&gt;

<h4>When your page loads, the debugger is hidden by default.</h4>
To toggle the debugger on and off:<br>
1. In a desktop browser, press F2.<br>
2. In a mobile device browser, tap two fingers anywhere in the page.  This causes the touchmove event to fire.<br>
   (Note that the two-finger tap action in XCode's IOS Simulator, using Ctrl-Shift, does not toggle the debugger.)<br>
3. The debugger script waits for DOMContentReady event to fire, before initializing.  This event may not be supported <br>in Internet Explorer 8, but should be supported in all other desktop and mobile browsers.<br>

<h4>Known issues:</h4>
1. The touchmove event can be a little flaky on iOS devices.  We need to find a way to make it a little less of a hair-trigger experience.<br>
2. Email: To test emailing the log, you will need to supply a recipient's email address when your email client opens.<br>
3. Email: Currently, email does not format the log dump.  The contents of the email are the contents of the array of Strings, separated by commas.  Would formatting be handled better on the server side?<br>
