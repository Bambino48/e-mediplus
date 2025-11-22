export default async function handler(req, res) {
  const { path } = req.query;
  const backendUrl = `https://lightsalmon-elk-292300.hostingersite.com/backend/public/api/${path.join(
    "/"
  )}`;

  try {
    const response = await fetch(backendUrl, {
      method: req.method,
      headers: {
        ...req.headers,
        host: "lightsalmon-elk-292300.hostingersite.com",
      },
      body:
        req.method !== "GET" && req.method !== "HEAD"
          ? JSON.stringify(req.body)
          : undefined,
    });

    const data = await response.text();
    res.status(response.status).send(data);
  } catch (error) {
    console.error("Proxy error:", error);
    res.status(500).json({ error: "Proxy error" });
  }
}
