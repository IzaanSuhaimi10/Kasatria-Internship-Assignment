// js/auth.js

let tokenClient;
let accessToken = null;
let isSignedIn = false;

// Initialize Google Identity Services
function initGoogleAuth() {
    console.log('🔑 Initializing Google Identity Services...');
    
    // Initialize the token client for OAuth 2.0
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CONFIG.CLIENT_ID,
        scope: CONFIG.SCOPES,
        callback: (response) => {
            if (response.error !== undefined) {
                console.error('❌ Token error:', response);
                throw response;
            }
            console.log('✅ Access token received');
            accessToken = response.access_token;
            handleSignInSuccess();
        },
    });
    
    console.log('✅ Google Identity Services initialized');
    
    // Set up button handlers
    document.getElementById('authorize-button').onclick = handleAuthClick;
    document.getElementById('signout-button').onclick = handleSignoutClick;
}

// Handle sign-in button click
function handleAuthClick() {
    console.log('🔐 Requesting access token...');
    
    // Request an access token
    tokenClient.requestAccessToken({ prompt: 'consent' });
}

// Handle successful sign-in
function handleSignInSuccess() {
    console.log('✅ User signed in successfully');
    isSignedIn = true;
    
    // Get user info
    fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    })
    .then(response => response.json())
    .then(userInfo => {
        console.log('👤 User info:', userInfo.name);
        
        // Update UI
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('main-app').classList.remove('hidden');
        document.getElementById('user-name').textContent = userInfo.name;
        
        // Initialize Google API client for Sheets
        initGapiClient();
    })
    .catch(error => {
        console.error('❌ Error getting user info:', error);
    });
}

// Initialize Google API Client (for Sheets API)
function initGapiClient() {
    console.log('📊 Initializing Google Sheets API...');
    
    gapi.load('client', () => {
        gapi.client.init({
            apiKey: CONFIG.API_KEY,
            discoveryDocs: CONFIG.DISCOVERY_DOCS,
        }).then(() => {
            console.log('✅ Google Sheets API initialized');
            gapi.client.setToken({ access_token: accessToken });
            
            // Load sheet data
            loadSheetData();
        }).catch(error => {
            console.error('❌ Error initializing Sheets API:', error);
        });
    });
}

// Handle sign-out
function handleSignoutClick() {
    console.log('👋 Signing out...');
    
    if (accessToken) {
        // Revoke the token
        google.accounts.oauth2.revoke(accessToken, () => {
            console.log('✅ Token revoked');
        });
        accessToken = null;
    }
    
    isSignedIn = false;
    
    // Update UI
    document.getElementById('login-screen').classList.remove('hidden');
    document.getElementById('main-app').classList.add('hidden');
}

// Wait for page to load
window.addEventListener('load', () => {
    console.log('📄 Page loaded');
    
    // Wait a bit for Google scripts to load
    setTimeout(() => {
        if (typeof google !== 'undefined' && typeof gapi !== 'undefined') {
            console.log('✅ Google libraries loaded');
            initGoogleAuth();
        } else {
            console.error('❌ Google libraries failed to load');
            alert('Failed to load Google Sign-In. Please refresh the page.');
        }
    }, 1000);

});
