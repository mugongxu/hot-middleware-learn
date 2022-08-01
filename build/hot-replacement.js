function hotDownloadManifest() {
  return new Promise((resolve, reject) => {
    if (typeof XMLHttpRequest === 'undefined') {
      reject(new Error('No browser support'));
    }
    try {
      var request = new XMLHttpRequest();
      var requestPath = `http://localhost:3000/app.${__webpack_hash__}.hot-update.json`;
      request.open("GET", requestPath, true);
	  request.timeout = 10000;
	  request.send(null);
    } catch(err) {
      reject(err);
    }
    request.onreadystatechange = function() {
      if (request.readyState !== 4) return;
      if (request.status === 0) {
        // timeout
        reject(new Error('Manifest request to ' + requestPath + ' timed out.'));
      } else if (request.status === 404) {
        resolve();
      } else if(request.status !== 200 && request.status !== 304) {
        // other failure
        reject(new Error("Manifest request to " + requestPath + " failed."));
      } else {
        // success
        try {
          var update = JSON.parse(request.responseText);
        } catch(e) {
          reject(e);
          return;
        }
        resolve(update);
      }
    }
  });
}

function hotDownloadUpdateChunk(chunkId) {
  var head = document.getElementsByTagName('head')[0];
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.charset = 'utf-8';
  script.src = `http://localhost:3000/${chunkId}.${__webpack_hash__}.hot-update.js`;
  head.appendChild(script);
}

module.exports = {
  hotDownloadManifest: hotDownloadManifest,
  hotDownloadUpdateChunk: hotDownloadUpdateChunk
};
