exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method not allowed" };
  const payload = JSON.parse(event.body || "{}");
  console.log("KB feedback placeholder", payload);
  return { statusCode: 202, headers: { "content-type": "application/json" }, body: JSON.stringify({ accepted: true }) };
};
