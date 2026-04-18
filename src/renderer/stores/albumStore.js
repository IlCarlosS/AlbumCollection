import { defineStore } from 'pinia';
export const useAlbumStore = defineStore('albums', {
  state: () => ({
    albums: [],
    stats: [],
    wishlist: [],
    loading: false,
    error: null
  }),

  actions: {
    // Carga inicial de toda la base de datos
    async fetchAllData() {
      this.loading = true;
      try {
        const [albums, stats, wishlist] = await Promise.all([
          window.api.getAlbums(),
          window.api.getStats(),
          window.api.getWishlist()
        ]);
        this.albums = albums;
        this.stats = stats;
        this.wishlist = wishlist;
      } catch (err) {
        this.error = "Error al cargar la base de datos";
        console.error(err);
      } finally {
        this.loading = false;
      }
    },

    // --- Acciones de Colección ---
    
    async addAlbum(album) {
      try {
        // album debe contener: artist, title, format, minutes, digitalization
        await window.api.addAlbum(album);
        await this.fetchAllData(); 
      } catch (err) {
        console.error("Error al añadir álbum:", err);
      }
    },

    async updateAlbum(album) {
      try {
        await window.api.updateAlbum(album);
        await this.fetchAllData();
      } catch (err) {
        console.error("Error al actualizar álbum:", err);
      }
    },

    async deleteAlbum(id) {
      try {
        await window.api.deleteAlbum(id);
        // Actualizamos estado local para respuesta inmediata
        this.albums = this.albums.filter(a => a.id !== id);
        this.stats = this.stats.filter(s => s.album_id !== id);
      } catch (err) {
        console.error("Error al eliminar álbum:", err);
      }
    },

    // --- Acciones de Playback ---
    
    async registerPlay(albumId, minutes) {
      try {
        // Ahora solo mandamos el ID y los minutos, SQLite hace el resto (+1 y fecha)
        await window.api.updatePlayback({ album_id: albumId, minutes });
        await this.fetchAllData();
      } catch (err) {
        console.error("Error al registrar reproducción:", err);
      }
    },

    // --- Acciones de Wishlist ---
    
    async addToWishlist(item) {
      try {
        await window.api.addToWishlist(item);
        await this.fetchAllData();
      } catch (err) {
        console.error("Error en wishlist:", err);
      }
    },

    async saveStatEdit(statData) {
      try {
        await window.api.saveStatEdit(statData);
        // No hace falta fetchAllData si actualizamos el state localmente, 
        // pero es más seguro para mantener la sincronía.
        await this.fetchAllData(); 
      } catch (err) {
        console.error("Error al guardar edición de estadística:", err);
      }
    },

    async updateWishlistPrice(item, newPrice) {
      try {
        const updatedCount = item.price_count + 1;
        const updatedSum = item.price_sum + newPrice;
        const newAvg = updatedSum / updatedCount;

        await window.api.updateWishlist({
          ...item,
          target_price: newPrice,
          avg_price: newAvg,
          price_sum: updatedSum,
          price_count: updatedCount
        });
        await this.fetchAllData();
      } catch (err) {
        console.error("Error al actualizar precio:", err);
      }
    },

    async updatePriceEntry(item, newPrice) {
      // Si el usuario borra el número y deja el campo vacío, salimos para evitar errores
      if (newPrice === '' || newPrice === null) return;

      try {
        const priceValue = Number(newPrice);
        
        // 1. Calculamos los nuevos valores basados en el historial previo del item
        const updatedCount = (item.price_count || 0) + 1;
        const updatedSum = (item.price_sum || 0) + priceValue;
        const updatedAvg = updatedSum / updatedCount;

        // 2. Preparamos el objeto actualizado
        const updatedItem = {
          ...item,
          target_price: priceValue,
          avg_price: updatedAvg,
          price_sum: updatedSum,
          price_count: updatedCount
        };

        // 3. Enviamos a la base de datos
        await window.api.updateWishlist(updatedItem);
        
        // 4. Refrescamos el store para actualizar la tendencia y el promedio en la UI
        await this.fetchAllData();
      } catch (err) {
        console.error("Error al recalcular el precio:", err);
      }
    }

  }
});