
// Import the necessary modules
const { Client } = require("pg");

// Create a new PostgreSQL client with the connection string
const client = new Client("postgres://localhost:5432/juicebox-dev");

// Export the client for use in other modules
module.exports = {
client,
};

/**

Retrieve all users from the database
@returns {Array} Array of user objects
*/
async function getAllUsers() {
// Execute a query to select the required fields from the users table
const { rows } = await client.query(
SELECT id, username, name, location, active FROM users;
);
// Return the resulting rows
return rows;
}

// Export the getAllUsers function for use in other modules
module.exports = {
getAllUsers,
};

/**

Create a new user in the database

@param {Object} userData - User data including username, password, name, and location

@returns {Object} The created user object

@throws {Error} If an error occurs during the database operation
*/
async function createUser({ username, password, name, location }) {
  try {
  // Execute a query to insert a new user into the users table, with conflict resolution on username
  const {
  rows: [user],
  } = await client.query(
  INSERT INTO users (username, password, name, location) VALUES ($1, $2, $3, $4) ON CONFLICT (username) DO NOTHING RETURNING *;,
  [username, password, name, location]
  );
  
  // Return the created user object
  return user;
  } catch (error) {
  // Throw the error if an exception occurs
  throw error;
  }
  }
  
  // Export the createUser function for use in other modules
  module.exports = {
  createUser,
  };

  
/**

Updates a user with the specified ID using the provided fields.
@param {string} id - The ID of the user to update.
@param {object} fields - The fields to update.
@returns {object} - The updated user object.
*/
async function updateUser(id, fields = {}) {
  // Generate the SET clause of the SQL query
  const setString = Object.keys(fields)
  .map((key, index) => "${key}"=$${index + 1})
  .join(", ");
  // If there are no fields to update, return early
  if (setString.length === 0) {
  return;
  }
  
  try {
  const {
  rows: [user],
  } = await client.query(
  // Execute the SQL query with the provided fields
  UPDATE users SET ${setString} WHERE id=${id} RETURNING *; ,
  Object.values(fields)
  );
  return user;
} catch (error) {
  throw error;
  }
  }

  async function createPost({ authorId, title, content, tags = [] }) {
    try {
    // Insert the post into the "posts" table and retrieve the inserted row
    const {
    rows: [post],
    } = await client.query(
    INSERT INTO posts ("authorId", title, content) VALUES ($1, $2, $3) RETURNING *;,
    [authorId, title, content]
    );
    // Create tags for the post
const tagList = await createTags(tags);

// Add the created tags to the post
return await addTagsToPost(post.id, tagList);
} catch (error) {
  throw error;
  }
  }
  
  // Helper function to create tags for a post
  async function createTags(tags) {
  // Implementation details for creating tags
  }
  
  // Helper function to add tags to a post
  async function addTagsToPost(postId, tagList) {
  // Implementation details for adding tags to a post
  }

  async function updatePost(postId, fields = {}) {
    try {
    console.log("postId", postId);
    console.log("fields", fields);
    
    // Extract tags field from the fields object
    const { tags } = fields;
    delete fields.tags;
    
    // Generate the SET clause string for the UPDATE query
    const setString = Object.keys(fields)
    .map((key, index) => "${key}"=$${index + 1})
    .join(", ");
    
    console.log("setString", setString);
    console.log(Object.keys(fields));
    
    if (setString.length > 0) {
    // Execute the UPDATE query to update the post
    await client.query(
    UPDATE posts SET ${setString} WHERE id=${postId} RETURNING *; ,
    Object.values(fields)
    );
    }
    
    console.log("passed setString if statement");
    
    if (!tags) {
    // If tags field is not provided, return the updated post
    return await getPostById(postId);
    }
    
    // Create tags and obtain their IDs
    const tagList = await createTags(tags);
    const tagListIdString = tagList.map((tag) => ${tag.id}).join(", ");
    
    // Remove any existing post tags that are not in the updated tag list
    await client.query(
    DELETE FROM post_tags WHERE "tagId" NOT IN (${tagListIdString}) AND "postId" = $1;,
    [postId]
    );
    
    // Add the updated tag list to the post
    await addTagsToPost(postId, tagList);
    
    // Return the updated post
    return await getPostById(postId);
    } catch (error) {
    console.log("Error in updatePost");
    throw error;
    }
    }

    