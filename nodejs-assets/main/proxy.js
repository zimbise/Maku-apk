const http = require("http");
const https = require("https");

http.createServer((req, res) => {
  const target = decodeURIComponent(req.url.slice(1));
  const client = target.startsWith("https") ? https : http;

  client.get(target, proxyRes => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  }).on("error", err => {
    res.writeHead(500);
    res.end("Proxy error: " + err.message);
  });
}).listen(10000, () => {
  console.log("🚀 Embedded proxy running on port 10000");
});
