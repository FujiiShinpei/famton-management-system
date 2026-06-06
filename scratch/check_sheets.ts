import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function check() {
    const SPEADSHEET_ID = process.env.GOOGLE_SHEET_ID;
    const GOOGLE_CLIENT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY;

    if (!SPEADSHEET_ID || !GOOGLE_CLIENT_EMAIL || !GOOGLE_PRIVATE_KEY) {
        console.error("Missing credentials");
        return;
    }

    const cleanKey = GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');

    const auth = new JWT({
        email: GOOGLE_CLIENT_EMAIL,
        key: cleanKey,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(SPEADSHEET_ID, auth);
    await doc.loadInfo();
    const sheet = doc.sheetsByTitle['orders'];
    await sheet.loadHeaderRow();
    
    console.log("HEADERS:", sheet.headerValues);
    
    const rows = await sheet.getRows();
    if (rows.length > 0) {
        const lastRow = rows[rows.length - 1];
        console.log("LAST ROW RAW DATA:", (lastRow as any)._rawData);
        console.log("LAST ROW 'email':", lastRow.get('email'));
        console.log("LAST ROW 'id':", lastRow.get('id'));
    }
}

check().catch(console.error);

