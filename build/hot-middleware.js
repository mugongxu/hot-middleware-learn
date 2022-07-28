var parse = require('url').parse;

var pathMatch = function(url, path) {
  try {
    return parse(url).pathname === path;
  } catch (e) {
    return false;
  }
};

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
    publishStats('built', statsResult, eventStream);
  }

  var middleware = function(req, res, next) {
    // 只有符合路径的才创建EventStream请求
    if (!pathMatch(req.url, opts.path)) return next();
    // eventStream创建请求
    eventStream.handler(req, res);
  }

  middleware.publish = function(payload) {
    eventStream.publish(payload);
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
      console.log('编译成功：', payload.action);
      Object.keys(clients).forEach(function(id) {
        console.log('开始发送-------', JSON.stringify(payload));
        clients[id].write('data: ' + JSON.stringify(payload) + '\n\n');
      });
    }
  };
}

function publishStats(action, statsResult, eventStream, log) {
  var stats = statsResult.toJson({
    all: false,
    cached: true,
    children: true,
    modules: true,
    timings: true,
    hash: true,
  });
  var bundles = [stats];
  if (stats.modules) bundles = [stats];
  if (stats.children && stats.children.length) bundles = stats.children;

  bundles.forEach(stat => {
    var name = stat.name || '';

    var map = {};
    (stats.modules || []).forEach(module => {
      map[module.id] = module.name;
    });
    
    eventStream.publish({
      name: name,
      action: action,
      time: stats.time,
      hash: stats.hash,
      warnings: stats.warnings || [],
      errors: stats.errors || [],
      modules: map,
    });
  });
}
