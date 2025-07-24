const http = require('http');
const fs = require('fs');
const WebSocket = require('ws');
const path = require('path');

const server = http.createServer((req, res) => {
  if (req.url === '/') {
    fs.readFile('./index.html', (err, data) => {
      if (err) return res.writeHead(500).end('Server Error');
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
  } else if (req.url === '/ranking.csv') {
    fs.readFile('./ranking.csv', (err, data) => {
      if (err) return res.writeHead(404).end('Not Found');
      res.writeHead(200, { 'Content-Type': 'text/csv' });
      res.end(data);
    });
  } else {
    res.writeHead(404).end('Not Found');
  }
});

const wss = new WebSocket.Server({ server });

wss.on('connection', ws => {
  console.log('Client connected');
  const sendCSV = () => {
    fs.readFile('./ranking.csv', 'utf8', (err, data) => {
      if (!err) ws.send(data);
    });
  };

  // 初始送一次
  sendCSV();

  // 每 5 秒自動檢查
  const interval = setInterval(sendCSV, 5000);

  ws.on('close', () => clearInterval(interval));
});

server.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});
