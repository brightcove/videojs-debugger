# videojs-debugger

## Including

1. Include `bootstrap.js` in after `video.js`: `<script src="src/js/bootstrap.js"></script>`
2. Include `debugger.css`: `<link href="src/css/debugger.css" rel="stylesheet">`
3. Initialize the debugger with the url to the `debugger.js` file:

```js
var player = videojs('video');
player.debuggerWindow({ url: "src/js/debugger.js" });
```

## F2 or Triple Tap to open debugger

The debugger is loaded on demand via a certain trigger.
* On desktops, the trigger is *`<F2>`*.
* On mobile devices, the trigger is a *`three finger tap`*

## Options

* `url`: The url to the debugger script

## Known issues

* Email: To test emailing the log, you will need to supply a recipient's email address when your email client opens.
* Email: Currently, email does not format the log dump.  The contents of the email are the contents of the array of Strings, separated by commas.  Would formatting be handled better on the server side?
