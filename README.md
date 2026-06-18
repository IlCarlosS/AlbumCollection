# Album Collection: MusicStats.
Es una aplicación de escritorio diseñada para coleccionistas de música en formato físico (CDs y Vinilos). Permite gestionar una biblioteca personal, visualizar estadísticas detalladas de la colección y monitorear una lista de deseos con un rastreador de precios dinámico.

## El Problema que Resuelve
Para un coleccionista, es difícil llevar el control del tiempo total de escucha de su biblioteca y, sobre todo, saber cuándo un disco de su lista de deseos está en una buena oferta. MusicStats centraliza la base de datos de la colección y automatiza el cálculo del precio promedio histórico, indicando mediante tendencias si el precio actual de un álbum ha subido o bajado respecto a los registros anteriores.

### Actualización 1.2.0
- Se añade buscador en la pantalla de colección (CollectionView.vue).
- Se añade opción de filtrado rápido en los encabezados de la tabla de colección (CollectionView.vue).
- Opción para importar base de datos (CollectionView.vue, preload.cjs, main.js (electron)).
- Corrección de icono, ahora mide 256x256px evitando resolviendos problemas al construir ejecutable e instalador
- Se oculta la cinta/menú de opciones de la ventana de electron, mejorando la UI (main.js (electron)).
- Ahora al ejecutar el comando npm run build se crea el la carpeta con ejecutable win-unpacked asi como el instalador para Windows (10 y 11) Album Collection MusicStats Setup 1.1.2.exe

### Actualización 1.1.0
- Se añade buscador en la pantalla de estadisticas (StatsView.vue).
- Se añade opción de filtrado rapido en los encabezados de la tabla de estadisticas (StatsView.vue).
- Opción para exportar base de datos y guardarla localmente (StatsView.vue, preload.cjs, main.js (electron))

## Tecnologías Usadas
- Core: Electron (Framework para apps de escritorio)
- Frontend: Vue.js 3 (Composition API)
- Estilos: Tailwind CSS (Diseño "Dark Mode")
- Estado: Pinia (Gestión de datos global)
- Base de Datos: SQLite via better-sqlite3
- Bundler: Vite

## Estructura del Proyecto
```
├── resources/           # Iconos y assets estáticos (.ico, .png)
├── src/
│   ├── main/            # Proceso principal de Electron (Node.js)
│   │   ├── main.js (electron)     # Configuración de ventana y handlers IPC
│   │   ├── db.js        # Esquema y conexión a SQLite
│   │   └── preload/preload.cjs  # Puente seguro entre Electron y Vue
│   └── renderer/        # Interfaz de usuario (Vue.js)
│       ├── views/       # Vistas principales de la app
│       ├── stores/      # Lógica de Pinia (albumStore.js)
│       └── App.vue      # Componente raíz con el Layout
│       └── style.css    # Hoja de estilos globales
└── package.json         # Dependencias y scripts de build
```

## Metodología de Desarrollo
Se utilizó una arquitectura de Separación de Procesos:
- Main Process: Gestiona la base de datos y el acceso al sistema de archivos.
- Renderer Process: Una SPA (Single Page Application) fluida que no conoce la base de datos directamente, sino que se comunica mediante un Context Bridge seguro para evitar vulnerabilidades.
- Reactividad Matemática: El cálculo de promedios se realiza en el Store antes de persistir los datos, asegurando que la UI se actualice en tiempo real sin recargar.

## Descripción de las Vistas (Views)
### Dashboard / StatsView.vue
Muestra métricas clave como el total de álbumes, minutos totales de música y gráficos de distribución por formato.

### CollectionView.vue 
El inventario principal. Permite añadir, editar y eliminar discos de la biblioteca personal.

### WishlistView.vue
Un panel interactivo donde se registran discos deseados. Incluye:
- Rastreador de Tendencias: Compara el precio actual contra el promedio guardado.
- Selector de Prioridad: Colores dinámicos para identificar qué urge comprar.
- Portapapeles: Copia rápida de enlaces de compra.

## Descripción de Archivos Clave
- main.js: Orquestador de la app. Configura la ventana, el icono y los canales de comunicación (IPC) para guardar/leer datos.
- db.js: Define el esquema de las tablas albums y wishlist. Maneja la persistencia local en un archivo .sqlite.
- preload.cjs: Actúa como embajador. Expone funciones específicas (window.api) al frontend para que Vue pueda hablar con SQLite de forma segura.
- albumStore.js: El corazón lógico. Aquí reside la "inteligencia" que calcula los promedios de precios, filtra los datos y mantiene sincronizada la UI con la base de datos.
- WishlistView.vue: Contiene la lógica de la tabla dinámica y los cálculos de tendencia (Subió/Bajó/Estable).

## ¿Cómo instalar y ejecutar?
- Clonar el repositorio.
- Instalar dependencias: 
```
npm install
```
- Ejecutar en modo desarrollo: 
```
npm run dev
```
Una vez completado en otra consola:
```
npm start
```
- Construir ejecutable e instalador: 
``` 
npm run build
```