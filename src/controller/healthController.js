const getHealth = (req, res) => {
  // req = request
  // res = respond

  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
};

module.exports = { getHealth };
