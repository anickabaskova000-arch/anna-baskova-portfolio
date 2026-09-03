// GitHub OAuth – krok 2: výměna kódu za přístupový token a předání zpět do CMS okna.
module.exports = async (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  const url = new URL(req.url, "https://x");
  const code = url.searchParams.get("code");

  const send = (status, payload) => {
    const body = JSON.stringify(payload);
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.statusCode = 200;
    res.end(`<!doctype html><html><head><meta charset="utf-8"></head><body>
<script>
(function () {
  function receive(e) {
    window.opener && window.opener.postMessage(
      'authorization:github:${status}:${body.replace(/'/g, "\\'")}',
      e.origin
    );
    window.removeEventListener('message', receive, false);
    window.close();
  }
  window.addEventListener('message', receive, false);
  window.opener && window.opener.postMessage('authorizing:github', '*');
})();
</script>
<p>Přihlašování… toto okno se zavře samo.</p>
</body></html>`);
  };

  if (!code) return send("error", { error: "Chybí kód z GitHubu." });
  if (!clientId || !clientSecret)
    return send("error", { error: "Chybí GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET." });

  try {
    const r = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
    });
    const data = await r.json();
    if (data.access_token) {
      return send("success", { token: data.access_token, provider: "github" });
    }
    return send("error", { error: data.error_description || data.error || "Token se nepodařilo získat." });
  } catch (e) {
    return send("error", { error: String(e && e.message ? e.message : e) });
  }
};
