const fs = require("fs");
const url = require("url");
const http = require("http");

const {
  crearUsuario,
  consultaUsuarios,
  editUsuario,
  eliminarUsuario,
  transferencia,
  consultaTransferencia,
} = require("./db/pool.js");

const server = http.createServer(async (req, res) => {
  if (req.url == "/" && req.method === "GET") {
    res.setHeader("content-type", "text/html");
    const html = fs.readFileSync("index.html", "utf8");
    res.end(html);
  }

  if (req.url.includes("/usuario") && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", async () => {
      const datos = Object.values(JSON.parse(body));
      const result = await crearUsuario(datos);

      if (!result.ok) {
        res.writeHead(500, { "Content-type": "application/json" });
        return res.end(JSON.stringify(result.data));
      }
      res.writeHead(201, { "Content-type": "application/json" });
      res.end(JSON.stringify(result.data));
    });
  }

  if (req.url.includes("/usuarios") && req.method === "GET") {
    const result = await consultaUsuarios();
    if (!result.ok) {
      res.writeHead(500, { "Content-type": "application/json" });
      res.end(JSON.stringify(result.data));
    }
    res.writeHead(200, { "Content-type": "application/json" });
    res.end(JSON.stringify(result.data));
  }

  if (req.url.includes("/usuario") && req.method === "PUT") {
    const { id } = url.parse(req.url, true).query;
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", async () => {
      const { name, balance } = JSON.parse(body);
      const result = await editUsuario({ id, name, balance });

      if (!result.ok) {
        res.writeHead(500, { "Content-type": "application/json" });
        return res.end(JSON.stringify(result.data));
      }
      if (result.data.length === 0) {
        res.writeHead(403, { "Content-type": "application/json" });
        return res.end(
          JSON.stringify({
            error: "ID inexistente",
          })
        );
      }
      res.writeHead(200, { "Content-type": "application/json" });
      res.end(JSON.stringify(result.data));
    });
  }

  if (req.url.includes("/usuario") && req.method === "DELETE") {
    const { id } = url.parse(req.url, true).query;
    const result = await eliminarUsuario([id]);

    if (!result.ok) {
      res.writeHead(500, { "Content-type": "application/json" });
      return res.end(JSON.stringify(result.data));
    }

    if (result.data.length === 0) {
      res.writeHead(403, { "Content-type": "application/json" });
      return res.end(
        JSON.stringify({
          error: "ID inexistente",
        })
      );
    }
    res.writeHead(200, { "Content-type": "application/json" });
    res.end(JSON.stringify(result.data));
  }

  if (req.url.includes("/transferencia") && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", async () => {
      const { emisor, receptor, monto } = JSON.parse(body);
      const result = await transferencia(emisor, receptor, monto);

      if (!result.ok) {
        res.writeHead(400, { "Content-type": "application/json" });
        res.end(JSON.stringify(result.data));
      }
      res.writeHead(200, { "Content-type": "application/json" });
      res.end(JSON.stringify(result.data));
    });
  }

  if (req.url.includes("/transferencias") && req.method === "GET") {
    const result = await consultaTransferencia();
    res.end(JSON.stringify(result.data));
  }
});
server.listen(3000, () => console.log("Servidor arriba!"));
