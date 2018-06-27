if (typeof(self) !== 'undefined' && typeof(self.onmessage) !== 'undefined') {
    self.onmessage = function(event) {
        var args = event.data
        var task = args[0]
        var httpCache = args[1]
        var lastProgress = 0;
        var lastSummary = "";
        var backtestFunc = null;

        if (typeof(VBacktest) === 'undefined') {
            importScripts("env.js", "decimal.min.js", "underscore-min.js", "math.min.js", "sandbox_cpp.js");
        }
        var httpGet = function(path) {
            var r = XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP")
            r.open("GET", "https://www.botvs.com"+path, false)
            r.send(null)
            return r.responseText
        };
        VBacktest().VTask(task, httpCache, httpGet, function(st) {
            if (typeof(st['TaskStatus']) !== 'undefined' && st['TaskStatus'] == 1) {
                st['httpCache'] = httpCache;
            }
            if (st['TaskStatus'] == 1) {
                self.postMessage({ ret: st });
            } else {
                var nowProgress = st.Progress.toFixed(1);
                if (nowProgress != lastProgress || lastSummary !== st.statusStr) {
                    lastProgress = nowProgress;
                    lastSummary = st.statusStr;
                    self.postMessage({ ret: st });
                }
            }
        });
    };
} else {
    var fs = require("fs");
    var os = require("os");
    var process = require("process");
    var CLUSTER_IP = process.env["CLUSTER_IP"] ||  "120.27.135.154"
    var CLUSTER_DOMAIN = process.env["CLUSTER_DOMAIN"] || "q.botvs.net"

    var _session = s;
    var request = require('/usr/local/lib/node_modules/sync-request');

    var _ = this._;
    var math = this.math;
    var Decimal = this.Decimal;

    var crypto = require('crypto');
    function md5 (text) {
        return crypto.createHash('md5').update(text).digest('hex');
    }

    var httpGet = function(url) {
        var tmpCache = os.tmpdir() + '/cache'
        if (!fs.existsSync(tmpCache)) {
            fs.mkdirSync(tmpCache);
        }
        url = "http://" + CLUSTER_IP + url;
        var cacheFile = tmpCache + '/botvs_kline_'+md5(url);
        if (fs.existsSync(cacheFile)) {
            return fs.readFileSync(cacheFile, 'utf-8');
        }
        var request = require('/usr/local/lib/node_modules/sync-request');
        var res = request('GET', url, {headers:{'Host': CLUSTER_DOMAIN}});
        var body = res.getBody('utf8');
        if (body && body.indexOf(',') !== -1) {
            fs.writeFileSync(cacheFile, body, 'utf-8');
        }
        return body
    }

    function notify(msgType, msg) {
        var b = Buffer.from(msg)
        var h = Buffer.allocUnsafe(8);
        h.writeUInt32BE(msgType, 0);
        h.writeUInt32BE(b.length, 4);
        _session.write(Buffer.concat([h, b]));
    }
    VBacktest().VTask(__cfg__, null, httpGet, function(st) {
            notify(st['TaskStatus'], JSON.stringify(st));
        });
    _session.end();
}
