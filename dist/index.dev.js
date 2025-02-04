"use strict";

var express = require("express");

var path = require("path");

var fs = require("fs");

var sharp = require("sharp");

var app = express();
var PORT = 8080;
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
console.log("Folder index.js:", __dirname);
console.log("Folder curent (de lucru):", process.cwd());
console.log("Cale fișier:", __filename); // Obiect global pentru gestionarea erorilor

var obGlobal = {
  obErori: null
}; // Crearea folderelor necesare

var vectorFoldere = ["temp", "poze_uploadate", "backup", "temp1"];

for (var _i = 0, _vectorFoldere = vectorFoldere; _i < _vectorFoldere.length; _i++) {
  var folder = _vectorFoldere[_i];
  var folderCaleAbsoluta = path.join(__dirname, folder);

  if (!fs.existsSync(folderCaleAbsoluta)) {
    fs.mkdirSync(folderCaleAbsoluta);
  }
} // Servirea fișierelor statice


app.use("/resurse", express["static"](path.join(__dirname, "resurse"))); // Ruta corectă pentru favicon.ico

app.get("/favicon.ico", function (_req, res) {
  res.sendFile(path.join(__dirname, "resurse/imagini/ico/favicon.ico"));
}); // Permite accesul la pagina principală de pe mai multe rute

app.get(["/", "/index", "/home"], function (req, res) {
  res.render("pagini/index", {
    ip: req.ip
  });
}); // Blocare acces direct la resurse fără fișier specificat

app.get(/^\/resurse\/[a-z0-9A-Z/_-]+$/i, function (_req, res) {
  afisareEroare(res, 403);
}); // Interzicere acces fișiere `.ejs`

app.get("/*.ejs", function (_req, res) {
  afisareEroare(res, 400);
}); // Rută pentru orice altceva (pagini dinamice)

app.get("/*", function (req, res) {
  var pagina = req.url;
  var filePath = path.join(__dirname, "views", "pagini", pagina + ".ejs");

  if (!fs.existsSync(filePath)) {
    return afisareEroare(res, 404, "Pagina negăsită", "Verificați calea URL-ului");
  }

  res.render("pagini" + pagina, function (err, rezRandare) {
    if (err) {
      return afisareEroare(res, 404, "Pagina negăsită", "Verificați calea URL-ului");
    }

    res.send(rezRandare);
  });
}); // Inițializare erori

initErori();

function initErori() {
  try {
    var continut = fs.readFileSync(path.join(__dirname, "resurse/json/erori.json"), "utf-8");
    obGlobal.obErori = JSON.parse(continut);
    obGlobal.obErori.eroare_default.imagine = "/resurse/imagini/erori/" + obGlobal.obErori.eroare_default.imagine;
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = obGlobal.obErori.info_erori[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var eroare = _step.value;
        eroare.imagine = "/resurse/imagini/erori/" + eroare.imagine;
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator["return"] != null) {
          _iterator["return"]();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  } catch (err) {
    console.error("Eroare la citirea fișierului erori.json:", err);
  }
} // Funcție pentru afișarea erorilor


function afisareEroare(res, identificator, titlu, text, imagine) {
  var eroare = obGlobal.obErori.info_erori.find(function (e) {
    return e.identificator === identificator;
  }) || obGlobal.obErori.eroare_default; // Verifică dacă imaginea există, altfel folosește una default

  var imaginePath = path.join(__dirname, "resurse/imagini/erori", eroare.imagine.split("/").pop());

  if (!fs.existsSync(imaginePath)) {
    eroare.imagine = "/resurse/imagini/erori/interzis.png"; // Imagine default
  }

  res.status(eroare.status ? identificator : 400).render("pagini/eroare", {
    titlu: titlu || eroare.titlu,
    text: text || eroare.text,
    imagine: eroare.imagine
  });
} // Pornire server


app.listen(PORT, function () {
  console.log("Serverul ruleaz\u0103 la http://localhost:".concat(PORT));
});
//# sourceMappingURL=index.dev.js.map
