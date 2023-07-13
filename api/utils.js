/**
 * Middleware to require user authentication.
 * If the user is not logged in, it passes an error to the next middleware.
 */
function requireUser(req, res, next) {
  if (!req.user) {
    next({
      name: "MissingUserError",
      message: "You must be logged in to perform this action",
    });
  } else {
    next();
  }
}

// Export the requireUser middleware
module.exports = { requireUser };
