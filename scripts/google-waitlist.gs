function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  if (sheet.getLastRow() === 0) sheet.appendRow(["Added", "Email", "Source"]);
  const payload = JSON.parse(e.postData.contents);
  const email = String(payload.email || "").trim().toLowerCase();
  if (!email) return json_({ ok: false, error: "email" });
  sheet.appendRow([new Date(), email, payload.source || "project-kripaa"]);
  return json_({ ok: true });
}

function json_(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}
