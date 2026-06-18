<template>
  <div class="flex flex-col h-screen bg-dark-bg text-text-main font-sans overflow-hidden">
    
    <header class="flex items-end bg-dark-surface px-4 pt-3 border-b border-dark-border shadow-md">
      <div class="flex gap-1">
        <button
          v-for="(label, key) in navItems"
          :key="key"
          @click="currentView = key"
          :class="[
            'px-6 py-2 text-sm font-semibold transition-all duration-200 rounded-t-md border-t border-x',
            currentView === key
              ? 'bg-dark-bg border-dark-border text-accent translate-y-[1px]' 
              : 'bg-transparent border-transparent text-text-dim hover:text-text-main hover:bg-dark-bg/20'
          ]"
        >
          {{ label }}
        </button>
      </div>
      
      <div class="flex-1 text-right pb-2 pr-2 text-xs text-text-dim italic">
        AlbumCollection v1.1.2
      </div>
    </header>

    <main class="flex-1 overflow-y-auto p-6 bg-dark-bg">
      <Transition name="fade" mode="out-in">
        <component :is="views[currentView]" />
      </Transition>
    </main>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAlbumStore } from './stores/albumStore.js';

// Importación de las vistas
import CollectionView from './views/CollectionView.vue';
import StatsView from './views/StatsView.vue';
import WishlistView from './views/WishlistView.vue';

const store = useAlbumStore();
const currentView = ref('Collection');

// Diccionario para etiquetas y componentes
const navItems = {
  Collection: 'Colección',
  Stats: 'Lista de reproducción',
  Wishlist: 'Lista de deseos'
};

const views = {
  Collection: CollectionView,
  Stats: StatsView,
  Wishlist: WishlistView
};

// Cargar datos al iniciar
onMounted(() => {
  store.fetchAllData();
});
</script>

<style>
/* Animación de cambio de vista */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Reset básico para asegurar que el scroll sea limpio */
body {
  margin: 0;
  padding: 0;
  user-select: none; /* Evita que se seleccione texto al clickear tabs rápido */
}
</style>