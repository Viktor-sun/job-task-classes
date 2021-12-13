// const path = require("path");
// const fs = require("fs");
// const http = require("http");

// http
//   .createServer(function (req, res) {
//     fs.readFile(path.join("../", "index.html"), function (err, data) {
//       if (err) {
//         res.writeHead(404);
//         res.end(JSON.stringify(err));
//         return;
//       }
//       res.writeHead(200);
//       res.end(data);
//     });
//   })
//   .listen(8010, () => console.log("server ranning"));

const express = require("express");
const app = express();
const path = require("path");

app.use(express.static(path.resolve(__dirname, "public")));

app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "./", "public", "index.html"));
});

app.listen(8010, () => console.log("server ranning"));
