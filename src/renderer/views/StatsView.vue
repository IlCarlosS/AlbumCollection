<!-- StatsView.vue -->
<template>
  <div class="space-y-8">
    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-bold text-accent">Estadísticas de Reproducción</h2>
      <button @click="store.fetchAllData()" class="text-text-dim hover:text-accent transition-colors text-sm">
        Refrescar datos 🔄
      </button>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <div class="bg-dark-surface p-5 rounded-lg border border-dark-border space-y-4">
        <h3 class="text-accent font-bold uppercase text-xs tracking-widest border-b border-dark-border pb-2">Resumen Global</h3>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <span class="text-text-dim block text-[10px] uppercase font-bold">Total Escuchas</span>
            <span class="text-2xl font-bold text-softWhite">{{ totalPlays }}</span>
          </div>
          <div>
            <span class="text-text-dim block text-[10px] uppercase font-bold">Discos Totales</span>
            <span class="text-2xl font-bold text-softWhite">{{ store.albums.length }}</span>
          </div>
          <div class="col-span-2">
            <span class="text-text-dim block text-[10px] uppercase font-bold">Tiempo Total (Min)</span>
            <span class="text-2xl font-bold text-softWhite">{{ totalMinutes.toLocaleString() }}</span>
          </div>
        </div>
      </div>

      <div class="bg-dark-surface p-5 rounded-lg border border-dark-border border-l-4 border-l-blue-500 space-y-4">
        <h3 class="text-blue-400 font-bold uppercase text-xs tracking-widest border-b border-dark-border pb-2 text-center">Formato CD</h3>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <span class="text-text-dim block text-[10px] uppercase font-bold">Nº de CDs</span>
            <span class="text-xl font-bold">{{ cdStats.count }}</span>
          </div>
          <div>
            <span class="text-text-dim block text-[10px] uppercase font-bold">Digitalizados</span>
            <span class="text-xl font-bold text-green-400">{{ cdStats.digitalized }}</span>
          </div>
          <div>
            <span class="text-text-dim block text-[10px] uppercase font-bold">Escuchas</span>
            <span class="text-xl font-bold font-mono">{{ cdStats.plays }}</span>
          </div>
          <div>
            <span class="text-text-dim block text-[10px] uppercase font-bold">Minutos</span>
            <span class="text-xl font-bold font-mono">{{ cdStats.minutes.toLocaleString() }}</span>
          </div>
        </div>
      </div>

      <div class="bg-dark-surface p-5 rounded-lg border border-dark-border border-l-4 border-l-purple-500 space-y-4">
        <h3 class="text-purple-400 font-bold uppercase text-xs tracking-widest border-b border-dark-border pb-2 text-center">Formato Vinilo</h3>
        <div class="grid grid-cols-2 gap-4 text-center">
          <div class="col-span-2">
            <span class="text-text-dim block text-[10px] uppercase font-bold">Nº de Vinilos</span>
            <span class="text-2xl font-bold">{{ vinylStats.count }}</span>
          </div>
          <div>
            <span class="text-text-dim block text-[10px] uppercase font-bold">Escuchas</span>
            <span class="text-xl font-bold font-mono">{{ vinylStats.plays }}</span>
          </div>
          <div>
            <span class="text-text-dim block text-[10px] uppercase font-bold">Minutos</span>
            <span class="text-xl font-bold font-mono">{{ vinylStats.minutes.toLocaleString() }}</span>
          </div>
        </div>
      </div>

    </div>

    <div class="space-y-4">
      <h3 class="text-lg font-bold text-softWhite">Desglose por Álbum</h3>
      <div class="bg-dark-surface rounded-lg border border-dark-border overflow-hidden">
        <table class="w-full text-left text-sm">
          <thead>
            <tr class="bg-black/30 text-text-dim text-[10px] uppercase tracking-wider">
              <th class="px-6 py-3 border-b border-dark-border">Álbum / Artista</th>
              <th class="px-6 py-3 border-b border-dark-border text-center">Escuchas</th>
              <th class="px-6 py-3 border-b border-dark-border text-center">Total Min</th>
              <th class="px-6 py-3 border-b border-dark-border text-center">Digital</th>
              <th class="px-6 py-3 border-b border-dark-border text-right">Última vez</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-dark-border">
            <tr v-for="stat in store.stats" :key="stat.album_id" class="hover:bg-white/5 transition-colors group">
              <td class="px-6 py-4">
                <div class="font-bold text-softWhite">{{ stat.title }}</div>
                <div class="text-xs text-text-dim">{{ stat.artist }} ({{ stat.format }})</div>
              </td>
              
              <td class="px-6 py-4 text-center">
                <input 
                  type="number" 
                  v-model.number="stat.play_count"
                  @change="updateStat(stat)"
                  min="0"
                  class="w-16 bg-black/40 border border-dark-border rounded text-center text-accent font-mono p-1 focus:border-accent outline-none"
                >
              </td>

              <td class="px-6 py-4 text-center text-text-dim font-mono">
                {{ stat.total_minutes }}
              </td>

              <td class="px-6 py-4 text-center">
                <select 
                  v-model.number="stat.digitalization"
                  @change="updateStat(stat)"
                  class="bg-black/40 border border-dark-border rounded text-[10px] p-1 text-softWhite outline-none focus:border-accent"
                  :class="stat.digitalization ? 'text-green-400' : 'text-red-400'"
                >
                  <option :value="1">SÍ</option>
                  <option :value="0">NO</option>
                </select>
              </td>

              <td class="px-6 py-4 text-right text-xs text-text-dim font-mono">
                {{ stat.last_played ? stat.last_played : 'Nunca' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useAlbumStore } from '../stores/albumStore.js';

const store = useAlbumStore();

// Aseguramos que los datos estén cargados al entrar a la vista
onMounted(() => {
  store.fetchAllData();
});

// FUNCIÓN DE ACTUALIZACIÓN Y CÁLCULO
const updateStat = async (stat) => {
  // 1. Calculamos el total de minutos localmente primero
  // Asegúrate de que 'stat.minutes' exista (viene del JOIN en el main.js)
  const albumMinutes = stat.minutes || 0;
  stat.total_minutes = stat.play_count * albumMinutes;
  
  // 2. Generamos la fecha actual para el feedback visual
  const now = new Date().toISOString().replace('T', ' ').split('.')[0];
  stat.last_played = now;

  // 3. Preparamos el paquete para la DB
  const updatedData = {
    album_id: stat.album_id,
    play_count: stat.play_count,
    total_minutes: stat.total_minutes,
    digitalization: stat.digitalization,
    last_played: now
  };

  try {
    // 4. Intentamos guardar
    await store.saveStatEdit(updatedData);
  } catch (err) {
    console.error("Fallo al persistir en DB:", err);
  }
};

// --- Lógica de Cálculos (Cerebro de la View) ---

const totalPlays = computed(() => {
  return store.stats.reduce((acc, s) => acc + s.play_count, 0);
});

const totalMinutes = computed(() => {
  return store.stats.reduce((acc, s) => acc + s.total_minutes, 0);
});

const cdStats = computed(() => {
  const cds = store.stats.filter(s => s.format === 'CD');
  return {
    count: store.albums.filter(a => a.format === 'CD').length,
    digitalized: cds.filter(s => s.digitalization === 1).length,
    plays: cds.reduce((acc, s) => acc + s.play_count, 0),
    minutes: cds.reduce((acc, s) => acc + s.total_minutes, 0)
  };
});

const vinylStats = computed(() => {
  const vinyls = store.stats.filter(s => s.format === 'Vinyl');
  return {
    count: store.albums.filter(a => a.format === 'Vinyl').length,
    plays: vinyls.reduce((acc, s) => acc + s.play_count, 0),
    minutes: vinyls.reduce((acc, s) => acc + s.total_minutes, 0)
  };
});

// Formateador de fecha simple
const formatDate = (dateStr) => {
  if (!dateStr) return '';
  // Convertimos el formato de SQLite a algo más legible si se prefiere
  return dateStr.split(' ')[0]; 
};
</script>