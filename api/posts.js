const express = require("express");
const {
getAllPosts,
createPost,
updatePost,
getPostById,
} = require("../db");
const { requireUser } = require("./utils");
const postsRouter = express.Router();

// Middleware to log requests to the '/posts' route
postsRouter.use((req, res, next) => {
console.log("Request being made to /posts");
next();
});

// Route for creating a new post
postsRouter.post("/", requireUser, async (req, res, next) => {
const { title, content, tags = "" } = req.body;
const authorId = req.user.id;
const tagArr = tags.trim().split(/\s+/);
const postData = {};

if (tagArr.length) {
postData.tags = tagArr;
}

try {
const post = await createPost({ authorId, title, content, tags });
if (!post) {
next({
name: "PostFailedError",
message: "Something went wrong with creating the post",
});
}
res.send({ post });
} catch ({ name, message }) {
next({ name, message });
}
});

// Route for retrieving all posts
postsRouter.get("/", async (req, res, next) => {
try {
const allPosts = await getAllPosts();
const posts = allPosts.filter((post) => {
  if (post.active) {
    return true;
  }

  if (req.user && post.author.id === req.user.id) {
    return true;
  }

  return false;
});

res.send({ posts });
} catch (error) {
  next(error);
  }
  });
  
  // Route for updating a post
  postsRouter.patch("/:postId", requireUser, async (req, res, next) => {
  const { postId } = req.params;
  const { title, content, tags } = req.body;
  const updateFields = {};
  
  if (tags && tags.length > 0) {
  updateFields.tags = tags.trim().split(/\s+/);
  }
  
  if (title) {
  updateFields.title = title;
  }
  
  if (content) {
  updateFields.content = content;
  }
  
  try {
  const originalPost = await getPostById(postId);
  if (originalPost.author.id === req.user.id) {
    const updatedPost = await updatePost(postId, updateFields);
    res.send({ post: updatedPost });
  } else {
    next({
      name: "UnauthorizedUserError",
      message: "You cannot update a post that is not yours",
    });
  }
} catch ({ name, message }) {
  next({ name, message });
  }
  });
  
  // Route for deleting a post
  postsRouter.delete("/:postId", requireUser, async (req, res, next) => {
  try {
  const post = await getPostById(req.params.postId);
  if (post && post.author.id === req.user.id) {
    const updatedPost = await updatePost(post.id, { active: false });
    res.send({ post: updatedPost });
  } else {
    next(
      post
        ? {
            name: "UnauthorizedUserError",
            message: "You cannot delete a post that is not yours",
          }
        : {
            name: "PostNotFoundError",
            message: "That post does not exist",
          }
    );
  }
} catch ({ name, message }) {
  next({ name, message });
  }
  });
  
  module.exports = postsRouter; // Export the posts router for use in other files