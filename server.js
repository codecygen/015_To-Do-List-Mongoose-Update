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

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
});

const Item = mongoose.model("Item", itemsSchema);

const List = mongoose.model('List', listSchema);

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

const deleteOneData = (deleteObj) => {
  Item.deleteOne({ _id: deleteObj }, err => {
    if(err) {
      console.error(err);
    } else {
      console.log('An item is successfully deleted!');
      asyncUpdateList();
    }
  });
};

let listItemsRender = [];

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

const asyncUpdateList = async () => {
  let foundItems = await findData();
  listItemsRender = [];

  foundItems.forEach(foundItem => {
    listItemsRender.push(foundItem);
    console.log(foundItem.name)
  });
};

app.get("/", function(req, res) {

  const day = date.getDate();

  res.render("list", {listTitle: day, newListItems: listItemsRender});

});

app.post('/', (req, res) => {
  const itemName = req.body.newItem;
  // Because the value of the submit button is listTitle,
  // listName will be equal to listTitle for any specific page!
  const listName = req.body.list;
  console.log(listName);

  const item = new Item({
    name: itemName,
  });

  if(listName === date.getDate()) {
    item.save((err) => {
      if(!err) {
        asyncUpdateList();
      }
    });

    res.redirect('/');
  } else {
    List.findOne({ name: listName}, (err, foundList) => {
      foundList.items.push(item);
      foundList.save();
      res.redirect(`/${listName}`);
    });
  }

});

// When checkbox is checked, delete the checked entry
// Also see list.ejs form which contains checkbox to understand this
app.post('/delete', (req, res) => {
  const checkedItemId = req.body.checkbox;

  deleteOneData(checkedItemId);

  res.redirect('/');
});

app.get("/about", function(req, res){
  res.render("about");
});

// Whatever is entered to the browser after slash, will be saved as a customListName
app.get('/:customListName', (req, res) => {
  
  const customListName = req.params.customListName;

  // If you want to get rid of favicon.ico to be added to lists
  // <link rel="icon" href="data:,"> use this on header.ejs partial file.
  // you're instructing the browser to not follow its default behavior of 
  // looking for the icon in the root directory, but instead to try to load it 
  // from the specified Data URL (which in this case is empty).
  List.findOne({ name: customListName }, (err, list) => {
    if(err) {
      console.error(err);
    } else {
      if(!list) {
        const list = new List({
          name: customListName,
          items: defaultItems
        });
      
        list.save((err) => {
          if(!err) {
            console.log('List is successfully saved!!');
            res.redirect(`/${customListName}`);
          }
        });
        
      } else {
        res.render("list", {listTitle: `${list.name}`, newListItems: list.items});
      }
    }
  });
  
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
