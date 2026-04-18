import Database from 'better-sqlite3';
import path from 'path';
import { app } from 'electron';

// Ruta persistente para la base de datos
const dbPath = path.join(app.getPath('userData'), 'albumcollection.db');
const db = new Database(dbPath);

export function initDatabase() {
  // 1. Tabla de Álbumes (Estructura simplificada)
  db.prepare(`
    CREATE TABLE IF NOT EXISTS albums (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      artist TEXT NOT NULL,
      title TEXT NOT NULL,
      format TEXT, -- CD o Vinilo
      minutes INTEGER DEFAULT 0 -- Duración del disco movida aquí
    )
  `).run();

  // 2. Tabla de Estadísticas (Relación limpia)
  // Nota: No repetimos artista/título porque ya están en 'albums'
  db.prepare(`
    CREATE TABLE IF NOT EXISTS playback_stats (
      album_id INTEGER PRIMARY KEY,
      play_count INTEGER DEFAULT 0,
      total_minutes INTEGER DEFAULT 0,
      last_played DATETIME, -- Usaremos formato ISO o TIMESTAMP
      digitalization INTEGER DEFAULT 0, -- 0 para No, 1 para Sí
      FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE CASCADE
    )
  `).run();

  // 3. Tabla de Wishlist
  db.prepare(`
    CREATE TABLE IF NOT EXISTS wishlist (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      artist TEXT NOT NULL,
      title TEXT NOT NULL,
      format TEXT,
      target_price REAL,      -- El precio actual/último encontrado
      avg_price REAL,         -- El promedio calculado (Suma / Cuenta)
      price_sum REAL DEFAULT 0, -- Suma acumulada de todos los precios registrados
      price_count INTEGER DEFAULT 0, -- Total de veces que se ha actualizado el precio
      link TEXT,
      priority TEXT
    )
  `).run();

  console.log('Base de datos inicializada con el nuevo esquema.');
}

export default db;