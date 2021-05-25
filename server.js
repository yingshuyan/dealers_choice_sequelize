const express = require("express");
const app = express();
const {
  syncAndSeed,
  models: { Book, Author, Reader },
} = require("./db");
const { red, blueBright } = require("chalk");

const path = require("path");

//body parsing; json and urlencoding
//static file under public folder
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "/public")));

app.get("/books", async (req, res, next) => {
  try {
    const bookList = await Book.findAll({
      include: {
        all: true,
      },
    });
    res.send(bookList);
  } catch (er) {
    next(er);
  }
});

app.get("/readers", async (req, res, next) => {
  try {
    const readerList = await Reader.findAll({
      include: {
        all: true,
      },
    });
    res.send(readerList);
  } catch (er) {
    next(er);
  }
});

const port = 1337;
app.listen(1337, () => {
  syncAndSeed();
  console.log(blueBright(`app is listening at port:${port}`));
});
