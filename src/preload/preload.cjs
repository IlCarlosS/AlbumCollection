const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  // Álbumes
  getAlbums: () => ipcRenderer.invoke('db:getAlbums'),
  addAlbum: (album) => ipcRenderer.invoke('db:addAlbum', album),
  updateAlbum: (album) => ipcRenderer.invoke('db:updateAlbum', album),
  deleteAlbum: (id) => ipcRenderer.invoke('db:deleteAlbum', id),
  
  // Stats
  getStats: () => ipcRenderer.invoke('db:getStats'),
  updatePlayback: (data) => ipcRenderer.invoke('db:updatePlayback', data),
  saveStatEdit: (data) => ipcRenderer.invoke('db:saveStatEdit', data),

  // Wishlist
  getWishlist: () => ipcRenderer.invoke('db:getWishlist'),
  addToWishlist: (item) => ipcRenderer.invoke('db:addToWishlist', item),
  updateWishlist: (item) => ipcRenderer.invoke('db:updateWishlist', item),
  deleteWishlist: (id) => ipcRenderer.invoke('db:deleteWishlist', id),

  // Función para exportar e importar
  exportDatabase: () => ipcRenderer.invoke('export-database'),
  importDatabase: () => ipcRenderer.invoke('import-database')
});