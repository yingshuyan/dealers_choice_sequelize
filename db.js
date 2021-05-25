const Sequelize = require("sequelize");
const db = new Sequelize("postgres://localhost/dealers_choice_db", {
  logging: false,
});
const {
  DataTypes: { STRING, INTEGER, UUID, UUIDV4 },
} = Sequelize;
const { red, blue } = require("chalk");

book = [
  { name: "Macbeth" },
  { name: "Othello" },
  { name: "The_Count_of_Monte_Cristo" },
  { name: "The_Three_Musketeers" },
  { name: "Pride_and_Prejudice" },
];
author = [
  { name: "William_Shakespeare" },
  { name: "Alexandre_Dumas" },
  { name: "Jane_Austen" },
];
reader = [
  { name: "lucy" },
  { name: "moe" },
  { name: "larry" },
  { name: "ethyl" },
];

const Book = db.define("book", {
  id: {
    type: UUID,
    allowNull: false,
    defaultValue: UUIDV4,
    primaryKey: true,
  },
  name: {
    type: STRING,
    allowNull: false,
  },
  purchaseURL: {
    type: STRING,
  },
});

const Author = db.define("author", {
  id: {
    type: UUID,
    allowNull: false,
    defaultValue: UUIDV4,
    primaryKey: true,
  },
  name: {
    type: STRING,
    allowNull: false,
  },
});

const Reader = db.define("reader", {
  id: {
    type: UUID,
    allowNull: false,
    defaultValue: UUIDV4,
    primaryKey: true,
  },
  name: {
    type: STRING,
    allowNull: false,
  },
});

// one to many: Author to Book
Book.belongsTo(Author);
Author.hasMany(Book);

//many to many: Reader to Book.
Book.belongsToMany(Reader, { through: "book_readers" });
Reader.belongsToMany(Book, { through: "book_readers" }); // uses belongsToMany two times to have many-to-many associations through same table.

// one associate to oneself Reader belongs to Reader one to many
Reader.belongsTo(Reader, {
  as: "following",
  foreignkey: "followingId",
});
// Reader.hasMany(Reader, {
//   as: "follower",
//   foreignkey: "followerId",
// });

const syncAndSeed = async () => {
  // drop the tables if exist
  await db.sync({ force: true });
  //create the tables and feed data
  await Book.bulkCreate(book);
  await Author.bulkCreate(author);
  await Reader.bulkCreate(reader);

  // destructuring all promise into variables
  const [[m, o, tcmc, ttp, pap], [ws, ad, ja], [lucy, moe, larry, ethyl]] =
    await Promise.all([Book.findAll(), Author.findAll(), Reader.findAll()]);

  await Promise.all([
    ws.setBooks([m, o]),
    ad.setBooks([tcmc, ttp]),
    ja.setBooks([pap]),

    // addReaders is created new rows in the many-to-many table
    m.addReaders([lucy, moe, larry]),
    o.addReaders([lucy, ethyl]),
    tcmc.addReaders([moe, ethyl]),
    ttp.addReaders([moe]),
    pap.addReaders([lucy, ethyl]),

    lucy.setFollowing(moe),
    moe.setFollowing(ethyl),
    larry.setFollowing(lucy),
    ethyl.setFollowing(lucy),
    // lucy.setFollower(larry),
    // moe.setFollower(ethyl),
    // larry.setFollower(moe),
    // ethyl.setFollower(lucy),
  ]);
};

module.exports = {
  syncAndSeed,
  models: { Book, Author, Reader },
};
