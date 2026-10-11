/**
 * Google Sheets order receiver for Astrological Solutions.
 *
 * Setup:
 * 1. Open the target spreadsheet, then Extensions > Apps Script.
 * 2. Paste this file into Code.gs.
 * 3. In Project Settings > Script properties, add ORDER_WEBHOOK_SECRET with the
 *    same random secret as GOOGLE_SHEETS_WEBHOOK_SECRET on the server.
 * 4. Deploy > New deployment > Web app; execute as you, access as anyone.
 * 5. Set the deployment URL as GOOGLE_SHEETS_WEBHOOK_URL in the server environment.
 *
 * The secret is checked in the POST body. Do not publish it or put it in browser code.
 */
function doPost(e) {
  try {
    var payload = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    var expected = PropertiesService.getScriptProperties().getProperty("ORDER_WEBHOOK_SECRET");
    if (!expected || !payload.secret || payload.secret !== expected) {
      return json_({ ok: false, error: "Unauthorized" });
    }
    if (!payload.orderId || !payload.createdAt) {
      return json_({ ok: false, error: "Missing order ID or timestamp" });
    }

    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    if (!spreadsheet) throw new Error("No bound spreadsheet found");
    var sheet = spreadsheet.getSheetByName("Orders") || spreadsheet.insertSheet("Orders");
    var headers = [
      "Order ID", "Order Date (ISO)", "Customer Name", "Phone", "Email",
      "Address", "Items (JSON)", "Fulfillment", "Subtotal", "Discount",
      "Shipping", "Order Total", "Coupon Code", "Payment Status", "Order Status"
    ];
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(headers);
      sheet.setFrozenRows(1);
    }

    // Idempotency guard: retries for the same order must not create duplicate rows.
    var lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      var existingIds = sheet.getRange(2, 1, lastRow - 1, 1).getDisplayValues();
      for (var i = 0; i < existingIds.length; i++) {
        if (existingIds[i][0] === String(payload.orderId)) {
          return json_({ ok: true, duplicate: true });
        }
      }
    }

    var address = typeof payload.address === "string"
      ? payload.address
      : JSON.stringify(payload.address || {});
    var items = JSON.stringify(payload.items || []);
    sheet.appendRow([
      String(payload.orderId), String(payload.createdAt), String(payload.customerName || ""),
      String(payload.phone || ""), String(payload.email || ""), address, items,
      String(payload.fulfillment || ""), Number(payload.subtotal || 0),
      Number(payload.discount || 0), Number(payload.shipping || 0), Number(payload.total || 0),
      String(payload.couponCode || ""), String(payload.paymentStatus || ""),
      String(payload.status || "")
    ]);
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message || err) });
  }
}

function json_(value) {
  return ContentService.createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}
