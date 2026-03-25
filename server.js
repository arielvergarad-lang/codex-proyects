const fs = require("node:fs");
const path = require("node:path");
const http = require("node:http");
const { URL } = require("node:url");

loadDotEnv(path.join(__dirname, ".env"));

const PORT = Number(process.env.PORT || 3000);
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4.1-mini";
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || "";
const GOOGLE_MAPS_JS_API_KEY = process.env.GOOGLE_MAPS_JS_API_KEY || GOOGLE_MAPS_API_KEY;
const PYTHON_OPTIMIZER_URL = (process.env.PYTHON_OPTIMIZER_URL || "http://127.0.0.1:8001").replace(/\/+$/, "");
const PYTHON_OPTIMIZER_TOKEN = process.env.PYTHON_OPTIMIZER_TOKEN || "";
const PYTHON_OPTIMIZER_TIMEOUT_MS = Number(process.env.PYTHON_OPTIMIZER_TIMEOUT_MS || 4500);
const DEPOT = {
  id: "depot",
  code: "DEPOT",
  customer: "Centro Logistico",
  x: 12,
  y: 72,
  lat: -33.45,
  lng: -70.66
};

const projectRoot = __dirname;
const dataDir = path.join(projectRoot, "data");
const dbPath = path.join(dataDir, "logistics-db.json");

fs.mkdirSync(dataDir, { recursive: true });
let db = loadDb();
syncDepotFromDb();

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = url.pathname;

    if (req.method === "OPTIONS") {
      sendJson(res, 204, {});
      return;
    }

    if (pathname.startsWith("/api/")) {
      await handleApi(req, res, pathname);
      return;
    }

    serveStatic(res, pathname);
  } catch (error) {
    sendJson(res, 500, {
      error: "internal_error",
      message: error.message || "Unexpected server error"
    });
  }
});

server.listen(PORT, () => {
  console.log(`DeliveryCore server running on http://localhost:${PORT}`);
});

function loadDb() {
  if (!fs.existsSync(dbPath)) {
    const seed = getSeedDb();
    fs.writeFileSync(dbPath, JSON.stringify(seed, null, 2), "utf8");
    syncDepotFromDb(seed);
    return seed;
  }

  const raw = fs.readFileSync(dbPath, "utf8");
  const parsed = JSON.parse(raw);
  const safe = ensureDbShape(parsed);
  syncDepotFromDb(safe);
  return safe;
}

function saveDb() {
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), "utf8");
}

function ensureDbShape(input) {
  const base = getSeedDb();
  const incomingConfig = input.config || {};
  const safeConfig = {
    scenario: normalizeScenario(incomingConfig.scenario || base.config.scenario),
    traffic: toInt(incomingConfig.traffic, 48, 0, 100),
    weather: toInt(incomingConfig.weather, 22, 0, 100),
    route_mode: incomingConfig.route_mode === "manual" ? "manual" : "auto",
    manual_route: Array.isArray(incomingConfig.manual_route) ? incomingConfig.manual_route.map(String) : []
  };
  const safeWorkers = Array.isArray(input.workers)
    ? input.workers.map((worker, idx) => sanitizeWorkerRecord(worker, idx))
    : base.workers;
  const safeSavedRoutes = Array.isArray(input.saved_routes) ? input.saved_routes : base.saved_routes;
  const sourceOrders = Array.isArray(input.orders) ? input.orders : base.orders;
  const safeCustomers = Array.isArray(input.customers) ? input.customers.map((item, idx) => sanitizeCustomerRecord(item, idx)) : base.customers;
  const safe = {
    config: safeConfig,
    depot: sanitizeDepot(input.depot || base.depot),
    workers: safeWorkers,
    orders: sourceOrders.map((order, idx) => sanitizeOrderRecord(order, idx, safeWorkers, safeCustomers)),
    markers: Array.isArray(input.markers) ? input.markers : base.markers,
    customers: safeCustomers,
    invoices: Array.isArray(input.invoices)
      ? input.invoices.map((item, idx) => sanitizeInvoiceRecord(item, idx, safeCustomers, safeWorkers, safeSavedRoutes))
      : base.invoices,
    users: Array.isArray(input.users) ? input.users : base.users,
    notifications: Array.isArray(input.notifications) ? input.notifications : base.notifications,
    google_route: input.google_route && typeof input.google_route === "object" ? input.google_route : null,
    saved_routes: safeSavedRoutes,
    route_assignments: Array.isArray(input.route_assignments) ? input.route_assignments : base.route_assignments,
    map_graph: input.map_graph && Array.isArray(input.map_graph.nodes) && Array.isArray(input.map_graph.edges)
      ? input.map_graph
      : base.map_graph,
    controller_log: Array.isArray(input.controller_log) ? input.controller_log : base.controller_log
  };
  return safe;
}

function getSeedDb() {
  const seedCreatedAt = new Date().toISOString();
  return {
    depot: { ...DEPOT },
    config: { scenario: "urban", traffic: 48, weather: 22, route_mode: "auto", manual_route: [] },
    workers: [
      { id: 1, name: "Camila Soto", role: "Conductor", shift_limit_minutes: 480, active: 1 },
      { id: 2, name: "Tomas Fuentes", role: "Ayudante", shift_limit_minutes: 480, active: 1 }
    ],
    orders: [
      { id: 1, code: "A-301", customer: "Pedido A", x: 28, y: 40, lat: -33.446, lng: -70.64, service_minutes: 7, demand: 12, priority: 0, status: "pending", worker_id: 1, created_at: seedCreatedAt, completed_at: null, completed_duration_minutes: null },
      { id: 2, code: "B-220", customer: "Pedido B", x: 44, y: 24, lat: -33.435, lng: -70.62, service_minutes: 6, demand: 20, priority: 0, status: "pending", worker_id: 2, created_at: seedCreatedAt, completed_at: null, completed_duration_minutes: null },
      { id: 3, code: "C-102", customer: "Pedido C", x: 63, y: 35, lat: -33.452, lng: -70.59, service_minutes: 10, demand: 14, priority: 1, status: "pending", worker_id: 1, created_at: seedCreatedAt, completed_at: null, completed_duration_minutes: null },
      { id: 4, code: "D-887", customer: "Pedido D", x: 73, y: 62, lat: -33.476, lng: -70.57, service_minutes: 8, demand: 10, priority: 0, status: "pending", worker_id: 2, created_at: seedCreatedAt, completed_at: null, completed_duration_minutes: null },
      { id: 5, code: "E-502", customer: "Pedido E", x: 54, y: 78, lat: -33.492, lng: -70.61, service_minutes: 5, demand: 8, priority: 0, status: "pending", worker_id: 1, created_at: seedCreatedAt, completed_at: null, completed_duration_minutes: null },
      { id: 6, code: "F-019", customer: "Pedido F", x: 31, y: 82, lat: -33.5, lng: -70.65, service_minutes: 9, demand: 18, priority: 0, status: "pending", worker_id: 2, created_at: seedCreatedAt, completed_at: null, completed_duration_minutes: null }
    ],
    markers: [
      { id: 1, type: "hotspot", x: 58, y: 48, lat: -33.455, lng: -70.605, note: "Cruce con congestion recurrente", created_at: new Date().toISOString() },
      { id: 2, type: "priority", x: 68, y: 28, lat: -33.438, lng: -70.585, note: "Zona premium con SLA estricto", created_at: new Date().toISOString() }
    ],
    users: [
      {
        id: 1,
        name: "Andrea Lopez",
        email: "andrea@empresa.cl",
        phone: "+56911112222",
        preferred_channel: "email",
        active: 1
      },
      {
        id: 2,
        name: "Jorge Rivas",
        email: "jorge@empresa.cl",
        phone: "+56933334444",
        preferred_channel: "sms",
        active: 1
      }
    ],
    customers: [
      { id: 1, name: "Cliente Demo Norte", email: "compras@norte.cl", phone: "+56911111111", address: "Coronel Centro", active: 1 },
      { id: 2, name: "Cliente Demo Sur", email: "compras@sur.cl", phone: "+56922222222", address: "Lota Sur", active: 1 }
    ],
    invoices: [
      {
        id: 1,
        customer_id: 1,
        worker_id: 1,
        saved_route_id: null,
        invoice_number: "F-1001",
        total_amount: 98000,
        status: "pending",
        due_date: seedCreatedAt.slice(0, 10),
        created_at: seedCreatedAt,
        order_codes: ["A-301", "C-102"]
      }
    ],
    notifications: [],
    google_route: null,
    saved_routes: [],
    route_assignments: [],
    map_graph: buildDefaultMapGraph(),
    controller_log: []
  };
}

async function handleApi(req, res, pathname) {
  const cleanPath = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  const method = req.method.toUpperCase();

  if (cleanPath === "/api/bootstrap" && method === "GET") {
    sendJson(res, 200, getBootstrapData());
    return;
  }

  if (cleanPath === "/api/depot" && method === "PUT") {
    const body = await readJsonBody(req);
    db.depot = sanitizeDepot(body);
    syncDepotFromDb();
    saveDb();
    sendJson(res, 200, getBootstrapData());
    return;
  }

  if (cleanPath === "/api/public-config" && method === "GET") {
    sendJson(res, 200, {
      map: {
        google_embed_enabled: Boolean(GOOGLE_MAPS_JS_API_KEY),
        google_maps_public_key: GOOGLE_MAPS_JS_API_KEY || ""
      }
    });
    return;
  }

  if (cleanPath === "/api/db" && method === "GET") {
    sendJson(res, 200, buildDbInfo());
    return;
  }

  if (cleanPath === "/api/db/export" && method === "GET") {
    sendJson(res, 200, {
      exported_at: new Date().toISOString(),
      db
    });
    return;
  }

  if (cleanPath === "/api/db/import" && method === "POST") {
    const body = await readJsonBody(req);
    if (!body || typeof body !== "object" || !body.db || typeof body.db !== "object") {
      sendJson(res, 400, { error: "invalid_input", message: "Debes enviar { db: {...} }" });
      return;
    }
    db = ensureDbShape(body.db);
    syncDepotFromDb();
    saveDb();
    sendJson(res, 200, { ok: true, info: buildDbInfo() });
    return;
  }

  if (cleanPath === "/api/db/reset" && method === "POST") {
    db = getSeedDb();
    syncDepotFromDb();
    saveDb();
    sendJson(res, 200, { ok: true, info: buildDbInfo() });
    return;
  }

  if (cleanPath === "/api/operations/reset" && method === "POST") {
    db.orders = [];
    db.markers = [];
    db.google_route = null;
    db.saved_routes = [];
    db.route_assignments = [];
    db.controller_log = [];
    db.map_graph = { nodes: [], edges: [] };
    db.invoices = (db.invoices || []).map((invoice, idx) => sanitizeInvoiceRecord({
      ...invoice,
      order_codes: []
    }, idx, db.customers || [], db.workers || [], db.saved_routes || []));
    saveDb();
    sendJson(res, 200, getBootstrapData());
    return;
  }

  if (cleanPath === "/api/orders" && method === "GET") {
    sendJson(res, 200, { orders: getOrders() });
    return;
  }

  if (cleanPath === "/api/customers" && method === "GET") {
    sendJson(res, 200, { customers: getCustomers(), customer_realtime: getCustomerRealtime() });
    return;
  }

  if (cleanPath === "/api/customers" && method === "POST") {
    const body = await readJsonBody(req);
    const customer = sanitizeCustomerRecord({
      id: getNextId(db.customers || []),
      name: body.name,
      email: body.email,
      phone: body.phone,
      address: body.address,
      active: body.active !== false
    }, db.customers?.length || 0);
    db.customers = [...(db.customers || []), customer];
    saveDb();
    sendJson(res, 201, getBootstrapData());
    return;
  }

  if (cleanPath.startsWith("/api/customers/") && method === "PUT") {
    const id = Number(cleanPath.split("/").pop());
    const body = await readJsonBody(req);
    const customer = (db.customers || []).find((item) => item.id === id);
    if (!customer) {
      sendJson(res, 404, { error: "not_found", message: "Customer not found" });
      return;
    }
    customer.name = String(body.name ?? customer.name).trim();
    customer.email = String(body.email ?? customer.email).trim();
    customer.phone = String(body.phone ?? customer.phone).trim();
    customer.address = String(body.address ?? customer.address).trim();
    if (body.active !== undefined) customer.active = body.active ? 1 : 0;
    saveDb();
    sendJson(res, 200, getBootstrapData());
    return;
  }

  if (cleanPath.startsWith("/api/customers/") && method === "DELETE") {
    const id = Number(cleanPath.split("/").pop());
    db.customers = (db.customers || []).filter((item) => item.id !== id);
    db.invoices = (db.invoices || []).filter((item) => Number(item.customer_id) !== id);
    db.orders.forEach((order) => {
      if (Number(order.customer_id) === id) order.customer_id = null;
    });
    saveDb();
    sendJson(res, 200, getBootstrapData());
    return;
  }

  if (cleanPath === "/api/invoices" && method === "GET") {
    sendJson(res, 200, { invoices: getInvoices() });
    return;
  }

  if (cleanPath === "/api/invoices" && method === "POST") {
    const body = await readJsonBody(req);
    const invoice = sanitizeInvoiceRecord({
      id: getNextId(db.invoices || []),
      customer_id: body.customer_id,
      worker_id: body.worker_id,
      saved_route_id: body.saved_route_id,
      invoice_number: body.invoice_number,
      total_amount: body.total_amount,
      status: body.status,
      due_date: body.due_date,
      order_codes: body.order_codes,
      created_at: new Date().toISOString()
    }, db.invoices?.length || 0, db.customers || [], db.workers || [], db.saved_routes || []);
    db.invoices = [...(db.invoices || []), invoice];
    saveDb();
    sendJson(res, 201, getBootstrapData());
    return;
  }

  if (cleanPath.startsWith("/api/invoices/") && method === "PUT") {
    const id = Number(cleanPath.split("/").pop());
    const body = await readJsonBody(req);
    const invoice = (db.invoices || []).find((item) => item.id === id);
    if (!invoice) {
      sendJson(res, 404, { error: "not_found", message: "Invoice not found" });
      return;
    }
    invoice.customer_id = normalizeCustomerId(body.customer_id ?? invoice.customer_id, db.customers || []);
    invoice.worker_id = normalizeWorkerId(body.worker_id ?? invoice.worker_id, db.workers || []);
    invoice.saved_route_id = normalizeSavedRouteId(body.saved_route_id ?? invoice.saved_route_id, db.saved_routes || []);
    invoice.invoice_number = String(body.invoice_number ?? invoice.invoice_number).trim();
    invoice.total_amount = Number.isFinite(Number(body.total_amount)) ? Number(body.total_amount) : invoice.total_amount;
    invoice.status = normalizeInvoiceStatus(body.status ?? invoice.status);
    invoice.due_date = String((body.due_date ?? invoice.due_date) || "");
    if (Array.isArray(body.order_codes)) {
      invoice.order_codes = body.order_codes.map(String);
    }
    saveDb();
    sendJson(res, 200, getBootstrapData());
    return;
  }

  if (cleanPath.startsWith("/api/invoices/") && method === "DELETE") {
    const id = Number(cleanPath.split("/").pop());
    db.invoices = (db.invoices || []).filter((item) => item.id !== id);
    saveDb();
    sendJson(res, 200, getBootstrapData());
    return;
  }

  if (cleanPath === "/api/orders" && method === "POST") {
    const body = await readJsonBody(req);
    const nextId = getNextId(db.orders);
    const x = clampNumber(body.x, 2, 98);
    const y = clampNumber(body.y, 2, 98);
    const inferred = inferLatLng({ x, y });
    const newOrder = {
      id: nextId,
      code: String(body.code || `N-${Date.now().toString().slice(-5)}`).trim(),
      customer: String(body.customer || "Pedido nuevo").trim(),
      x,
      y,
      lat: clampOrFallback(body.lat, inferred.lat),
      lng: clampOrFallback(body.lng, inferred.lng),
      service_minutes: toInt(body.service_minutes, 8, 1, 50),
      demand: toInt(body.demand, 10, 1, 100),
      priority: toInt(body.priority, 0, 0, 1),
      status: "pending",
      worker_id: normalizeWorkerId(body.worker_id, db.workers),
      customer_id: normalizeCustomerId(body.customer_id, db.customers || []),
      created_at: new Date().toISOString(),
      completed_at: null,
      completed_duration_minutes: null
    };
    db.orders.push(newOrder);
    saveDb();
    sendJson(res, 201, getBootstrapData());
    return;
  }

  if (cleanPath.startsWith("/api/orders/") && method === "PUT") {
    const id = Number(cleanPath.split("/").pop());
    const body = await readJsonBody(req);
    const order = db.orders.find((item) => item.id === id);
    if (!order) {
      sendJson(res, 404, { error: "not_found", message: "Order not found" });
      return;
    }

    order.code = String(body.code ?? order.code).trim();
    order.customer = String(body.customer ?? order.customer).trim();
    order.x = clampNumber(body.x ?? order.x, 2, 98);
    order.y = clampNumber(body.y ?? order.y, 2, 98);
    const inferred = inferLatLng({ x: order.x, y: order.y });
    order.lat = clampOrFallback(body.lat ?? order.lat, inferred.lat);
    order.lng = clampOrFallback(body.lng ?? order.lng, inferred.lng);
    order.service_minutes = toInt(body.service_minutes ?? order.service_minutes, 8, 1, 50);
    order.demand = toInt(body.demand ?? order.demand, 10, 1, 100);
    order.priority = toInt(body.priority ?? order.priority, 0, 0, 1);
    const previousStatus = normalizeStatus(order.status);
    const nextStatus = normalizeStatus(body.status ?? order.status);
    order.status = nextStatus;
    order.worker_id = normalizeWorkerId(body.worker_id ?? order.worker_id, db.workers);
    order.customer_id = normalizeCustomerId(body.customer_id ?? order.customer_id, db.customers || []);
    if (!order.created_at) {
      order.created_at = new Date().toISOString();
    }
    if (nextStatus === "completed" && previousStatus !== "completed") {
      const completedAt = new Date().toISOString();
      order.completed_at = completedAt;
      order.completed_duration_minutes = minutesBetweenIso(order.created_at, completedAt) || toInt(order.service_minutes, 8, 1, 50);
    }
    if (nextStatus !== "completed") {
      order.completed_at = null;
      order.completed_duration_minutes = null;
    }
    saveDb();
    sendJson(res, 200, getBootstrapData());
    return;
  }

  if (cleanPath.startsWith("/api/orders/") && method === "DELETE") {
    const id = Number(cleanPath.split("/").pop());
    db.orders = db.orders.filter((item) => item.id !== id);
    saveDb();
    sendJson(res, 200, getBootstrapData());
    return;
  }

  if (cleanPath === "/api/workers" && method === "GET") {
    sendJson(res, 200, { workers: getWorkers() });
    return;
  }

  if (cleanPath === "/api/users" && method === "GET") {
    sendJson(res, 200, { users: getUsers() });
    return;
  }

  if (cleanPath === "/api/users" && method === "POST") {
    const body = await readJsonBody(req);
    const user = {
      id: getNextId(db.users),
      name: String(body.name || "Nuevo usuario").trim(),
      email: String(body.email || "").trim(),
      phone: String(body.phone || "").trim(),
      preferred_channel: normalizeChannel(body.preferred_channel),
      active: body.active === false ? 0 : 1
    };
    db.users.push(user);
    saveDb();
    sendJson(res, 201, getBootstrapData());
    return;
  }

  if (cleanPath.startsWith("/api/users/") && method === "PUT") {
    const id = Number(cleanPath.split("/").pop());
    const body = await readJsonBody(req);
    const user = db.users.find((item) => item.id === id);
    if (!user) {
      sendJson(res, 404, { error: "not_found", message: "User not found" });
      return;
    }

    user.name = String(body.name ?? user.name).trim();
    user.email = String(body.email ?? user.email).trim();
    user.phone = String(body.phone ?? user.phone).trim();
    user.preferred_channel = normalizeChannel(body.preferred_channel ?? user.preferred_channel);
    if (body.active !== undefined) {
      user.active = body.active ? 1 : 0;
    }
    saveDb();
    sendJson(res, 200, getBootstrapData());
    return;
  }

  if (cleanPath.startsWith("/api/users/") && method === "DELETE") {
    const id = Number(cleanPath.split("/").pop());
    db.users = db.users.filter((item) => item.id !== id);
    saveDb();
    sendJson(res, 200, getBootstrapData());
    return;
  }

  if (cleanPath === "/api/workers" && method === "POST") {
    const body = await readJsonBody(req);
    const worker = {
      id: getNextId(db.workers),
      name: String(body.name || "Nuevo trabajador").trim(),
      role: String(body.role || "Conductor").trim(),
      shift_limit_minutes: toInt(body.shift_limit_minutes, 480, 120, 900),
      active: body.active === true ? 1 : 0
    };
    db.workers.push(worker);
    saveDb();
    sendJson(res, 201, getBootstrapData());
    return;
  }

  if (cleanPath.startsWith("/api/workers/") && method === "PUT") {
    const id = Number(cleanPath.split("/").pop());
    const body = await readJsonBody(req);
    const worker = db.workers.find((item) => item.id === id);
    if (!worker) {
      sendJson(res, 404, { error: "not_found", message: "Worker not found" });
      return;
    }

    worker.name = String(body.name ?? worker.name).trim();
    worker.role = String(body.role ?? worker.role).trim();
    worker.shift_limit_minutes = toInt(body.shift_limit_minutes ?? worker.shift_limit_minutes, 480, 120, 900);
    if (body.active !== undefined) {
      worker.active = body.active ? 1 : 0;
    }
    saveDb();
    sendJson(res, 200, getBootstrapData());
    return;
  }

  if (cleanPath.startsWith("/api/workers/") && method === "DELETE") {
    const id = Number(cleanPath.split("/").pop());
    db.workers = db.workers.filter((item) => item.id !== id);
    db.route_assignments = db.route_assignments.filter((item) => item.worker_id !== id);
    db.orders.forEach((order) => {
      if (order.worker_id === id) order.worker_id = null;
    });
    db.invoices.forEach((invoice) => {
      if (Number(invoice.worker_id) === id) invoice.worker_id = null;
    });
    saveDb();
    sendJson(res, 200, getBootstrapData());
    return;
  }

  if (cleanPath === "/api/markers" && method === "POST") {
    const body = await readJsonBody(req);
    const type = normalizeMarkerType(body.type);
    const marker = {
      id: getNextId(db.markers),
      type,
      x: clampNumber(body.x, 2, 98),
      y: clampNumber(body.y, 2, 98),
      lat: clampOrFallback(body.lat, inferLatLng({ x: clampNumber(body.x, 2, 98), y: clampNumber(body.y, 2, 98) }).lat),
      lng: clampOrFallback(body.lng, inferLatLng({ x: clampNumber(body.x, 2, 98), y: clampNumber(body.y, 2, 98) }).lng),
      note: String(body.note || defaultMarkerNote(type)).trim(),
      created_at: new Date().toISOString()
    };
    db.markers.push(marker);
    if (db.markers.length > 10) {
      db.markers = db.markers.slice(-10);
    }
    saveDb();
    sendJson(res, 201, getBootstrapData());
    return;
  }

  if (cleanPath.startsWith("/api/markers/") && method === "DELETE") {
    const id = Number(cleanPath.split("/").pop());
    db.markers = db.markers.filter((item) => item.id !== id);
    saveDb();
    sendJson(res, 200, getBootstrapData());
    return;
  }

  if (cleanPath === "/api/config" && method === "PUT") {
    const body = await readJsonBody(req);
    db.config.scenario = normalizeScenario(body.scenario);
    db.config.traffic = toInt(body.traffic, 48, 0, 100);
    db.config.weather = toInt(body.weather, 22, 0, 100);
    db.config.route_mode = body.route_mode === "manual" ? "manual" : "auto";
    db.config.manual_route = Array.isArray(body.manual_route) ? body.manual_route.map(String) : db.config.manual_route;
    saveDb();
    sendJson(res, 200, getBootstrapData());
    return;
  }

  if ((cleanPath === "/api/test-run" || cleanPath === "/api/test_run" || cleanPath === "/api/testrun") && method === "POST") {
    const body = await readJsonBody(req);
    const incomingOrders = Array.isArray(body.orders) ? body.orders : [];
    if (!incomingOrders.length) {
      sendJson(res, 400, { error: "invalid_input", message: "Debes enviar al menos una orden en 'orders'" });
      return;
    }

    if (body.depot && typeof body.depot === "object") {
      DEPOT.customer = String(body.depot.customer || DEPOT.customer);
      DEPOT.lat = clampOrFallback(body.depot.lat, DEPOT.lat);
      DEPOT.lng = clampOrFallback(body.depot.lng, DEPOT.lng);
      if (Number.isFinite(Number(body.depot.x))) DEPOT.x = clampNumber(body.depot.x, 2, 98);
      if (Number.isFinite(Number(body.depot.y))) DEPOT.y = clampNumber(body.depot.y, 2, 98);
      db.depot = sanitizeDepot(DEPOT);
    }

    db.orders = incomingOrders.map((item, idx) => {
      const x = clampNumber(item.x ?? 10 + idx * 10, 2, 98);
      const y = clampNumber(item.y ?? 20 + idx * 8, 2, 98);
      const inferred = inferLatLng({ x, y });
      return {
        id: idx + 1,
        code: String(item.code || `ORD-${idx + 1}`),
        customer: String(item.customer || `Pedido ${idx + 1}`),
        x,
        y,
        lat: clampOrFallback(item.lat, inferred.lat),
        lng: clampOrFallback(item.lng, inferred.lng),
        service_minutes: toInt(item.service_minutes, 8, 1, 50),
        demand: toInt(item.demand, 10, 1, 100),
        priority: toInt(item.priority, 0, 0, 1),
        status: normalizeStatus(item.status || "pending"),
        worker_id: normalizeWorkerId(item.worker_id, db.workers),
        customer_id: normalizeCustomerId(item.customer_id, db.customers || []),
        created_at: item.created_at || new Date(Date.now() - (idx + 1) * 5 * 60000).toISOString(),
        completed_at: normalizeStatus(item.status || "pending") === "completed"
          ? (item.completed_at || new Date().toISOString())
          : null,
        completed_duration_minutes: normalizeStatus(item.status || "pending") === "completed"
          ? (toInt(item.completed_duration_minutes, 0, 0, 1440) || toInt(item.service_minutes, 8, 1, 50))
          : null
      };
    });

    db.config.manual_route = Array.isArray(body.route) ? body.route.map(String) : [];
    db.config.route_mode = db.config.manual_route.length ? "manual" : "auto";
    db.config.scenario = normalizeScenario(body.scenario || db.config.scenario);
    db.config.traffic = toInt(body.traffic ?? db.config.traffic, 48, 0, 100);
    db.config.weather = toInt(body.weather ?? db.config.weather, 22, 0, 100);

    if (Array.isArray(body.markers)) {
      db.markers = body.markers.map((item, idx) => {
        const x = clampNumber(item.x ?? 50, 2, 98);
        const y = clampNumber(item.y ?? 50, 2, 98);
        const inferred = inferLatLng({ x, y });
        const type = normalizeMarkerType(item.type);
        return {
          id: idx + 1,
          type,
          x,
          y,
          lat: clampOrFallback(item.lat, inferred.lat),
          lng: clampOrFallback(item.lng, inferred.lng),
          note: String(item.note || defaultMarkerNote(type)),
          created_at: new Date().toISOString()
        };
      });
    }

    saveDb();
    sendJson(res, 200, getBootstrapData());
    return;
  }

  if (cleanPath === "/api/optimize-route" && method === "POST") {
    const body = await readJsonBody(req);
    let data = getBootstrapData();
    let pendingOrders = data.orders.filter((item) => item.status !== "completed");
    const requestedCodes = sanitizeRouteCodes(
      Array.isArray(body.codes) ? body.codes.map(String) : [],
      pendingOrders
    );
    const hasRequestedManual = requestedCodes.length > 0;
    if (hasRequestedManual) {
      db.config.route_mode = "manual";
      db.config.manual_route = requestedCodes;
      saveDb();
      data = getBootstrapData();
      pendingOrders = data.orders.filter((item) => item.status !== "completed");
    }
    const usePython = body.use_python !== false;
    let warning = null;
    let optimizerPayload = null;

    if (usePython && PYTHON_OPTIMIZER_URL) {
      try {
        const optimizeOrders = hasRequestedManual
          ? applyManualCodesToOrders(data.orders, requestedCodes)
          : pendingOrders;
        optimizerPayload = await optimizeWithPythonService({
          depot: data.depot,
          config: data.config,
          orders: optimizeOrders,
          markers: data.markers,
          workers: data.active_workers || []
        });
      } catch (error) {
        warning = `Python optimizer no disponible: ${error.message}`;
      }
    }

    if (optimizerPayload?.route_codes?.length) {
      db.config.route_mode = "manual";
      db.config.manual_route = optimizerPayload.route_codes.map(String);
      saveDb();
      const refreshed = getBootstrapData();
      sendJson(res, 200, {
        source: "python",
        warning,
        optimizer: optimizerPayload,
        route: refreshed.route,
        metrics: refreshed.metrics,
        data: refreshed
      });
      return;
    }
    if (!hasRequestedManual) {
      db.config.route_mode = "auto";
      db.config.manual_route = [];
      saveDb();
      const refreshed = getBootstrapData();
      sendJson(res, 200, {
        source: warning ? "local_fallback" : "local_js",
        warning,
        route: refreshed.route,
        metrics: refreshed.metrics,
        data: refreshed
      });
      return;
    }
    const refreshed = getBootstrapData();
    sendJson(res, 200, {
      source: warning ? "local_manual_fallback" : "local_manual",
      warning,
      route: refreshed.route,
      metrics: refreshed.metrics,
      data: refreshed
    });
    return;
  }

  if (
    (cleanPath === "/api/google-route" || cleanPath === "/api/google_route" || cleanPath === "/api/googleroute")
    && method === "POST"
  ) {
    const body = await readJsonBody(req);
    const data = getBootstrapData();
    const useRoute = Array.isArray(body.codes) && body.codes.length
      ? applyManualCodesToOrders(data.orders, body.codes)
      : data.route;
    const googleRoute = await fetchGoogleRoute(data.depot, useRoute);
    db.google_route = googleRoute;
    db.saved_routes.push({
      id: getNextId(db.saved_routes),
      provider: "google",
      created_at: new Date().toISOString(),
      summary: `${googleRoute.distance_km.toFixed(1)} km / ${googleRoute.duration_min} min`,
      route: googleRoute
    });
    if (db.saved_routes.length > 50) db.saved_routes = db.saved_routes.slice(-50);
    saveDb();
    sendJson(res, 200, { google_route: googleRoute, data: getBootstrapData() });
    return;
  }

  if (
    (cleanPath === "/api/db-route" || cleanPath === "/api/db_route" || cleanPath === "/api/local-route")
    && method === "POST"
  ) {
    const body = await readJsonBody(req);
    const data = getBootstrapData();
    const useRoute = Array.isArray(body.codes) && body.codes.length
      ? applyManualCodesToOrders(data.orders, body.codes)
      : data.route;
    const localRoute = fetchDbRoute(data.depot, useRoute, db.map_graph);
    db.google_route = localRoute;
    db.saved_routes.push({
      id: getNextId(db.saved_routes),
      provider: "local_db_map",
      created_at: new Date().toISOString(),
      summary: `${localRoute.distance_km.toFixed(1)} km / ${localRoute.duration_min} min`,
      route: localRoute
    });
    if (db.saved_routes.length > 50) db.saved_routes = db.saved_routes.slice(-50);
    saveDb();
    sendJson(res, 200, { google_route: localRoute, data: getBootstrapData() });
    return;
  }

  if ((cleanPath === "/api/saved-routes" || cleanPath === "/api/saved_routes") && method === "GET") {
    sendJson(res, 200, { saved_routes: [...db.saved_routes].sort((a, b) => b.id - a.id) });
    return;
  }

  if ((cleanPath === "/api/saved-routes" || cleanPath === "/api/saved_routes") && method === "POST") {
    const body = await readJsonBody(req);
    const payload = body.route && typeof body.route === "object"
      ? body.route
      : db.google_route || buildFallbackSavedRoute(getBootstrapData());
    const entry = {
      id: getNextId(db.saved_routes),
      provider: String(body.provider || payload.provider || "local"),
      created_at: new Date().toISOString(),
      summary: String(body.summary || `${payload.distance_km || 0} km / ${payload.duration_min || 0} min`),
      route: payload
    };
    db.saved_routes.push(entry);
    if (db.saved_routes.length > 50) db.saved_routes = db.saved_routes.slice(-50);
    saveDb();
    sendJson(res, 201, { saved_route: entry, saved_routes: [...db.saved_routes].sort((a, b) => b.id - a.id) });
    return;
  }

  if ((cleanPath === "/api/route-assignments" || cleanPath === "/api/route_assignments") && method === "GET") {
    sendJson(res, 200, { route_assignments: getRouteAssignments() });
    return;
  }

  if ((cleanPath === "/api/route-assignments" || cleanPath === "/api/route_assignments") && method === "POST") {
    const body = await readJsonBody(req);
    const workerId = Number(body.worker_id);
    const savedRouteId = Number(body.saved_route_id);
    const worker = db.workers.find((item) => item.id === workerId);
    const saved = db.saved_routes.find((item) => item.id === savedRouteId);
    if (!worker || !saved) {
      sendJson(res, 400, { error: "invalid_input", message: "worker_id o saved_route_id invalido" });
      return;
    }
    db.route_assignments = db.route_assignments.filter((item) => item.worker_id !== workerId);
    db.route_assignments.push({
      id: getNextId(db.route_assignments),
      worker_id: workerId,
      worker_name: worker.name,
      saved_route_id: savedRouteId,
      route_summary: saved.summary,
      provider: saved.provider,
      assigned_at: new Date().toISOString(),
      note: String(body.note || "").trim()
    });
    saveDb();
    sendJson(res, 201, { route_assignments: getRouteAssignments(), data: getBootstrapData() });
    return;
  }

  if ((cleanPath === "/api/route-assignments" || cleanPath === "/api/route_assignments") && method === "DELETE") {
    const body = await readJsonBody(req);
    const workerId = Number(body.worker_id);
    db.route_assignments = db.route_assignments.filter((item) => item.worker_id !== workerId);
    saveDb();
    sendJson(res, 200, { route_assignments: getRouteAssignments(), data: getBootstrapData() });
    return;
  }

  if (cleanPath === "/api/map-graph" && method === "GET") {
    sendJson(res, 200, { map_graph: db.map_graph });
    return;
  }

  if (cleanPath === "/api/map-graph" && method === "PUT") {
    const body = await readJsonBody(req);
    if (!body.map_graph || !Array.isArray(body.map_graph.nodes) || !Array.isArray(body.map_graph.edges)) {
      sendJson(res, 400, { error: "invalid_input", message: "map_graph invalido" });
      return;
    }
    db.map_graph = sanitizeGraph(body.map_graph);
    saveDb();
    sendJson(res, 200, { map_graph: db.map_graph });
    return;
  }

  if (cleanPath === "/api/map-graph/nodes" && method === "POST") {
    const body = await readJsonBody(req);
    const id = String(body.id || `n_${Date.now()}`);
    const lat = Number(body.lat);
    const lng = Number(body.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      sendJson(res, 400, { error: "invalid_input", message: "lat/lng invalidos" });
      return;
    }
    if (!db.map_graph.nodes.some((node) => node.id === id)) {
      db.map_graph.nodes.push({ id, lat, lng });
      saveDb();
    }
    sendJson(res, 201, { map_graph: db.map_graph, node_id: id });
    return;
  }

  if (cleanPath.startsWith("/api/map-graph/nodes/") && method === "DELETE") {
    const id = String(cleanPath.split("/").pop());
    db.map_graph.nodes = db.map_graph.nodes.filter((node) => node.id !== id);
    db.map_graph.edges = db.map_graph.edges.filter((edge) => edge.from !== id && edge.to !== id);
    saveDb();
    sendJson(res, 200, { map_graph: db.map_graph });
    return;
  }

  if (cleanPath === "/api/map-graph/edges" && method === "POST") {
    const body = await readJsonBody(req);
    const from = String(body.from || "");
    const to = String(body.to || "");
    if (!from || !to || from === to) {
      sendJson(res, 400, { error: "invalid_input", message: "edge invalida" });
      return;
    }
    const existsFrom = db.map_graph.nodes.some((node) => node.id === from);
    const existsTo = db.map_graph.nodes.some((node) => node.id === to);
    if (!existsFrom || !existsTo) {
      sendJson(res, 400, { error: "invalid_input", message: "nodos inexistentes" });
      return;
    }
    const exists = db.map_graph.edges.some((edge) =>
      (edge.from === from && edge.to === to) || (edge.from === to && edge.to === from)
    );
    if (!exists) {
      db.map_graph.edges.push({ from, to });
      saveDb();
    }
    sendJson(res, 201, { map_graph: db.map_graph });
    return;
  }

  if (cleanPath === "/api/map-graph/edges" && method === "DELETE") {
    const body = await readJsonBody(req);
    const from = String(body.from || "");
    const to = String(body.to || "");
    db.map_graph.edges = db.map_graph.edges.filter((edge) =>
      !((edge.from === from && edge.to === to) || (edge.from === to && edge.to === from))
    );
    saveDb();
    sendJson(res, 200, { map_graph: db.map_graph });
    return;
  }

  if ((cleanPath === "/api/controller/suggestion" || cleanPath === "/api/controller-suggestion") && method === "POST") {
    const body = await readJsonBody(req);
    const message = String(body.message || "").trim();
    if (!message) {
      sendJson(res, 400, { error: "invalid_input", message: "Debes enviar un mensaje" });
      return;
    }
    const priority = body.priority === "alta" ? "alta" : body.priority === "media" ? "media" : "baja";
    const targetWorkerId = normalizeWorkerId(body.worker_id, db.workers);
    const activeWorkers = getWorkers().filter((worker) => worker.active === 1);
    const targets = targetWorkerId
      ? db.workers.filter((worker) => worker.id === targetWorkerId)
      : activeWorkers;

    if (!targets.length) {
      sendJson(res, 404, { error: "not_found", message: "No hay conductores disponibles para enviar sugerencia." });
      return;
    }

    const created = targets.map((target) => createNotification({
      user_id: target.id,
      user_name: target.name,
      channel: "push",
      message: `[Sugerencia ${priority.toUpperCase()}] ${message}`
    }));
    db.controller_log.push({
      id: getNextId(db.controller_log),
      message,
      priority,
      target_worker_id: targetWorkerId || null,
      target_worker_name: targetWorkerId
        ? (db.workers.find((worker) => worker.id === targetWorkerId)?.name || "Conductor")
        : "Equipo completo",
      sent: created.length,
      created_at: new Date().toISOString()
    });
    if (db.controller_log.length > 100) db.controller_log = db.controller_log.slice(-100);
    saveDb();
    sendJson(res, 201, {
      created: created.length,
      log: db.controller_log.slice(-15).reverse(),
      notifications: created
    });
    return;
  }

  if ((cleanPath === "/api/sandbox-assistant" || cleanPath === "/api/sandbox_assistant") && method === "POST") {
    const body = await readJsonBody(req);
    const text = String(body.text || "").trim();
    if (!text) {
      sendJson(res, 400, { error: "invalid_input", message: "Debes enviar texto para generar puntos." });
      return;
    }
    const generated = buildSandboxOrdersFromText(text);
    sendJson(res, 200, generated);
    return;
  }

  if ((cleanPath === "/api/route-assistant" || cleanPath === "/api/route_assistant") && method === "POST") {
    const body = await readJsonBody(req);
    const message = String(body.message || "").trim();
    const bootstrap = getBootstrapData();
    const pendingOrders = bootstrap.orders.filter((item) => item.status !== "completed");
    if (!pendingOrders.length) {
      sendJson(res, 200, {
        source: "assistant_local",
        applied: false,
        route_codes: [],
        reply: "No hay pedidos pendientes. Carga una prueba o resetea demo antes de generar ruta."
      });
      return;
    }
    const explicitCodes = Array.isArray(body.route_codes) ? body.route_codes.map(String) : [];
    const interpreted = explicitCodes.length
      ? { source: "ui_codes", route_codes: explicitCodes, reply: `Perfecto, aplicare esta secuencia: ${explicitCodes.join(" -> ")}` }
      : await interpretRouteAssistantMessage(message, pendingOrders);
    const validCodes = sanitizeRouteCodes(interpreted.route_codes || [], pendingOrders);
    const apply = body.apply === true;

    if (apply && validCodes.length) {
      db.config.route_mode = "manual";
      db.config.manual_route = validCodes;
      saveDb();
      const refreshed = getBootstrapData();
      sendJson(res, 200, {
        source: interpreted.source,
        applied: true,
        route_codes: validCodes,
        reply: interpreted.reply || "Ruta aplicada.",
        data: refreshed
      });
      return;
    }

    sendJson(res, 200, {
      source: interpreted.source,
      applied: false,
      route_codes: validCodes,
      reply: interpreted.reply || (validCodes.length
        ? `Entendi esta ruta: ${validCodes.join(" -> ")}`
        : "No pude reconocer paradas. Escribe codigos o nombres de clientes.")
    });
    return;
  }

  if (cleanPath === "/api/ai-suggestion" && method === "POST") {
    const body = await readJsonBody(req);
    const suggestion = await generateAiSuggestion(body || getBootstrapData());
    sendJson(res, 200, suggestion);
    return;
  }

  if (cleanPath === "/api/notifications" && method === "GET") {
    sendJson(res, 200, { notifications: getNotifications() });
    return;
  }

  if (cleanPath === "/api/notifications" && method === "POST") {
    const body = await readJsonBody(req);
    const message = String(body.message || "").trim();
    if (!message) {
      sendJson(res, 400, { error: "invalid_input", message: "Notification message is required" });
      return;
    }

    const channel = normalizeChannel(body.channel);
    const recipient = body.recipient === "all" ? "all" : Number(body.recipient);
    const users = getUsers();
    const targets = recipient === "all"
      ? users.filter((user) => user.active === 1)
      : users.filter((user) => user.id === recipient);

    if (!targets.length) {
      sendJson(res, 404, { error: "not_found", message: "No recipients found" });
      return;
    }

    const created = targets.map((target) => createNotification({
      user_id: target.id,
      user_name: target.name,
      channel: channel === "auto" ? normalizeChannel(target.preferred_channel) : channel,
      message
    }));

    saveDb();
    sendJson(res, 201, { sent: created.length, notifications: created, data: getBootstrapData() });
    return;
  }

  sendJson(res, 404, { error: "not_found", message: "Route not found" });
}

function getOrders() {
  return [...db.orders]
    .map((order) => ({
      ...order,
      worker_id: normalizeWorkerId(order.worker_id, db.workers),
      customer_id: normalizeCustomerId(order.customer_id, db.customers || [])
    }))
    .sort((a, b) => a.id - b.id);
}

function getWorkers() {
  return [...db.workers].sort((a, b) => a.id - b.id);
}

function getMarkers() {
  return [...db.markers].sort((a, b) => a.id - b.id);
}

function getUsers() {
  return [...db.users].sort((a, b) => a.id - b.id);
}

function getCustomers() {
  return [...(db.customers || [])].sort((a, b) => a.id - b.id);
}

function getInvoices() {
  return [...(db.invoices || [])].sort((a, b) => b.id - a.id);
}

function getCustomerRealtime() {
  const customers = getCustomers();
  return customers.map((customer) => {
    const orders = db.orders.filter((order) => Number(order.customer_id) === Number(customer.id));
    const pending_orders = orders.filter((order) => order.status !== "completed").map((order) => order.code);
    const completed_orders = orders.filter((order) => order.status === "completed").map((order) => order.code);
    const invoices = getInvoices().filter((inv) => Number(inv.customer_id) === Number(customer.id));
    const pending_invoices = invoices.filter((inv) => inv.status !== "paid").length;
    return {
      customer_id: customer.id,
      customer_name: customer.name,
      pending_orders,
      completed_orders,
      pending_invoices
    };
  });
}

function getNotifications() {
  return [...db.notifications].sort((a, b) => b.id - a.id).slice(0, 25);
}

function getRouteAssignments() {
  return [...db.route_assignments].sort((a, b) => b.id - a.id);
}

function getBootstrapData() {
  const orders = getOrders();
  const workers = getWorkers();
  const markers = getMarkers();
  const config = { ...db.config };
  const route = buildRoute(orders.filter((order) => order.status !== "completed"), markers, config);
  const workerRoutes = computeWorkerRoutes(orders, workers, markers, config);
  const metrics = computeMetrics(route, config, markers, orders);

  return {
    depot: DEPOT,
    config,
    workers,
    activeWorker: workers.find((worker) => worker.active === 1) || null,
    active_workers: workers.filter((worker) => worker.active === 1),
    users: getUsers(),
    customers: getCustomers(),
    invoices: getInvoices(),
    customer_realtime: getCustomerRealtime(),
    notifications: getNotifications(),
    orders,
    markers,
    route,
    worker_routes: workerRoutes,
    metrics,
    google_route: db.google_route,
    saved_routes: [...db.saved_routes].sort((a, b) => b.id - a.id),
    route_assignments: getRouteAssignments(),
    map_graph_info: {
      nodes: db.map_graph?.nodes?.length || 0,
      edges: db.map_graph?.edges?.length || 0
    },
    controller_log: [...db.controller_log].slice(-15).reverse(),
    db_info: buildDbInfo()
  };
}

function buildDbInfo() {
  return {
    orders: db.orders.length,
    workers: db.workers.length,
    users: db.users.length,
    customers: (db.customers || []).length,
    invoices: (db.invoices || []).length,
    markers: db.markers.length,
    saved_routes: db.saved_routes.length,
    graph_nodes: db.map_graph?.nodes?.length || 0,
    graph_edges: db.map_graph?.edges?.length || 0
  };
}

function buildRoute(pendingOrders, markers, config) {
  if (config.route_mode === "manual" && Array.isArray(config.manual_route) && config.manual_route.length) {
    const byCode = new Map(pendingOrders.map((order) => [String(order.code), order]));
    const route = [];
    for (const code of config.manual_route) {
      const found = byCode.get(String(code));
      if (found) route.push(found);
    }
    const used = new Set(route.map((order) => order.id));
    const remaining = pendingOrders.filter((order) => !used.has(order.id));
    return [...route, ...remaining];
  }

  const pool = [...pendingOrders];
  const route = [];
  let current = DEPOT;

  while (pool.length) {
    pool.sort((a, b) => {
      const aScore = distance(current, a) + markerPenalty(markers, a) * 20 - a.priority * 3;
      const bScore = distance(current, b) + markerPenalty(markers, b) * 20 - b.priority * 3;
      return aScore - bScore;
    });
    const next = pool.shift();
    route.push(next);
    current = next;
  }

  return route;
}

function computeWorkerRoutes(orders, workers, markers, config) {
  const pending = orders.filter((order) => order.status !== "completed");
  const activeWorkers = workers.filter((worker) => worker.active === 1);
  if (!activeWorkers.length) return [];

  const workerIds = activeWorkers.map((worker) => worker.id);
  let roundRobin = 0;
  const normalizedPending = pending.map((order) => {
    const assigned = normalizeWorkerId(order.worker_id, workers);
    if (assigned && workerIds.includes(assigned)) {
      return { ...order, worker_id: assigned };
    }
    const fallback = workerIds[roundRobin % workerIds.length];
    roundRobin += 1;
    return { ...order, worker_id: fallback };
  });

  const grouped = new Map(workerIds.map((id) => [id, []]));
  for (const order of normalizedPending) {
    grouped.get(order.worker_id).push(order);
  }

  return activeWorkers.map((worker) => {
    const subset = grouped.get(worker.id) || [];
    const ordered = buildRoute(subset, markers, config);
    return {
      worker_id: worker.id,
      worker_name: worker.name,
      order_codes: ordered.map((item) => item.code),
      points: [DEPOT, ...ordered].map((item) => {
        const [lat, lng] = pointString(item).split(",").map(Number);
        return [lat, lng];
      })
    };
  });
}

function computeMetrics(route, config, markers, allOrders) {
  const speed = computeSpeed(config.scenario, config.traffic, config.weather);
  let totalMinutes = 0;
  let prev = DEPOT;

  const etaByStop = route.map((stop) => {
    const km = distanceKm(prev, stop);
    const penalty = markerPenalty(markers, stop);
    const travel = (km / speed) * 60 * (1 + penalty);
    totalMinutes += travel + stop.service_minutes;
    prev = stop;
    return {
      order_id: stop.id,
      code: stop.code,
      eta_minutes: Math.round(totalMinutes),
      travel_minutes: Math.round(travel)
    };
  });

  const completed = allOrders.filter((order) => order.status === "completed").length;
  const completedPct = allOrders.length ? Math.round((completed / allOrders.length) * 100) : 0;
  const safetyPenalty = markers.filter((marker) => marker.type === "unsafe").length * 3;
  const onTime = Math.max(70, 95 - Math.round(config.traffic / 5) - safetyPenalty);

  return {
    eta_total_minutes: Math.round(totalMinutes),
    eta_by_stop: etaByStop,
    speed_kmh: Math.round(speed),
    completed_pct: completedPct,
    ontime_pct: onTime,
    savings_minutes: Math.max(4, Math.round(56 - totalMinutes + markers.filter((m) => m.type === "priority").length * 2))
  };
}

function computeSpeed(scenario, traffic, weather) {
  const scenarioFactor = scenario === "express" ? 0.88 : scenario === "mixed" ? 1 : 1.1;
  const trafficFactor = 1 + traffic / 130;
  const weatherFactor = 1 + weather / 240;
  const raw = 41 / (scenarioFactor * trafficFactor * weatherFactor);
  return Math.max(18, Math.min(raw, 52));
}

function markerPenalty(markers, point) {
  return markers
    .filter((marker) => marker.type === "hotspot" || marker.type === "unsafe")
    .reduce((sum, marker) => {
      const d = distanceKm(point, marker);
      if (d < 2.2) return sum + (marker.type === "unsafe" ? 0.3 : 0.18);
      return sum;
    }, 0);
}

async function generateAiSuggestion(payload) {
  const snapshot = payload.metrics && payload.route ? payload : getBootstrapData();
  const prompt = [
    "Eres un planificador logistico experto.",
    "Entrega 3 sugerencias concretas y accionables para reducir ETA y riesgo operacional.",
    "Responde en espanol en formato breve con bullets.",
    `Escenario: ${snapshot.config?.scenario || "urban"}, trafico ${snapshot.config?.traffic || 50}, clima ${snapshot.config?.weather || 20}.`,
    `ETA total: ${snapshot.metrics?.eta_total_minutes || 0} minutos.`,
    `Paradas pendientes: ${snapshot.route?.length || 0}.`,
    `Marcadores: ${(snapshot.markers || []).map((m) => `${m.type}:${m.note}`).join(" | ")}`
  ].join("\n");

  if (!OPENAI_API_KEY) {
    return {
      source: "local_fallback",
      text: "- Reordena dos paradas cercanas al corredor con menor trafico.\n- Programa una pausa corta antes de entrar a zona con mayor congestion.\n- Prioriza pedidos con SLA alto y alto tiempo de servicio al inicio."
    };
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      input: prompt,
      max_output_tokens: 260
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    return {
      source: "openai_error",
      text: `No se pudo consultar IA (${response.status}). ${errorText.slice(0, 220)}`
    };
  }

  const json = await response.json();
  const text = (json.output_text || "").trim();
  return { source: "openai", text: text || "- IA no devolvio texto util en esta llamada." };
}

function serveStatic(res, pathname) {
  const safePath = pathname === "/" ? "/index.html" : pathname;
  const filePath = path.normalize(path.join(projectRoot, safePath));
  if (!filePath.startsWith(projectRoot)) {
    sendText(res, 403, "Forbidden");
    return;
  }

  const ext = path.extname(filePath);
  const allow = new Set([".html", ".css", ".js", ".json", ".png", ".jpg", ".svg"]);
  if (!allow.has(ext)) {
    sendText(res, 404, "Not found");
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      sendText(res, 404, "Not found");
      return;
    }
    res.writeHead(200, { "Content-Type": getContentType(ext) });
    res.end(content);
  });
}

function getContentType(ext) {
  if (ext === ".html") return "text/html; charset=utf-8";
  if (ext === ".css") return "text/css; charset=utf-8";
  if (ext === ".js") return "application/javascript; charset=utf-8";
  if (ext === ".json") return "application/json; charset=utf-8";
  if (ext === ".svg") return "image/svg+xml";
  if (ext === ".png") return "image/png";
  if (ext === ".jpg") return "image/jpeg";
  return "text/plain; charset=utf-8";
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS"
  });
  res.end(JSON.stringify(payload));
}

function sendText(res, statusCode, text) {
  res.writeHead(statusCode, { "Content-Type": "text/plain; charset=utf-8" });
  res.end(text);
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk.toString("utf8");
      if (raw.length > 1_000_000) reject(new Error("payload_too_large"));
    });
    req.on("end", () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error("invalid_json"));
      }
    });
    req.on("error", reject);
  });
}

function getNextId(rows) {
  return rows.length ? Math.max(...rows.map((item) => item.id)) + 1 : 1;
}

function distance(a, b) {
  return Math.hypot((b.x || 0) - (a.x || 0), (b.y || 0) - (a.y || 0));
}

function distanceKm(a, b) {
  const aHasGeo = Number.isFinite(Number(a.lat)) && Number.isFinite(Number(a.lng));
  const bHasGeo = Number.isFinite(Number(b.lat)) && Number.isFinite(Number(b.lng));
  if (aHasGeo && bHasGeo) {
    return haversineKm(a.lat, a.lng, b.lat, b.lng);
  }
  return distance(a, b) * 0.42;
}

function haversineKm(lat1, lng1, lat2, lng2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const r = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return r * c;
}

function toInt(value, fallback, min, max) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

function clampNumber(value, min, max) {
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return min;
  return Math.min(max, Math.max(min, parsed));
}

function clampOrFallback(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function minutesBetweenIso(startIso, endIso) {
  const start = Date.parse(String(startIso || ""));
  const end = Date.parse(String(endIso || ""));
  if (!Number.isFinite(start) || !Number.isFinite(end)) return null;
  const delta = Math.max(0, end - start);
  return Math.max(1, Math.round(delta / 60000));
}

function sanitizeWorkerRecord(worker, idx) {
  return {
    id: Number(worker?.id) || (idx + 1),
    name: String(worker?.name || `Conductor ${idx + 1}`).trim(),
    role: String(worker?.role || "Conductor").trim(),
    shift_limit_minutes: toInt(worker?.shift_limit_minutes, 480, 120, 900),
    active: worker?.active ? 1 : 0
  };
}

function sanitizeOrderRecord(order, idx, workers, customers = []) {
  const x = clampNumber(order?.x ?? 10 + idx * 10, 2, 98);
  const y = clampNumber(order?.y ?? 20 + idx * 8, 2, 98);
  const inferred = inferLatLng({ x, y });
  const createdAt = String(order?.created_at || new Date(Date.now() - (idx + 1) * 4 * 60000).toISOString());
  const status = normalizeStatus(order?.status || "pending");
  const completedAt = status === "completed" ? String(order?.completed_at || new Date().toISOString()) : null;
  const completedDuration = status === "completed"
    ? (toInt(order?.completed_duration_minutes, 0, 0, 1440) || minutesBetweenIso(createdAt, completedAt) || toInt(order?.service_minutes, 8, 1, 50))
    : null;

  return {
    id: Number(order?.id) || (idx + 1),
    code: String(order?.code || `ORD-${idx + 1}`),
    customer: String(order?.customer || `Pedido ${idx + 1}`),
    x,
    y,
    lat: clampOrFallback(order?.lat, inferred.lat),
    lng: clampOrFallback(order?.lng, inferred.lng),
    service_minutes: toInt(order?.service_minutes, 8, 1, 50),
    demand: toInt(order?.demand, 10, 1, 100),
    priority: toInt(order?.priority, 0, 0, 1),
    status,
    worker_id: normalizeWorkerId(order?.worker_id, workers),
    customer_id: normalizeCustomerId(order?.customer_id, customers),
    created_at: createdAt,
    completed_at: completedAt,
    completed_duration_minutes: completedDuration
  };
}

function sanitizeDepot(source) {
  const safe = source && typeof source === "object" ? source : DEPOT;
  return {
    id: "depot",
    code: "DEPOT",
    customer: String(safe.customer || "Centro Logistico"),
    x: clampNumber(safe.x ?? DEPOT.x, 2, 98),
    y: clampNumber(safe.y ?? DEPOT.y, 2, 98),
    lat: clampOrFallback(safe.lat, DEPOT.lat),
    lng: clampOrFallback(safe.lng, DEPOT.lng)
  };
}

function syncDepotFromDb(sourceDb = db) {
  const depot = sanitizeDepot(sourceDb?.depot || DEPOT);
  DEPOT.customer = depot.customer;
  DEPOT.x = depot.x;
  DEPOT.y = depot.y;
  DEPOT.lat = depot.lat;
  DEPOT.lng = depot.lng;
  if (sourceDb) sourceDb.depot = { ...depot };
}

function sanitizeCustomerRecord(customer, idx) {
  return {
    id: Number(customer?.id) || (idx + 1),
    name: String(customer?.name || `Cliente ${idx + 1}`).trim(),
    email: String(customer?.email || "").trim(),
    phone: String(customer?.phone || "").trim(),
    address: String(customer?.address || "").trim(),
    active: customer?.active === 0 || customer?.active === false ? 0 : 1
  };
}

function sanitizeInvoiceRecord(invoice, idx, customers = [], workers = [], savedRoutes = []) {
  return {
    id: Number(invoice?.id) || (idx + 1),
    customer_id: normalizeCustomerId(invoice?.customer_id, customers),
    worker_id: normalizeWorkerId(invoice?.worker_id, workers),
    saved_route_id: normalizeSavedRouteId(invoice?.saved_route_id, savedRoutes),
    invoice_number: String(invoice?.invoice_number || `FAC-${1000 + idx}`).trim(),
    total_amount: Number.isFinite(Number(invoice?.total_amount)) ? Number(invoice.total_amount) : 0,
    status: normalizeInvoiceStatus(invoice?.status),
    due_date: String(invoice?.due_date || ""),
    created_at: String(invoice?.created_at || new Date().toISOString()),
    order_codes: Array.isArray(invoice?.order_codes) ? invoice.order_codes.map(String) : []
  };
}

function normalizeStatus(status) {
  const candidate = String(status || "").toLowerCase();
  if (candidate === "completed") return "completed";
  if (candidate === "in_progress") return "in_progress";
  return "pending";
}

function normalizeMarkerType(type) {
  if (type === "priority" || type === "unsafe") return type;
  return "hotspot";
}

function defaultMarkerNote(type) {
  if (type === "priority") return "Prioridad agregada por operacion";
  if (type === "unsafe") return "Riesgo reportado por conductor";
  return "Congestion marcada por despacho";
}

function normalizeScenario(scenario) {
  if (scenario === "mixed" || scenario === "express") return scenario;
  return "urban";
}

async function interpretRouteAssistantMessage(message, pendingOrders) {
  if (!message) {
    return { source: "assistant_local", route_codes: [], reply: "Necesito una descripcion para proponer ruta." };
  }
  const localCodes = inferRouteCodesFromText(message, pendingOrders);
  if (!OPENAI_API_KEY) {
    return {
      source: "assistant_local",
      route_codes: localCodes,
      reply: localCodes.length
        ? `Entendi esta secuencia: ${localCodes.join(" -> ")}. Si te parece, la aplico.`
        : "No detecte paradas claras. Incluye codigos (ej: A-301) o nombres de clientes."
    };
  }

  try {
    const catalog = pendingOrders.map((order) => `${order.code}: ${order.customer}`).join(" | ");
    const prompt = [
      "Eres asistente logistico.",
      "Debes interpretar la instruccion del usuario y devolver JSON estricto.",
      "JSON esperado: {\"route_codes\":[\"COD-1\",\"COD-2\"],\"reply\":\"texto breve en espanol\"}",
      "Usa solo codigos existentes del catalogo.",
      `Catalogo: ${catalog}`,
      `Usuario: ${message}`
    ].join("\n");
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        input: prompt,
        max_output_tokens: 260
      })
    });
    const raw = await response.text();
    if (!response.ok) {
      throw new Error(`OpenAI ${response.status}`);
    }
    const parsed = JSON.parse(raw);
    const text = String(parsed.output_text || "").trim();
    const jsonCandidate = text.startsWith("{") ? text : text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1);
    const payload = JSON.parse(jsonCandidate);
    const route_codes = sanitizeRouteCodes(Array.isArray(payload.route_codes) ? payload.route_codes : [], pendingOrders);
    return {
      source: "assistant_openai",
      route_codes,
      reply: String(payload.reply || "Tengo una ruta lista para aplicar.")
    };
  } catch {
    return {
      source: "assistant_local_fallback",
      route_codes: localCodes,
      reply: localCodes.length
        ? `Use analisis local y propuse: ${localCodes.join(" -> ")}.`
        : "No pude interpretar la ruta. Prueba con codigos o nombres mas directos."
    };
  }
}

function inferRouteCodesFromText(message, pendingOrders) {
  const msg = String(message || "").toLowerCase();
  const byCode = new Map(pendingOrders.map((order) => [String(order.code).toLowerCase(), order.code]));
  const direct = [];
  const matches = msg.match(/[a-z]{1,3}-\d{2,4}/g) || [];
  for (const token of matches) {
    const found = byCode.get(token);
    if (found && !direct.includes(found)) direct.push(found);
  }

  const scored = pendingOrders
    .map((order) => {
      const terms = `${order.code} ${order.customer}`.toLowerCase().split(/[^a-z0-9-]+/).filter((t) => t.length >= 3);
      let index = Number.POSITIVE_INFINITY;
      for (const term of terms) {
        const pos = msg.indexOf(term);
        if (pos >= 0 && pos < index) index = pos;
      }
      return { code: order.code, index };
    })
    .filter((entry) => Number.isFinite(entry.index))
    .sort((a, b) => a.index - b.index)
    .map((entry) => entry.code);

  const merged = [...direct];
  for (const code of scored) {
    if (!merged.includes(code)) merged.push(code);
  }
  if (msg.includes("solo") || msg.includes("solamente")) {
    return merged;
  }
  const rest = pendingOrders.map((order) => order.code).filter((code) => !merged.includes(code));
  return [...merged, ...rest];
}

function sanitizeRouteCodes(codes, pendingOrders) {
  const allowed = new Set(pendingOrders.map((order) => String(order.code)));
  const unique = [];
  for (const code of codes.map(String)) {
    if (allowed.has(code) && !unique.includes(code)) unique.push(code);
  }
  return unique;
}

function buildSandboxOrdersFromText(text) {
  const lower = String(text || "").toLowerCase();
  const anchors = [
    { key: "coronel", label: "Coronel", lat: -37.0169, lng: -73.1438 },
    { key: "lota", label: "Lota", lat: -37.0936, lng: -73.1618 },
    { key: "curanilahue", label: "Curanilahue", lat: -37.4731, lng: -73.3462 },
    { key: "lebu", label: "Lebu", lat: -37.6079, lng: -73.6515 },
    { key: "concepcion", label: "Concepcion", lat: -36.827, lng: -73.0498 }
  ];
  const hits = [];
  for (const anchor of anchors) {
    let start = 0;
    while (start < lower.length) {
      const idx = lower.indexOf(anchor.key, start);
      if (idx < 0) break;
      hits.push({ idx, anchor });
      start = idx + anchor.key.length;
    }
  }
  hits.sort((a, b) => a.idx - b.idx);
  const orderedAnchors = hits.length ? hits.map((item) => item.anchor) : [anchors[0], anchors[1], anchors[2]];
  const countMatch = lower.match(/(\d+)\s*(pedidos|paradas|puntos)/);
  const desiredCount = Math.min(30, Math.max(3, Number(countMatch?.[1] || orderedAnchors.length)));
  const orders = [];
  for (let i = 0; i < desiredCount; i += 1) {
    const base = orderedAnchors[i % orderedAnchors.length];
    const offsetLat = ((i % 5) - 2) * 0.0075;
    const offsetLng = ((i % 4) - 1.5) * 0.008;
    const prefix = base.label.slice(0, 2).toUpperCase();
    const code = `${prefix}-${String(i + 1).padStart(3, "0")}`;
    orders.push({
      code,
      customer: `${base.label} punto ${i + 1}`,
      lat: Number((base.lat + offsetLat).toFixed(6)),
      lng: Number((base.lng + offsetLng).toFixed(6)),
      service_minutes: 8 + (i % 4),
      demand: 8 + (i % 6),
      priority: i % 5 === 0 ? 1 : 0
    });
  }
  return {
    source: "sandbox_local_builder",
    orders,
    route_codes: orders.map((order) => order.code),
    message: `Genere ${orders.length} puntos desde tu descripcion. Puedes conectar/quitar puntos antes de ejecutar prueba.`
  };
}

function inferLatLng(point) {
  const x = clampNumber(point.x, 2, 98);
  const y = clampNumber(point.y, 2, 98);
  const lat = -33.56 + (100 - y) * 0.0022;
  const lng = -70.77 + x * 0.0022;
  return { lat, lng };
}

function applyManualCodesToOrders(orders, codes) {
  const map = new Map(orders.map((order) => [String(order.code), order]));
  const route = [];
  for (const code of codes.map(String)) {
    const found = map.get(code);
    if (found) route.push(found);
  }
  const used = new Set(route.map((item) => item.id));
  const rest = orders.filter((order) => !used.has(order.id) && order.status !== "completed");
  return [...route, ...rest];
}

async function fetchGoogleRoute(depot, route) {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error("GOOGLE_MAPS_API_KEY no configurada");
  }
  if (!route.length) {
    throw new Error("No hay paradas para calcular ruta");
  }

  const origin = pointString(depot);
  const destination = pointString(route[route.length - 1]);
  const middle = route.slice(0, -1).map(pointString);
  const url = new URL("https://maps.googleapis.com/maps/api/directions/json");
  url.searchParams.set("origin", origin);
  url.searchParams.set("destination", destination);
  url.searchParams.set("mode", "driving");
  url.searchParams.set("departure_time", "now");
  if (middle.length) {
    url.searchParams.set("waypoints", middle.join("|"));
  }
  url.searchParams.set("key", GOOGLE_MAPS_API_KEY);

  const response = await fetch(url.toString());
  const data = await response.json();
  if (!response.ok || data.status !== "OK") {
    throw new Error(`Google Directions fallo: ${data.status || response.status}`);
  }

  const topRoute = data.routes[0];
  const points = decodePolyline(topRoute.overview_polyline?.points || "");
  let meters = 0;
  let seconds = 0;
  for (const leg of topRoute.legs || []) {
    meters += leg.distance?.value || 0;
    seconds += leg.duration?.value || 0;
  }

  return {
    provider: "google",
    encoded_polyline: topRoute.overview_polyline?.points || "",
    points,
    order_codes: route.map((item) => item.code),
    distance_km: Number((meters / 1000).toFixed(2)),
    duration_min: Math.round(seconds / 60),
    created_at: new Date().toISOString()
  };
}

function pointString(point) {
  const lat = Number.isFinite(Number(point.lat)) ? Number(point.lat) : inferLatLng(point).lat;
  const lng = Number.isFinite(Number(point.lng)) ? Number(point.lng) : inferLatLng(point).lng;
  return `${lat},${lng}`;
}

function decodePolyline(encoded) {
  if (!encoded) return [];
  const points = [];
  let index = 0;
  let lat = 0;
  let lng = 0;
  while (index < encoded.length) {
    let b;
    let shift = 0;
    let result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dLat = (result & 1) ? ~(result >> 1) : (result >> 1);
    lat += dLat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dLng = (result & 1) ? ~(result >> 1) : (result >> 1);
    lng += dLng;

    points.push([lat / 1e5, lng / 1e5]);
  }
  return points;
}

async function optimizeWithPythonService(payload) {
  const headers = { "Content-Type": "application/json" };
  if (PYTHON_OPTIMIZER_TOKEN) {
    headers["X-Optimizer-Token"] = PYTHON_OPTIMIZER_TOKEN;
  }

  const response = await fetch(`${PYTHON_OPTIMIZER_URL}/optimize`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(PYTHON_OPTIMIZER_TIMEOUT_MS)
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${text.slice(0, 180)}`);
  }

  let data = null;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("respuesta no JSON");
  }

  if (!Array.isArray(data.route_codes)) {
    throw new Error("respuesta invalida de optimizer");
  }
  return data;
}

function buildFallbackSavedRoute(data) {
  const points = [data.depot, ...data.route].map((item) => {
    const [lat, lng] = pointString(item).split(",").map(Number);
    return [lat, lng];
  });
  return {
    provider: "local",
    points,
    order_codes: data.route.map((item) => item.code),
    distance_km: Number((data.metrics?.eta_by_stop || []).reduce((sum, step) => sum + (step.travel_minutes || 0) * 0.6, 0).toFixed(2)),
    duration_min: data.metrics?.eta_total_minutes || 0,
    created_at: new Date().toISOString()
  };
}

function normalizeWorkerId(workerId, workers) {
  if (workerId === null || workerId === undefined || workerId === "") return null;
  const id = Number(workerId);
  if (!Number.isFinite(id)) return null;
  return workers.some((worker) => worker.id === id) ? id : null;
}

function normalizeCustomerId(customerId, customers) {
  if (customerId === null || customerId === undefined || customerId === "") return null;
  const id = Number(customerId);
  if (!Number.isFinite(id)) return null;
  return (customers || []).some((customer) => customer.id === id) ? id : null;
}

function normalizeSavedRouteId(savedRouteId, savedRoutes) {
  if (savedRouteId === null || savedRouteId === undefined || savedRouteId === "") return null;
  const id = Number(savedRouteId);
  if (!Number.isFinite(id)) return null;
  return (savedRoutes || []).some((route) => Number(route.id) === id) ? id : null;
}

function normalizeInvoiceStatus(status) {
  const value = String(status || "").toLowerCase();
  if (value === "paid") return "paid";
  if (value === "overdue") return "overdue";
  return "pending";
}

function buildDefaultMapGraph() {
  const nodes = [
    { id: "coronel_norte", lat: -36.9715, lng: -73.1542 },
    { id: "coronel_centro", lat: -37.0169, lng: -73.1438 },
    { id: "coronel_sur", lat: -37.0451, lng: -73.1571 },
    { id: "lota_norte", lat: -37.0817, lng: -73.1543 },
    { id: "lota_centro", lat: -37.0936, lng: -73.1618 },
    { id: "lota_sur", lat: -37.1328, lng: -73.1687 },
    { id: "a160_1", lat: -37.21, lng: -73.21 },
    { id: "a160_2", lat: -37.31, lng: -73.27 },
    { id: "a160_3", lat: -37.39, lng: -73.31 },
    { id: "cura_norte", lat: -37.4412, lng: -73.3288 },
    { id: "cura_centro", lat: -37.4731, lng: -73.3462 },
    { id: "cura_sur", lat: -37.5076, lng: -73.3351 },
    { id: "lebu_norte", lat: -37.5908, lng: -73.6464 },
    { id: "lebu_centro", lat: -37.6079, lng: -73.6515 },
    { id: "lebu_sur", lat: -37.6422, lng: -73.6479 }
  ];

  const edges = [
    ["coronel_norte", "coronel_centro"],
    ["coronel_centro", "coronel_sur"],
    ["coronel_sur", "lota_norte"],
    ["lota_norte", "lota_centro"],
    ["lota_centro", "lota_sur"],
    ["lota_sur", "a160_1"],
    ["a160_1", "a160_2"],
    ["a160_2", "a160_3"],
    ["a160_3", "cura_norte"],
    ["cura_norte", "cura_centro"],
    ["cura_centro", "cura_sur"],
    ["cura_sur", "lebu_norte"],
    ["lebu_norte", "lebu_centro"],
    ["lebu_centro", "lebu_sur"]
  ].map(([from, to]) => ({ from, to }));

  return { nodes, edges };
}

function sanitizeGraph(graph) {
  const nodes = Array.isArray(graph.nodes)
    ? graph.nodes
      .filter((node) => node && typeof node.id !== "undefined")
      .map((node) => ({
        id: String(node.id),
        lat: Number(node.lat),
        lng: Number(node.lng)
      }))
      .filter((node) => Number.isFinite(node.lat) && Number.isFinite(node.lng))
    : [];
  const nodeIds = new Set(nodes.map((node) => node.id));
  const edges = Array.isArray(graph.edges)
    ? graph.edges
      .map((edge) => ({ from: String(edge.from), to: String(edge.to) }))
      .filter((edge) => edge.from !== edge.to && nodeIds.has(edge.from) && nodeIds.has(edge.to))
    : [];
  return { nodes, edges };
}

function fetchDbRoute(depot, route, graph) {
  if (!route.length) {
    throw new Error("No hay paradas para calcular ruta local");
  }
  if (!graph || !Array.isArray(graph.nodes) || !Array.isArray(graph.edges)) {
    throw new Error("No existe grafo de mapa local en base de datos");
  }

  const nodesById = new Map(graph.nodes.map((n) => [n.id, n]));
  const adjacency = buildAdjacency(graph, nodesById);
  const allPoints = [];
  let totalKm = 0;
  let current = depot;

  for (const stop of route) {
    const segment = shortestPathBetweenPoints(current, stop, nodesById, adjacency);
    totalKm += segment.distanceKm;
    if (!allPoints.length) {
      allPoints.push(...segment.points);
    } else {
      allPoints.push(...segment.points.slice(1));
    }
    current = stop;
  }

  return {
    provider: "local_db_map",
    points: allPoints,
    order_codes: route.map((item) => item.code),
    distance_km: Number(totalKm.toFixed(2)),
    duration_min: Math.round((totalKm / 34) * 60),
    created_at: new Date().toISOString()
  };
}

function buildAdjacency(graph, nodesById) {
  const adjacency = new Map();
  for (const node of graph.nodes) {
    adjacency.set(node.id, []);
  }
  for (const edge of graph.edges) {
    const a = nodesById.get(edge.from);
    const b = nodesById.get(edge.to);
    if (!a || !b) continue;
    const dist = haversineKm(a.lat, a.lng, b.lat, b.lng);
    adjacency.get(edge.from).push({ to: edge.to, distance: dist });
    adjacency.get(edge.to).push({ to: edge.from, distance: dist });
  }
  return adjacency;
}

function shortestPathBetweenPoints(originPoint, destinationPoint, nodesById, adjacency) {
  const originNode = nearestGraphNode(originPoint, nodesById);
  const destinationNode = nearestGraphNode(destinationPoint, nodesById);
  const pathInfo = dijkstra(originNode.id, destinationNode.id, adjacency);
  if (!pathInfo.path.length) {
    throw new Error("No existe camino en mapa local entre nodos");
  }

  const originLatLng = pointString(originPoint).split(",").map(Number);
  const destinationLatLng = pointString(destinationPoint).split(",").map(Number);
  const nodePoints = pathInfo.path.map((id) => {
    const node = nodesById.get(id);
    return [node.lat, node.lng];
  });

  const startNode = nodesById.get(originNode.id);
  const endNode = nodesById.get(destinationNode.id);
  const startBridge = haversineKm(originLatLng[0], originLatLng[1], startNode.lat, startNode.lng);
  const endBridge = haversineKm(endNode.lat, endNode.lng, destinationLatLng[0], destinationLatLng[1]);

  return {
    points: [originLatLng, ...nodePoints, destinationLatLng],
    distanceKm: pathInfo.distance + startBridge + endBridge
  };
}

function nearestGraphNode(point, nodesById) {
  const [lat, lng] = pointString(point).split(",").map(Number);
  let best = null;
  let bestDistance = Number.POSITIVE_INFINITY;
  for (const node of nodesById.values()) {
    const d = haversineKm(lat, lng, node.lat, node.lng);
    if (d < bestDistance) {
      bestDistance = d;
      best = node;
    }
  }
  return best;
}

function dijkstra(startId, endId, adjacency) {
  const distances = new Map();
  const previous = new Map();
  const unvisited = new Set(adjacency.keys());

  for (const id of unvisited) distances.set(id, Number.POSITIVE_INFINITY);
  distances.set(startId, 0);

  while (unvisited.size) {
    let current = null;
    let min = Number.POSITIVE_INFINITY;
    for (const id of unvisited) {
      const d = distances.get(id);
      if (d < min) {
        min = d;
        current = id;
      }
    }
    if (!current || min === Number.POSITIVE_INFINITY) break;
    if (current === endId) break;

    unvisited.delete(current);
    for (const edge of adjacency.get(current) || []) {
      if (!unvisited.has(edge.to)) continue;
      const alt = distances.get(current) + edge.distance;
      if (alt < distances.get(edge.to)) {
        distances.set(edge.to, alt);
        previous.set(edge.to, current);
      }
    }
  }

  const path = [];
  let cursor = endId;
  if (!previous.has(cursor) && cursor !== startId) {
    return { path: [], distance: Number.POSITIVE_INFINITY };
  }
  while (cursor) {
    path.unshift(cursor);
    if (cursor === startId) break;
    cursor = previous.get(cursor);
  }
  return { path, distance: distances.get(endId) || 0 };
}

function normalizeChannel(channel) {
  if (channel === "email" || channel === "sms" || channel === "push") return channel;
  return "auto";
}

function createNotification(input) {
  const notification = {
    id: getNextId(db.notifications),
    user_id: input.user_id,
    user_name: input.user_name,
    channel: normalizeChannel(input.channel),
    message: String(input.message || "").trim(),
    status: "sent",
    created_at: new Date().toISOString(),
    delivered_at: new Date().toISOString()
  };
  db.notifications.push(notification);
  if (db.notifications.length > 200) {
    db.notifications = db.notifications.slice(-200);
  }
  return notification;
}

function loadDotEnv(filePath) {
  if (!fs.existsSync(filePath)) return;
  const raw = fs.readFileSync(filePath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separator = trimmed.indexOf("=");
    if (separator === -1) continue;
    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}
