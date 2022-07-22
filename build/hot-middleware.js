module.exports = function(compiler, opts) {
  opts = opts || {};
  opts.path = opts.path || '/__webpack_hmr';

  // 创建链接
  var eventStream = createEventStream();

  // 监听webpack编译
  if (compiler.hooks) {
    compiler.hooks.invalid.tap('hot-middleware', onInvalid);
    compiler.hooks.done.tap('hot-middleware', onDone)
  } else {
    compiler.plugin('invaild', onInvalid);
    compiler.plugin('done', onDone);
  }

  function onInvalid() {}

  function onDone(statsResult) {
    // 发送更新命令
    publishStats('build', statsResult, eventStream);
  }

  var middleware = function(req, res, next) {
    // eventStream创建请求
    eventStream.handler(req, res);
  }

  return middleware;
};

function createEventStream() {
  var clientId = 0;
  var clients = {};

  return {
    close: function() {},
    handler: function(req, res) {
      var headers = {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'text/event-stream;charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'X-Accel-Buffering': 'no',
      };      
      var isHttp1 = !(parseInt(req.httpVersion) >= 2);
      if (isHttp1) {
        req.socket.setKeepAlive(true);
        Object.assign(headers, {
          Connection: 'keep-alive',
        });
      }      
      res.writeHead(200, headers);
      res.write('\n');
      var id = clientId++;
      clients[id] = res;
      req.on('close', function() {
        if (!res.finished) res.end();
        delete clients[id];
      });
    },
    publish: function(payload) {
      Object.keys(clients).forEach(function(id) {
        clients[id].write('data: ' + JSON.stringify(payload) + '\n\\n');
      });
    }
  };
}

function publishStats(action, statsResult, eventStream, log) {
  console.log(action, statsResult, eventStream, log);
}
