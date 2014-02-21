<a href="http://trunkcity/viewType.html?buildTypeId=ExperimentalVideoJsPlayerDebugger_10Continuous&guest=1">
<img src="http://teamcity/app/rest/builds/buildType:(id:ExperimentalVideoJsPlayerDebugger_10Continuous)/statusIcon"/>
</a>

# videojs-debugger

## Including

1. Include `bootstrap.js` in after `video.js`: `<script src="src/js/bootstrap.js"></script>`
2. Include `debugger.css`: `<link href="src/css/debugger.css" rel="stylesheet">`
3. Initialize the debugger with the url to the `debugger.js` file:

```js
var player = videojs('video');
player.debuggerWindow({
  js: "src/js/debugger.js",
  css: "src/css/debugger.css"
});
```

## F2 or Triple Tap to open debugger

The debugger is loaded on demand via a certain trigger.
* On desktops, the trigger is *`<F2>`*.
* On mobile devices, the trigger is a *`three finger tap`*

## Options

* `js`: The url to the debugger script
* `css`: The url to the debugger stylesheet

## Usage

`videojs.log`

Once the the plugin gets loaded, there are several extra logging methods available for use.
### Available always
* `videojs.log.debug` - Adds a `debug` message
* `videojs.log.warn` - Adds a `warn` message
* `videojs.log.info` - Adds an `info` message. This one is equivalent to `videojs.log` itself
* `videojs.log.error` - Adds an `error` message

### Available after the debugger has been opened
* `videojs.log.resize` - Toggles the size of the debugger window
* `videojs.log.clear` - Clears the current output in the debugger window
* `videojs.log.move` - Moves the debugger window to the next corner
* `videojs.log.profile` - Adds a <code>profile</code> message

## Known issues

* Email: To test emailing the log, you will need to supply a recipient's email address when your email client opens.
* Email: Currently, email does not format the log dump.  The contents of the email are the contents of the array of Strings, separated by commas.  Would formatting be handled better on the server side?
