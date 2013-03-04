videojs-debugger
================

How to use the Brightcove Videojs Player Debugger

In your page:
1. Include the debugger.js file inside a <script> tag:
   <script src="http://url-to-debugger.js"></script>
2. Include the debugger.css file inside a <link> tag:
   <link href="http://url-to-debugger.css" rel="stylesheet" type="text/css">

When your page loads, the debugger is hidden by default.
To toggle the debugger on and off:
1. In a desktop browser, press F2.
2. In a mobile device browser, tap two fingers anywhere in the page.  This causes the touchmove event to fire.
   (Note that the two-finger tap action in XCode's IOS Simulator, using Ctrl-Shift, does not toggle the debugger.)
3. The debugger script waits for DOMContentReady event to fire, before initializing.  This event may not be supported in Internet Explorer 8, but should be supported in all other desktop and mobile browsers.

Known issues:
1. The touchmove event can be a little flaky on iOS devices.  We need to find a way to make it a little less of a hair-trigger experience.
2. Email: To test emailing the log, you will need to supply a recipient's email address when your email client opens.
3. Email: Currently, email does not format the log dump.  The contents of the email are the contents of the array of Strings, separated by commas.  Would formatting be handled better on the server side?
