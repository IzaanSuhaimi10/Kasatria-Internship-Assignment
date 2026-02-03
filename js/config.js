// js/config.js

const CONFIG = {
    // Your Google OAuth Client ID from Google Cloud Console
    CLIENT_ID: '515926527174-qe1lkmilb4e0o63a3mdak3558ipcjrbt.apps.googleusercontent.com',
    
    // Your Google Sheets API Key from Google Cloud Console
    API_KEY: 'AIzaSyCDVV6cbOoZ84tCRhI7aqwqyeB4ri2-6wc',
    
    // Your Google Sheet ID (from the URL of your Google Sheet)
    SHEET_ID: '1DXtMsNDmWQ56ZqqZySie3jYberASSb3mQxPbRhc0mc0',
    
    // The name of the sheet/tab in your Google Sheets (usually "Sheet1")
    SHEET_NAME: 'Sheet1',
    
    // Discovery docs for Google APIs
    DISCOVERY_DOCS: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
    
    // Authorization scopes required
    SCOPES: 'https://www.googleapis.com/auth/spreadsheets.readonly'
};


console.log('✅ Config loaded');
