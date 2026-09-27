function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  const headers = ["Added", "Email", "Source", "Confirmation"];
  if (sheet.getLastRow() === 0) sheet.appendRow(headers);
  if (sheet.getRange(1, 4).getValue() !== headers[3]) sheet.getRange(1, 4).setValue(headers[3]);

  let payload;
  try {
    payload = JSON.parse(e.postData.contents || "{}");
  } catch (error) {
    return json_({ ok: false, error: "invalid-json" });
  }

  const email = String(payload.email || "").trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email)) return json_({ ok: false, error: "email" });

  // Prevent duplicate rows while still allowing a failed confirmation to retry.
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const lastRow = sheet.getLastRow();
    const rows = lastRow > 1 ? sheet.getRange(2, 1, lastRow - 1, 4).getValues() : [];
    const existingIndex = rows.findIndex(row => String(row[1]).trim().toLowerCase() === email);
    const rowNumber = existingIndex === -1 ? sheet.getLastRow() + 1 : existingIndex + 2;
    const isNew = existingIndex === -1;
    const confirmation = isNew ? "pending" : String(rows[existingIndex][3] || "pending");

    if (isNew) {
      sheet.appendRow([new Date(), email, payload.source || "project-kripaa", "pending"]);
    } else if (confirmation === "sent") {
      return json_({ ok: true, status: "already-joined", emailSent: true });
    }

    try {
      const siteUrl = "https://project-kripaa.vercel.app";
      const heroImageUrl = siteUrl + "/assets/09-waitlist-background.png";
      MailApp.sendEmail({
        to: email,
        subject: "You’re in — welcome to Project Kripaa",
        body: "Thank you for joining the Project Kripaa waitlist. You’ll be among the first to hear when the first rings are ready. Visit https://project-kripaa.vercel.app to keep exploring.",
        htmlBody: [
          '<div style="margin:0;background:#101820;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;color:#1d2730;">',
            '<div style="max-width:600px;margin:0 auto;background:#f4f0e8;border-radius:18px;overflow:hidden;">',
              '<div style="padding:28px 32px 18px;background:#101820;text-align:center;">',
                '<div style="font-size:12px;letter-spacing:4px;color:#bcd6ff;font-weight:700;">PROJECT KRIPAA</div>',
              '</div>',
              '<img src="' + heroImageUrl + '" alt="A Project Kripaa ring resting in a quiet moment" width="600" style="display:block;width:100%;height:auto;max-height:260px;object-fit:cover;">',
              '<div style="padding:36px 36px 40px;">',
                '<p style="margin:0 0 14px;color:#607b9d;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">You’re on the list</p>',
                '<h1 style="margin:0 0 18px;color:#17212b;font-family:Georgia,serif;font-size:38px;line-height:1.08;font-weight:400;">A quieter rhythm is coming.</h1>',
                '<p style="margin:0 0 18px;color:#46515c;font-size:16px;line-height:1.65;">Thank you for joining Project Kripaa. We’ll notify you when the first rings are ready, and you’ll be among the very first to get one.</p>',
                '<p style="margin:0 0 28px;color:#46515c;font-size:16px;line-height:1.65;">Until then, keep a little space for the moments when your hands need somewhere quieter to go.</p>',
                '<a href="' + siteUrl + '" style="display:inline-block;background:#607b9d;color:#ffffff;text-decoration:none;border-radius:6px;padding:14px 22px;font-size:13px;font-weight:700;letter-spacing:1.5px;">EXPLORE KRIPAA</a>',
              '</div>',
              '<div style="padding:20px 36px;background:#e7e0d5;color:#718092;font-size:12px;line-height:1.5;">You’re receiving this because you joined the Project Kripaa waitlist.<br>— Project Kripaa</div>',
            '</div>',
          '</div>',
        ].join(""),
      });
      sheet.getRange(rowNumber, 4).setValue("sent");
      return json_({ ok: true, status: isNew ? "added" : "confirmation-resent", emailSent: true });
    } catch (error) {
      sheet.getRange(rowNumber, 4).setValue("failed");
      // The address is still safely stored; a later submission can retry the email.
      return json_({ ok: true, status: "saved-email-failed", emailSent: false });
    }
  } finally {
    lock.releaseLock();
  }
}

function json_(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}
