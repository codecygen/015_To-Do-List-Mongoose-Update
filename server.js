//jshint esversion:6

const express = require("express");
const mongoose = require('mongoose');
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect("mongodb://localhost:27017/arasDB");
}

const itemsSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Buy Food"
});

const item2 = new Item({
  name: "Cook Food"
});

const item3 = new Item({
  name: "Eat Food"
});

const defaultItems = [item1, item2, item3];

const insertData = defaultItems => {
  return new Promise((res, rej) => {
    Item.insertMany(defaultItems, (err) => {
      if(err){
        console.error(err);
        rej('Error in insertMany!');
      } else {
        console.log('New entries are added to the database!');
        res();
      }
    });    
  });
};

const findData = () => {
  return new Promise((res,rej) => {
    Item.find((err, items) => {
      if(err) {
        console.error(err);
        rej([]);
      } else {
        console.log("New entries found!");
        res(items);
      }
    });
  });
};

const listItemsRender = [];

const asyncFuncs = async () => {
  try {
    let foundItems = await findData();

    if(foundItems.length === 0) {
      await insertData(defaultItems);
      foundItems = await findData();
    }

    console.log(foundItems.length);

    foundItems.forEach(foundItem => {
      listItemsRender.push(foundItem);
      console.log(foundItem.name)
    });
  } catch (error) {};
};

asyncFuncs();

app.get("/", function(req, res) {

  const day = date.getDate();

  res.render("list", {listTitle: day, newListItems: listItemsRender});

});

app.post("/", function(req, res){

  const item = req.body.newItem;

  if (req.body.list === "Work") {
    workItemsRender.push(item);
    res.redirect("/work");
  } else {
    const newListItemRender = new Item({
      name: item
    });

    newListItemRender.save();

    listItemsRender.push(newListItemRender);
    res.redirect("/");
  }
});

// When checkbox is checked, delete the checked entry
// Also see list.ejs form which contains checknox to understand this
app.post('/delete', (req, res) => {
  const checkedItemId = req.body.checkbox;

  Item.deleteOne({ _id: checkedItemId }, err => {
    if(err) {
      console.error(err);
    } else {
      console.log('An item is successfully deleted!');
      res.redirect('/');
    }
  });
});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItemsRender});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
