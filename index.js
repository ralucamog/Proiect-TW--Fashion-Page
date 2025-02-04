const express = require("express");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");


const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

console.log("Folder index.js:", __dirname);
console.log("Folder curent (de lucru):", process.cwd());
console.log("Cale fișier:", __filename);

// Obiect global pentru gestionarea erorilor
let obGlobal = { obErori: null };

// Crearea folderelor necesare
const vectorFoldere = ["temp", "poze_uploadate", "backup", "temp1"];
for (const folder of vectorFoldere) {
    const folderCaleAbsoluta = path.join(__dirname, folder);
    if (!fs.existsSync(folderCaleAbsoluta)) {
        fs.mkdirSync(folderCaleAbsoluta);
    }
}

// Servirea fișierelor statice
app.use("/resurse", express.static(path.join(__dirname, "resurse")));


// Ruta corectă pentru favicon.ico
app.get("/favicon.ico", (_req, res) => {
    res.sendFile(path.join(__dirname, "resurse/imagini/ico/favicon.ico"));
});

// Permite accesul la pagina principală de pe mai multe rute
app.get(["/", "/index", "/home"], (req, res) => {
    res.render("pagini/index", { ip: req.ip });
});

// Blocare acces direct la resurse fără fișier specificat
app.get(/^\/resurse\/[a-z0-9A-Z/_-]+$/i, (_req, res) => {
    afisareEroare(res, 403);
});

// Interzicere acces fișiere `.ejs`
app.get("/*.ejs", (_req, res) => {
    afisareEroare(res, 400);
});

// Rută pentru orice altceva (pagini dinamice)
app.get("/*", (req, res) => {
    const pagina = req.url;
    const filePath = path.join(__dirname, "views", "pagini", pagina + ".ejs");

    if (!fs.existsSync(filePath)) {
        return afisareEroare(res, 404, "Pagina negăsită", "Verificați calea URL-ului");
    }

    res.render("pagini" + pagina, (err, rezRandare) => {
        if (err) {
            return afisareEroare(res, 404, "Pagina negăsită", "Verificați calea URL-ului");
        }
        res.send(rezRandare);
    });
});

// Inițializare erori
initErori()

function initErori() {
    try {
        const continut = fs.readFileSync(path.join(__dirname, "resurse/json/erori.json"), "utf-8");
        obGlobal.obErori = JSON.parse(continut);

        obGlobal.obErori.eroare_default.imagine = "/resurse/imagini/erori/" + obGlobal.obErori.eroare_default.imagine;

        for (let eroare of obGlobal.obErori.info_erori) {
            eroare.imagine = "/resurse/imagini/erori/" + eroare.imagine;
        }
    } catch (err) {
        console.error("Eroare la citirea fișierului erori.json:", err);
    }
}

// Funcție pentru afișarea erorilor
function afisareEroare(res, identificator, titlu, text, imagine) {
    let eroare = obGlobal.obErori.info_erori.find(e => e.identificator === identificator) || obGlobal.obErori.eroare_default;

    // Verifică dacă imaginea există, altfel folosește una default
    const imaginePath = path.join(__dirname, "resurse/imagini/erori", eroare.imagine.split("/").pop());
    if (!fs.existsSync(imaginePath)) {
        eroare.imagine = "/resurse/imagini/erori/interzis.png"; // Imagine default
    }

    res.status(eroare.status ? identificator : 400).render("pagini/eroare", {
        titlu: titlu || eroare.titlu,
        text: text || eroare.text,
        imagine: eroare.imagine
    });
}

// Pornire server
app.listen(PORT, () => {
    console.log(`Serverul rulează la http://localhost:${PORT}`);
});
