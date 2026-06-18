<!-- StatsView.vue -->
<template>
  <div class="space-y-8">
    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-bold text-accent">Estadísticas de Reproducción</h2>
      <div class="flex items-center gap-4">
        <button @click="store.fetchAllData()" class="text-text-dim hover:text-accent transition-colors text-sm">
          Refrescar datos 🔄
        </button>
        
        <select 
          v-model="dataAction" 
          @change="handleDataAction"
          class="bg-black/40 border border-dark-border rounded text-sm p-1.5 text-softWhite outline-none focus:border-accent cursor-pointer"
        >
          <option value="" disabled>Gestión de Datos...</option>
          <option value="export">Exportar Base de Datos</option>
          <option value="import">Importar Base de Datos</option>
        </select>
      </div>
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
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <h3 class="text-lg font-bold text-softWhite">Desglose por Álbum</h3>
        
        <div class="relative w-full sm:w-72">
          <input 
            type="text" 
            v-model="searchQuery"
            placeholder="Buscar álbum o artista..." 
            class="w-full bg-black/40 border border-dark-border text-softWhite rounded p-2 pl-9 outline-none focus:border-accent transition-colors text-sm"
          >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 absolute left-3 top-2.5 text-text-dim" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <div class="bg-dark-surface rounded-lg border border-dark-border overflow-hidden">
        <table class="w-full text-left text-sm">
          <thead>
            <tr class="bg-black/30 text-text-dim text-[10px] uppercase tracking-wider">
              <th @click="toggleSort('title')" class="px-6 py-3 border-b border-dark-border cursor-pointer hover:text-softWhite transition-colors select-none group">
                <div class="flex items-center gap-1">
                  <span>Álbum / Artista</span>
                  <span class="text-[10px]" :class="sortKey === 'title' ? 'text-accent' : 'text-text-dim/30 group-hover:text-accent/50'">
                    {{ sortKey === 'title' ? (sortAsc ? '▲' : '▼') : '▲▼' }}
                  </span>
                </div>
              </th>
              <th @click="toggleSort('play_count')" class="px-6 py-3 border-b border-dark-border cursor-pointer hover:text-softWhite transition-colors select-none group">
                <div class="flex items-center justify-center gap-1">
                  <span>Escuchas</span>
                  <span class="text-[10px]" :class="sortKey === 'play_count' ? 'text-accent' : 'text-text-dim/30 group-hover:text-accent/50'">
                    {{ sortKey === 'play_count' ? (sortAsc ? '▲' : '▼') : '▲▼' }}
                  </span>
                </div>
              </th>
              <th @click="toggleSort('total_minutes')" class="px-6 py-3 border-b border-dark-border cursor-pointer hover:text-softWhite transition-colors select-none group">
                <div class="flex items-center justify-center gap-1">
                  <span>Total Min</span>
                  <span class="text-[10px]" :class="sortKey === 'total_minutes' ? 'text-accent' : 'text-text-dim/30 group-hover:text-accent/50'">
                    {{ sortKey === 'total_minutes' ? (sortAsc ? '▲' : '▼') : '▲▼' }}
                  </span>
                </div>
              </th>
              <th @click="toggleSort('digitalization')" class="px-6 py-3 border-b border-dark-border cursor-pointer hover:text-softWhite transition-colors select-none group">
                <div class="flex items-center justify-center gap-1">
                  <span>Digital</span>
                  <span class="text-[10px]" :class="sortKey === 'digitalization' ? 'text-accent' : 'text-text-dim/30 group-hover:text-accent/50'">
                    {{ sortKey === 'digitalization' ? (sortAsc ? '▲' : '▼') : '▲▼' }}
                  </span>
                </div>
              </th>
              <th @click="toggleSort('last_played')" class="px-6 py-3 border-b border-dark-border cursor-pointer hover:text-softWhite transition-colors select-none group">
                <div class="flex items-center justify-end gap-1">
                  <span>Última vez</span>
                  <span class="text-[10px]" :class="sortKey === 'last_played' ? 'text-accent' : 'text-text-dim/30 group-hover:text-accent/50'">
                    {{ sortKey === 'last_played' ? (sortAsc ? '▲' : '▼') : '▲▼' }}
                  </span>
                </div>
              </th>
            </tr>
          </thead>
          
          <tbody class="divide-y divide-dark-border">
            <tr v-for="stat in processedStats" :key="stat.album_id" class="hover:bg-white/5 transition-colors group">
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
import { ref, computed, onMounted } from 'vue';
import { useAlbumStore } from '../stores/albumStore.js';

const store = useAlbumStore();
const searchQuery = ref('');
const sortKey = ref('last_played'); // Columna por defecto al cargar
const sortAsc = ref(false); // false = mayor a menor (descendente)
const dataAction = ref('');

// Datos estén cargados al entrar a la vista
onMounted(() => {
  store.fetchAllData();
});

// Manejador del select
const handleDataAction = async () => {
  if (dataAction.value === 'export') {
    try {
      // Electron para que abra la ventana de guardado
      const result = await window.api.exportDatabase();
      
      if (result.success) {
        // alert despues usar toast o modal
        alert('Copia de seguridad guardada con éxito en:\n' + result.path);
      } else if (!result.canceled) {
        alert('Ocurrió un error al exportar:\n' + result.error);
      }
    } catch (err) {
      console.error("Error ejecutando la exportación:", err);
    }
  }
  else if (dataAction.value === 'import') {
    // NUEVA LÓGICA DE IMPORTACIÓN
    try {
      const result = await window.api.importDatabase();
      
      if (result.success) {
        alert('Base de datos importada con éxito. Actualizando vista...');
        // Refrescamos los datos en el store para ver los cambios de inmediato
        await store.fetchAllData(); 
      } else if (!result.canceled) {
        alert('Ocurrió un error al importar:\n' + result.error);
      }
    } catch (err) {
      console.error("Error ejecutando la importación:", err);
    }
  }
  
  // IMPORTANTE: select a su estado por defecto
  dataAction.value = '';
};

// Función para cambiar la columna o la dirección del orden
const toggleSort = (key) => {
  if (sortKey.value === key) {
    // Si ya estamos en esa columna, invertimos el orden
    sortAsc.value = !sortAsc.value;
  } else {
    // Si cambiamos de columna, por defecto ordenamos descendente (los mayores arriba)
    sortKey.value = key;
    sortAsc.value = false;
  }
};

// El "Cerebro" de la tabla: Filtra y luego ordena
const processedStats = computed(() => {
  // Filtrado por Búsqueda (Buscador)
  let result = store.stats.filter(stat => {
    if (!searchQuery.value) return true;
    
    const query = searchQuery.value.toLowerCase();
    const titleMatch = stat.title?.toLowerCase().includes(query);
    const artistMatch = stat.artist?.toLowerCase().includes(query);
    
    return titleMatch || artistMatch;
  });

  // Ordenamiento (Cabeceras)
  return result.sort((a, b) => {
    let valA = a[sortKey.value];
    let valB = b[sortKey.value];

    // Manejo especial para strings (ignorar mayúsculas/minúsculas)
    if (typeof valA === 'string') valA = valA.toLowerCase();
    if (typeof valB === 'string') valB = valB.toLowerCase();

    // Manejo especial para fechas nulas ('Nunca')
    if (sortKey.value === 'last_played') {
      if (!valA) return sortAsc.value ? -1 : 1; // Manda los nulos al final
      if (!valB) return sortAsc.value ? 1 : -1;
    }

    // Lógica de comparación
    if (valA < valB) return sortAsc.value ? -1 : 1;
    if (valA > valB) return sortAsc.value ? 1 : -1;
    return 0;
  });
});

// FUNCIÓN DE ACTUALIZACIÓN Y CÁLCULO
const updateStat = async (stat) => {
  // 1. Calculo  total de minutos localmente primero
  const albumMinutes = stat.minutes || 0;
  stat.total_minutes = stat.play_count * albumMinutes;
  
  // 2. Generamos la fecha local exacta para SQLite
  const d = new Date();
  // Ajustes la fecha restando los minutos de diferencia de la zona horaria
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  const now = d.toISOString().replace('T', ' ').split('.')[0];
  
  stat.last_played = now;

  // 3. paquete para la DB
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