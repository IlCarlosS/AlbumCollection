<template>
  <div class="space-y-6">
    <div class="flex justify-between items-start">
      <div>
        <h2 class="text-2xl font-bold text-accent">Lista de Deseos</h2>
        <p class="text-text-dim text-sm">Monitoreando {{ store.wishlist.length }} posibles compras.</p>
      </div>
      <button v-if="!showForm" @click="openCreateForm" class="bg-accent text-dark-bg px-4 py-2 rounded font-bold hover:bg-accent-hover transition-all">
        + Añadir Disco
      </button>
    </div>

    <Transition name="slide">
      <div v-if="showForm" class="bg-dark-surface p-6 rounded-lg border border-dark-border shadow-xl">
        <h3 class="text-lg font-bold mb-4 text-softWhite text-center">Registrar Nuevo Deseo</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div class="flex flex-col gap-1">
            <label class="text-xs text-text-dim uppercase font-bold">Artista</label>
            <input v-model="form.artist" type="text" placeholder="Ej: Pink Floyd" class="bg-dark-bg border border-dark-border text-softWhite rounded p-2 outline-none focus:border-accent">
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-xs text-text-dim uppercase font-bold">Título</label>
            <input v-model="form.title" type="text" placeholder="Ej: The Wall" class="bg-dark-bg border border-dark-border text-softWhite rounded p-2 outline-none focus:border-accent">
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-xs text-text-dim uppercase font-bold">Formato</label>
            <select v-model="form.format" class="bg-dark-bg border border-dark-border text-softWhite rounded p-2 outline-none focus:border-accent">
              <option value="CD">CD</option>
              <option value="Vinyl">Vinyl</option>
            </select>
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-xs text-text-dim uppercase font-bold">Precio Inicial ($)</label>
            <input v-model.number="form.target_price" type="number" step="0.01" class="bg-dark-bg border border-dark-border text-softWhite rounded p-2 outline-none focus:border-accent">
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-xs text-text-dim uppercase font-bold">Prioridad</label>
            <select v-model="form.priority" class="bg-dark-bg border border-dark-border text-softWhite rounded p-2 outline-none focus:border-accent">
              <option value="Alta">Alta</option>
              <option value="Media">Media</option>
              <option value="Baja">Baja</option>
            </select>
          </div>

          <div class="flex flex-col gap-1 md:col-span-1 lg:col-span-1">
            <label class="text-xs text-text-dim uppercase font-bold">Enlace / Tienda</label>
            <input v-model="form.link" type="url" placeholder="https://..." class="bg-dark-bg border border-dark-border text-softWhite rounded p-2 outline-none focus:border-accent">
          </div>
        </div>

        <div class="mt-6 flex justify-end gap-3">
          <button @click="closeForm" class="px-4 py-2 text-text-dim hover:text-softWhite transition-colors">Cancelar</button>
          <button @click="handleSave" class="bg-accent text-dark-bg px-6 py-2 rounded font-bold hover:bg-opacity-90 transition-all">
            Añadir a la lista
          </button>
        </div>
      </div>
    </Transition>

    <div v-if="!showForm" class="bg-dark-surface rounded-lg border border-dark-border overflow-hidden">
      <table class="w-full text-left text-sm">
        <thead>
          <tr class="bg-black/30 text-text-dim text-[10px] uppercase tracking-wider">
            <th class="px-6 py-4">Álbum / Artista</th>
            <th class="px-6 py-4 text-center">Precio Actual</th>
            <th class="px-6 py-4 text-center">Tendencia</th>
            <th class="px-6 py-4 text-center">Promedio Hist.</th>
            <th class="px-6 py-4 text-center">Prioridad</th>
            <th class="px-6 py-4 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-dark-border">
          <tr v-for="item in store.wishlist" :key="item.id" class="hover:bg-white/5 transition-colors group">
            <td class="px-6 py-4">
              <div class="font-bold text-softWhite">{{ item.title }}</div>
              <div class="text-xs text-text-dim">{{ item.artist }} ({{ item.format }})</div>
            </td>
            
            <td class="px-6 py-4 text-center">
              <div class="flex items-center justify-center gap-1">
                <span class="text-text-dim">$</span>
                <input 
                  type="number" 
                  step="1"
                  :value="item.target_price" 
                  @change="(e) => store.updatePriceEntry(item, e.target.value)"
                  class="w-20 bg-black/20 border border-transparent hover:border-dark-border focus:border-accent text-center font-mono outline-none text-softWhite rounded p-1 transition-all"
                >
              </div>
            </td>

            <td class="px-6 py-4 text-center">
              <span v-if="item.target_price < item.avg_price" class="text-green-400 font-bold text-xs flex items-center justify-center gap-1">
                ▼ BAJÓ
              </span>
              <span v-else-if="item.target_price > item.avg_price" class="text-red-400 font-bold text-xs flex items-center justify-center gap-1">
                ▲ SUBIÓ
              </span>
              <span v-else class="text-text-dim text-xs italic">ESTABLE</span>
            </td>

            <td class="px-6 py-4 text-center font-mono text-text-dim text-xs">
              ${{ item.avg_price ? item.avg_price.toFixed(2) : '0.00' }}
            </td>

            <td class="px-6 py-4 text-center">
              <select 
                v-model="item.priority"
                @change="updatePriority(item)"
                :class="priorityClass(item.priority)"
                class="px-2 py-1 rounded text-[10px] uppercase font-bold outline-none cursor-pointer transition-all border appearance-none text-center bg-transparent"
              >
                <option value="Alta" class="bg-dark-surface text-red-400">Alta</option>
                <option value="Media" class="bg-dark-surface text-orange-400">Media</option>
                <option value="Baja" class="bg-dark-surface text-blue-400">Baja</option>
              </select>
            </td>

            <td class="px-6 py-4 text-right">
              <div class="flex justify-end items-center gap-3">
                <button 
                  v-if="item.link" 
                  @click="copyLink(item.link, item.id)"
                  class="transition-all duration-200 flex items-center gap-1"
                  :class="copiedId === item.id ? 'text-green-400' : 'text-accent hover:text-white'"
                >
                  <span class="text-xs font-bold">
                    {{ copiedId === item.id ? '¡Copiado!' : 'Copiar Link' }}
                  </span>
                  <span>{{ copiedId === item.id ? '✅' : '📋' }}</span>
                </button>

                <button 
                  @click="deleteItem(item.id)" 
                  class="text-red-500/30 hover:text-red-500 transition-colors p-1"
                  title="Eliminar de la lista"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useAlbumStore } from '../stores/albumStore.js';

const store = useAlbumStore();
const showForm = ref(false);
const copiedId = ref(null); // Para mostrar un mensaje de "¡Copiado!" temporal

// 1. Objeto reactivo para el formulario (Estado inicial limpio)
const form = reactive({
  artist: '',
  title: '',
  format: 'CD',
  target_price: 0,
  priority: 'Media',
  link: ''
});

onMounted(() => {
  store.fetchAllData();
});

// 2. Lógica para abrir/cerrar formulario
const openCreateForm = () => {
  Object.assign(form, {
    artist: '',
    title: '',
    format: 'CD',
    target_price: 0,
    priority: 'Media',
    link: ''
  });
  showForm.value = true;
};

const closeForm = () => {
  showForm.value = false;
};

// 3. Lógica de Guardado Inicial (Matemática de arranque)
const handleSave = async () => {
  if (!form.artist || !form.title) {
    alert("Artista y Título son requeridos");
    return;
  }

  try {
    // Al ser el primer registro:
    // La suma es el precio actual, el conteo es 1 y el promedio es el mismo precio.
    const newItem = {
      ...form,
      price_sum: form.target_price,
      price_count: 1,
      avg_price: form.target_price
    };

    await store.addToWishlist(newItem);
    closeForm();
  } catch (err) {
    console.error("Error al guardar en Wishlist:", err);
  }
};

// 4. FUNCIONES DE AYUDA (Las que faltaban y causaban el error)
const priorityClass = (priority) => {
  switch (priority) {
    case 'Alta': return 'bg-red-500/20 text-red-400 border border-red-500/50';
    case 'Media': return 'bg-orange-500/20 text-orange-400 border border-orange-500/50';
    case 'Baja': return 'bg-blue-500/20 text-blue-400 border border-blue-500/50';
    default: return 'bg-gray-500/20 text-gray-400 border border-gray-500/50';
  }
};

const updatePriority = async (item) => {
  try {
    // Usamos el objeto completo con la nueva prioridad ya asignada por v-model
    await window.api.updateWishlist({ ...item });
    // Refrescamos para asegurar sincronía, aunque v-model ya actualizó la UI
    await store.fetchAllData();
  } catch (err) {
    console.error("Error al actualizar la prioridad:", err);
    alert("No se pudo actualizar la prioridad");
  }
};

const deleteItem = async (id) => {
  if (confirm('¿Eliminar de la lista de deseos?')) {
    await window.api.deleteWishlist(id);
    await store.fetchAllData();
  }
};

//copiado de enlace
const copyLink = async (url, id) => {
  try {
    await navigator.clipboard.writeText(url);
    
    // Feedback visual temporal
    copiedId.value = id;
    setTimeout(() => {
      copiedId.value = null;
    }, 2000);
    
  } catch (err) {
    console.error('Error al copiar:', err);
  }
};

</script>

<style scoped>
.slide-enter-active, .slide-leave-active {
  transition: all 0.3s ease-out;
}
.slide-enter-from, .slide-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}
select {
  text-align-last: center; /* Centra el texto dentro del select */
}
/* Estilo para las opciones del desplegable */
option {
  background-color: #1a1a1a; /* bg-dark-surface aproximado */
  color: rgb(180, 179, 179);
}
</style>