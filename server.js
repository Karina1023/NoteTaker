const express = require('express');
const path = require('path');
const fs = require("fs");
const util = require("util");

var exp = express();
var PORT = process.env.PORT || 80;

exp.use(express.urlencoded({extended: true}));
exp.use(express.json());
exp.use(express.static(__dirname + '/public'));

const writeFileAsync = util.promisify(fs.writeFile);
const readFileAsync = util.promisify(fs.readFile);

exp.get("/", function(req,res) {
    res.sendFile(path.join(__dirname, '/public/index.html'), err =>{
        if(err){
            console.error("Could not get public/notes.html file, ", err);
            res.sendStatus(400);
        }
    });
});

exp.get("/api/notes", async (req, res) => {
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

exp.get("/api/notes/:id", async (req, res) =>{
    try{
        let objectToShow = req.params;
        let idToShow = parseInt(objectToShow.id);
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
        return res.json(200);
    }
    catch (e) {
        console.log('error : ' + e);
        res.sendStatus(400);
    }
});

exp.delete("/api/notes/:id", async (req, res) => {
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

exp.listen(PORT, function() {
    console.log('App listening on PORT ${PORT}');
});