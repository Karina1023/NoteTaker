const express = require('express');
const path = require('path');
const fs = require("fs");
const util = require("util");

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(express.static('public'));

const writeFileAsync = util.promisify(fs.writeFile);
const readFileAsync = util.promisify(fs.readFile);

app.get("/", function(req,res) {
    res.sendFile(path.join(__dirname, '/public/index.html'), err =>{
        if(err){
            console.error("Could not get public/notes.html file, ", err);
            res.sendStatus(400);
        }
    });
});

app.get("/notes", function(req,res) {
    res.sendFile(path.join(__dirname, '/public/notes.html'), err =>{
        if(err){
            console.error("Could not get public/notes.html file, ", err);
            res.sendStatus(400);
        }
    });
});


app.get("/api/notes", async (req, res) => {
    try{
        let noteList = await readFileAsync(path.join(__dirname, "./db/db.json"), "utf8");
        console.log(JSON.parse(noteList));
        if(!noteList){
            noteList = '';
        }
        else{
            noteList = JSON.parse(noteList);
        }
        return res.json(noteList);
    }
    catch (e) {
        console.log(`exp.get("/api/notes", async (req, res) => ` + e);
        res.sendStatus(400);
    }
});

app.post("/api/notes", async (req, res) =>{
    try{
        let noteToAdd = req.body;
        let noteList = await readFileAsync(path.join(__dirname, "./db/db.json"), "utf8");
        if(!noteList){
            noteList = [];
            return;
        }
        else{
            noteList = JSON.parse(noteList);
        }
        noteToAdd.id = noteList.length + 1;
        noteList.push(noteToAdd);
        await writeFileAsync(path.join(__dirname, "./db/db.json"), JSON.stringify(noteList));
        return res.json(noteToAdd);
    }
    catch (e) {
        console.log('error : ' + e);
        res.sendStatus(400);
    }
});

app.delete("/api/notes/:id", async (req, res) => {
    try{
        let objectToDelete = req.params;
        let idToDelete = parseInt(objectToDelete.id);

        let noteList = await readFileAsync(path.join(__dirname, "./db/db.json"), "utf8");
        if (!noteList){
            noteList = [];
            return;
        }
        else{
            noteList = JSON.parse(noteList);
        }
        let noteToDeleteIndex = noteList.findIndex(note => note.id ===idToDelete);
        noteList.splice(noteToDeleteIndex, 1);

        for (let note of noteList) {
            note.id = noteList.indexOf(note) + 1;
        }
        await writeFileAsync(path.join(__dirname, "./db/db.json"), JSON.stringify(noteList));
        res.sendStatus(200);
    }
    catch (e) {
        console.log("Error in deleting note, ", e);
        res.sendStatus(400);
    }
});

app.listen(PORT, () => {
    console.log(`App listening on PORT ${PORT}`);
});