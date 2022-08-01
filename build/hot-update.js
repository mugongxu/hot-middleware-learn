var { hotDownloadManifest, hotDownloadUpdateChunk } = require('./hot-replacement');

if (!module.hot) {
  throw new Error('[HMR] Hot Module Replacement is disabled.');
}

var lastHash;
var applyOptions = {
  ignoreUnaccepted: true,
  ignoreDeclined: true,
  ignoreErrored: true,
  onUnaccepted: function (data) {
    console.warn(
      'Ignored an update to unaccepted module ' + data.chain.join(' -> ')
    );
  },
  onDeclined: function (data) {
    console.warn(
      'Ignored an update to declined module ' + data.chain.join(' -> ')
    );
  },
  onErrored: function (data) {
    console.error(data.error);
    console.warn(
      'Ignored an error while updating module ' +
        data.moduleId +
        ' (' +
        data.type +
        ')'
    );
  },
};

function upToDate(hash) {
  if (hash) lastHash = hash;
  return lastHash == __webpack_hash__;
}

// 热更新文件更新
module.exports = function(hash, moduleMap, options) {
  var reload = options.reload;
  // hash值不同 && 该进程正在等待调用 check
  console.log(hash, moduleMap, options)
  console.log(__webpack_require__.p);
  if (!upToDate(hash) && module.hot.status() == 'idle') {
    // 开始检测更新
    hotDownloadManifest().then(update => {
      console.log('update:', update);
      let hotAvailableFilesMap = update.c || {};
      Object.keys(hotAvailableFilesMap).forEach(chunkId => {
        hotDownloadUpdateChunk(hotAvailableFilesMap[chunkId]);
      });
    });
    // 原方法
    // check();
  }

  function check() {
    console.log('进来了');
    module.hot.check(false).then(outdatedModules => {
      // 过时的模块
      console.log('outdatedModules:', outdatedModules);
      if (!outdatedModules) {
        if (options.warn) {
          console.warn('[HMR] Cannot find update (Full reload needed)');
          console.warn('[HMR] (Probably because of restarting the server)');
        }
        performReload();
        return;
      }
      // apply
      module.hot.apply(applyOptions).then(renewedModules => {
        // 已更新的模块
        console.log('apply:', renewedModules);
        // 如果有模块还没更新，继续检查
        if (!upToDate()) check();

        // 对比查找还有那些文件没更新
        logApplyResult(outdatedModules, renewedModules);

        if (upToDate()) {
          console.log('[HMR] App is up to date');
        }
      }).catch(error => {
        handleError(error); 
      });
    }).catch(error => {
      // 捕获错误
      handleError(error);
    });
  }

  function logApplyResult(outdatedModules, renewedModules) {
    // 对比查找出unacceptedModules
    var unacceptedModules = outdatedModules.filter(function(moduleId) {
      return renewedModules && !renewedModules.includes(moduleId);
    });
    
    // 存在未更新的，刷新页面
    if (unacceptedModules.length > 0) {
      performReload(); 
    }
  }

  var failureStatuses = { abort: 1, fail: 1 };
  function handleError(err) {
    if (module.hot.status() in failureStatuses) {
      performReload();
    }
  }

  function performReload() {
    if (reload) {
      window.location.reload();
    }
  }
}

