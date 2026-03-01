export const isAdmin = (req, res, next) => {
  const user = req.user;
  const role = (user?.role || "").toLowerCase().trim();

  // Log for server-side debugging
  console.log(`[AdminCheck] User: ${user?.email}, Role: "${user?.role}", Normalized: "${role}"`);

  if (user && (role.includes("admin") || role.includes("police"))) {
    next();
  } else {
    console.warn(`Admin access denied for: ${user?.email}. Role: "${user?.role}"`);
    res.status(403).json({
      message: `Access denied: Admin only. Your role is: ${user?.role || "undefined"}`,
      debug: { email: user?.email, foundRole: user?.role }
    });
  }
};

export const isUser = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authorized. No user found." });
  }

  // Normalize role string (default to 'user' if property missing)
  const role = (req.user.role || "user").toLowerCase().trim();

  console.log(`[ACL] User: ${req.user.email}, Role: "${req.user.role}", Normalized: "${role}"`);

  if (role === "user" || role === "admin" || role === "police") {
    next();
  } else {
    console.warn(`User access denied for: ${req.user.email}. Role found: "${req.user.role}"`);
    res.status(403).json({
      message: "Access denied: Citizen or Police role required.",
      debug: { email: req.user.email, role: req.user.role }
    });
  }
};