<!-- src/renderer/views/CollectionView.vue -->
<template>
  <div class="space-y-6">
    <div class="flex justify-between items-end mb-6">
      <div class="flex-1">
        <h2 class="text-2xl font-bold text-accent">Mi Colección</h2>
        <p class="text-text-dim text-sm mb-4">Tienes {{ store.albums.length }} discos en tu biblioteca.</p>
        
        <div class="w-full max-w-md">
          <input 
            type="text" 
            v-model="searchQuery"
            placeholder="Buscar por artista o título..." 
            class="w-full bg-black/40 border border-dark-border text-softWhite rounded p-2 outline-none focus:border-accent transition-colors text-sm"
          >
        </div>
      </div>
      
      <button 
        v-if="!showForm"
        @click="openCreateForm"
        class="bg-accent text-dark-bg px-4 py-2 rounded font-bold hover:bg-accent-hover transition-all flex items-center gap-2 h-fit"
      >
        <span>+</span> Añadir Álbum
      </button>
    </div>

    <Transition name="slide">
      <div v-if="showForm" class="bg-dark-surface p-6 rounded-lg border border-dark-border shadow-xl">
        <h3 class="text-lg font-bold mb-4 text-softWhite">
          {{ editingId ? 'Editar Álbum' : 'Nuevo Álbum' }}
        </h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div class="flex flex-col gap-1">
            <label class="text-xs text-text-dim uppercase font-bold">Artista</label>
            <input v-model="form.artist" type="text" placeholder="Ej: Linkin Park" class="bg-dark-bg border border-dark-border text-softWhite rounded p-2 outline-none focus:border-accent">
          </div>
          
          <div class="flex flex-col gap-1">
            <label class="text-xs text-text-dim uppercase font-bold">Título</label>
            <input v-model="form.title" type="text" placeholder="Ej: Meteora" class="bg-dark-bg border border-dark-border text-softWhite rounded p-2 outline-none focus:border-accent">
          </div>
          
          <div class="flex flex-col gap-1">
            <label class="text-xs text-text-dim uppercase font-bold">Formato</label>
            <select v-model="form.format" class="bg-dark-bg border border-dark-border text-softWhite rounded p-2 outline-none focus:border-accent">
              <option value="CD">CD</option>
              <option value="Vinyl">Vinyl</option>
            </select>
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-xs text-text-dim uppercase font-bold">Duración (Minutos)</label>
            <input v-model.number="form.minutes" type="number" placeholder="0" class="bg-dark-bg border border-dark-border text-softWhite rounded p-2 outline-none focus:border-accent">
          </div>
        </div>

        <div class="mt-6 flex justify-end gap-3">
          <button @click="closeForm" class="px-4 py-2 text-text-dim hover:text-softWhite transition-colors">Cancelar</button>
          <button @click="handleSave" class="bg-accent text-dark-bg px-6 py-2 rounded font-bold hover:bg-accent-hover">
            {{ editingId ? 'Guardar Cambios' : 'Registrar Disco' }}
          </button>
        </div>
      </div>
    </Transition>

    <div class="bg-dark-surface rounded-lg border border-dark-border overflow-hidden text-sm">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-black/20 text-text-dim text-xs uppercase cursor-pointer select-none">
            
            <th @click="toggleSort('artist')" class="px-4 py-3 border-b border-dark-border hover:text-softWhite transition-colors group">
              <div class="flex items-center gap-1">
                <span>Artista</span>
                <span class="text-[10px]" :class="sortKey === 'artist' ? 'text-accent' : 'text-text-dim/30 group-hover:text-accent/50'">
                  {{ sortKey === 'artist' ? (sortAsc ? '▲' : '▼') : '▲▼' }}
                </span>
              </div>
            </th>

            <th @click="toggleSort('title')" class="px-4 py-3 border-b border-dark-border hover:text-softWhite transition-colors group">
              <div class="flex items-center gap-1">
                <span>Título</span>
                <span class="text-[10px]" :class="sortKey === 'title' ? 'text-accent' : 'text-text-dim/30 group-hover:text-accent/50'">
                  {{ sortKey === 'title' ? (sortAsc ? '▲' : '▼') : '▲▼' }}
                </span>
              </div>
            </th>

            <th @click="toggleSort('format')" class="px-4 py-3 border-b border-dark-border hover:text-softWhite transition-colors group">
              <div class="flex items-center gap-1">
                <span>Formato</span>
                <span class="text-[10px]" :class="sortKey === 'format' ? 'text-accent' : 'text-text-dim/30 group-hover:text-accent/50'">
                  {{ sortKey === 'format' ? (sortAsc ? '▲' : '▼') : '▲▼' }}
                </span>
              </div>
            </th>

            <th @click="toggleSort('minutes')" class="px-4 py-3 border-b border-dark-border hover:text-softWhite transition-colors group">
              <div class="flex items-center gap-1">
                <span>Duración</span>
                <span class="text-[10px]" :class="sortKey === 'minutes' ? 'text-accent' : 'text-text-dim/30 group-hover:text-accent/50'">
                  {{ sortKey === 'minutes' ? (sortAsc ? '▲' : '▼') : '▲▼' }}
                </span>
              </div>
            </th>

            <th class="px-4 py-3 border-b border-dark-border text-right cursor-default">Acciones</th>
            
          </tr>
        </thead>
        
        <tbody class="divide-y divide-dark-border">
          <tr v-for="album in processedAlbums" :key="album.id" class="hover:bg-white/5 transition-colors group">
            <td class="px-4 py-4 font-semibold text-softWhite">{{ album.artist }}</td>
            <td class="px-4 py-4 italic text-text-dim">{{ album.title }}</td>
            <td class="px-4 py-4">
              <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-dark-bg border border-dark-border uppercase">
                {{ album.format }}
              </span>
            </td>
            <td class="px-4 py-4 text-sm text-text-dim">{{ album.minutes }} min</td>
            <td class="px-4 py-4 text-right space-x-2">
              <button @click="prepareEdit(album)" class="hover:text-accent transition-colors">✏️</button>
              <button @click="handleDelete(album.id)" class="hover:text-red-500 transition-colors">🗑️</button>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="store.albums.length === 0" class="p-20 text-center text-text-dim">
        No hay discos registrados. ¡Añade el primero!
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { useAlbumStore } from '../stores/albumStore.js';

const store = useAlbumStore();
const showForm = ref(false);
const editingId = ref(null);

const searchQuery = ref('');
const sortKey = ref('artist'); // Columna por defecto al cargar
const sortAsc = ref(true);     // Orden ascendente (A-Z) por defecto

const form = reactive({
  artist: '',
  title: '',
  format: 'CD',
  minutes: 0
});

// Cargar datos al montar
onMounted(() => store.fetchAllData());

const openCreateForm = () => {
  editingId.value = null;
  Object.assign(form, { artist: '', title: '', format: 'CD', minutes: 0  });
  showForm.value = true;
};

const prepareEdit = (album) => {
  editingId.value = album.id;
  Object.assign(form, album);
  showForm.value = true;
};

const closeForm = () => {
  showForm.value = false;
};

const handleSave = async () => {
  if (!form.artist || !form.title) return alert("Artista y Título son obligatorios");

  if (editingId.value) {
    // Al actualizar, pasamos el objeto completo (incluye minutes)
    await store.updateAlbum({ ...form, id: editingId.value });
  } else {
    // Al crear, enviamos el objeto
    await store.addAlbum({ ...form });
  }
  
  closeForm();
};

const handleDelete = async (id) => {
  if (confirm("¿Eliminar este disco de la colección?")) {
    await store.deleteAlbum(id);
    await store.fetchAllData();
  }
};

const toggleSort = (key) => {
  if (sortKey.value === key) {
    // Si haces clic en la misma columna, simplemente invierte el orden (A-Z a Z-A)
    sortAsc.value = !sortAsc.value;
  } else {
    // Si haces clic en una columna nueva, cambia la clave y ponlo en A-Z
    sortKey.value = key;
    sortAsc.value = true;
  }
};

// 3.  La propiedad computada (processedAlbums) Vue actualizará la tabla automáticamente cada vez que escribas en el buscador
// o hagas clic en una flecha, sin modificar la base de datos original.
const processedAlbums = computed(() => {
  let result = store.albums;
  // A) Aplicar el Buscador
  if (searchQuery.value.trim() !== '') {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(album => 
      album.artist.toLowerCase().includes(query) || 
      album.title.toLowerCase().includes(query)
    );
  }
  // B) Aplicar el Ordenamiento
  // Usamos [...result] para crear una copia del array y no mutar el original
  result = [...result].sort((a, b) => {
    let valA = a[sortKey.value];
    let valB = b[sortKey.value];

    // Para evitar errores al comparar strings con mayúsculas/minúsculas
    if (typeof valA === 'string') valA = valA.toLowerCase();
    if (typeof valB === 'string') valB = valB.toLowerCase();

    // Lógica mágica de ordenamiento (Ascendente vs Descendente)
    if (valA < valB) return sortAsc.value ? -1 : 1;
    if (valA > valB) return sortAsc.value ? 1 : -1;
    return 0; // Son iguales
  });

  return result;
});
</script>

<style scoped>
.slide-enter-active, .slide-leave-active { transition: all 0.3s ease; }
.slide-enter-from, .slide-leave-to { opacity: 0; transform: translateY(-10px); }
</style>