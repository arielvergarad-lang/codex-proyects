const state = {
  depot: { id: "depot", customer: "Centro Logistico", lat: -33.45, lng: -70.66, x: 12, y: 72 },
  config: { scenario: "urban", traffic: 48, weather: 22, route_mode: "auto", manual_route: [] },
  workers: [],
  activeWorkers: [],
  activeWorker: null,
  users: [],
  customers: [],
  invoices: [],
  customerRealtime: [],
  notifications: [],
  googleRoute: null,
  savedRoutes: [],
  routeAssignments: [],
  mapGraph: { nodes: [], edges: [] },
  controllerLog: [],
  dbInfo: null,
  orders: [],
  markers: [],
  route: [],
  workerRoutes: [],
  metrics: null,
  progress: 0,
  activeLeg: 0,
  simulationRunning: true,
  elapsedMinutes: 320,
  continuousDrive: 95,
  syncingConfig: false,
  inFlightTick: false,
  offlineLoaded: false,
  map: null,
  mapTileLayer: null,
  mapTileErrorCount: 0,
  mapTileProviderIndex: 0,
  mapLayers: { route: null, depot: null, orders: [], markers: [], vehicle: [], graphNodes: [], graphEdges: [], workerRoutes: [] }
};
state.mapMode = "leaflet";
state.mapConfig = { google_embed_enabled: false, google_maps_public_key: "" };
state.simulationRate = 1;
state.liveSpeedKmh = 31;
state.vehicleSpeedOverride = null;
state.routeAssistant = { route_codes: [], message: "", reply: "" };
state.preRouteCodes = [];
state.sandboxDraftOrders = [];
state.sandboxDraftRouteCodes = [];
state.stopsWorkerExpanded = null;
state.routeQuickSelectedWorkerId = null;
state.activeTab = "operacion";
const defaultUiPrefs = {
  operatorName: "",
  companyName: "",
  simpleMode: true,
  showAdvanced: false,
  fontScale: 100,
  theme: "default"
};
state.uiPrefs = { ...defaultUiPrefs };

const ui = {
  mapBoard: document.querySelector("#mapBoard"),
  googleMapFrame: document.querySelector("#googleMapFrame"),
  mapModeSelect: document.querySelector("#mapModeSelect"),
  mapModeHint: document.querySelector("#mapModeHint"),
  simSpeedRange: document.querySelector("#simSpeedRange"),
  simSpeedValue: document.querySelector("#simSpeedValue"),
  vehicleSpeedRange: document.querySelector("#vehicleSpeedRange"),
  vehicleSpeedValue: document.querySelector("#vehicleSpeedValue"),
  presetEasy: document.querySelector("#presetEasy"),
  presetNormal: document.querySelector("#presetNormal"),
  presetHard: document.querySelector("#presetHard"),
  trafficValue: document.querySelector("#trafficValue"),
  weatherValue: document.querySelector("#weatherValue"),
  liveSpeedStatus: document.querySelector("#liveSpeedStatus"),
  liveSpeedBadge: document.querySelector("#liveSpeedBadge"),
  loadSimpleExample: document.querySelector("#loadSimpleExample"),
  clearSandboxData: document.querySelector("#clearSandboxData"),
  routeChatForm: document.querySelector("#routeChatForm"),
  routeChatInput: document.querySelector("#routeChatInput"),
  routeChatFeed: document.querySelector("#routeChatFeed"),
  routeChatApplyBtn: document.querySelector("#routeChatApplyBtn"),
  routeChatStatus: document.querySelector("#routeChatStatus"),
  routePlanList: document.querySelector("#routePlanList"),
  routePlanCodes: document.querySelector("#routePlanCodes"),
  applyPreRouteBtn: document.querySelector("#applyPreRouteBtn"),
  optimizeFromPreRouteBtn: document.querySelector("#optimizeFromPreRouteBtn"),
  optimizeSmartRoute: document.querySelector("#optimizeSmartRoute"),
  clearOperationsBtn: document.querySelector("#clearOperationsBtn"),
  clearPreRouteBtn: document.querySelector("#clearPreRouteBtn"),
  tabButtons: Array.from(document.querySelectorAll(".tab-btn[data-tab]")),
  tabStatus: document.querySelector("#tabStatus"),
  tabGroups: Array.from(document.querySelectorAll(".tab-group[data-tab-group]")),
  backToMainLink: document.querySelector("#backToMainLink"),
  toggleSimulation: document.querySelector("#toggleSimulation"),
  optimizeRoute: document.querySelector("#optimizeRoute"),
  googleRouteBtn: document.querySelector("#googleRouteBtn"),
  dbRouteBtn: document.querySelector("#dbRouteBtn"),
  saveOfflineBtn: document.querySelector("#saveOfflineBtn"),
  loadOfflineBtn: document.querySelector("#loadOfflineBtn"),
  offlineStatus: document.querySelector("#offlineStatus"),
  controllerSuggestionForm: document.querySelector("#controllerSuggestionForm"),
  controllerMessage: document.querySelector("#controllerMessage"),
  controllerPriority: document.querySelector("#controllerPriority"),
  controllerTargetWorker: document.querySelector("#controllerTargetWorker"),
  controllerDriversBoard: document.querySelector("#controllerDriversBoard"),
  controllerDepotForm: document.querySelector("#controllerDepotForm"),
  controllerDepotStatus: document.querySelector("#controllerDepotStatus"),
  controllerPreRouteList: document.querySelector("#controllerPreRouteList"),
  controllerPreRouteCodes: document.querySelector("#controllerPreRouteCodes"),
  controllerApplyPreRouteBtn: document.querySelector("#controllerApplyPreRouteBtn"),
  controllerOptimizePreRouteBtn: document.querySelector("#controllerOptimizePreRouteBtn"),
  controllerClearPreRouteBtn: document.querySelector("#controllerClearPreRouteBtn"),
  controllerPreRouteStatus: document.querySelector("#controllerPreRouteStatus"),
  controllerLog: document.querySelector("#controllerLog"),
  dbExportBtn: document.querySelector("#dbExportBtn"),
  dbImportBtn: document.querySelector("#dbImportBtn"),
  dbResetBtn: document.querySelector("#dbResetBtn"),
  dbJsonEditor: document.querySelector("#dbJsonEditor"),
  dbStatus: document.querySelector("#dbStatus"),
  dbOrdersCount: document.querySelector("#dbOrdersCount"),
  dbWorkersCount: document.querySelector("#dbWorkersCount"),
  dbUsersCount: document.querySelector("#dbUsersCount"),
  scenarioSelect: document.querySelector("#scenarioSelect"),
  trafficRange: document.querySelector("#trafficRange"),
  weatherRange: document.querySelector("#weatherRange"),
  markerType: document.querySelector("#markerType"),
  stopsList: document.querySelector("#stopsList"),
  suggestionsList: document.querySelector("#suggestionsList"),
  markersList: document.querySelector("#markersList"),
  aiText: document.querySelector("#aiSuggestionText"),
  aiButton: document.querySelector("#getAiSuggestion"),
  refreshData: document.querySelector("#refreshData"),
  orderForm: document.querySelector("#orderForm"),
  orderCustomerSelect: document.querySelector("#orderCustomerSelect"),
  orderWorkerSelect: document.querySelector("#orderWorkerSelect"),
  workerForm: document.querySelector("#workerForm"),
  routeAssignForm: document.querySelector("#routeAssignForm"),
  assignWorkerSelect: document.querySelector("#assignWorkerSelect"),
  assignSavedRouteSelect: document.querySelector("#assignSavedRouteSelect"),
  assignNoteInput: document.querySelector("#assignNoteInput"),
  routeAssignmentsList: document.querySelector("#routeAssignmentsList"),
  routeQuickWorkerChips: document.querySelector("#routeQuickWorkerChips"),
  routeQuickRouteCards: document.querySelector("#routeQuickRouteCards"),
  routeQuickRentableList: document.querySelector("#routeQuickRentableList"),
  routeQuickAssignStatus: document.querySelector("#routeQuickAssignStatus"),
  routeQuickAssignmentsList: document.querySelector("#routeQuickAssignmentsList"),
  prefsOperatorName: document.querySelector("#prefsOperatorName"),
  prefsCompanyName: document.querySelector("#prefsCompanyName"),
  prefsSimpleMode: document.querySelector("#prefsSimpleMode"),
  prefsShowAdvanced: document.querySelector("#prefsShowAdvanced"),
  prefsFontScale: document.querySelector("#prefsFontScale"),
  prefsTheme: document.querySelector("#prefsTheme"),
  savePrefsBtn: document.querySelector("#savePrefsBtn"),
  resetPrefsBtn: document.querySelector("#resetPrefsBtn"),
  prefsStatus: document.querySelector("#prefsStatus"),
  shiftLimitHelp: document.querySelector("#shiftLimitHelp"),
  userForm: document.querySelector("#userForm"),
  notificationForm: document.querySelector("#notificationForm"),
  recipientSelect: document.querySelector("#recipientSelect"),
  notificationsFeed: document.querySelector("#notificationsFeed"),
  testRunForm: document.querySelector("#testRunForm"),
  sandboxTextInput: document.querySelector("#sandboxTextInput"),
  sandboxGenerateBtn: document.querySelector("#sandboxGenerateBtn"),
  sandboxClearRouteBtn: document.querySelector("#sandboxClearRouteBtn"),
  sandboxAutoStatus: document.querySelector("#sandboxAutoStatus"),
  sandboxRouteBuilder: document.querySelector("#sandboxRouteBuilder"),
  sandboxRoutePreview: document.querySelector("#sandboxRoutePreview"),
  simpleStopsInput: document.querySelector("#simpleStopsInput"),
  simpleRouteOrderInput: document.querySelector("#simpleRouteOrderInput"),
  testOrdersJson: document.querySelector("#testOrdersJson"),
  testRouteInput: document.querySelector("#testRouteInput"),
  testDepotLat: document.querySelector("#testDepotLat"),
  testDepotLng: document.querySelector("#testDepotLng"),
  testRunStatus: document.querySelector("#testRunStatus"),
  graphNodeForm: document.querySelector("#graphNodeForm"),
  graphEdgeForm: document.querySelector("#graphEdgeForm"),
  edgeFrom: document.querySelector("#edgeFrom"),
  edgeTo: document.querySelector("#edgeTo"),
  graphNodesBody: document.querySelector("#graphNodesBody"),
  graphStatus: document.querySelector("#graphStatus"),
  refreshGraphBtn: document.querySelector("#refreshGraphBtn"),
  mapTapMode: document.querySelector("#mapTapMode"),
  ordersTableBody: document.querySelector("#ordersTableBody"),
  workersTableBody: document.querySelector("#workersTableBody"),
  usersTableBody: document.querySelector("#usersTableBody"),
  customerForm: document.querySelector("#customerForm"),
  customersTableBody: document.querySelector("#customersTableBody"),
  invoiceForm: document.querySelector("#invoiceForm"),
  invoiceCustomerSelect: document.querySelector("#invoiceCustomerSelect"),
  invoiceWorkerSelect: document.querySelector("#invoiceWorkerSelect"),
  invoiceRouteSelect: document.querySelector("#invoiceRouteSelect"),
  invoiceAutoOrdersBtn: document.querySelector("#invoiceAutoOrdersBtn"),
  invoiceAssignHint: document.querySelector("#invoiceAssignHint"),
  invoicesTableBody: document.querySelector("#invoicesTableBody"),
  customerRealtimeList: document.querySelector("#customerRealtimeList"),
  metrics: {
    eta: document.querySelector("#etaMetric"),
    etaDelta: document.querySelector("#etaDelta"),
    ontime: document.querySelector("#ontimeMetric"),
    worker: document.querySelector("#workerMetric"),
    savings: document.querySelector("#savingsMetric"),
    speed: document.querySelector("#speedLabel"),
    routeLabel: document.querySelector("#activeRouteLabel"),
    nextStop: document.querySelector("#nextStopLabel"),
    workerName: document.querySelector("#workerName"),
    shiftWorked: document.querySelector("#shiftWorked"),
    shiftRisk: document.querySelector("#shiftRisk"),
    continuousDrive: document.querySelector("#continuousDrive"),
    breakHint: document.querySelector("#breakHint"),
    cost: document.querySelector("#costMetric"),
    distance: document.querySelector("#distanceMetric"),
    detours: document.querySelector("#detourMetric"),
    capacity: document.querySelector("#capacityMetric")
  }
};

const scenarioLabels = {
  urban: "Urbano denso",
  mixed: "Mixto",
  express: "Express prioritario"
};

const mapPalette = {
  depot: "#12344d",
  order: "#ff6b35",
  orderDone: "#1f8a70",
  hotspot: "#efb11d",
  priority: "#1f8a70",
  unsafe: "#c8553d",
  route: "#1f8a70"
};

const workerRouteColors = ["#1f8a70", "#ff6b35", "#12344d", "#c8553d", "#6a4c93", "#efb11d"];
const tileProviders = [
  {
    name: "OpenStreetMap",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    options: {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap contributors"
    }
  },
  {
    name: "Carto Light",
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    options: {
      maxZoom: 20,
      subdomains: "abcd",
      attribution: "&copy; OpenStreetMap contributors &copy; CARTO"
    }
  }
];

function colorForWorker(workerId) {
  const index = Math.abs(Number(workerId || 0)) % workerRouteColors.length;
  return workerRouteColors[index];
}

function matchesTabGroup(groupsRaw, tab) {
  return String(groupsRaw || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .includes(tab);
}

function isAdvancedTab(tab) {
  return tab === "asistente" || tab === "datos" || tab === "sandbox";
}

function syncPrefsUi() {
  if (ui.prefsOperatorName) ui.prefsOperatorName.value = state.uiPrefs.operatorName || "";
  if (ui.prefsCompanyName) ui.prefsCompanyName.value = state.uiPrefs.companyName || "";
  if (ui.prefsSimpleMode) ui.prefsSimpleMode.value = state.uiPrefs.simpleMode ? "on" : "off";
  if (ui.prefsShowAdvanced) ui.prefsShowAdvanced.value = state.uiPrefs.showAdvanced ? "on" : "off";
  if (ui.prefsFontScale) ui.prefsFontScale.value = String(state.uiPrefs.fontScale || 100);
  if (ui.prefsTheme) ui.prefsTheme.value = state.uiPrefs.theme || "default";
}

function applyUiPrefs() {
  document.body.classList.toggle("simple-mode", Boolean(state.uiPrefs.simpleMode));
  document.body.classList.toggle("advanced-visible", Boolean(state.uiPrefs.showAdvanced));
  document.body.classList.remove("theme-high-contrast", "theme-colorblind");
  if (state.uiPrefs.theme === "high-contrast") document.body.classList.add("theme-high-contrast");
  if (state.uiPrefs.theme === "colorblind") document.body.classList.add("theme-colorblind");
  document.documentElement.style.setProperty("--ui-font-scale", `${Number(state.uiPrefs.fontScale || 100)}%`);

  if (state.uiPrefs.simpleMode && !state.uiPrefs.showAdvanced && isAdvancedTab(state.activeTab)) {
    setActiveTab("operacion");
  }
  if (ui.prefsStatus) {
    const modeLabel = state.uiPrefs.simpleMode ? "Modo esencial activado" : "Modo completo activado";
    ui.prefsStatus.textContent = `${modeLabel}. Personalizacion aplicada.`;
  }
}

function loadUiPrefs() {
  try {
    const raw = localStorage.getItem("deliverycore_ui_prefs");
    if (!raw) {
      state.uiPrefs = { ...defaultUiPrefs };
      return;
    }
    const parsed = JSON.parse(raw);
    state.uiPrefs = {
      operatorName: String(parsed.operatorName || ""),
      companyName: String(parsed.companyName || ""),
      simpleMode: parsed.simpleMode !== false,
      showAdvanced: parsed.showAdvanced === true,
      fontScale: [95, 100, 110, 120].includes(Number(parsed.fontScale)) ? Number(parsed.fontScale) : 100,
      theme: parsed.theme === "high-contrast" || parsed.theme === "colorblind" ? parsed.theme : "default"
    };
  } catch {
    state.uiPrefs = { ...defaultUiPrefs };
  }
}

function saveUiPrefs() {
  localStorage.setItem("deliverycore_ui_prefs", JSON.stringify(state.uiPrefs));
}

function setActiveTab(tab) {
  if (state.uiMode === "sandbox" && tab !== "sandbox") {
    tab = "sandbox";
  }
  if (state.uiPrefs.simpleMode && !state.uiPrefs.showAdvanced && isAdvancedTab(tab)) {
    tab = "operacion";
  }
  state.activeTab = tab;
  ui.tabButtons.forEach((button) => {
    const active = button.dataset.tab === tab;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-selected", active ? "true" : "false");
    button.tabIndex = active ? 0 : -1;
  });

  ui.tabGroups.forEach((block) => {
    block.hidden = !matchesTabGroup(block.dataset.tabGroup, tab);
  });

  if (ui.tabStatus) {
    const tabNames = {
      operacion: "Operacion",
      rutas: "Rutas",
      asistente: "Asistente",
      controlador: "Controlador",
      conductores: "Conductores",
      datos: "Datos",
      clientes: "Clientes",
      sandbox: "Sandbox",
      ajustes: "Ajustes"
    };
    const name = tabNames[tab] || (tab.charAt(0).toUpperCase() + tab.slice(1));
    ui.tabStatus.textContent = `Pestana activa: ${name}.`;
  }
  if (tab === "operacion") {
    scheduleMapRefresh(true);
  }
}

function scheduleMapRefresh(fit = false) {
  if (!state.map || state.mapMode !== "leaflet") return;
  requestAnimationFrame(() => {
    setTimeout(() => {
      if (!state.map) return;
      state.map.invalidateSize();
      if (fit) fitMap();
    }, 60);
  });
}

function api(path, options = {}) {
  return fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...options
  }).then(async (response) => {
    if (!response.ok) {
      throw new Error(await response.text());
    }
    return response.json();
  });
}

async function loadPublicConfig() {
  try {
    const data = await api("/api/public-config");
    state.mapConfig = data?.map || { google_embed_enabled: false, google_maps_public_key: "" };
  } catch {
    state.mapConfig = { google_embed_enabled: false, google_maps_public_key: "" };
  }
}

async function withButtonLoading(button, labelLoading, fn) {
  const original = button.textContent;
  button.disabled = true;
  button.textContent = labelLoading;
  try {
    return await fn();
  } finally {
    button.disabled = false;
    button.textContent = original;
  }
}

function inferLatLng(point) {
  const x = clampNumber(point.x, 2, 98);
  const y = clampNumber(point.y, 2, 98);
  return { lat: -33.56 + (100 - y) * 0.0022, lng: -70.77 + x * 0.0022 };
}

function pointLatLng(point) {
  if (Number.isFinite(Number(point.lat)) && Number.isFinite(Number(point.lng))) {
    return [Number(point.lat), Number(point.lng)];
  }
  const fallback = inferLatLng(point);
  return [fallback.lat, fallback.lng];
}

function clampNumber(value, min, max) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return min;
  return Math.min(max, Math.max(min, parsed));
}

async function geocodeStreetAddress(street, area) {
  const query = [street, area, "Chile"].map((part) => String(part || "").trim()).filter(Boolean).join(", ");
  if (!query) {
    throw new Error("Debes escribir calle y comuna.");
  }
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&addressdetails=1&q=${encodeURIComponent(query)}`;
  const response = await fetch(url, {
    headers: { Accept: "application/json" }
  });
  if (!response.ok) {
    throw new Error(`No se pudo buscar direccion (HTTP ${response.status}).`);
  }
  const data = await response.json();
  if (!Array.isArray(data) || !data.length) {
    throw new Error("No encontramos esa direccion. Prueba con una mas especifica.");
  }
  const first = data[0];
  const lat = Number(first.lat);
  const lng = Number(first.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    throw new Error("La direccion no devolvio coordenadas validas.");
  }
  return {
    lat,
    lng,
    label: String(first.display_name || query)
  };
}

function routePoints() {
  return [state.depot, ...state.route];
}

function shortRouteLabel(point) {
  return point.id === "depot" ? "Centro" : point.code;
}

function markerDescription(type) {
  if (type === "priority") return "Punto prioritario";
  if (type === "unsafe") return "Zona de riesgo";
  return "Congestion recurrente";
}

function formatMinutes(minutes) {
  const safe = Math.max(0, Math.round(minutes));
  const h = Math.floor(safe / 60);
  const m = safe % 60;
  return `${String(h).padStart(2, "0")}h ${String(m).padStart(2, "0")}m`;
}

function findSavedRouteLabel(savedRouteId) {
  const id = Number(savedRouteId);
  if (!Number.isFinite(id)) return "Sin ruta";
  const route = state.savedRoutes.find((item) => Number(item.id) === id);
  if (!route) return "Ruta no disponible";
  return `#${route.id} ${route.summary}`;
}

function refreshInvoicePlanningHint() {
  if (!ui.invoiceAssignHint) return;
  const workerId = Number(ui.invoiceWorkerSelect?.value || "");
  const savedRouteId = Number(ui.invoiceRouteSelect?.value || "");
  const workerName = Number.isFinite(workerId)
    ? (state.workers.find((worker) => Number(worker.id) === workerId)?.name || "Conductor")
    : "Sin conductor asignado";
  const routeLabel = Number.isFinite(savedRouteId) ? findSavedRouteLabel(savedRouteId) : "Sin ruta pre-hecha";
  ui.invoiceAssignHint.textContent = `Plan actual: ${workerName} | ${routeLabel}.`;
}

function currentLeg() {
  const points = routePoints();
  const from = points[state.activeLeg] || state.depot;
  const to = points[Math.min(state.activeLeg + 1, points.length - 1)] || from;
  return { from, to };
}

function interpolateVehiclePosition() {
  const leg = currentLeg();
  const [fromLat, fromLng] = pointLatLng(leg.from);
  const [toLat, toLng] = pointLatLng(leg.to);
  return [
    fromLat + (toLat - fromLat) * state.progress,
    fromLng + (toLng - fromLng) * state.progress
  ];
}

function routeCompletionRatio() {
  if (!state.route.length) return 0;
  const ratio = (state.activeLeg + state.progress) / Math.max(1, state.route.length);
  return Math.max(0, Math.min(1, ratio));
}

function workerLiveStatuses() {
  const ratio = routeCompletionRatio();
  const baseSpeed = Number(state.liveSpeedKmh || state.metrics?.speed_kmh || 28);
  return (state.workerRoutes || []).map((workerRoute, idx) => {
    const points = Array.isArray(workerRoute.points) ? workerRoute.points : [];
    const orderCodes = Array.isArray(workerRoute.order_codes) ? workerRoute.order_codes : [];
    if (points.length < 2) {
      const [lat, lng] = pointLatLng(state.depot);
      return {
        worker_id: workerRoute.worker_id,
        worker_name: workerRoute.worker_name,
        color: colorForWorker(workerRoute.worker_id),
        lat,
        lng,
        speed_kmh: Math.max(8, Math.round(baseSpeed)),
        remaining_stops: orderCodes.length,
        next_stop: orderCodes[0] || "Sin pedidos",
        status: state.simulationRunning ? "En espera" : "En pausa"
      };
    }

    const legs = points.length - 1;
    const progressLeg = Math.min(legs, ratio * legs);
    const legIndex = Math.min(Math.max(0, Math.floor(progressLeg)), Math.max(0, legs - 1));
    const legProgress = Math.max(0, Math.min(1, progressLeg - legIndex));
    const from = points[legIndex] || points[0];
    const to = points[Math.min(legIndex + 1, points.length - 1)] || from;
    const lat = from[0] + (to[0] - from[0]) * legProgress;
    const lng = from[1] + (to[1] - from[1]) * legProgress;
    const completed = ratio >= 1;
    const nextStop = completed ? "Ruta completada" : (orderCodes[legIndex] || orderCodes[orderCodes.length - 1] || "Sin parada");
    const remainingStops = completed ? 0 : Math.max(0, orderCodes.length - legIndex);
    const speedFactor = 0.9 + (idx % 4) * 0.07;
    const speedPenalty = Number(state.config?.traffic || 0) * 0.06;
    const speedKmh = Math.max(8, Math.round(baseSpeed * speedFactor - speedPenalty));

    return {
      worker_id: workerRoute.worker_id,
      worker_name: workerRoute.worker_name,
      color: colorForWorker(workerRoute.worker_id),
      lat,
      lng,
      speed_kmh: speedKmh,
      remaining_stops: remainingStops,
      next_stop: nextStop,
      status: completed ? "Ruta completada" : state.simulationRunning ? "En ruta" : "En pausa"
    };
  });
}

function clearMapLayers() {
  if (!state.map) return;
  if (state.mapLayers.route) state.map.removeLayer(state.mapLayers.route);
  if (state.mapLayers.depot) state.map.removeLayer(state.mapLayers.depot);
  if (Array.isArray(state.mapLayers.vehicle)) {
    state.mapLayers.vehicle.forEach((layer) => state.map.removeLayer(layer));
  } else if (state.mapLayers.vehicle) {
    state.map.removeLayer(state.mapLayers.vehicle);
  }
  state.mapLayers.orders.forEach((layer) => state.map.removeLayer(layer));
  state.mapLayers.markers.forEach((layer) => state.map.removeLayer(layer));
  state.mapLayers.graphNodes.forEach((layer) => state.map.removeLayer(layer));
  state.mapLayers.graphEdges.forEach((layer) => state.map.removeLayer(layer));
  state.mapLayers.workerRoutes.forEach((layer) => state.map.removeLayer(layer));
  state.mapLayers.route = null;
  state.mapLayers.depot = null;
  state.mapLayers.vehicle = [];
  state.mapLayers.orders = [];
  state.mapLayers.markers = [];
  state.mapLayers.graphNodes = [];
  state.mapLayers.graphEdges = [];
  state.mapLayers.workerRoutes = [];
}

function initMap() {
  if (state.map || !window.L) return;

  const [lat, lng] = pointLatLng(state.depot);
  state.map = L.map(ui.mapBoard, { zoomControl: true, preferCanvas: true }).setView([lat, lng], 12);
  attachTileLayer(0);

  state.map.on("click", async (event) => {
    if (ui.mapTapMode && ui.mapTapMode.value === "graph") {
      const nodeId = `n_${Date.now().toString().slice(-6)}`;
      await api("/api/map-graph/nodes", {
        method: "POST",
        body: JSON.stringify({ id: nodeId, lat: event.latlng.lat, lng: event.latlng.lng })
      });
      await loadMapGraph();
      renderAll();
      ui.graphStatus.textContent = `Punto ${nodeId} agregado desde el mapa.`;
      return;
    }

    const type = ui.markerType.value;
    await api("/api/markers", {
      method: "POST",
      body: JSON.stringify({
        type,
        lat: event.latlng.lat,
        lng: event.latlng.lng,
        x: 50,
        y: 50
      })
    });
    await loadBootstrap(false);
  });
  state.map.on("load", () => {
    scheduleMapRefresh(false);
  });
  window.addEventListener("resize", () => scheduleMapRefresh(false));
  window.addEventListener("orientationchange", () => scheduleMapRefresh(false));
}

function attachTileLayer(providerIndex) {
  const provider = tileProviders[providerIndex] || tileProviders[0];
  state.mapTileProviderIndex = providerIndex;
  state.mapTileErrorCount = 0;
  if (state.mapTileLayer && state.map) {
    state.map.removeLayer(state.mapTileLayer);
  }
  state.mapTileLayer = L.tileLayer(provider.url, {
    ...provider.options,
    crossOrigin: true,
    updateWhenIdle: true,
    keepBuffer: 4
  });
  state.mapTileLayer.on("tileerror", () => {
    state.mapTileErrorCount += 1;
    if (state.mapTileErrorCount > 6 && state.mapTileProviderIndex === 0) {
      attachTileLayer(1);
      ui.offlineStatus.textContent = "Mapa base alternativo activado para mejorar carga.";
    }
  });
  state.mapTileLayer.addTo(state.map);
}

function renderMap() {
  const wantsGoogle = state.mapMode === "google";
  const hasGoogle = Boolean(state.mapConfig.google_embed_enabled && state.mapConfig.google_maps_public_key);
  if (ui.googleMapFrame) {
    ui.googleMapFrame.hidden = !(wantsGoogle && hasGoogle);
  }
  if (wantsGoogle && hasGoogle) {
    updateGoogleEmbedFrame();
    return;
  }

  if (!state.map) return;
  clearMapLayers();

  const graphById = new Map((state.mapGraph.nodes || []).map((node) => [node.id, node]));
  (state.mapGraph.edges || []).forEach((edge) => {
    const from = graphById.get(edge.from);
    const to = graphById.get(edge.to);
    if (!from || !to) return;
    const layer = L.polyline([[from.lat, from.lng], [to.lat, to.lng]], {
      color: "#2f3e4d",
      weight: 2,
      opacity: 0.35,
      dashArray: "6,6"
    });
    layer.addTo(state.map);
    state.mapLayers.graphEdges.push(layer);
  });

  (state.mapGraph.nodes || []).forEach((node) => {
    const marker = L.circleMarker([node.lat, node.lng], {
      radius: 4,
      color: "#2f3e4d",
      fillColor: "#2f3e4d",
      fillOpacity: 0.6
    }).bindTooltip(`Punto ${node.id}`, { direction: "top", offset: [0, -4] });
    marker.addTo(state.map);
    state.mapLayers.graphNodes.push(marker);
  });

  const depotMarker = L.circleMarker(pointLatLng(state.depot), {
    radius: 8,
    color: mapPalette.depot,
    fillColor: mapPalette.depot,
    fillOpacity: 0.9
  }).bindPopup(`<strong>${state.depot.customer}</strong><br/>Deposito`);
  depotMarker.addTo(state.map);
  state.mapLayers.depot = depotMarker;

  state.orders.forEach((order) => {
    const assignedColor = order.worker_id ? colorForWorker(order.worker_id) : mapPalette.order;
    const color = order.status === "completed" ? mapPalette.orderDone : assignedColor;
    const workerName = state.workers.find((worker) => worker.id === order.worker_id)?.name || "Sin asignar";
    const marker = L.circleMarker(pointLatLng(order), {
      radius: 7,
      color,
      fillColor: color,
      fillOpacity: 0.85
    }).bindPopup(`<strong>${order.code}</strong><br/>${order.customer}<br/>Conductor: ${workerName}<br/>Estado: ${order.status}`);
    marker.addTo(state.map);
    state.mapLayers.orders.push(marker);
  });

  state.markers.forEach((marker) => {
    const color = marker.type === "priority" ? mapPalette.priority : marker.type === "unsafe" ? mapPalette.unsafe : mapPalette.hotspot;
    const layer = L.circleMarker(pointLatLng(marker), {
      radius: 6,
      color,
      fillColor: color,
      fillOpacity: 0.85
    }).bindPopup(`<strong>${markerDescription(marker.type)}</strong><br/>${marker.note}`);
    layer.addTo(state.map);
    state.mapLayers.markers.push(layer);
  });

  if (state.workerRoutes?.length) {
    state.workerRoutes.forEach((workerRoute) => {
      if (!workerRoute.points?.length) return;
      const color = colorForWorker(workerRoute.worker_id);
      const routeLine = L.polyline(workerRoute.points, {
        color,
        weight: 5,
        opacity: 0.78
      }).bindTooltip(`${workerRoute.worker_name}`, { sticky: true });
      routeLine.addTo(state.map);
      state.mapLayers.workerRoutes.push(routeLine);
    });
  } else {
    const pathPoints = state.googleRoute?.points?.length
      ? state.googleRoute.points
      : routePoints().map(pointLatLng);
    const routeLine = L.polyline(pathPoints, {
      color: mapPalette.route,
      weight: 4,
      opacity: 0.8
    });
    routeLine.addTo(state.map);
    state.mapLayers.route = routeLine;
  }

  const workerStatuses = workerLiveStatuses();
  if (workerStatuses.length) {
    workerStatuses.forEach((entry, idx) => {
      const vehicleIcon = L.divIcon({
        className: "vehicle-icon",
        html: `<div style="background:${entry.color};color:#fff;padding:6px 8px;border-radius:10px;font-weight:700;">C${idx + 1}</div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });
      const marker = L.marker([entry.lat, entry.lng], { icon: vehicleIcon })
        .bindPopup(`<strong>${entry.worker_name}</strong><br/>Estado: ${entry.status}<br/>Siguiente: ${entry.next_stop}<br/>Velocidad: ${entry.speed_kmh} km/h`);
      marker.addTo(state.map);
      state.mapLayers.vehicle.push(marker);
    });
  } else {
    const vehicleIcon = L.divIcon({
      className: "vehicle-icon",
      html: `<div style="background:${mapPalette.route};color:#fff;padding:6px 8px;border-radius:10px;font-weight:700;">V1</div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });
    const vehicleMarker = L.marker(interpolateVehiclePosition(), { icon: vehicleIcon });
    vehicleMarker.addTo(state.map);
    state.mapLayers.vehicle = [vehicleMarker];
  }
}

function updateGoogleEmbedFrame() {
  if (!ui.googleMapFrame) return;
  const key = state.mapConfig.google_maps_public_key;
  if (!key) return;

  const logicalRoute = [state.depot, ...state.route];
  if (logicalRoute.length < 2) {
    ui.googleMapFrame.hidden = true;
    if (ui.mapModeHint) {
      ui.mapModeHint.textContent = "Google Maps requiere al menos 1 parada pendiente para mostrar ruta.";
    }
    return;
  }

  const coords = logicalRoute.map((point) => {
    const [lat, lng] = pointLatLng(point);
    return `${lat},${lng}`;
  });
  const origin = coords[0];
  const destination = coords[coords.length - 1];
  const middle = coords.slice(1, -1).slice(0, 8);
  const params = new URLSearchParams({
    key,
    origin,
    destination,
    mode: "driving"
  });
  if (middle.length) params.set("waypoints", middle.join("|"));
  ui.googleMapFrame.src = `https://www.google.com/maps/embed/v1/directions?${params.toString()}`;
  if (ui.mapModeHint) {
    ui.mapModeHint.textContent = "Vista comercial en Google Maps (Embed API).";
  }
}

function fitMap() {
  if (state.mapMode === "google") return;
  if (!state.map) return;
  state.map.invalidateSize();
  const points = state.workerRoutes?.length
    ? state.workerRoutes.flatMap((item) => item.points || [])
    : routePoints().map(pointLatLng);
  if (!points.length) return;
  const bounds = L.latLngBounds(points);
  state.map.fitBounds(bounds.pad(0.2));
}

function renderStops() {
  const etaLookup = new Map((state.metrics?.eta_by_stop || []).map((entry) => [entry.order_id, entry]));
  const workers = state.workers || [];
  const groups = workers.map((worker) => {
    const ownOrders = state.orders.filter((order) => Number(order.worker_id) === Number(worker.id));
    const pending = ownOrders.filter((order) => order.status !== "completed");
    const completed = ownOrders.filter((order) => order.status === "completed");
    const completionDurations = completed
      .map((order) => Number(order.completed_duration_minutes))
      .filter((value) => Number.isFinite(value) && value > 0);
    const avgCompletedMinutes = completionDurations.length
      ? Math.round(completionDurations.reduce((sum, value) => sum + value, 0) / completionDurations.length)
      : 0;
    const savingsProjection = estimateWorkerSavings({
      pendingCount: pending.length,
      completedAvgMinutes: avgCompletedMinutes,
      traffic: Number(state.config?.traffic || 0),
      markerCount: state.markers.length
    });
    return {
      worker,
      pending,
      completed,
      avgCompletedMinutes,
      savingsProjection
    };
  });

  if (!groups.length) {
    ui.stopsList.innerHTML = `
      <article class="stop-item">
        <div class="stop-row">
          <strong>Sin conductores</strong>
          <span class="stop-status">Configurar</span>
        </div>
        <p class="stop-meta">Agrega conductores en la seccion Datos para dividir paradas por equipo.</p>
      </article>
    `;
    return;
  }

  const validExpanded = groups.some((item) => Number(item.worker.id) === Number(state.stopsWorkerExpanded));
  if (!validExpanded) {
    state.stopsWorkerExpanded = groups[0].worker.id;
  }

  ui.stopsList.innerHTML = groups.map((group) => {
    const worker = group.worker;
    const expanded = Number(worker.id) === Number(state.stopsWorkerExpanded);
    const pendingPreview = group.pending.slice(0, 4).map((order) => {
      const eta = etaLookup.get(order.id);
      const etaText = eta ? `${eta.eta_minutes} min` : "sin ETA";
      return `<li>${order.code} · ${order.customer} (${etaText})</li>`;
    }).join("");
    const completedPreview = group.completed.slice(0, 4).map((order) => {
      const doneMin = Number(order.completed_duration_minutes);
      const doneText = Number.isFinite(doneMin) && doneMin > 0 ? `${doneMin} min` : "sin registro";
      return `<li>${order.code} · ${doneText}</li>`;
    }).join("");
    const color = colorForWorker(worker.id);

    return `
      <article class="stop-item driver-stop-card ${expanded ? "is-expanded" : ""}">
        <button class="driver-stop-toggle" data-worker-stops-toggle="${worker.id}" type="button">
          <div class="stop-row">
            <strong><span class="worker-color-dot" style="background:${color};"></span>${worker.name}</strong>
            <span class="stop-status ${expanded ? "active" : ""}">${expanded ? "Abierto" : "Ver detalle"}</span>
          </div>
          <p class="stop-meta">Pendientes: ${group.pending.length} | Completados: ${group.completed.length} | Ahorro potencial: ${group.savingsProjection} min</p>
        </button>
        ${expanded ? `
          <div class="driver-stop-details">
            <p class="stop-meta"><strong>Tiempo promedio de completado:</strong> ${group.avgCompletedMinutes ? `${group.avgCompletedMinutes} min` : "Aun sin suficientes datos"}</p>
            <p class="stop-meta"><strong>Pedidos pendientes:</strong></p>
            ${group.pending.length ? `<ul class="driver-stop-list">${pendingPreview}${group.pending.length > 4 ? `<li>... y ${group.pending.length - 4} mas</li>` : ""}</ul>` : `<p class="stop-meta">No hay pendientes.</p>`}
            <p class="stop-meta"><strong>Pedidos completados:</strong></p>
            ${group.completed.length ? `<ul class="driver-stop-list">${completedPreview}${group.completed.length > 4 ? `<li>... y ${group.completed.length - 4} mas</li>` : ""}</ul>` : `<p class="stop-meta">Aun no hay completados.</p>`}
          </div>
        ` : ""}
      </article>
    `;
  }).join("");
}

function estimateWorkerSavings({ pendingCount, completedAvgMinutes, traffic, markerCount }) {
  if (!pendingCount) return 0;
  const base = Math.max(1, Math.round((traffic / 100) * 4 + 1));
  const history = completedAvgMinutes ? Math.max(1, Math.round(completedAvgMinutes * 0.12)) : 2;
  const markerBoost = Math.min(6, Math.round(markerCount * 0.7));
  return Math.min(75, pendingCount * base + history + markerBoost);
}

function buildSuggestions() {
  const suggestions = [];
  if (state.config.traffic > 55) {
    suggestions.push({
      title: "Reordenar eje de alta densidad",
      body: "El trafico subio. Conviene tomar primero las paradas mas cercanas."
    });
  }
  if (state.continuousDrive > 110) {
    suggestions.push({
      title: "Insertar pausa breve",
      body: "El conductor supero el umbral de conduccion continua. Programa pausa de 10 minutos."
    });
  }
  if (state.markers.some((marker) => marker.type === "unsafe")) {
    suggestions.push({
      title: "Desviar zona de riesgo",
      body: "Se detecto zona insegura. Prioriza vias principales para la aproximacion."
    });
  }
  if ((state.metrics?.eta_total_minutes || 0) > 42) {
    suggestions.push({
      title: "Micro-optimizar ruta pendiente",
      body: "Agrupar entregas del mismo cuadrante puede recortar entre 6 y 10 minutos."
    });
  }
  if (!suggestions.length) {
    suggestions.push({
      title: "Operacion estable",
      body: "Los indicadores estan en rango saludable. Mantener monitoreo de trafico y clima."
    });
  }
  return suggestions.slice(0, 4);
}

function renderSuggestions() {
  ui.suggestionsList.innerHTML = buildSuggestions().map((item) => `
    <article class="suggestion-item">
      <strong>${item.title}</strong>
      <p>${item.body}</p>
    </article>
  `).join("");
}

function renderMarkers() {
  if (!state.markers.length) {
    ui.markersList.innerHTML = `
      <article class="marker-item">
        <strong>Sin marcadores</strong>
        <p>Haz clic en el mapa para agregar un punto estrategico.</p>
      </article>
    `;
    return;
  }

  ui.markersList.innerHTML = state.markers.map((marker, idx) => `
    <article class="marker-item">
      <strong>${idx + 1}. ${marker.note}</strong>
      <p>${markerDescription(marker.type)} | ${Number(marker.lat).toFixed(5)}, ${Number(marker.lng).toFixed(5)}</p>
    </article>
  `).join("");
}

function renderMetrics() {
  const metrics = state.metrics || {};
  const workedPct = Math.min(95, Math.round((state.elapsedMinutes / 480) * 100));
  const remainingTravel = (metrics.eta_by_stop || []).reduce((sum, stop) => sum + stop.travel_minutes, 0);
  const next = state.route[state.activeLeg] || null;

  ui.metrics.eta.textContent = `${metrics.eta_total_minutes || 0} min`;
  ui.metrics.etaDelta.textContent = `${(metrics.eta_total_minutes || 0) <= 42 ? "-" : "+"}${Math.abs(42 - (metrics.eta_total_minutes || 0))}% vs plan base`;
  ui.metrics.ontime.textContent = `${metrics.ontime_pct || 0}%`;
  ui.metrics.worker.textContent = `${workedPct}%`;
  ui.metrics.savings.textContent = `${metrics.savings_minutes || 0} min`;
  ui.metrics.speed.textContent = `${Math.round(state.liveSpeedKmh || metrics.speed_kmh || 0)} km/h`;
  ui.metrics.routeLabel.textContent = routePoints().slice(state.activeLeg, state.activeLeg + 4).map(shortRouteLabel).join(" -> ");
  ui.metrics.nextStop.textContent = next ? next.code : "Ruta completada";
  ui.metrics.workerName.textContent = state.activeWorkers.length > 1
    ? `${state.activeWorkers.length} conductores activos`
    : state.activeWorker?.name || "Sin asignar";
  ui.metrics.shiftWorked.textContent = formatMinutes(state.elapsedMinutes);
  ui.metrics.shiftRisk.textContent = workedPct > 85 ? "Riesgo alto de sobretiempo" : workedPct > 70 ? "Riesgo moderado de sobretiempo" : "Riesgo bajo de sobretiempo";
  ui.metrics.continuousDrive.textContent = formatMinutes(state.continuousDrive);
  ui.metrics.breakHint.textContent = state.continuousDrive > 110 ? "Pausa recomendada ahora" : `Pausa sugerida en ${Math.max(5, 130 - state.continuousDrive)} min`;
  ui.metrics.cost.textContent = `$${(3.8 - (metrics.savings_minutes || 0) / 20).toFixed(1)}`;
  ui.metrics.distance.textContent = `${(remainingTravel / 2.8).toFixed(1)} km`;
  ui.metrics.detours.textContent = String(Math.max(1, state.markers.filter((m) => m.type === "hotspot").length + Math.round(state.config.traffic / 40)));
  ui.metrics.capacity.textContent = `${Math.min(97, Math.round(58 + state.orders.reduce((sum, order) => sum + order.demand, 0) / 2))}%`;
  if (ui.liveSpeedStatus) {
    ui.liveSpeedStatus.textContent = `Velocidad actual: ${Math.round(state.liveSpeedKmh || 0)} km/h.`;
  }
  if (ui.liveSpeedBadge) {
    ui.liveSpeedBadge.textContent = `${Math.round(state.liveSpeedKmh || 0)} km/h`;
  }
  if (ui.trafficValue) ui.trafficValue.textContent = `${state.config.traffic}%`;
  if (ui.weatherValue) ui.weatherValue.textContent = `${state.config.weather}%`;
  if (ui.simSpeedValue) ui.simSpeedValue.textContent = `${Number(state.simulationRate || 1).toFixed(1)}x`;
  if (ui.vehicleSpeedValue) {
    const speed = Math.round(state.vehicleSpeedOverride ?? metrics.speed_kmh ?? state.liveSpeedKmh ?? 31);
    ui.vehicleSpeedValue.textContent = `${speed} km/h`;
  }
  updateOfflineStatus();
}

function renderAdminTables() {
  const workerById = new Map(state.workers.map((worker) => [worker.id, worker]));

  ui.ordersTableBody.innerHTML = state.orders.map((order) => `
    <tr>
      <td>${order.id}</td>
      <td>${order.code}</td>
      <td>${workerById.get(order.worker_id)?.name || "Sin asignar"}</td>
      <td>${order.status}</td>
      <td>
        <div class="row-actions">
          <button class="mini-action" data-order-action="complete" data-id="${order.id}">Completar</button>
          <button class="mini-action" data-order-action="delete" data-id="${order.id}">Eliminar</button>
        </div>
      </td>
    </tr>
  `).join("");

  ui.workersTableBody.innerHTML = state.workers.map((worker) => `
    <tr>
      <td>${worker.id}</td>
      <td>${worker.name}</td>
      <td>${formatMinutes(worker.shift_limit_minutes || 480)}</td>
      <td>${worker.active ? "Si" : "No"}</td>
      <td>
        <div class="row-actions">
          <button class="mini-action" data-worker-action="toggle" data-id="${worker.id}">${worker.active ? "Desactivar" : "Activar"}</button>
          <button class="mini-action" data-worker-action="delete" data-id="${worker.id}">Eliminar</button>
        </div>
      </td>
    </tr>
  `).join("");

  ui.usersTableBody.innerHTML = state.users.map((user) => `
    <tr>
      <td>${user.id}</td>
      <td>${user.name}</td>
      <td>${user.preferred_channel}</td>
      <td>
        <div class="row-actions">
          <button class="mini-action" data-user-action="toggle" data-id="${user.id}">${user.active ? "Desactivar" : "Activar"}</button>
          <button class="mini-action" data-user-action="delete" data-id="${user.id}">Eliminar</button>
        </div>
      </td>
    </tr>
  `).join("");

  if (ui.customersTableBody) {
    ui.customersTableBody.innerHTML = state.customers.map((customer) => `
      <tr>
        <td>${customer.id}</td>
        <td>${customer.name}</td>
        <td>${customer.email || customer.phone || "-"}</td>
        <td>
          <div class="row-actions">
            <button class="mini-action" data-customer-action="toggle" data-id="${customer.id}">${customer.active ? "Desactivar" : "Activar"}</button>
            <button class="mini-action" data-customer-action="delete" data-id="${customer.id}">Eliminar</button>
          </div>
        </td>
      </tr>
    `).join("");
  }

  if (ui.invoiceCustomerSelect) {
    ui.invoiceCustomerSelect.innerHTML = `
      <option value="">Selecciona cliente</option>
      ${state.customers.map((customer) => `<option value="${customer.id}">${customer.name}</option>`).join("")}
    `;
  }

  if (ui.invoiceWorkerSelect) {
    ui.invoiceWorkerSelect.innerHTML = `
      <option value="">Conductor responsable (opcional)</option>
      ${state.workers.map((worker) => `<option value="${worker.id}">${worker.name}</option>`).join("")}
    `;
  }

  if (ui.invoiceRouteSelect) {
    ui.invoiceRouteSelect.innerHTML = `
      <option value="">Ruta planificada (opcional)</option>
      ${state.savedRoutes.map((route) => `<option value="${route.id}">#${route.id} ${route.summary}</option>`).join("")}
    `;
  }

  if (ui.invoicesTableBody) {
    const customerById = new Map(state.customers.map((customer) => [customer.id, customer.name]));
    const workerById = new Map(state.workers.map((worker) => [worker.id, worker.name]));
    ui.invoicesTableBody.innerHTML = state.invoices.map((invoice) => `
      <tr>
        <td>${invoice.invoice_number}</td>
        <td>${customerById.get(invoice.customer_id) || "Sin cliente"}</td>
        <td>${workerById.get(invoice.worker_id) || "Sin asignar"}</td>
        <td>${findSavedRouteLabel(invoice.saved_route_id)}</td>
        <td>$${Number(invoice.total_amount || 0).toLocaleString("es-CL")}</td>
        <td>${invoice.status}</td>
        <td>
          <div class="row-actions">
            <button class="mini-action" data-invoice-action="mark-paid" data-id="${invoice.id}">Marcar pagada</button>
            <button class="mini-action" data-invoice-action="delete" data-id="${invoice.id}">Eliminar</button>
          </div>
        </td>
      </tr>
    `).join("");
  }
  refreshInvoicePlanningHint();

  if (ui.customerRealtimeList) {
    ui.customerRealtimeList.innerHTML = state.customerRealtime.length
      ? state.customerRealtime.map((item) => `
        <article class="marker-item">
          <strong>${item.customer_name}</strong>
          <p>Pendientes: ${item.pending_orders.length ? item.pending_orders.join(", ") : "sin pedidos"}.</p>
          <p>Completados: ${item.completed_orders.length ? item.completed_orders.join(", ") : "sin completados"}.</p>
          <p>Facturas pendientes: ${item.pending_invoices}</p>
        </article>
      `).join("")
      : `<article class="marker-item"><strong>Sin clientes</strong><p>Agrega clientes para ver pedidos y facturas en tiempo real.</p></article>`;
  }

  ui.recipientSelect.innerHTML = `
    <option value="all">Todos los usuarios activos</option>
    ${state.users.map((user) => `<option value="${user.id}">${user.name}</option>`).join("")}
  `;

  ui.orderWorkerSelect.innerHTML = `
    <option value="">Sin conductor asignado</option>
    ${state.workers.map((worker) => `<option value="${worker.id}">${worker.name}</option>`).join("")}
  `;
  if (ui.orderCustomerSelect) {
    ui.orderCustomerSelect.innerHTML = `
      <option value="">Sin cliente vinculado</option>
      ${state.customers.map((customer) => `<option value="${customer.id}">${customer.name}</option>`).join("")}
    `;
  }
  if (ui.assignWorkerSelect) {
    ui.assignWorkerSelect.innerHTML = `
      <option value="">Selecciona conductor</option>
      ${state.workers.map((worker) => `<option value="${worker.id}">${worker.name}</option>`).join("")}
    `;
  }
  if (ui.assignSavedRouteSelect) {
    ui.assignSavedRouteSelect.innerHTML = `
      <option value="">Selecciona ruta pre-hecha</option>
      ${state.savedRoutes.map((route) => `<option value="${route.id}">#${route.id} ${route.summary} (${route.provider})</option>`).join("")}
    `;
  }
  if (!state.routeQuickSelectedWorkerId || !state.workers.some((worker) => Number(worker.id) === Number(state.routeQuickSelectedWorkerId))) {
    state.routeQuickSelectedWorkerId = state.workers[0]?.id || null;
  }
  renderRouteQuickAssignUi();
  if (ui.controllerTargetWorker) {
    const currentTarget = ui.controllerTargetWorker.value || "all";
    ui.controllerTargetWorker.innerHTML = `
      <option value="all">Todos los conductores activos</option>
      ${state.workers.map((worker) => `<option value="${worker.id}">${worker.name}</option>`).join("")}
    `;
    ui.controllerTargetWorker.value = state.workers.some((worker) => String(worker.id) === String(currentTarget))
      ? String(currentTarget)
      : "all";
  }

  ui.notificationsFeed.innerHTML = state.notifications.length
    ? state.notifications.map((item) => `
      <article class="marker-item">
        <strong>${item.user_name} (${item.channel})</strong>
        <p>${item.message}</p>
      </article>
    `).join("")
    : `<article class="marker-item"><strong>Sin notificaciones</strong><p>Aun no se han enviado mensajes a usuarios.</p></article>`;

  ui.controllerLog.innerHTML = state.controllerLog.length
    ? state.controllerLog.map((item) => `
      <article class="marker-item">
        <strong>${item.priority.toUpperCase()} | ${item.target_worker_name || "Equipo completo"} | ${item.sent} destinatarios</strong>
        <p>${item.message}</p>
      </article>
    `).join("")
    : `<article class="marker-item"><strong>Sin acciones</strong><p>El controlador principal aun no envio sugerencias.</p></article>`;

  if (ui.routeAssignmentsList) {
    ui.routeAssignmentsList.innerHTML = state.routeAssignments?.length
      ? state.routeAssignments.map((item) => `
        <article class="marker-item">
          <strong>${item.worker_name} -> Ruta #${item.saved_route_id}</strong>
          <p>${item.route_summary} | ${item.provider}${item.note ? ` | ${item.note}` : ""}</p>
          <div class="row-actions">
            <button class="mini-action" data-route-assignment-action="remove" data-worker-id="${item.worker_id}">Quitar asignacion</button>
          </div>
        </article>
      `).join("")
      : `<article class="marker-item"><strong>Sin asignaciones</strong><p>Aun no hay rutas pre-hechas asignadas a conductores.</p></article>`;
  }
  if (ui.routeQuickAssignmentsList) {
    ui.routeQuickAssignmentsList.innerHTML = state.routeAssignments?.length
      ? state.routeAssignments.map((item) => `
        <article class="marker-item">
          <strong>${item.worker_name} -> Ruta #${item.saved_route_id}</strong>
          <p>${item.route_summary}${item.note ? ` | ${item.note}` : ""}</p>
          <div class="row-actions">
            <button class="mini-action" data-route-quick-action="remove" data-worker-id="${item.worker_id}">Quitar</button>
          </div>
        </article>
      `).join("")
      : `<article class="marker-item"><strong>Sin asignaciones</strong><p>Cuando asignes una ruta, aparecera aqui.</p></article>`;
  }

  ui.graphNodesBody.innerHTML = (state.mapGraph.nodes || []).map((node) => `
    <tr>
      <td>${node.id}</td>
      <td>${Number(node.lat).toFixed(5)}, ${Number(node.lng).toFixed(5)}</td>
      <td><button class="mini-action" data-graph-action="delete-node" data-id="${node.id}">Eliminar</button></td>
    </tr>
  `).join("");

  const nodeOptions = (state.mapGraph.nodes || []).map((node) => `<option value="${node.id}">${node.id}</option>`).join("");
  ui.edgeFrom.innerHTML = `<option value="">Punto origen</option>${nodeOptions}`;
  ui.edgeTo.innerHTML = `<option value="">Punto destino</option>${nodeOptions}`;

  ui.dbOrdersCount.textContent = String(state.dbInfo?.orders || 0);
  ui.dbWorkersCount.textContent = String(state.dbInfo?.workers || 0);
  ui.dbUsersCount.textContent = String(state.dbInfo?.users || 0);
}

function renderRoutePlanner() {
  if (!ui.routePlanList || !ui.routePlanCodes) return;
  const pending = state.orders.filter((order) => order.status !== "completed");
  const allowed = new Set(pending.map((order) => order.code));
  state.preRouteCodes = state.preRouteCodes.filter((code) => allowed.has(code));

  if (!pending.length) {
    ui.routePlanList.innerHTML = `
      <article class="marker-item">
        <strong>Sin pedidos pendientes</strong>
        <p>Carga una prueba o marca pedidos como pendientes para planificar.</p>
      </article>
    `;
    ui.routePlanCodes.value = "";
    return;
  }

  ui.routePlanList.innerHTML = pending.map((order) => {
    const idx = state.preRouteCodes.indexOf(order.code);
    const selected = idx >= 0;
    return `
      <button class="route-plan-chip ${selected ? "is-selected" : ""}" data-code="${order.code}" type="button">
        ${selected ? `<span class="seq">${idx + 1}</span>` : ""}
        <strong>${order.code}</strong>
        <small>${order.customer}</small>
      </button>
    `;
  }).join("");
  ui.routePlanCodes.value = state.preRouteCodes.join(", ");
}

function renderControllerPreRoute() {
  if (!ui.controllerPreRouteList || !ui.controllerPreRouteCodes) return;
  const pending = state.orders.filter((order) => order.status !== "completed");
  const allowed = new Set(pending.map((order) => order.code));
  state.preRouteCodes = state.preRouteCodes.filter((code) => allowed.has(code));

  if (!pending.length) {
    ui.controllerPreRouteList.innerHTML = `
      <article class="marker-item">
        <strong>Sin pedidos pendientes</strong>
        <p>No hay pedidos para crear pre-ruta.</p>
      </article>
    `;
    ui.controllerPreRouteCodes.value = "";
    return;
  }

  ui.controllerPreRouteList.innerHTML = pending.map((order) => {
    const idx = state.preRouteCodes.indexOf(order.code);
    const selected = idx >= 0;
    return `
      <button class="route-plan-chip ${selected ? "is-selected" : ""}" data-controller-pre-code="${order.code}" type="button">
        ${selected ? `<span class="seq">${idx + 1}</span>` : ""}
        <strong>${order.code}</strong>
        <small>${order.customer}</small>
      </button>
    `;
  }).join("");
  ui.controllerPreRouteCodes.value = state.preRouteCodes.join(", ");
}

function buildRentableByWorker() {
  const etaLookup = new Map((state.metrics?.eta_by_stop || []).map((entry) => [entry.order_id, entry]));
  return state.workers.map((worker) => {
    const pending = state.orders.filter((order) => order.status !== "completed" && Number(order.worker_id) === Number(worker.id));
    const ranked = pending
      .map((order) => {
        const eta = etaLookup.get(order.id);
        const travel = Number(eta?.travel_minutes || 999);
        const service = Number(order.service_minutes || 8);
        const score = travel + service * 0.65 - Number(order.priority || 0) * 4;
        return { order, score, travel, service };
      })
      .sort((a, b) => a.score - b.score)
      .slice(0, 3);
    return {
      worker,
      ranked
    };
  });
}

function renderRouteQuickAssignUi() {
  if (ui.routeQuickWorkerChips) {
    ui.routeQuickWorkerChips.innerHTML = state.workers.length
      ? state.workers.map((worker) => {
        const selected = Number(worker.id) === Number(state.routeQuickSelectedWorkerId);
        const color = colorForWorker(worker.id);
        return `
          <button class="route-worker-chip ${selected ? "is-selected" : ""}" type="button" data-route-worker-chip="${worker.id}">
            <span class="worker-color-dot" style="background:${color};"></span>${worker.name}
          </button>
        `;
      }).join("")
      : `<article class="marker-item"><strong>Sin conductores</strong><p>Agrega conductores para asignar rutas.</p></article>`;
  }

  if (ui.routeQuickRouteCards) {
    ui.routeQuickRouteCards.innerHTML = state.savedRoutes.length
      ? state.savedRoutes.map((route) => `
        <button class="route-saved-card" type="button" data-route-saved-card="${route.id}">
          <strong>Ruta #${route.id}</strong>
          <small>${route.summary}</small>
          <small>${route.provider}</small>
        </button>
      `).join("")
      : `<article class="marker-item"><strong>Sin rutas guardadas</strong><p>Primero guarda una ruta pre-hecha.</p></article>`;
  }

  if (ui.routeQuickRentableList) {
    const suggestions = buildRentableByWorker();
    ui.routeQuickRentableList.innerHTML = suggestions.length
      ? suggestions.map((entry) => {
        const color = colorForWorker(entry.worker.id);
        const content = entry.ranked.length
          ? entry.ranked.map((item) => `${item.order.code} (${item.travel}m + ${item.service}m)`).join(" | ")
          : "Sin pendientes asignados.";
        return `
          <article class="marker-item">
            <strong><span class="worker-color-dot" style="background:${color};"></span>${entry.worker.name}</strong>
            <p>${content}</p>
          </article>
        `;
      }).join("")
      : `<article class="marker-item"><strong>Sin recomendaciones</strong><p>No hay datos suficientes para sugerir pedidos rentables.</p></article>`;
  }
}

function renderAll() {
  renderMap();
  renderStops();
  renderSuggestions();
  renderMarkers();
  renderMetrics();
  renderAdminTables();
  renderControllerBoard();
  renderRoutePlanner();
  renderControllerPreRoute();
  renderSandboxRouteBuilder();
}

function renderControllerBoard() {
  if (!ui.controllerDriversBoard) return;
  const statuses = workerLiveStatuses();
  if (!statuses.length) {
    ui.controllerDriversBoard.innerHTML = `
      <article class="marker-item">
        <strong>Sin conductores activos</strong>
        <p>Activa conductores en Gestion de equipo para ver ubicacion en vivo.</p>
      </article>
    `;
    return;
  }
  ui.controllerDriversBoard.innerHTML = statuses.map((entry) => `
    <article class="marker-item">
      <strong><span class="worker-color-dot" style="background:${entry.color};"></span>${entry.worker_name}</strong>
      <p>${entry.status} | ${entry.speed_kmh} km/h | Sig: ${entry.next_stop}</p>
      <p>${Number(entry.lat).toFixed(5)}, ${Number(entry.lng).toFixed(5)} | Pendientes: ${entry.remaining_stops}</p>
    </article>
  `).join("");
  if (ui.controllerDepotStatus) {
    ui.controllerDepotStatus.textContent = `Bodega actual: ${state.depot.customer} (${Number(state.depot.lat).toFixed(5)}, ${Number(state.depot.lng).toFixed(5)})`;
  }
}

function updateOfflineStatus() {
  const online = navigator.onLine;
  if (!online) {
    ui.offlineStatus.textContent = "Modo offline: usando ruta guardada en dispositivo.";
    return;
  }
  if (state.googleRoute?.provider === "google") {
    ui.offlineStatus.textContent = `Online con Google Route (${state.googleRoute.distance_km} km estimados).`;
    return;
  }
  if (state.googleRoute?.provider === "local_db_map") {
    ui.offlineStatus.textContent = `Online con Ruta BD local (${state.googleRoute.distance_km} km estimados).`;
    return;
  }
  ui.offlineStatus.textContent = "Modo online.";
}

function getDeviceSnapshot() {
  return {
    depot: state.depot,
    config: state.config,
    workers: state.workers,
    active_workers: state.activeWorkers,
    activeWorker: state.activeWorker,
    users: state.users,
    customers: state.customers,
    invoices: state.invoices,
    customer_realtime: state.customerRealtime,
    notifications: state.notifications,
    route_assignments: state.routeAssignments,
    controller_log: state.controllerLog,
    db_info: state.dbInfo,
    orders: state.orders,
    markers: state.markers,
    route: state.route,
    worker_routes: state.workerRoutes,
    metrics: state.metrics,
    simulation_rate: state.simulationRate,
    vehicle_speed_override: state.vehicleSpeedOverride,
    pre_route_codes: state.preRouteCodes,
    google_route: state.googleRoute,
    saved_routes: state.savedRoutes,
    map_graph: state.mapGraph,
    saved_at: new Date().toISOString()
  };
}

function saveDeviceSnapshot() {
  const payload = getDeviceSnapshot();
  localStorage.setItem("deliverycore_offline_snapshot", JSON.stringify(payload));
}

function loadDeviceSnapshot() {
  const raw = localStorage.getItem("deliverycore_offline_snapshot")
    || localStorage.getItem("enrta_offline_snapshot")
    || localStorage.getItem("enrutate_offline_snapshot");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function loadBootstrap(resetProgress = false, fit = false) {
  const data = await api("/api/bootstrap");
  state.depot = data.depot;
  state.config = data.config;
  state.workers = data.workers;
  state.activeWorkers = data.active_workers || [];
  state.activeWorker = data.activeWorker;
  state.users = data.users || [];
  state.customers = data.customers || [];
  state.invoices = data.invoices || [];
  state.customerRealtime = data.customer_realtime || [];
  state.notifications = data.notifications || [];
  state.controllerLog = data.controller_log || [];
  state.dbInfo = data.db_info || null;
  state.googleRoute = data.google_route || null;
  state.savedRoutes = data.saved_routes || [];
  state.routeAssignments = data.route_assignments || [];
  state.orders = data.orders;
  state.markers = data.markers;
  state.route = data.route;
  state.workerRoutes = data.worker_routes || [];
  state.metrics = data.metrics;
  const fromConfig = Array.isArray(data.config?.manual_route) ? data.config.manual_route.map(String) : [];
  if (fromConfig.length) {
    state.preRouteCodes = fromConfig;
  } else if (state.config?.route_mode !== "manual") {
    state.preRouteCodes = [];
  }
  state.liveSpeedKmh = Number(data.metrics?.speed_kmh || state.liveSpeedKmh || 31);
  if (state.vehicleSpeedOverride === null && ui.vehicleSpeedRange) {
    const base = Math.round(Number(data.metrics?.speed_kmh || 31));
    ui.vehicleSpeedRange.value = String(base);
  }
  await loadMapGraph();

  if (resetProgress) {
    state.activeLeg = 0;
    state.progress = 0;
  } else {
    state.activeLeg = Math.min(state.activeLeg, Math.max(0, state.route.length - 1));
  }

  ui.scenarioSelect.value = state.config.scenario;
  ui.trafficRange.value = String(state.config.traffic);
  ui.weatherRange.value = String(state.config.weather);
  if (ui.simSpeedRange) ui.simSpeedRange.value = String(state.simulationRate);
  if (ui.vehicleSpeedRange) {
    const base = Math.round(state.vehicleSpeedOverride ?? Number(state.metrics?.speed_kmh || 31));
    ui.vehicleSpeedRange.value = String(base);
  }
  if (ui.controllerDepotForm?.elements) {
    const customerInput = ui.controllerDepotForm.elements.namedItem("customer");
    const latInput = ui.controllerDepotForm.elements.namedItem("lat");
    const lngInput = ui.controllerDepotForm.elements.namedItem("lng");
    if (customerInput) customerInput.value = state.depot.customer || "";
    if (latInput) latInput.value = Number(state.depot.lat || 0);
    if (lngInput) lngInput.value = Number(state.depot.lng || 0);
  }
  renderAll();
  scheduleMapRefresh(false);
  saveDeviceSnapshot();
  if (fit) fitMap();
}

async function loadMapGraph() {
  try {
    const data = await api("/api/map-graph");
    state.mapGraph = data.map_graph || { nodes: [], edges: [] };
  } catch {
    state.mapGraph = { nodes: [], edges: [] };
  }
}

async function saveConfig() {
  if (state.syncingConfig) return;
  state.syncingConfig = true;
  try {
    await api("/api/config", {
      method: "PUT",
      body: JSON.stringify(state.config)
    });
    await loadBootstrap(false, false);
  } finally {
    state.syncingConfig = false;
  }
}

function completeOrder(orderId) {
  return api(`/api/orders/${orderId}`, {
    method: "PUT",
    body: JSON.stringify({ status: "completed" })
  });
}

async function tickSimulation() {
  if (!state.simulationRunning || state.inFlightTick) return;
  if (!state.route.length) return;
  state.inFlightTick = true;
  try {
    const pace = Math.max(0.5, Math.min(3, Number(state.simulationRate || 1)));
    state.progress += 0.045 * pace;
    state.elapsedMinutes += pace;
    state.continuousDrive += pace;
    const baseSpeed = Number(state.vehicleSpeedOverride ?? state.metrics?.speed_kmh ?? 28);
    const trafficPenalty = Number(state.config.traffic || 50) * 0.07;
    const weatherPenalty = Number(state.config.weather || 20) * 0.03;
    const randomSwing = (Math.random() * 4) - 2;
    state.liveSpeedKmh = Math.max(8, baseSpeed - trafficPenalty - weatherPenalty + randomSwing);

    if (state.progress >= 1) {
      const currentStop = state.route[state.activeLeg];
      if (currentStop) await completeOrder(currentStop.id);
      state.progress = 0;
      state.continuousDrive = Math.max(18, state.continuousDrive - 14);
      await loadBootstrap(true, false);
      if (!state.route.length) {
        state.simulationRunning = false;
        ui.toggleSimulation.textContent = "Reiniciar simulacion";
      }
    } else {
      renderAll();
    }
  } catch (error) {
    ui.aiText.textContent = `Error de simulacion: ${error.message}`;
  } finally {
    state.inFlightTick = false;
  }
}

function parseRouteCodes(raw) {
  return String(raw || "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

function parseSimpleStops(raw) {
  const lines = String(raw || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const orders = [];
  for (let i = 0; i < lines.length; i += 1) {
    const parts = lines[i].split(",").map((p) => p.trim());
    if (parts.length < 4) {
      throw new Error(`Linea ${i + 1}: usa formato CODIGO, Cliente, LAT, LNG`);
    }
    const [code, customer, latRaw, lngRaw] = parts;
    const lat = Number(latRaw);
    const lng = Number(lngRaw);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      throw new Error(`Linea ${i + 1}: lat/lng no validos`);
    }
    orders.push({
      code: code || `ORD-${i + 1}`,
      customer: customer || `Cliente ${i + 1}`,
      lat,
      lng,
      service_minutes: 8,
      demand: 10,
      priority: 0
    });
  }
  return orders;
}

function simpleStopsFromOrders(orders) {
  return (orders || []).map((order) =>
    `${order.code}, ${order.customer}, ${Number(order.lat).toFixed(6)}, ${Number(order.lng).toFixed(6)}`
  ).join("\n");
}

function syncSandboxRoutePreview() {
  if (!ui.sandboxRoutePreview) return;
  ui.sandboxRoutePreview.value = state.sandboxDraftRouteCodes.length
    ? state.sandboxDraftRouteCodes.join(" -> ")
    : "";
  if (ui.simpleRouteOrderInput) {
    ui.simpleRouteOrderInput.value = state.sandboxDraftRouteCodes.join(",");
  }
}

function renderSandboxRouteBuilder() {
  if (!ui.sandboxRouteBuilder) return;
  if (!state.sandboxDraftOrders.length) {
    ui.sandboxRouteBuilder.innerHTML = `
      <article class="marker-item">
        <strong>Sin puntos cargados</strong>
        <p>Genera puntos automaticos o escribe paradas por linea.</p>
      </article>
    `;
    syncSandboxRoutePreview();
    return;
  }
  ui.sandboxRouteBuilder.innerHTML = state.sandboxDraftOrders.map((order) => {
    const idx = state.sandboxDraftRouteCodes.indexOf(order.code);
    const selected = idx >= 0;
    return `
      <button class="route-plan-chip ${selected ? "is-selected" : ""}" data-sandbox-code="${order.code}" type="button">
        ${selected ? `<span class="seq">${idx + 1}</span>` : ""}
        <strong>${order.code}</strong>
        <small>${order.customer}</small>
      </button>
    `;
  }).join("");
  syncSandboxRoutePreview();
}

function addRouteChatMessage(role, text) {
  if (!ui.routeChatFeed) return;
  const item = document.createElement("article");
  item.className = `route-chat-msg ${role === "assistant" ? "assistant" : "user"}`;
  const title = role === "assistant" ? "Asistente" : "Tu";
  item.innerHTML = `<strong>${title}</strong><p>${text}</p>`;
  ui.routeChatFeed.appendChild(item);
  ui.routeChatFeed.scrollTop = ui.routeChatFeed.scrollHeight;
}

function applySandboxPreset({ scenario, traffic, weather, simRate, vehicleSpeed }) {
  state.config.scenario = scenario;
  state.config.traffic = traffic;
  state.config.weather = weather;
  state.simulationRate = simRate;
  if (Number.isFinite(Number(vehicleSpeed))) {
    state.vehicleSpeedOverride = Number(vehicleSpeed);
  }
  ui.scenarioSelect.value = scenario;
  ui.trafficRange.value = String(traffic);
  ui.weatherRange.value = String(weather);
  if (ui.simSpeedRange) ui.simSpeedRange.value = String(simRate);
  if (ui.vehicleSpeedRange && Number.isFinite(Number(vehicleSpeed))) {
    ui.vehicleSpeedRange.value = String(Math.round(Number(vehicleSpeed)));
  }
  if (ui.trafficValue) ui.trafficValue.textContent = `${traffic}%`;
  if (ui.weatherValue) ui.weatherValue.textContent = `${weather}%`;
  if (ui.simSpeedValue) ui.simSpeedValue.textContent = `${Number(simRate).toFixed(1)}x`;
  if (ui.vehicleSpeedValue && Number.isFinite(Number(vehicleSpeed))) {
    ui.vehicleSpeedValue.textContent = `${Math.round(Number(vehicleSpeed))} km/h`;
  }
  saveConfig();
  renderAll();
}

function bindEvents() {
  ui.tabButtons.forEach((button, index) => {
    button.addEventListener("click", () => {
      setActiveTab(button.dataset.tab);
    });
    button.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
      event.preventDefault();
      const dir = event.key === "ArrowRight" ? 1 : -1;
      const nextIndex = (index + dir + ui.tabButtons.length) % ui.tabButtons.length;
      const nextButton = ui.tabButtons[nextIndex];
      nextButton.focus();
      setActiveTab(nextButton.dataset.tab);
    });
  });

  ui.toggleSimulation.addEventListener("click", async () => {
    if (!state.simulationRunning && state.activeLeg >= state.route.length) {
      await loadBootstrap(true, false);
      state.simulationRunning = true;
      ui.toggleSimulation.textContent = "Pausar simulacion";
      return;
    }
    state.simulationRunning = !state.simulationRunning;
    ui.toggleSimulation.textContent = state.simulationRunning ? "Pausar simulacion" : "Reanudar simulacion";
  });

  if (ui.routePlanList) {
    ui.routePlanList.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-code]");
      if (!button) return;
      const code = String(button.dataset.code);
      const index = state.preRouteCodes.indexOf(code);
      if (index >= 0) {
        state.preRouteCodes = state.preRouteCodes.filter((item) => item !== code);
      } else {
        state.preRouteCodes.push(code);
      }
      renderRoutePlanner();
    });
  }
  if (ui.controllerPreRouteList) {
    ui.controllerPreRouteList.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-controller-pre-code]");
      if (!button) return;
      const code = String(button.dataset.controllerPreCode);
      const index = state.preRouteCodes.indexOf(code);
      if (index >= 0) {
        state.preRouteCodes = state.preRouteCodes.filter((item) => item !== code);
      } else {
        state.preRouteCodes.push(code);
      }
      renderRoutePlanner();
      renderControllerPreRoute();
    });
  }
  if (ui.clearPreRouteBtn) {
    ui.clearPreRouteBtn.addEventListener("click", () => {
      state.preRouteCodes = [];
      renderRoutePlanner();
      ui.offlineStatus.textContent = "Pre-ruta limpiada.";
    });
  }
  if (ui.applyPreRouteBtn) {
    ui.applyPreRouteBtn.addEventListener("click", async () => {
      if (!state.preRouteCodes.length) {
        ui.offlineStatus.textContent = "Marca al menos una parada en la pre-ruta.";
        return;
      }
      state.config.route_mode = "manual";
      state.config.manual_route = [...state.preRouteCodes];
      await saveConfig();
      await loadBootstrap(true, true);
      ui.offlineStatus.textContent = `Pre-ruta aplicada: ${state.preRouteCodes.join(" -> ")}`;
    });
  }
  if (ui.optimizeFromPreRouteBtn) {
    ui.optimizeFromPreRouteBtn.addEventListener("click", async () => {
      if (!state.preRouteCodes.length) {
        ui.offlineStatus.textContent = "Marca primero una pre-ruta para optimizar desde ahi.";
        return;
      }
      ui.offlineStatus.textContent = "Optimizando desde la pre-ruta marcada...";
      await api("/api/optimize-route", {
        method: "POST",
        body: JSON.stringify({ codes: state.preRouteCodes })
      });
      await loadBootstrap(true, true);
      ui.offlineStatus.textContent = "Ruta optimizada desde pre-ruta.";
    });
  }
  if (ui.controllerClearPreRouteBtn) {
    ui.controllerClearPreRouteBtn.addEventListener("click", () => {
      state.preRouteCodes = [];
      renderRoutePlanner();
      renderControllerPreRoute();
      if (ui.controllerPreRouteStatus) ui.controllerPreRouteStatus.textContent = "Pre-ruta limpiada.";
    });
  }
  if (ui.controllerApplyPreRouteBtn) {
    ui.controllerApplyPreRouteBtn.addEventListener("click", async () => {
      if (!state.preRouteCodes.length) {
        if (ui.controllerPreRouteStatus) ui.controllerPreRouteStatus.textContent = "Marca al menos una parada.";
        return;
      }
      state.config.route_mode = "manual";
      state.config.manual_route = [...state.preRouteCodes];
      await saveConfig();
      await loadBootstrap(true, true);
      if (ui.controllerPreRouteStatus) ui.controllerPreRouteStatus.textContent = "Pre-ruta aplicada.";
      ui.offlineStatus.textContent = "Pre-ruta aplicada desde Controlador.";
    });
  }
  if (ui.controllerOptimizePreRouteBtn) {
    ui.controllerOptimizePreRouteBtn.addEventListener("click", async () => {
      if (!state.preRouteCodes.length) {
        if (ui.controllerPreRouteStatus) ui.controllerPreRouteStatus.textContent = "Primero marca una pre-ruta.";
        return;
      }
      if (ui.controllerPreRouteStatus) ui.controllerPreRouteStatus.textContent = "Optimizando desde pre-ruta...";
      await api("/api/optimize-route", {
        method: "POST",
        body: JSON.stringify({ codes: state.preRouteCodes })
      });
      await loadBootstrap(true, true);
      if (ui.controllerPreRouteStatus) ui.controllerPreRouteStatus.textContent = "Ruta optimizada desde Controlador.";
      ui.offlineStatus.textContent = "Optimizacion ejecutada desde Controlador.";
    });
  }
  if (ui.optimizeSmartRoute) {
    ui.optimizeSmartRoute.addEventListener("click", async () => {
      ui.offlineStatus.textContent = "Analizando mejor forma de optimizar...";
      if (state.preRouteCodes.length) {
        await api("/api/optimize-route", {
          method: "POST",
          body: JSON.stringify({ codes: state.preRouteCodes })
        });
        await loadBootstrap(true, true);
        ui.offlineStatus.textContent = "Optimizado desde tu pre-ruta.";
      } else {
        state.config.route_mode = "auto";
        state.config.manual_route = [];
        await saveConfig();
        await api("/api/optimize-route", { method: "POST", body: JSON.stringify({}) });
        await loadBootstrap(false, true);
        ui.offlineStatus.textContent = "Optimizado en modo automatico.";
      }
    });
  }

  ui.optimizeRoute.addEventListener("click", async () => {
    state.config.route_mode = "auto";
    state.config.manual_route = [];
    await saveConfig();
    await api("/api/optimize-route", { method: "POST", body: JSON.stringify({}) });
    await loadBootstrap(false, true);
  });

  ui.googleRouteBtn.addEventListener("click", async () => {
    ui.offlineStatus.textContent = "Calculando ruta con Google...";
    try {
      await api("/api/google-route", { method: "POST", body: JSON.stringify({}) });
      await loadBootstrap(false, true);
      ui.offlineStatus.textContent = "Ruta Google calculada y lista para guardar offline.";
    } catch (error) {
      ui.offlineStatus.textContent = `No se pudo calcular con Google: ${error.message}`;
    }
  });

  ui.dbRouteBtn.addEventListener("click", async () => {
    ui.offlineStatus.textContent = "Calculando ruta con mapa local de BD...";
    try {
      await api("/api/db-route", { method: "POST", body: JSON.stringify({}) });
      await loadBootstrap(false, true);
      ui.offlineStatus.textContent = "Ruta calculada con mapa local de base de datos.";
    } catch (error) {
      ui.offlineStatus.textContent = `No se pudo calcular ruta local: ${error.message}`;
    }
  });

  ui.saveOfflineBtn.addEventListener("click", async () => {
    try {
      const routePayload = state.googleRoute || {
        provider: "local",
        points: routePoints().map(pointLatLng),
        order_codes: state.route.map((item) => item.code),
        distance_km: Number((state.metrics?.eta_total_minutes || 0) * 0.6).toFixed(2),
        duration_min: state.metrics?.eta_total_minutes || 0
      };
      await api("/api/saved-routes", {
        method: "POST",
        body: JSON.stringify({
          provider: routePayload.provider,
          summary: `${routePayload.distance_km} km / ${routePayload.duration_min} min`,
          route: routePayload
        })
      });
      saveDeviceSnapshot();
      ui.offlineStatus.textContent = "Ruta guardada en servidor y dispositivo.";
      await loadBootstrap(false, false);
    } catch (error) {
      saveDeviceSnapshot();
      ui.offlineStatus.textContent = `Guardado local (sin servidor): ${error.message}`;
    }
  });

  ui.loadOfflineBtn.addEventListener("click", () => {
    const snapshot = loadDeviceSnapshot();
    if (!snapshot) {
      ui.offlineStatus.textContent = "No hay ruta guardada en este dispositivo.";
      return;
    }
    applySnapshot(snapshot);
    state.offlineLoaded = true;
    renderAll();
    fitMap();
    ui.offlineStatus.textContent = "Ruta offline cargada desde dispositivo.";
  });

  if (ui.clearOperationsBtn) {
    ui.clearOperationsBtn.addEventListener("click", async () => {
      const ok = window.confirm("Se limpiara mapa, pedidos, rutas guardadas y asignaciones. ¿Quieres continuar?");
      if (!ok) return;
      ui.offlineStatus.textContent = "Limpiando operacion para empezar de cero...";
      await api("/api/operations/reset", { method: "POST", body: JSON.stringify({}) });
      state.preRouteCodes = [];
      state.sandboxDraftOrders = [];
      state.sandboxDraftRouteCodes = [];
      await loadBootstrap(true, true);
      renderSandboxRouteBuilder();
      updateSandboxRoutePreview();
      ui.offlineStatus.textContent = "Listo: mapa y pedidos limpios para cargar nuevos productos.";
    });
  }

  ui.refreshData.addEventListener("click", async () => {
    await loadBootstrap(false, false);
  });

  if (ui.savePrefsBtn) {
    ui.savePrefsBtn.addEventListener("click", () => {
      state.uiPrefs.operatorName = String(ui.prefsOperatorName?.value || "").trim();
      state.uiPrefs.companyName = String(ui.prefsCompanyName?.value || "").trim();
      state.uiPrefs.simpleMode = (ui.prefsSimpleMode?.value || "on") === "on";
      state.uiPrefs.showAdvanced = (ui.prefsShowAdvanced?.value || "off") === "on";
      state.uiPrefs.fontScale = Number(ui.prefsFontScale?.value || 100);
      state.uiPrefs.theme = String(ui.prefsTheme?.value || "default");
      saveUiPrefs();
      applyUiPrefs();
      if (ui.prefsStatus) {
        const actor = state.uiPrefs.operatorName ? `Operador: ${state.uiPrefs.operatorName}.` : "Operador sin nombre.";
        ui.prefsStatus.textContent = `${actor} Cambios guardados.`;
      }
    });
  }

  if (ui.resetPrefsBtn) {
    ui.resetPrefsBtn.addEventListener("click", () => {
      state.uiPrefs = { ...defaultUiPrefs };
      saveUiPrefs();
      syncPrefsUi();
      applyUiPrefs();
      if (ui.prefsStatus) {
        ui.prefsStatus.textContent = "Ajustes restaurados por defecto.";
      }
    });
  }

  if (ui.stopsList) {
    ui.stopsList.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-worker-stops-toggle]");
      if (!button) return;
      state.stopsWorkerExpanded = Number(button.dataset.workerStopsToggle);
      renderStops();
    });
  }

  ui.scenarioSelect.addEventListener("change", () => {
    state.config.scenario = ui.scenarioSelect.value;
    saveConfig();
  });
  ui.trafficRange.addEventListener("input", () => {
    state.config.traffic = Number(ui.trafficRange.value);
    if (ui.trafficValue) ui.trafficValue.textContent = `${state.config.traffic}%`;
    saveConfig();
  });
  ui.weatherRange.addEventListener("input", () => {
    state.config.weather = Number(ui.weatherRange.value);
    if (ui.weatherValue) ui.weatherValue.textContent = `${state.config.weather}%`;
    saveConfig();
  });
  if (ui.simSpeedRange) {
    ui.simSpeedRange.addEventListener("input", () => {
      state.simulationRate = Number(ui.simSpeedRange.value);
      if (ui.simSpeedValue) {
        ui.simSpeedValue.textContent = `${state.simulationRate.toFixed(1)}x`;
      }
    });
  }
  if (ui.vehicleSpeedRange) {
    ui.vehicleSpeedRange.addEventListener("input", () => {
      state.vehicleSpeedOverride = Number(ui.vehicleSpeedRange.value);
      if (ui.vehicleSpeedValue) {
        ui.vehicleSpeedValue.textContent = `${Math.round(state.vehicleSpeedOverride)} km/h`;
      }
      state.liveSpeedKmh = state.vehicleSpeedOverride;
      renderAll();
    });
  }
  if (ui.presetEasy) {
    ui.presetEasy.addEventListener("click", () => {
      applySandboxPreset({ scenario: "urban", traffic: 20, weather: 10, simRate: 1, vehicleSpeed: 38 });
      ui.testRunStatus.textContent = "Preset aplicado: Dia tranquilo.";
    });
  }
  if (ui.presetNormal) {
    ui.presetNormal.addEventListener("click", () => {
      applySandboxPreset({ scenario: "mixed", traffic: 48, weather: 22, simRate: 1.2, vehicleSpeed: 31 });
      ui.testRunStatus.textContent = "Preset aplicado: Dia normal.";
    });
  }
  if (ui.presetHard) {
    ui.presetHard.addEventListener("click", () => {
      applySandboxPreset({ scenario: "express", traffic: 78, weather: 60, simRate: 1.4, vehicleSpeed: 22 });
      ui.testRunStatus.textContent = "Preset aplicado: Dia complejo.";
    });
  }
  if (ui.loadSimpleExample) {
    ui.loadSimpleExample.addEventListener("click", () => {
      const simpleLines = [
        "A-001, Cliente Centro, -33.452, -70.640",
        "A-002, Cliente Norte, -33.433, -70.610",
        "A-003, Cliente Sur, -33.490, -70.660"
      ].join("\n");
      ui.simpleStopsInput.value = simpleLines;
      ui.simpleRouteOrderInput.value = "A-001,A-002,A-003";
      state.sandboxDraftOrders = parseSimpleStops(simpleLines);
      state.sandboxDraftRouteCodes = ["A-001", "A-002", "A-003"];
      ui.testOrdersJson.value = [
        "[",
        '  { "code": "A-001", "customer": "Cliente Centro", "lat": -33.452, "lng": -70.64, "service_minutes": 8, "demand": 9, "priority": 1 },',
        '  { "code": "A-002", "customer": "Cliente Norte", "lat": -33.433, "lng": -70.61, "service_minutes": 7, "demand": 7, "priority": 0 },',
        '  { "code": "A-003", "customer": "Cliente Sur", "lat": -33.49, "lng": -70.66, "service_minutes": 9, "demand": 11, "priority": 0 }',
        "]"
      ].join("\n");
      ui.testRouteInput.value = "A-001,A-002,A-003";
      ui.testDepotLat.value = "";
      ui.testDepotLng.value = "";
      ui.testRunStatus.textContent = "Ejemplo cargado. Presiona 'Aplicar prueba ahora'.";
      renderSandboxRouteBuilder();
    });
  }
  if (ui.clearSandboxData) {
    ui.clearSandboxData.addEventListener("click", () => {
      ui.simpleStopsInput.value = "";
      ui.simpleRouteOrderInput.value = "";
      state.sandboxDraftOrders = [];
      state.sandboxDraftRouteCodes = [];
      ui.testOrdersJson.value = "[]";
      ui.testRouteInput.value = "";
      ui.testDepotLat.value = "";
      ui.testDepotLng.value = "";
      ui.testRunStatus.textContent = "Campos limpiados. Puedes pegar nuevos pedidos.";
      renderSandboxRouteBuilder();
    });
  }
  if (ui.sandboxGenerateBtn) {
    ui.sandboxGenerateBtn.addEventListener("click", async () => {
      const text = (ui.sandboxTextInput?.value || "").trim();
      if (!text) {
        ui.sandboxAutoStatus.textContent = "Escribe una descripcion antes de generar puntos.";
        return;
      }
      ui.sandboxAutoStatus.textContent = "Generando puntos desde texto...";
      try {
        const result = await api("/api/sandbox-assistant", {
          method: "POST",
          body: JSON.stringify({ text })
        });
        state.sandboxDraftOrders = result.orders || [];
        state.sandboxDraftRouteCodes = result.route_codes || [];
        ui.simpleStopsInput.value = simpleStopsFromOrders(state.sandboxDraftOrders);
        ui.simpleRouteOrderInput.value = state.sandboxDraftRouteCodes.join(",");
        ui.testOrdersJson.value = JSON.stringify(state.sandboxDraftOrders, null, 2);
        ui.testRouteInput.value = state.sandboxDraftRouteCodes.join(",");
        ui.sandboxAutoStatus.textContent = result.message || "Puntos generados correctamente.";
        renderSandboxRouteBuilder();
      } catch (error) {
        ui.sandboxAutoStatus.textContent = `No se pudo generar: ${error.message}`;
      }
    });
  }
  if (ui.sandboxClearRouteBtn) {
    ui.sandboxClearRouteBtn.addEventListener("click", () => {
      state.sandboxDraftRouteCodes = [];
      ui.simpleRouteOrderInput.value = "";
      renderSandboxRouteBuilder();
      ui.sandboxAutoStatus.textContent = "Conexion de puntos limpiada.";
    });
  }
  if (ui.sandboxRouteBuilder) {
    ui.sandboxRouteBuilder.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-sandbox-code]");
      if (!button) return;
      const code = String(button.dataset.sandboxCode);
      const idx = state.sandboxDraftRouteCodes.indexOf(code);
      if (idx >= 0) {
        state.sandboxDraftRouteCodes = state.sandboxDraftRouteCodes.filter((item) => item !== code);
      } else {
        state.sandboxDraftRouteCodes.push(code);
      }
      renderSandboxRouteBuilder();
    });
  }
  if (ui.simpleStopsInput) {
    ui.simpleStopsInput.addEventListener("blur", () => {
      try {
        const parsed = parseSimpleStops(ui.simpleStopsInput.value);
        state.sandboxDraftOrders = parsed;
        const allowed = new Set(parsed.map((item) => item.code));
        state.sandboxDraftRouteCodes = state.sandboxDraftRouteCodes.filter((code) => allowed.has(code));
        renderSandboxRouteBuilder();
      } catch {
        // keep previous draft while user edits invalid lines
      }
    });
  }
  if (ui.routeChatForm) {
    ui.routeChatForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const message = (ui.routeChatInput.value || "").trim();
      if (!message) {
        ui.routeChatStatus.textContent = "Escribe una descripcion de ruta primero.";
        return;
      }
      addRouteChatMessage("user", message);
      ui.routeChatStatus.textContent = "Analizando texto de ruta...";
      try {
        const response = await api("/api/route-assistant", {
          method: "POST",
          body: JSON.stringify({ message, apply: false })
        });
        const codes = response.route_codes || [];
        state.routeAssistant = {
          route_codes: codes,
          message,
          reply: response.reply || ""
        };
        addRouteChatMessage("assistant", response.reply || "Tengo una propuesta lista.");
        ui.routeChatStatus.textContent = codes.length
          ? `Ruta propuesta: ${codes.join(" -> ")}`
          : "No pude detectar paradas claras. Prueba con codigos o nombres.";
      } catch (error) {
        ui.routeChatStatus.textContent = `Error en asistente: ${error.message}`;
      }
    });
  }
  if (ui.routeChatApplyBtn) {
    ui.routeChatApplyBtn.addEventListener("click", async () => {
      const codes = state.routeAssistant.route_codes || [];
      if (!codes.length) {
        ui.routeChatStatus.textContent = "Primero pide una propuesta al asistente.";
        return;
      }
      ui.routeChatStatus.textContent = "Aplicando ruta sugerida...";
      try {
        const response = await api("/api/route-assistant", {
          method: "POST",
          body: JSON.stringify({
            message: state.routeAssistant.message,
            route_codes: codes,
            apply: true
          })
        });
        await loadBootstrap(true, true);
        ui.routeChatStatus.textContent = `Ruta aplicada: ${(response.route_codes || []).join(" -> ")}`;
        ui.offlineStatus.textContent = "Ruta aplicada desde Asistente.";
      } catch (error) {
        ui.routeChatStatus.textContent = `No se pudo aplicar: ${error.message}`;
      }
    });
  }

  ui.mapModeSelect.addEventListener("change", () => {
    const selected = ui.mapModeSelect.value === "google" ? "google" : "leaflet";
    if (selected === "google" && !state.mapConfig.google_embed_enabled) {
      state.mapMode = "leaflet";
      ui.mapModeSelect.value = "leaflet";
      if (ui.mapModeHint) {
        ui.mapModeHint.textContent = "Google Maps no disponible: configura GOOGLE_MAPS_JS_API_KEY.";
      }
      renderAll();
      return;
    }
    state.mapMode = selected;
    if (ui.mapModeHint) {
      ui.mapModeHint.textContent = selected === "google"
        ? "Vista comercial activada con Google Maps."
        : "Mapa operativo con OpenStreetMap.";
    }
    renderAll();
    if (selected === "leaflet") fitMap();
  });

  ui.aiButton.addEventListener("click", async () => {
    ui.aiText.textContent = "Consultando IA...";
    try {
      const suggestion = await api("/api/ai-suggestion", {
        method: "POST",
        body: JSON.stringify({
          config: state.config,
          route: state.route,
          markers: state.markers,
          metrics: state.metrics
        })
      });
      ui.aiText.textContent = suggestion.text;
    } catch (error) {
      ui.aiText.textContent = `No se pudo generar sugerencia IA: ${error.message}`;
    }
  });

  ui.orderForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = new FormData(ui.orderForm);
    await api("/api/orders", {
      method: "POST",
      body: JSON.stringify({
        code: form.get("code"),
        customer: form.get("customer"),
        x: Number(form.get("x")),
        y: Number(form.get("y")),
        service_minutes: Number(form.get("service_minutes") || 8),
        demand: Number(form.get("demand") || 10),
        priority: Number(form.get("priority") || 0),
        customer_id: form.get("customer_id") || null,
        worker_id: form.get("worker_id") || null
      })
    });
    ui.orderForm.reset();
    await loadBootstrap(false, true);
  });

  ui.workerForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = new FormData(ui.workerForm);
    await api("/api/workers", {
      method: "POST",
      body: JSON.stringify({
        name: form.get("name"),
        role: form.get("role") || "Conductor",
        shift_limit_minutes: Number(form.get("shift_limit_minutes") || 480)
      })
    });
    ui.workerForm.reset();
    const shiftInput = ui.workerForm.elements.namedItem("shift_limit_minutes");
    if (shiftInput) shiftInput.value = "480";
    if (ui.shiftLimitHelp) {
      ui.shiftLimitHelp.textContent = "Limite de turno: 08h 00m (tiempo maximo recomendado antes de sobretiempo).";
    }
    await loadBootstrap(false, false);
  });

  const shiftInput = ui.workerForm?.elements?.namedItem("shift_limit_minutes");
  if (shiftInput) {
    shiftInput.addEventListener("input", () => {
      const minutes = Number(shiftInput.value || 480);
      if (ui.shiftLimitHelp) {
        ui.shiftLimitHelp.textContent = `Limite de turno: ${formatMinutes(minutes)} (tiempo maximo recomendado antes de sobretiempo).`;
      }
    });
  }

  if (ui.routeAssignForm) {
    ui.routeAssignForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const form = new FormData(ui.routeAssignForm);
      const workerId = Number(form.get("worker_id"));
      const savedRouteId = Number(form.get("saved_route_id"));
      if (!workerId || !savedRouteId) {
        ui.offlineStatus.textContent = "Selecciona conductor y ruta para asignar.";
        return;
      }
      await api("/api/route-assignments", {
        method: "POST",
        body: JSON.stringify({
          worker_id: workerId,
          saved_route_id: savedRouteId,
          note: String(form.get("note") || "")
        })
      });
      ui.routeAssignForm.reset();
      await loadBootstrap(false, false);
      ui.offlineStatus.textContent = "Ruta pre-hecha asignada correctamente.";
    });
  }
  if (ui.routeAssignmentsList) {
    ui.routeAssignmentsList.addEventListener("click", async (event) => {
      const button = event.target.closest("button[data-route-assignment-action]");
      if (!button) return;
      const action = button.dataset.routeAssignmentAction;
      const workerId = Number(button.dataset.workerId);
      if (action === "remove" && workerId) {
        await api("/api/route-assignments", {
          method: "DELETE",
          body: JSON.stringify({ worker_id: workerId })
        });
        await loadBootstrap(false, false);
        ui.offlineStatus.textContent = "Asignacion de ruta eliminada.";
      }
    });
  }
  if (ui.routeQuickWorkerChips) {
    ui.routeQuickWorkerChips.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-route-worker-chip]");
      if (!button) return;
      state.routeQuickSelectedWorkerId = Number(button.dataset.routeWorkerChip);
      renderRouteQuickAssignUi();
      if (ui.routeQuickAssignStatus) {
        const name = state.workers.find((worker) => Number(worker.id) === Number(state.routeQuickSelectedWorkerId))?.name || "conductor";
        ui.routeQuickAssignStatus.textContent = `Conductor seleccionado: ${name}. Ahora toca una ruta para asignarla.`;
      }
    });
  }
  if (ui.routeQuickRouteCards) {
    ui.routeQuickRouteCards.addEventListener("click", async (event) => {
      const button = event.target.closest("button[data-route-saved-card]");
      if (!button) return;
      const workerId = Number(state.routeQuickSelectedWorkerId || 0);
      const savedRouteId = Number(button.dataset.routeSavedCard || 0);
      if (!workerId) {
        if (ui.routeQuickAssignStatus) {
          ui.routeQuickAssignStatus.textContent = "Primero toca un conductor.";
        }
        return;
      }
      if (!savedRouteId) return;
      await api("/api/route-assignments", {
        method: "POST",
        body: JSON.stringify({
          worker_id: workerId,
          saved_route_id: savedRouteId,
          note: "Asignada con clic rapido"
        })
      });
      await loadBootstrap(false, false);
      if (ui.routeQuickAssignStatus) {
        const routeLabel = state.savedRoutes.find((route) => Number(route.id) === savedRouteId)?.summary || `Ruta #${savedRouteId}`;
        ui.routeQuickAssignStatus.textContent = `Asignada ${routeLabel} al conductor seleccionado.`;
      }
    });
  }
  if (ui.routeQuickAssignmentsList) {
    ui.routeQuickAssignmentsList.addEventListener("click", async (event) => {
      const button = event.target.closest("button[data-route-quick-action]");
      if (!button) return;
      const action = button.dataset.routeQuickAction;
      const workerId = Number(button.dataset.workerId);
      if (action === "remove" && workerId) {
        await api("/api/route-assignments", {
          method: "DELETE",
          body: JSON.stringify({ worker_id: workerId })
        });
        await loadBootstrap(false, false);
        if (ui.routeQuickAssignStatus) {
          ui.routeQuickAssignStatus.textContent = "Asignacion eliminada.";
        }
      }
    });
  }

  ui.userForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = new FormData(ui.userForm);
    await api("/api/users", {
      method: "POST",
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        phone: form.get("phone"),
        preferred_channel: form.get("preferred_channel")
      })
    });
    ui.userForm.reset();
    await loadBootstrap(false, false);
  });

  if (ui.customerForm) {
    ui.customerForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const form = new FormData(ui.customerForm);
      await api("/api/customers", {
        method: "POST",
        body: JSON.stringify({
          name: form.get("name"),
          email: form.get("email"),
          phone: form.get("phone"),
          address: form.get("address")
        })
      });
      ui.customerForm.reset();
      await loadBootstrap(false, false);
    });
  }

  if (ui.customersTableBody) {
    ui.customersTableBody.addEventListener("click", async (event) => {
      const button = event.target.closest("button[data-customer-action]");
      if (!button) return;
      const id = Number(button.dataset.id);
      const action = button.dataset.customerAction;
      const target = state.customers.find((item) => Number(item.id) === id);
      if (action === "toggle" && target) {
        await api(`/api/customers/${id}`, {
          method: "PUT",
          body: JSON.stringify({ active: !target.active })
        });
      }
      if (action === "delete") {
        await api(`/api/customers/${id}`, { method: "DELETE" });
      }
      await loadBootstrap(false, false);
    });
  }

  if (ui.invoiceForm) {
    ui.invoiceForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const form = new FormData(ui.invoiceForm);
      const orderCodesRaw = String(form.get("order_codes") || "");
      await api("/api/invoices", {
        method: "POST",
        body: JSON.stringify({
          customer_id: Number(form.get("customer_id")),
          worker_id: form.get("worker_id"),
          saved_route_id: form.get("saved_route_id"),
          invoice_number: form.get("invoice_number"),
          total_amount: Number(form.get("total_amount") || 0),
          due_date: form.get("due_date"),
          status: form.get("status"),
          order_codes: orderCodesRaw.split(",").map((item) => item.trim()).filter(Boolean)
        })
      });
      ui.invoiceForm.reset();
      await loadBootstrap(false, false);
    });
  }

  if (ui.invoiceAutoOrdersBtn) {
    ui.invoiceAutoOrdersBtn.addEventListener("click", () => {
      if (!ui.invoiceForm) return;
      const customerId = Number(ui.invoiceCustomerSelect?.value || "");
      if (!Number.isFinite(customerId)) {
        if (ui.invoiceAssignHint) {
          ui.invoiceAssignHint.textContent = "Primero selecciona cliente para cargar pedidos.";
        }
        return;
      }
      const pendingCodes = state.orders
        .filter((order) => Number(order.customer_id) === customerId && order.status !== "completed")
        .map((order) => order.code);
      const orderCodesInput = ui.invoiceForm.elements.namedItem("order_codes");
      if (orderCodesInput) orderCodesInput.value = pendingCodes.join(",");
      if (ui.invoiceAssignHint) {
        ui.invoiceAssignHint.textContent = pendingCodes.length
          ? `Se cargaron ${pendingCodes.length} pedidos pendientes del cliente.`
          : "Este cliente no tiene pedidos pendientes por ahora.";
      }
    });
  }

  if (ui.invoiceCustomerSelect) {
    ui.invoiceCustomerSelect.addEventListener("change", refreshInvoicePlanningHint);
  }
  if (ui.invoiceWorkerSelect) {
    ui.invoiceWorkerSelect.addEventListener("change", refreshInvoicePlanningHint);
  }
  if (ui.invoiceRouteSelect) {
    ui.invoiceRouteSelect.addEventListener("change", refreshInvoicePlanningHint);
  }

  if (ui.invoicesTableBody) {
    ui.invoicesTableBody.addEventListener("click", async (event) => {
      const button = event.target.closest("button[data-invoice-action]");
      if (!button) return;
      const id = Number(button.dataset.id);
      const action = button.dataset.invoiceAction;
      if (action === "mark-paid") {
        await api(`/api/invoices/${id}`, {
          method: "PUT",
          body: JSON.stringify({ status: "paid" })
        });
      }
      if (action === "delete") {
        await api(`/api/invoices/${id}`, { method: "DELETE" });
      }
      await loadBootstrap(false, false);
    });
  }

  if (ui.controllerDepotForm) {
    ui.controllerDepotForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const form = new FormData(ui.controllerDepotForm);
      const payload = {
        customer: String(form.get("customer") || state.depot.customer),
        lat: Number(form.get("lat")),
        lng: Number(form.get("lng")),
        x: state.depot.x,
        y: state.depot.y
      };
      await api("/api/depot", {
        method: "PUT",
        body: JSON.stringify(payload)
      });
      await loadBootstrap(false, true);
      if (ui.controllerDepotStatus) {
        ui.controllerDepotStatus.textContent = "Bodega principal actualizada.";
      }
    });
  }

  ui.notificationForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = new FormData(ui.notificationForm);
    await api("/api/notifications", {
      method: "POST",
      body: JSON.stringify({
        recipient: form.get("recipient"),
        channel: form.get("channel"),
        message: form.get("message")
      })
    });
    ui.notificationForm.reset();
    await loadBootstrap(false, false);
  });

  ui.controllerSuggestionForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const message = (ui.controllerMessage.value || "").trim();
    const priority = ui.controllerPriority.value || "media";
    const workerIdRaw = ui.controllerTargetWorker?.value || "all";
    if (!message) {
      ui.offlineStatus.textContent = "Escribe una sugerencia antes de enviarla.";
      return;
    }
    await api("/api/controller/suggestion", {
      method: "POST",
      body: JSON.stringify({ message, priority, worker_id: workerIdRaw })
    });
    ui.controllerMessage.value = "";
    await loadBootstrap(false, false);
    ui.offlineStatus.textContent = workerIdRaw === "all"
      ? "Sugerencia enviada a todos los conductores activos."
      : "Sugerencia enviada al conductor seleccionado.";
  });

  ui.graphNodeForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = new FormData(ui.graphNodeForm);
    const street = String(form.get("street") || "").trim();
    const area = String(form.get("area") || "").trim();
    ui.graphStatus.textContent = "Buscando direccion...";
    const result = await geocodeStreetAddress(street, area);
    await api("/api/map-graph/nodes", {
      method: "POST",
      body: JSON.stringify({
        lat: result.lat,
        lng: result.lng
      })
    });
    ui.graphNodeForm.reset();
    await loadMapGraph();
    renderAll();
    ui.graphStatus.textContent = `Punto agregado: ${result.label}`;
  });

  ui.graphEdgeForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = new FormData(ui.graphEdgeForm);
    await api("/api/map-graph/edges", {
      method: "POST",
      body: JSON.stringify({
        from: form.get("from"),
        to: form.get("to")
      })
    });
    await loadMapGraph();
    renderAll();
    ui.graphStatus.textContent = "Conexion agregada entre puntos.";
  });

  ui.refreshGraphBtn.addEventListener("click", async () => {
    await loadMapGraph();
    renderAll();
    ui.graphStatus.textContent = "Grafo recargado.";
  });

  ui.testRunForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    ui.testRunStatus.textContent = "Procesando prueba...";
    try {
      const simpleRaw = (ui.simpleStopsInput?.value || "").trim();
      const orders = simpleRaw
        ? parseSimpleStops(simpleRaw)
        : JSON.parse(ui.testOrdersJson.value);
      state.sandboxDraftOrders = simpleRaw ? orders : [];
      const route = simpleRaw
        ? (state.sandboxDraftRouteCodes.length
          ? state.sandboxDraftRouteCodes
          : parseRouteCodes(ui.simpleRouteOrderInput?.value || ""))
        : parseRouteCodes(ui.testRouteInput.value);
      const depotLat = Number(ui.testDepotLat.value);
      const depotLng = Number(ui.testDepotLng.value);
      const body = {
        orders,
        route,
        scenario: state.config.scenario,
        traffic: state.config.traffic,
        weather: state.config.weather
      };
      if (Number.isFinite(depotLat) && Number.isFinite(depotLng)) {
        body.depot = { lat: depotLat, lng: depotLng, customer: "Deposito de prueba" };
      }
      await api("/api/test-run", { method: "POST", body: JSON.stringify(body) });
      await loadBootstrap(true, true);
      renderSandboxRouteBuilder();
      ui.testRunStatus.textContent = simpleRaw
        ? "Prueba cargada con formato simple por lineas."
        : "Prueba cargada correctamente con tu data y tu ruta.";
    } catch (error) {
      ui.testRunStatus.textContent = `Error en prueba: ${error.message}`;
    }
  });

  ui.ordersTableBody.addEventListener("click", async (event) => {
    const button = event.target.closest("button[data-order-action]");
    if (!button) return;
    const id = Number(button.dataset.id);
    const action = button.dataset.orderAction;
    if (action === "complete") {
      await api(`/api/orders/${id}`, { method: "PUT", body: JSON.stringify({ status: "completed" }) });
    }
    if (action === "delete") {
      await api(`/api/orders/${id}`, { method: "DELETE" });
    }
    await loadBootstrap(false, false);
  });

  ui.workersTableBody.addEventListener("click", async (event) => {
    const button = event.target.closest("button[data-worker-action]");
    if (!button) return;
    const id = Number(button.dataset.id);
    const action = button.dataset.workerAction;
    if (action === "toggle") {
      const targetWorker = state.workers.find((worker) => worker.id === id);
      await api(`/api/workers/${id}`, {
        method: "PUT",
        body: JSON.stringify({ active: targetWorker ? !targetWorker.active : true })
      });
    }
    if (action === "delete") {
      await api(`/api/workers/${id}`, { method: "DELETE" });
    }
    await loadBootstrap(false, false);
  });

  ui.usersTableBody.addEventListener("click", async (event) => {
    const button = event.target.closest("button[data-user-action]");
    if (!button) return;
    const id = Number(button.dataset.id);
    const action = button.dataset.userAction;
    const target = state.users.find((user) => user.id === id);
    if (action === "toggle" && target) {
      await api(`/api/users/${id}`, { method: "PUT", body: JSON.stringify({ active: !target.active }) });
    }
    if (action === "delete") {
      await api(`/api/users/${id}`, { method: "DELETE" });
    }
    await loadBootstrap(false, false);
  });

  ui.graphNodesBody.addEventListener("click", async (event) => {
    const button = event.target.closest("button[data-graph-action]");
    if (!button) return;
    const action = button.dataset.graphAction;
    const id = button.dataset.id;
    if (action === "delete-node" && id) {
      await api(`/api/map-graph/nodes/${id}`, { method: "DELETE" });
      await loadMapGraph();
      renderAll();
      ui.graphStatus.textContent = `Punto ${id} eliminado.`;
    }
  });

  ui.dbExportBtn.addEventListener("click", async () => {
    await withButtonLoading(ui.dbExportBtn, "Exportando...", async () => {
      const payload = await api("/api/db/export");
      ui.dbJsonEditor.value = JSON.stringify(payload, null, 2);
      ui.dbStatus.textContent = "Exportacion lista. Puedes guardar ese JSON o reimportarlo.";
    });
  });

  ui.dbImportBtn.addEventListener("click", async () => {
    await withButtonLoading(ui.dbImportBtn, "Importando...", async () => {
      const raw = (ui.dbJsonEditor.value || "").trim();
      if (!raw) {
        ui.dbStatus.textContent = "Pega un JSON valido antes de importar.";
        return;
      }
      const parsed = JSON.parse(raw);
      await api("/api/db/import", {
        method: "POST",
        body: JSON.stringify(parsed)
      });
      await loadBootstrap(true, true);
      ui.dbStatus.textContent = "Base de datos importada correctamente.";
    }).catch((error) => {
      ui.dbStatus.textContent = `Error importando BD: ${error.message}`;
    });
  });

  ui.dbResetBtn.addEventListener("click", async () => {
    await withButtonLoading(ui.dbResetBtn, "Reseteando...", async () => {
      await api("/api/db/reset", { method: "POST", body: JSON.stringify({}) });
      await loadBootstrap(true, true);
      ui.dbStatus.textContent = "Base de datos restaurada a demo.";
    });
  });
}

function applySnapshot(snapshot) {
  state.depot = snapshot.depot || state.depot;
  state.config = snapshot.config || state.config;
  state.workers = snapshot.workers || [];
  state.activeWorkers = snapshot.active_workers || [];
  state.activeWorker = snapshot.activeWorker || null;
  state.users = snapshot.users || [];
  state.customers = snapshot.customers || [];
  state.invoices = snapshot.invoices || [];
  state.customerRealtime = snapshot.customer_realtime || [];
  state.notifications = snapshot.notifications || [];
  state.routeAssignments = snapshot.route_assignments || [];
  state.controllerLog = snapshot.controller_log || [];
  state.dbInfo = snapshot.db_info || null;
  state.orders = snapshot.orders || [];
  state.markers = snapshot.markers || [];
  state.route = snapshot.route || [];
  state.workerRoutes = snapshot.worker_routes || [];
  state.metrics = snapshot.metrics || null;
  state.simulationRate = Number(snapshot.simulation_rate || state.simulationRate || 1);
  state.vehicleSpeedOverride = Number.isFinite(Number(snapshot.vehicle_speed_override))
    ? Number(snapshot.vehicle_speed_override)
    : null;
  state.preRouteCodes = Array.isArray(snapshot.pre_route_codes) ? snapshot.pre_route_codes.map(String) : [];
  state.googleRoute = snapshot.google_route || null;
  state.savedRoutes = snapshot.saved_routes || [];
  state.mapGraph = snapshot.map_graph || { nodes: [], edges: [] };
  state.activeLeg = 0;
  state.progress = 0;
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  navigator.serviceWorker.register("/service-worker.js").catch(() => {
    ui.offlineStatus.textContent = "No se pudo registrar el modo offline.";
  });
}

function startLoop() {
  setInterval(() => {
    tickSimulation().catch((error) => {
      ui.aiText.textContent = `Error: ${error.message}`;
    });
  }, 1000);
}

async function init() {
  const params = new URLSearchParams(window.location.search);
  const queryTab = String(params.get("tab") || "operacion").toLowerCase();
  const queryMode = String(params.get("mode") || "").toLowerCase();
  state.uiMode = queryMode === "sandbox" ? "sandbox" : "default";
  document.body.classList.toggle("sandbox-mode", state.uiMode === "sandbox");
  loadUiPrefs();
  syncPrefsUi();
  applyUiPrefs();

  initMap();
  await loadPublicConfig();
  if (ui.mapModeSelect) {
    if (!state.mapConfig.google_embed_enabled) {
      const option = ui.mapModeSelect.querySelector('option[value="google"]');
      if (option) option.textContent = "Google Maps (requiere API key)";
    }
    ui.mapModeSelect.value = "leaflet";
  }
  const validTabs = new Set(["operacion", "rutas", "asistente", "controlador", "conductores", "datos", "clientes", "sandbox", "ajustes"]);
  const initialTab = state.uiMode === "sandbox"
    ? "sandbox"
    : (validTabs.has(queryTab) ? queryTab : "operacion");
  if (ui.backToMainLink) {
    ui.backToMainLink.hidden = state.uiMode !== "sandbox";
  }
  setActiveTab(initialTab);
  ui.aiText.textContent = `Modelo IA listo (${scenarioLabels[state.config.scenario]}).`;
  bindEvents();
  registerServiceWorker();
  try {
    await loadBootstrap(true, true);
  } catch (error) {
    const snapshot = loadDeviceSnapshot();
    if (snapshot) {
      applySnapshot(snapshot);
      renderAll();
      fitMap();
      ui.offlineStatus.textContent = "Sin internet: cargado desde dispositivo.";
    } else {
      throw error;
    }
  }
  startLoop();
}

init().catch((error) => {
  ui.aiText.textContent = `Error inicializando app: ${error.message}`;
});
