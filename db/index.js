
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

    async function updatePost(postId, fields = {}) {
      try {
        console.log("postId", postId);
        console.log("fields", fields);
    
        // Extract 'tags' field and remove it from 'fields' object
        const { tags, ...updatedFields } = fields;
    
        // Generate the SET string for the SQL query
        const setString = Object.keys(updatedFields)
          .map((key, index) => `"${key}"=$${index + 1}`)
          .join(", ");
    
        console.log("setString", setString);
        console.log(Object.keys(updatedFields));
    
        if (setString.length > 0) {
          // Perform the update query
          await client.query(
            `
            UPDATE posts 
            SET ${setString} 
            WHERE id = ${postId}
            RETURNING *;
          `,
            Object.values(updatedFields)
          );
        }
    
        console.log("passed setString if statement");
    
        if (!tags) {
          // If 'tags' field is not provided, return the updated post
          return await getPostById(postId);
        }
    
        // Create new tags and retrieve their IDs
        const tagList = await createTags(tags);
        const tagListIdString = tagList.map((tag) => `${tag.id}`).join(", ");
    
        // Delete old post tags not present in the new tag list
        await client.query(
          `
          DELETE FROM post_tags
          WHERE "tagId" NOT IN (${tagListIdString})
          AND "postId" = $1;
          `,
          [postId]
        );
    
        // Add new tags to the post
        await addTagsToPost(postId, tagList);
    
        // Return the updated post
        return await getPostById(postId);
      } catch (error) {
        console.log("Error in updatePost");
        throw error;
      }
    }

    async function getPostsByUser(userId) {
      try {
        // Retrieve post IDs for the specified user
        const { rows: postIds } = await client.query(
          `
          SELECT id
          FROM posts
          WHERE "authorId" = $1;
          `,
          [userId]
        );
    
        // Retrieve posts using post IDs
        const posts = await Promise.all(
          postIds.map((post) => getPostById(post.id))
        );
    
        console.log("getPostsByUser", posts);
        return posts;
      } catch (error) {
        throw error;
      }
    }

    async function getUserById(userId) {
      try {
        // Retrieve the user from the database
        const {
          rows: [user],
        } = await client.query(`
          SELECT id, username, name, location, active FROM users
          WHERE id = ${userId}`);
    
        if (!user) {
          // If user does not exist, return null
          return null;
        }
    
        // Retrieve the posts for the user
        user.posts = await getPostsByUser(userId);
    
        return user;
      } catch (error) {
        throw error;
      }
    }

    // Retrieve all posts from the database
async function getAllPosts() {
  // Retrieve post IDs from the 'posts' table
  const { rows: postIds } = await client.query( SELECT id FROM posts; );
  
  // Fetch all posts using their IDs in parallel
  const posts = await Promise.all(postIds.map((post) => getPostById(post.id)));
  return posts;
  }
  
  // Create tags in the database
  async function createTags(tagList) {
  // If the tag list is empty, return early
  if (tagList.length === 0) {
  return;
  }
  
  console.log("taglist", tagList);
  
  // Create placeholders for tag values in the query
  const insertValues = tagList
  .map((name, index) => $${index + 1})
  .join("), (");
  
  const selectValues = tagList.map((name, index) => $${index + 1}).join(", ");
  
  try {
  // Insert tags into the 'tags' table, ignoring conflicts
  await client.query(
  INSERT INTO tags(name) VALUES (${insertValues}) ON CONFLICT (name) DO NOTHING; ,
  tagList
  );
  // Retrieve the inserted tags from the 'tags' table
const { rows } = await client.query(
  `
  SELECT * FROM tags
  WHERE name IN (${selectValues});
`,
  tagList
);

console.log(rows);
return rows;
} catch (error) {
  console.log("Error in createTags");
  throw error;
  }
  }
  
  // Create a relationship between a post and a tag in the database
  async function createPostTag(postId, tagId) {
  try {
  // Insert a new entry into the 'post_tags' table, ignoring conflicts
  await client.query(
  INSERT INTO post_tags("postId", "tagId") VALUES ($1, $2) ON CONFLICT ("postId", "tagId") DO NOTHING; ,
  [postId, tagId]
  );
  } catch (error) {
  console.log("Error in createPostTag");
  throw error;
  }
  }
  
  // Add tags to a post in the database
  async function addTagsToPost(postId, tagList) {
  // If the tag list is empty, return early
  if (tagList.length) {
  try {
  // Create promises to create post-tag relationships
  const createPostTagPromises = tagList.map((tag) =>
  createPostTag(postId, tag.id)
  );
    // Create post-tag relationships in parallel
    await Promise.all(createPostTagPromises);

    // Return the updated post
    return await getPostById(postId);
  } catch (error) {
    console.log("Error in addTagsToPost");
    throw error;
  }
}
}

// Retrieve a post by its ID from the database
async function getPostById(postId) {
try {
// Retrieve the post from the 'posts' table
const {
rows: [post],
} = await client.query(
SELECT * FROM posts WHERE id = $1; ,
[postId]
);
// If the post doesn't exist, throw an error
if (!post) {
  throw {
    name: "PostNotFoundError",
    message: "Could not find a post with that postId",
  };
}

// Retrieve tags associated with the post
const { rows: tags } = await client.query(
  `
  SELECT tags.* FROM tags
  JOIN post_tags ON tags.id = post_tags."tagId"
  WHERE post_tags."postId" = $1;
`,
  [postId]
);

// Retrieve the author of the post
const {
  rows: [author],
} = await client.query(
  `
  SELECT id, username, name, location
  FROM users
  WHERE id = $1;
`,
  [post.authorId]
);

// Assign the tags and author to the post object
post.tags = tags;
post.author = author;

// Remove the authorId property from the post
delete post.authorId;

console.log("getPostById", post);
return post;
} catch (error) {
  console.log("error in getPostById");
  throw error;
  }
  }
  
  // Retrieve posts by a specific tag name from the database
  async function getPostsByTagName(tagName) {
  try {
  // Retrieve post IDs associated with the tag
  const { rows: postIds } = await client.query(
  SELECT posts.id FROM posts JOIN post_tags ON posts.id = post_tags."postId" JOIN tags ON tags.id = post_tags."tagId" WHERE tags.name = $1; ,
  [tagName]
  );
  // Fetch all posts by their IDs in parallel
return await Promise.all(postIds.map((post) => getPostById(post.id)));
} catch (error) {
  console.log("error in getPostsByTagName");
  throw error;
  }
  }
  
  // Retrieve all tags from the database
  async function getAllTags() {
  try {
  // Retrieve all tags from the 'tags' table
  const { rows: tags } = await client.query(SELECT * FROM tags;);
  return tags;
  } catch (error) {
  console.log("error in getAllTags");
  throw error;
  }
  }
  
  // Retrieve a user by their username from the database
  async function getUserByUsername(username) {
  try {
  // Retrieve the user from the 'users' table
  const {
  rows: [user],
  } = await client.query(
  SELECT * FROM users WHERE username = $1; ,
  [username]
  );
  return user;
} catch (error) {
  console.log("error in getUserByUsername");
  throw error;
  }
  }
  
  // Export all the necessary functions and the client object
  module.exports = {
  client,
  getAllUsers,
  createUser,
  updateUser,
  createPost,
  updatePost,
  getPostsByUser,
  getUserById,
  getAllPosts,
  createTags,
  addTagsToPost,
  getPostsByTagName,
  getAllTags,
  getUserByUsername,
  getPostById,
  };