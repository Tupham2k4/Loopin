export const protect = (req, res, next) => {
  try {
    const { userId } = req.auth();

    console.log(req.auth());

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "not authenticated",
      });
    }

    next();
  } catch (error) {
    console.log(error);

    return res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};
