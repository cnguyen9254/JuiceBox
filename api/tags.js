const express = require("express");
const { getAllTags, getPostsByTagName } = require("../db");

// Create a router instance
const tagsRouter = express.Router();

// Middleware to log request to tagsRouter
tagsRouter.use((req, res, next) => {
  console.log("Request to tagsRouter");
  next();
});

// Route to get all tags
tagsRouter.get("/", async (req, res, next) => {
  try {
    // Retrieve all tags
    const tags = await getAllTags();
    res.send({ tags });
  } catch (error) {
    // Pass the error to the error-handling middleware
    next(error);
  }
});

// Route to get posts by a specific tag name
tagsRouter.get("/:tagName/posts", async (req, res, next) => {
  const { tagName } = req.params;
  try {
    // Retrieve all posts with the specified tag name
    const allTaggedPosts = await getPostsByTagName(tagName);

    // Filter posts based on conditions
    const taggedPosts = allTaggedPosts.filter((post) => {
      if (post.active) {
        return true;
      }

      if (req.user && post.author.id === req.user.id) {
        return true;
      }

      return false;
    });

    // Send the filtered posts
    res.send({ taggedPosts });

    // If no tagged posts found, pass an error to the error-handling middleware
    if (!taggedPosts) {
      next({ name: "TaggedPostsFail", message: "Unable to send tagged posts" });
    }
  } catch (error) {
    // Pass the error to the error-handling middleware
    next(error);
  }
});

// Export the router
module.exports = tagsRouter;
