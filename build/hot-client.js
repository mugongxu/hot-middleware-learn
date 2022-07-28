require('eventsource-polyfill');
// 热更新客户端
var options = {
  path: '/__webpack_hmr',
  timeout: 20 * 1000,
  overlay: true,
  reload: true,
  log: true,
  warn: true,
  name: '',
  autoConnect: true,
  overlayStyles: {},
  overlayWarnings: false,
  ansiColors: {},
};

function EventSourceWrapper() {
  var source;
  // 多页面打开回调监听
  var listeners = [];

  // 创建EventSource实例
  function init() {
    source = new window.EventSource(options.path);
    source.onopen = handleOnopen;
    source.onerror = handleOnerror;
    source.onmessage = handleOnmessage;
  }

  function handleOnopen() {
    console.log('[HMR] connected')
  }

  function handleOnerror() {
    // 错误关闭
    source.close();
    // 重启
    setTimeout(init, options.timeout);
  }

  function handleOnmessage(event) {
    // 执行回调
    listeners.forEach(listener => {
      listener(event);
    });
  }

  init();

  return {
    addMessageListener(fn) {
      listeners.push(fn);
    }
  };
}

function getEventSourceWrapper() {
  // 缓存eventSource实例
  if (!window.__whmEventSourceWrapper) {
    window.__whmEventSourceWrapper = {};
  }
  if (!window.__whmEventSourceWrapper[options.path]) {
    window.__whmEventSourceWrapper[options.path] = EventSourceWrapper();
  }
  return window.__whmEventSourceWrapper[options.path];
}

function connect() {
  getEventSourceWrapper().addMessageListener(function(event) {
    // 更新数据
    processMessage(JSON.parse(event.data));
  });
}

// 链接执行
connect();

var processUpdate = require('./hot-update');

// 更新执行
function processMessage(data) {
  switch(data.action) {
    case 'building':
    break;
    case 'built':
    case 'sync':
      // 更新数据
      processUpdate(data.hash, data.modules, options);
    break;
    default:
      if (data.action === 'reload') {
        window.location.reload()
      }
    break;
  }
}
