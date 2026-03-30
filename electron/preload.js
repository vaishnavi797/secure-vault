const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    getAssets: () => ipcRenderer.invoke('db:get-assets'),
    saveAsset: (asset) => ipcRenderer.invoke('db:save-asset', asset),
    deleteAsset: (id) => ipcRenderer.invoke('db:delete-asset', id),
    openFileDialog: () => ipcRenderer.invoke('file:open-dialog'),
    readFile: (path) => ipcRenderer.invoke('file:read-content', path),
    onVaultLocked: (callback) => ipcRenderer.on('vault-locked', (event, ...args) => callback(...args)),
    lockVault: () => ipcRenderer.send('vault-lock-trigger'),
    window: {
        minimize: () => ipcRenderer.send('window:minimize'),
        maximize: () => ipcRenderer.send('window:maximize'),
        close: () => ipcRenderer.send('window:close')
    }
});
