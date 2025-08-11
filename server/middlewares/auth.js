const jwt = require("jsonwebtoken");
const User = require("../model/userModel");

exports.isAuthenticated = async (req, res, next) => {
  let token;
  
  // Check for token in headers
  if (req?.headers?.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }
  // Check for token in cookies
  else if (req?.cookies?.token) {
    token = req.cookies.token;
  }
  
  console.log("Token received:", token);
  
  // Special case for order routes - allow them to proceed even without auth
  if (!token && req.originalUrl.includes("/order/user/")) {
    console.log("Order route detected, proceeding without auth");
    // Extract userId from URL
    const userId = req.params.userId;
    if (userId && userId !== "undefined") {
      // Set a minimal user object with just the ID
      req.user = { id: userId };
      return next();
    }
  }
  
  if (token) {
    try {
      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      
      // Fetch the user from the database
      const user = await User.findById(decoded.id);
      
      if (!user) {
        return res
          .status(401)
          .json({ success: false, message: "User not found" });
      }
      
      // CHECK: Verify if user account is active
      if (user.active !== 1) {
        return res.status(401).json({ 
          success: false, 
          message: "Account has been deactivated. Please contact support." 
        });
      }
      
      // Attach user to request object
      req.user = user;
      next();
    } catch (error) {
      console.error("Token verification error:", error);
      return res.status(401).json({ success: false, message: "Invalid Token" });
    }
  } else {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
};

exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    // First check if req.user exists
    if (!req.user) {
      console.log("User object not found in request");
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please login.",
      });
    }
    
    console.log("User role:", req.user.role);
    console.log("Required roles:", roles);
    
    if (!roles.includes(req.user.role)) {
      console.log("Access denied for user:", req.user.role);
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    
    console.log("Access granted for user:", req.user.role);
    next();
  };
};