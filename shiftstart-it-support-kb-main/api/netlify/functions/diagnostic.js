exports.handler = async () => ({ statusCode: 501, headers: { "content-type": "application/json" }, body: JSON.stringify({ error: "Diagnostic service not configured" }) });
