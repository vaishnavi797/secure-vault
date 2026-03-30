const { app, BrowserWindow, ipcMain, dialog, Tray, Menu, globalShortcut, Notification } = require('electron');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const Datastore = require('nedb-promises');

// Encryption Settings
const ENCRYPTION_KEY = crypto.scryptSync('securevault-secret-pwd', 'salt', 32);
const IV_LENGTH = 16;

function encrypt(text) {
    let iv = crypto.randomBytes(IV_LENGTH);
    let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
    try {
        if (!text || !text.includes(':')) return text; // Not encrypted or malformed
        let textParts = text.split(':');
        let iv = Buffer.from(textParts.shift(), 'hex');
        let encryptedText = Buffer.from(textParts.join(':'), 'hex');
        let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    } catch (e) {
        console.error('Decryption failed:', e.message);
        return '--- [ENCRYPTED DATA] ---';
    }
}

// Single Instance Lock
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    app.quit();
} else {
    app.on('second-instance', () => {
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();
        }
    });
}

// Database Setup
const dbPath = path.join(app.getPath('userData'), 'vault.db');
const db = Datastore.create({ 
    filename: dbPath, 
    autoload: false, // Turn off autoload to manage it manually
    corruptAlertThreshold: 1
});

// Sync-like initialization to prevent EBUSY
async function initDB() {
    try {
        await db.load();
        console.log('--- DATABASE LOADED SECURELY ---');
    } catch (e) {
        console.error('DB INIT CRITICAL ERROR:', e);
    }
}
initDB();

let mainWindow;
let tray;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        icon: path.join(__dirname, '../public/favicon.svg'),
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        },
        backgroundColor: '#0f172a',
        frame: false, // Custom title bar for premium look
        show: false
    });

    // In dev use vite server, in prod use build
    const isDev = !app.isPackaged;
    const VIT_URL = `http://localhost:5173`;

    if (isDev) {
        const tryLoad = () => {
            console.log('--- ATTEMPTING VITE CONNECTION ---');
            mainWindow.loadURL(VIT_URL).catch(() => {
                console.log('--- VITE NOT READY, RETRYING IN 1S ---');
                setTimeout(tryLoad, 1000);
            });
        };
        tryLoad();
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // Tray logic
    setupTray();

    // Global Shortcut: Panic Key (Ctrl+Shift+L)
    globalShortcut.register('CommandOrControl+Shift+L', () => {
        if (mainWindow) {
            mainWindow.hide();
            mainWindow.webContents.send('vault-locked');
            new Notification({ 
                title: 'SecureVault', 
                body: 'Panic Mode: Vault Locked & Hidden',
                icon: path.join(__dirname, '../public/favicon.svg') 
            }).show();
        }
    });
}

function setupTray() {
    try {
        const iconPath = path.join(app.getAppPath(), 'public/favicon.svg');
        tray = new Tray(iconPath);
        const contextMenu = Menu.buildFromTemplate([
            { label: 'Restore Vault', click: () => mainWindow.show() },
            { label: 'Quick Lock', click: () => {
                 mainWindow.hide();
                 mainWindow.webContents.send('vault-locked');
            }},
            { type: 'separator' },
            { label: 'Status: Secure', enabled: false },
            { type: 'separator' },
            { label: 'Quit', click: () => app.quit() }
        ]);
        tray.setToolTip('SecureVault - Offline Security Manager');
        tray.setContextMenu(contextMenu);
        tray.on('click', () => {
            mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
        });
    } catch (e) {
        console.log('Tray failed to initialize (usually icon format):', e.message);
    }
}

// IPC Handlers
ipcMain.handle('file:open-dialog', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [
            { name: 'Technical Docs', extensions: ['json', 'log', 'txt', 'csv'] }
        ]
    });
    if (!canceled) {
        return filePaths[0];
    }
});

ipcMain.handle('file:read-content', async (event, filePath) => {
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        return content;
    } catch (error) {
        return `Security Error: Reading file blocked or failed. (${error.message})`;
    }
});

ipcMain.on('vault-lock-trigger', () => {
    if (mainWindow) {
        mainWindow.hide();
        mainWindow.webContents.send('vault-locked');
    }
});

// IPC Handlers
ipcMain.handle('db:get-assets', async () => {
    try {
        await db.load();
        let assets = await db.find({}).sort({ timestamp: -1 });
        
        // AUTO-SEED: If the vault is empty, add 3 professional samples for the demo
        if (assets.length === 0) {
            const samples = [
                { title: 'AWS Production Root', username: 'deploy_user_01', secret: encrypt('AKIA-X9283-SECURE'), type: 'API Key', timestamp: new Date() },
                { title: 'Stripe Payment Hook', username: 'finance_admin', secret: encrypt('sk_live_51P-vault-secret'), type: 'Secret Token', timestamp: new Date() },
                { title: 'HackerOne Bounty', username: 'whitehat_07', secret: encrypt('H1-report-access-2026'), type: 'Password', timestamp: new Date() }
            ];
            await db.insert(samples);
            assets = await db.find({}).sort({ timestamp: -1 });
        }

        return assets.map(asset => ({ ...asset, secret: decrypt(asset.secret) }));
    } catch (e) {
        console.error('Fetch Error:', e);
        return [];
    }
});

ipcMain.handle('db:save-asset', async (event, asset) => {
    try {
        await db.load();
        const encryptedSecret = encrypt(asset.secret);
        return await db.insert({ ...asset, secret: encryptedSecret, timestamp: new Date() });
    } catch (e) {
        console.error('Save Error:', e);
        return null;
    }
});

ipcMain.handle('db:delete-asset', async (event, id) => {
    try {
        await db.load();
        return await db.remove({ _id: id });
    } catch (e) {
        console.error('Delete Error:', e);
        return 0;
    }
});

ipcMain.on('window:close', () => mainWindow?.close());
ipcMain.on('window:minimize', () => mainWindow?.minimize());
ipcMain.on('window:maximize', () => {
    if (mainWindow && mainWindow.isMaximized()) {
        mainWindow.unmaximize();
    } else {
        mainWindow?.maximize();
    }
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('will-quit', () => {
    globalShortcut.unregisterAll();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
