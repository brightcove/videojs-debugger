# videojs-debugger

## How to use the Brightcove Videojs Player Debugger

1. Include `bootstrap.js` in after `video.js`
2. Include `debugger.css`
3. Initialize the debugger:

```js
var player = videojs('video');
player.debuggerWindow();
```

## F12 or Triple Tap to open debugger

The debugger is loaded on demand via a certain trigger.
* On desktops, the trigger is *`<F12>`*.
* On mobile devices, the trigger is a *`three finger tap`*

## Known issues
* Email: To test emailing the log, you will need to supply a recipient's email address when your email client opens.
* Email: Currently, email does not format the log dump.  The contents of the email are the contents of the array of Strings, separated by commas.  Would formatting be handled better on the server side?
