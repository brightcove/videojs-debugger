var baseUrl = window.__karma__ ? '/base/' : '../';

module('Debugger', {
  beforeEach: function(assert) {
    var done = assert.async();
    this.fixture = document.createElement('div');
    document.body.appendChild(this.fixture);

    var video = document.createElement('video');
    video.width = 600;
    video.height = 600;
    this.fixture.appendChild(video);
    this.player = videojs(video);
    this.player.ready(done);
  },
  afterEach: function() {
    this.fixture.innerHTML = '';
    this.player.dispose();
  }
});

test('debugger loads', function(assert) {
  var player = this.player;
  var done = assert.async();

  assert.ok(player.debuggerWindow, 'debugger plugin is registered');

  player.debuggerWindow({
    js: baseUrl + 'src/js/debugger.js',
    css: baseUrl + 'src/css/debugger.css'
  });

  player.debuggerWindow.loadDebugger();

  assert.ok(document.querySelector('script[src*="debug"]'), 'debugger script loaded');
  assert.ok(document.querySelector('link[href*="debug"]'), 'debugger stylesheet loaded');

  done();
});
