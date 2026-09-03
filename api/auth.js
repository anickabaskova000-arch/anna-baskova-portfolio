// GitHub OAuth – krok 1: přesměrování na GitHub přihlášení.
// Používá Sveltia/Decap CMS na /admin. Potřebuje env proměnné
// GITHUB_CLIENT_ID a GITHUB_CLIENT_SECRET (nastaví se ve Vercel → Settings → Environment Variables).
const crypto = require("crypto");

module.exports = (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) {
    res.statusCode = 500;
    res.end("Chybí GITHUB_CLIENT_ID ve Vercel env proměnných.");
    return;
  }
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const redirectUri = `https://${host}/api/callback`;
  const state = crypto.randomBytes(12).toString("hex");
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: "repo,user",
    state,
    allow_signup: "false",
  });
  res.setHeader(
    "Set-Cookie",
    `oauth_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`
  );
  res.statusCode = 302;
  res.setHeader(
    "Location",
    `https://github.com/login/oauth/authorize?${params.toString()}`
  );
  res.end();
};
