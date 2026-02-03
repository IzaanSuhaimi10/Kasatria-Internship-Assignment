// js/sheets.js
// This file handles fetching data from Google Sheets

let peopleData = [];

// Load data from Google Sheets
function loadSheetData() {
    showLoading(true);
    console.log('📊 Loading data from Google Sheets...');
    console.log('📊 Sheet ID:', CONFIG.SHEET_ID);
    console.log('📊 Sheet Name:', CONFIG.SHEET_NAME);
    
    gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: CONFIG.SHEET_ID,
        range: `${CONFIG.SHEET_NAME}!A1:F202`, // Changed to A1 to include header
    }).then((response) => {
        console.log('✅ Raw response from Sheets API:', response);
        const rows = response.result.values;
        
        if (!rows || rows.length === 0) {
            console.error('❌ No data found in the sheet!');
            alert('No data found in the Google Sheet! Please check:\n1. Sheet ID is correct\n2. Sheet name is correct\n3. Sheet has data');
            showLoading(false);
            return;
        }
        
        console.log(`📊 Found ${rows.length} rows (including header)`);
        console.log('📊 First row (header):', rows[0]);
        console.log('📊 Second row (first data):', rows[1]);
        
        // Skip header row (index 0) and parse the data
        peopleData = rows.slice(1).map((row, index) => {
            return {
                id: index,
                name: row[0] || 'Unknown',
                photo: row[1] || '',
                age: row[2] || '0',
                country: row[3] || 'Unknown',
                interest: row[4] || 'Unknown',
                netWorth: row[5] || '$0'
            };
        });
        
        console.log(`✅ Successfully loaded ${peopleData.length} people from Google Sheets`);
        console.log('📊 Sample person:', peopleData[0]);
        
        // Initialize the 3D visualization with the loaded data
        init3DVisualization();
        showLoading(false);
        
    }).catch((error) => {
        console.error('❌ Detailed error loading sheet data:', error);
        console.error('❌ Error message:', error.result?.error?.message);
        console.error('❌ Error status:', error.status);
        console.error('❌ Error details:', JSON.stringify(error, null, 2));
        
        let errorMessage = 'Failed to load data from Google Sheets.\n\n';
        
        if (error.status === 403) {
            errorMessage += 'Error: Permission denied (403)\n';
            errorMessage += 'Solution: Make sure your Google Sheet is shared publicly or with your account.';
        } else if (error.status === 404) {
            errorMessage += 'Error: Sheet not found (404)\n';
            errorMessage += 'Solution: Check your Sheet ID in config.js';
        } else if (error.result?.error?.message) {
            errorMessage += 'Error: ' + error.result.error.message;
        }
        
        alert(errorMessage);
        showLoading(false);
    });
}

// Show/hide loading indicator
function showLoading(show) {
    const loading = document.getElementById('loading');
    if (show) {
        loading.style.display = 'block';
    } else {
        loading.style.display = 'none';
    }
}

// Parse net worth string to number (removes $ and commas)
function parseNetWorth(netWorthString) {
    // Remove $ and commas, then parse to float
    // Example: "$251,260.80" becomes 251260.80
    return parseFloat(netWorthString.replace(/[$,]/g, ''));
}

// Get color class based on net worth
// Red: < $100K
// Orange: >= $100K and < $200K
// Green: >= $200K
function getColorByNetWorth(netWorthString) {
    const netWorth = parseNetWorth(netWorthString);
    
    if (netWorth < 100000) {
        return 'color-red';
    } else if (netWorth >= 100000 && netWorth < 200000) {
        return 'color-orange';
    } else {
        return 'color-green';
    }
}