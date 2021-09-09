//jshint esversion:6

const express = require("express");
const mongoose = require('mongoose');
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect('mongodb://localhost:21017/todolistDB');
}

const itemsSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model('Item', itemsSchema);

const item1 = new Item({
  name: 'Buy Food'
});

const item2 = new Item({
  name: 'Cook Food'
});

const item3 = new Item({
  name: 'Eat Food'
});

app.get("/", function(req, res) {

const day = date.getDate();

  res.render("list", {listTitle: day, newListItems: items});

});

const defaultItems = [item1, item2, item3];

const insertData = (defaultItems) => {
  return new Promise((res, rej) => {
    Item.insertMany(defaultItems, (err) => {
      if(err){
        console.error(err);
        rej('Error!');
      } else {
        console.log('New entries are added to the database!');
        res();
      }
    });
  });
};

const asyncFunctions = async () => {
  try{
    await insertData(defaultItems);
    console.log(items);

    items.forEach(item => {
      console.log(item.name)
    });

    mongoose.connection.close();

  } catch(err) {};
};

asyncFunctions();

app.post("/", function(req, res){

  const item = req.body.newItem;

  if (req.body.list === "Work") {
    workItems.push(item);
    res.redirect("/work");
  } else {
    items.push(item);
    res.redirect("/");
  }
});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
