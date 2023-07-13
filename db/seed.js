// Import necessary functions and the client object from the 'index' file
const {
client,
getAllUsers,
createUser,
createPost,
} = require("./index");

// Create initial users in the database
async function createInitialUsers() {
try {
console.log("Starting to create users");

// Create users with their respective details
const albert = await createUser({
  username: "albert",
  password: "bertie99",
  name: "Albert",
  location: "Yorkshire",
});

const sandra = await createUser({
  username: "sandra",
  password: "2sandy4me",
  name: "Sahandra",
  location: "Sahara Desert",
});

const glamgal = await createUser({
  username: "glamgal",
  password: "soglam",
  name: "Glenda",
  location: "Gloucestershire",
});

console.log(albert);
console.log(sandra);
console.log(glamgal);

console.log("Finished creating users");
} catch (error) {
  console.error("Error creating users:", error.message);
  throw error;
  }
  }
  
  // Drop tables from the database
  async function dropTables() {
  try {
  console.log("Starting to drop tables.");
  await client.query( DROP TABLE IF EXISTS post_tags, tags, users, posts; );
  console.log("Dropped tables!");
  } catch (error) {
  console.error("Error dropping tables:", error.message);
  throw error;
  }
  }
  
  // Create tables in the database
  async function createTables() {
  try {
  console.log("Starting to build tables.");
  await client.query(`
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    active BOOLEAN DEFAULT true
  );

  CREATE TABLE IF NOT EXISTS posts (
    id SERIAL PRIMARY KEY,
    "authorId" INTEGER REFERENCES users(id) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    active BOOLEAN DEFAULT true
  );

  CREATE TABLE IF NOT EXISTS tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL
  );

  CREATE TABLE IF NOT EXISTS post_tags (
    "postId" INTEGER REFERENCES posts(id),
    "tagId" INTEGER REFERENCES tags(id),
    UNIQUE ("postId", "tagId")
  );
`);

console.log("Finished building tables");
} catch (error) {
  console.error("Error building tables:", error.message);
  throw error;
  }
  }
  
  // Create initial posts in the database
  async function createInitialPosts() {
  try {
  console.log("Starting to create initial posts");
  const [albert, sandra, glamgal] = await getAllUsers();
} catch (error) {
  console.error("Error building tables:", error.message);
  throw error;
  }
  }
  
  // Create initial posts in the database
  async function createInitialPosts() {
  try {
  console.log("Starting to create initial posts");
  const [albert, sandra, glamgal] = await getAllUsers();
  console.log("Albert.id", albert.id);

// Create posts with their respective details
await createPost({
  authorId: albert.id,
  title: "First Post",
  content:
    "This is my first post. I hope I love writing blogs as much as I love writing them. Doesn't make much sense but okay.",
  tags: ["#happy", "#youcandoanything"],
});

await createPost({
  authorId: sandra.id,
  title: "Second Post",
  content:
    "This is my second post. Let's hope it is received better than my first.",
  tags: ["#happy", "#worst-day-ever"],
});

await createPost({
  authorId: glamgal.id,
  title: "How do I...",
  content: "...Tell my sister she has mascara gloop in her eye all the time?",
  tags: ["#happy", "#youcandoanything", "#catmandoeverything"],
});

console.log("Finished creating posts");
} catch (error) {
  console.error("Error creating initial posts:", error.message);
  throw error;
  }
  }
  
  // Rebuild the entire database (drop tables, create tables, create initial users, create initial posts)
  async function rebuildDB() {
  try {
  console.log("Starting to rebuild the database");
  await client.connect(); // Connect to the database
await dropTables(); // Drop existing tables (if any)
await createTables(); // Create new tables
await createInitialUsers(); // Create initial users
await createInitialPosts(); // Create initial posts

console.log("Finished rebuilding the database");
} catch (error) {
  console.error("Error rebuilding the database:", error.message);
  throw error;
  }
  }
