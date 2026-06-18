//src/main/main.js
// import { app, BrowserWindow, ipcMain } from 'electron';
// import path from 'path';
// import { fileURLToPath } from 'url';
// import { initDatabase } from './db.js';
// import db from './db.js';

// const __dirname = path.dirname(fileURLToPath(import.meta.url));
// const isDev = !app.isPackaged;
// const { ipcMain, dialog, app } = require('electron');
// const fs = require('fs');
// const path = require('path');

import { app, BrowserWindow, ipcMain, dialog } from 'electron'; // Añadimos dialog aquí
import fs from 'fs'; // Importamos fs con sintaxis moderna
import path from 'path';
import { fileURLToPath } from 'url';
import { initDatabase } from './db.js';
import db from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isDev = !app.isPackaged;

function createWindow() {
  const win = new BrowserWindow({
  width: 1100,
  height: 800,
  icon: path.join(__dirname, '../../resources/icon.ico'),
  autoHideMenuBar: true, //ocultar barra menu
  webPreferences: {
    // Usamos path.resolve para asegurar que la ruta sea absoluta y correcta
    preload: path.join(__dirname, '../preload/preload.cjs'),
    nodeIntegration: false,
    contextIsolation: true,
    sandbox: false // Añade esto para permitir que el preload cargue correctamente en modo manual
  },
  backgroundColor: '#121212'
});

  if (isDev) {
    win.loadURL('http://localhost:3000');
  } else {
    win.loadFile(path.join(__dirname, '../../dist/index.html'));
  }
}

app.whenReady().then(() => {
  initDatabase(); // Crea las tablas si no existen
  createWindow();
});

// --- MANEJADORES DE LA BASE DE DATOS (IPC) ---
// 1. ÁLBUMES: Obtener lista
ipcMain.handle('db:getAlbums', () => {
  return db.prepare('SELECT * FROM albums ORDER BY artist ASC').all();
});

// 2. ÁLBUMES: Agregar (con stats iniciales)
ipcMain.handle('db:addAlbum', (event, album) => {
  const insertAlbum = db.prepare(`
    INSERT INTO albums (artist, title, format, minutes) 
    VALUES (?, ?, ?, ?)
  `);
  
  const result = insertAlbum.run(album.artist, album.title, album.format, album.minutes || 0);
  
  // Inicializar stats con digitalization
  db.prepare(`
    INSERT INTO playback_stats (album_id, digitalization) 
    VALUES (?, ?)
  `).run(result.lastInsertRowid, album.digitalization ? 1 : 0);

  return result;
});

// 3. ÁLBUMES: Actualizar (Editar) - CORREGIDO
ipcMain.handle('db:updateAlbum', (event, album) => {
  // Actualizamos la tabla principal
  db.prepare(`
    UPDATE albums 
    SET artist = ?, title = ?, format = ?, minutes = ? 
    WHERE id = ?
  `).run(album.artist, album.title, album.format, album.minutes, album.id);

  // Actualizamos la digitalización en la tabla de stats
  db.prepare(`
    UPDATE playback_stats 
    SET digitalization = ? 
    WHERE album_id = ?
  `).run(album.digitalization ? 1 : 0, album.id);

  return { success: true };
});

// 4. ÁLBUMES: Eliminar
ipcMain.handle('db:deleteAlbum', (event, id) => {
  return db.prepare('DELETE FROM albums WHERE id = ?').run(id);
});

// 5. ESTADÍSTICAS: Obtener todas (con JOIN para tener nombres)
ipcMain.handle('db:getStats', () => {
  // Hacemos un JOIN para que la vista de stats sepa qué disco es cada uno
  return db.prepare(`
    SELECT s.*, a.artist, a.title, a.format, a.minutes
    FROM playback_stats s
    JOIN albums a ON s.album_id = a.id
    ORDER BY s.play_count DESC
  `).all();
});

// 6. ESTADÍSTICAS: Nueva reproducción (+1 automático) - CORREGIDO
ipcMain.handle('db:updatePlayback', (event, data) => {
  const update = db.prepare(`
    UPDATE playback_stats 
    SET play_count = play_count + 1, 
        total_minutes = total_minutes + ?, 
        last_played = datetime('now', 'localtime') 
    WHERE album_id = ?
  `);
  return update.run(data.minutes, data.album_id);
});

ipcMain.handle('db:saveStatEdit', (event, data) => {
  const update = db.prepare(`
    UPDATE playback_stats 
    SET play_count = ?, 
        total_minutes = ?, 
        digitalization = ?, 
        last_played = ? 
    WHERE album_id = ?
  `);
  return update.run(
    data.play_count, 
    data.total_minutes, 
    data.digitalization, 
    data.last_played, 
    data.album_id
  );
});

// 7. WISHLIST: Obtener
ipcMain.handle('db:getWishlist', () => {
  return db.prepare('SELECT * FROM wishlist ORDER BY id DESC').all();
});

// 8. WISHLIST: Agregar
ipcMain.handle('db:addToWishlist', (event, item) => {
  const insert = db.prepare(`
    INSERT INTO wishlist (artist, title, format, target_price, avg_price, link, priority) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  return insert.run(
    item.artist, 
    item.title, 
    item.format, 
    item.target_price || 0, 
    item.avg_price || 0, 
    item.link || '', 
    item.priority || 'Media'
  );
});

// Editar para la Wishlist (importante para actualizar precios)
ipcMain.handle('db:updateWishlist', (event, item) => {
  const update = db.prepare(`
      UPDATE wishlist 
      SET artist = ?, title = ?, format = ?, target_price = ?, 
          avg_price = ?, price_sum = ?, price_count = ?, 
          link = ?, priority = ? 
      WHERE id = ?
    `);

    update.run(
      item.artist, 
      item.title, 
      item.format, 
      item.target_price,
      item.avg_price, 
      item.price_sum, 
      item.price_count,
      item.link, 
      item.priority, 
      item.id
    );
});

// Eliminar para la Wishlist
ipcMain.handle('db:deleteWishlist', (event, id) => {
  return db.prepare('DELETE FROM wishlist WHERE id = ?').run(id);
});

// exportar base de datos
ipcMain.handle('export-database', async (event) => {
  try {
    // 1. Ruta de la base de datos original (ajusta el nombre si es distinto)
    const sourcePath = path.join(app.getPath('userData'), 'albumcollection.db');

    // 2. Abrir la ventana de Windows de "Guardar como..."
    const { canceled, filePath } = await dialog.showSaveDialog({
      title: 'Exportar Copia de Seguridad',
      defaultPath: 'musicstats_backup.db',
      buttonLabel: 'Exportar',
      filters: [
        { name: 'Base de Datos SQLite', extensions: ['db', 'sqlite'] },
        { name: 'Todos los Archivos', extensions: ['*'] }
      ]
    });

    // Si el usuario cierra la ventana o le da a cancelar
    if (canceled) {
      return { success: false, canceled: true };
    }

    // 3. Copiar el archivo de la carpeta oculta a la ruta elegida por el usuario
    fs.copyFileSync(sourcePath, filePath);
    
    return { success: true, path: filePath };
  } catch (error) {
    console.error('Error al exportar la base de datos:', error);
    return { success: false, error: error.message };
  }
});

// importar base de datos
ipcMain.handle('import-database', async (event) => {
  try {
    // 1. Abrimos la ventana de Windows para seleccionar un archivo
    const { canceled, filePaths } = await dialog.showOpenDialog({
      title: 'Importar Base de Datos',
      buttonLabel: 'Importar y Sobrescribir',
      properties: ['openFile'],
      filters: [
        { name: 'Base de Datos SQLite', extensions: ['db', 'sqlite'] },
        { name: 'Todos los Archivos', extensions: ['*'] }
      ]
    });

    // Si el usuario cierra la ventana o cancela
    if (canceled || filePaths.length === 0) {
      return { success: false, canceled: true };
    }

    // 2. Rutas de origen (el archivo elegido) y destino (la app interna)
    const sourcePath = filePaths[0];
    const destPath = path.join(app.getPath('userData'), 'albumcollection.db');

    // 3. Sobrescribimos el archivo interno con el importado
    fs.copyFileSync(sourcePath, destPath);
    
    return { success: true };
  } catch (error) {
    console.error('Error al importar la base de datos:', error);
    return { success: false, error: error.message };
  }
});