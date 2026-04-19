function notFoundHandler(req, res) {
  res.status(404).json({
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

function getErrorDetails(error) {
  if (!error) {
    return {
      status: 500,
      message: "Something went wrong on the server.",
    };
  }

  if (error.code === "ECONNREFUSED") {
    const connectionTarget =
      error.errors
        ?.map((entry) => entry.message)
        .filter(Boolean)
        .join(" | ") || "the configured database host";

    return {
      status: 503,
      message: `Database connection failed. Make sure PostgreSQL is running and reachable. ${connectionTarget}`,
    };
  }

  if (error.code === "42P01") {
    return {
      status: 500,
      message: "The database schema is missing. Run the schema and seed scripts before using the app.",
    };
  }

  if (error.message) {
    return {
      status: 500,
      message: `Something went wrong on the server: ${error.message}`,
    };
  }

  return {
    status: 500,
    message: "Something went wrong on the server.",
  };
}

function errorHandler(error, _req, res, _next) {
  console.error(error);
  const details = getErrorDetails(error);

  res.status(details.status).json({
    message: details.message,
  });
}

module.exports = {
  errorHandler,
  notFoundHandler,
};
