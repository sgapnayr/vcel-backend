const rateLimit = (limit, timeWindow) => {
  let requests = {};
  return (req, res, next) => {
    const now = Date.now();
    const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

    if (!requests[ip]) {
      requests[ip] = [];
    }
    requests[ip].push(now);

    requests[ip] = requests[ip].filter(
      (timestamp) => now - timestamp < timeWindow
    );

    if (requests[ip].length > limit) {
      res
        .status(429)
        .json({ message: "Too many requests. Please try again later." });
    } else {
      next();
    }
  };
};

module.exports = rateLimit;
