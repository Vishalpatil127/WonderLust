const express = require("express");
const passport = require("../services/oauthService");
const authService = require("../services/authService");
const env = require("../config/env");
const router = express.Router();

// Guard: return a clear 503 if Google credentials are not configured
const requireGoogleConfig = (req, res, next) => {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    return res.status(503).json({
      success: false,
      message: "Google OAuth is not configured on this server. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to your .env file.",
    });
  }
  next();
};

router.get(
  "/google",
  requireGoogleConfig,
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  requireGoogleConfig,
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${env.CLIENT_URL}/login?error=oauth_failed`,
  }),
  async (req, res) => {
    try {
      const { accessToken, refreshToken } = await authService.issueTokens(req.user);
      const redirectUrl = new URL(`${env.CLIENT_URL}/auth/google/callback`);
      redirectUrl.searchParams.set("accessToken", accessToken);
      redirectUrl.searchParams.set("refreshToken", refreshToken);
      res.redirect(redirectUrl.toString());
    } catch (err) {
      res.redirect(`${env.CLIENT_URL}/login?error=oauth_failed`);
    }
  }
);

module.exports = router;
