// ============================================================
// EDITOR VISUAL v9.0 — Full featured page builder
// ============================================================

const money = (n) => "$" + Number(n).toLocaleString("es-CL");
const loginView = document.getElementById("login-view");
const adminView = document.getElementById("admin-view");

// Editor state
let currentContent = null;
let selectedBlockId = null;
let isDragging = false;
let draggedBlockId = null;

const presetThemes = {
  gold: { primary: "#C97A3D", secondary: "#E39655", bg: "#241713", bgDeep: "#1A0F0C", paper: "#F4ECDD", ink: "#2B1B12" },
  dark: { primary: "#D19A5A", secondary: "#A96334", bg: "#111827", bgDeep: "#0B1220", paper: "#F3F4F6", ink: "#111827" },
  earth: { primary: "#B55D3B", secondary: "#E09B63", bg: "#2C1E1A", bgDeep: "#1B120E", paper: "#F9EBDD", ink: "#2B1B12" },
  minimal: { primary: "#4F46E5", secondary: "#818CF8", bg: "#F5F7FB", bgDeep: "#E2E8F0", paper: "#FFFFFF", ink: "#111827" },
};

const blockTemplates = {
  hero: {
    type: "hero",
    content: {
      eyebrow: "Subtítulo",
      title: "Tu titular aquí",
      tagline: "Una descripción breve del producto o servicio.",
      modes: "Modo 1 · Modo 2 · Modo 3",
      badge: "🔥 Promoción especial",
      primaryCta: "Botón principal",
      secondaryCta: "Botón secundario",
      backgroundImage: null,
      gradient: true
    },
    style: { bgColor: "#241713", textColor: "#ffffff", padding: "40px 20px", textAlign: "center" }
  },
  process: {
    type: "process",
    content: {
      title: "¿Cómo funciona?",
      steps: [
        { title: "Paso 1", description: "Descripción del primer paso" },
        { title: "Paso 2", description: "Descripción del segundo paso" },
        { title: "Paso 3", description: "Descripción del tercer paso" }
      ]
    },
    style: { bgColor: "#F4ECDD", textColor: "#2B1B12", padding: "40px 20px", layout: "grid" }
  },
  faq: {
    type: "faq",
    content: {
      title: "Preguntas frecuentes",
      items: [
        { question: "¿Pregunta 1?", answer: "Respuesta corta y clara." },
        { question: "¿Pregunta 2?", answer: "Respuesta corta y clara." }
      ]
    },
    style: { bgColor: "#ffffff", textColor: "#2B1B12", padding: "40px 20px" }
  },
  testimonials: {
    type: "testimonials",
    content: {
      title: "Lo que dicen nuestros clientes",
      items: [
        { text: "Excelente producto y servicio", author: "Cliente 1" },
        { text: "Muy recomendado", author: "Cliente 2" }
      ]
    },
    style: { bgColor: "#F4ECDD", textColor: "#2B1B12", padding: "40px 20px" }
  },
  cta: {
    type: "cta",
    content: { title: "Título de llamada a acción", text: "Texto descripción", buttonText: "Botón", buttonUrl: "#" },
    style: { bgColor: "#C97A3D", textColor: "#ffffff", padding: "40px 20px", textAlign: "center" }
  }
};

// ============================================================
// LOAD & RENDER
// ============================================================

async function loadSiteContent() {
  try {
    const res = await fetch("/api/site-content");
    if (!res.ok) return null;
    currentContent = await res.json();
    return currentContent;
  } catch (error) {
    console.error("Error loading content:", error);
    return null;
  }
}

function renderBlocksList() {
  const blocksList = document.getElementById("blocks-list");
  if (!currentContent || !currentContent.blocks) {
    blocksList.innerHTML = "<p style='font-size:11px; color:var(--ink-soft);'>Sin bloques</p>";
    return;
  }

  blocksList.innerHTML = currentContent.blocks
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .map((block) => `
      <div 
        class="block-item ${block.id === selectedBlockId ? 'active' : ''}" 
        data-block-id="${block.id}" 
        draggable="true"
      >
        <div class="block-item-title">${block.content?.title || block.type}</div>
        <div class="block-item-type">${block.type}</div>
      </div>
    `)
    .join("");

  document.querySelectorAll(".block-item").forEach((item) => {
    item.addEventListener("click", () => selectBlock(item.dataset.blockId));
    item.addEventListener("dragstart", onBlockDragStart);
    item.addEventListener("dragend", onBlockDragEnd);
  });
}

function renderCanvasBlocks() {
  const canvas = document.getElementById("canvas-blocks");
  if (!currentContent || !currentContent.blocks) {
    canvas.innerHTML = "<p>Sin bloques. Agrega uno para comenzar.</p>";
    return;
  }

  canvas.innerHTML = currentContent.blocks
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .map((block, index) => `
      <div 
        class="canvas-block ${block.id === selectedBlockId ? 'editing' : ''}" 
        data-block-id="${block.id}" 
        draggable="true"
        style="background-color: ${block.style?.bgColor || '#f0f0f0'}"
      >
        <div class="block-actions">
          <button class="block-action-btn" onclick="editBlock('${block.id}')">Editar</button>
          <button class="block-action-btn" onclick="deleteBlock('${block.id}')" style="background:#A8432F;">Eliminar</button>
        </div>
        ${renderBlockPreview(block)}
      </div>
    `)
    .join("");

  document.querySelectorAll(".canvas-block").forEach((item) => {
    item.addEventListener("dragstart", onBlockDragStart);
    item.addEventListener("dragend", onBlockDragEnd);
    item.addEventListener("dragover", (e) => e.preventDefault());
    item.addEventListener("drop", onBlockDrop);
    item.addEventListener("click", () => selectBlock(item.dataset.blockId));
  });
}

function renderBlockPreview(block) {
  const content = block.content || {};
  switch (block.type) {
    case "hero":
      return `<div>
        <p style="font-size:11px; color:var(--ink-soft);">Hero</p>
        <h3 style="margin:8px 0 4px; font-size:16px;">${content.title || "Título"}</h3>
        <p style="margin:0; font-size:12px;">${content.tagline || "Tagline"}</p>
      </div>`;
    case "process":
      return `<div>
        <h3 style="margin:0 0 8px; font-size:14px;">${content.title || "Proceso"}</h3>
        <p style="margin:0; font-size:12px;">${content.steps?.length || 0} pasos</p>
      </div>`;
    case "faq":
      return `<div>
        <h3 style="margin:0 0 8px; font-size:14px;">${content.title || "FAQ"}</h3>
        <p style="margin:0; font-size:12px;">${content.items?.length || 0} preguntas</p>
      </div>`;
    case "testimonials":
      return `<div>
        <h3 style="margin:0 0 8px; font-size:14px;">${content.title || "Testimonios"}</h3>
        <p style="margin:0; font-size:12px;">${content.items?.length || 0} testimonios</p>
      </div>`;
    case "cta":
      return `<div>
        <p style="margin:0; font-size:12px;">${content.title || "CTA"}</p>
      </div>`;
    default:
      return `<p style="margin:0; font-size:12px;">Bloque ${block.type}</p>`;
  }
}

function renderPropertiesPanel() {
  const panel = document.getElementById("properties-panel");
  const title = document.getElementById("props-title");

  if (!selectedBlockId || !currentContent) {
    panel.innerHTML = "";
    title.textContent = "Selecciona un bloque";
    return;
  }

  const block = currentContent.blocks.find((b) => b.id === selectedBlockId);
  if (!block) return;

  title.textContent = `${block.type.charAt(0).toUpperCase() + block.type.slice(1)} — ${block.id}`;

  let html = `<div class="section-label">Contenido</div>`;

  // Renderizar campos según el tipo de bloque
  if (block.type === "hero") {
    html += `
      <div class="field">
        <label style="font-size:11px;">Eyebrow</label>
        <input type="text" class="prop-input" data-field="content.eyebrow" value="${block.content?.eyebrow || ''}">
      </div>
      <div class="field">
        <label style="font-size:11px;">Título</label>
        <input type="text" class="prop-input" data-field="content.title" value="${block.content?.title || ''}">
      </div>
      <div class="field">
        <label style="font-size:11px;">Tagline</label>
        <input type="text" class="prop-input" data-field="content.tagline" value="${block.content?.tagline || ''}">
      </div>
      <div class="field">
        <label style="font-size:11px;">Modos/Modos de venta</label>
        <input type="text" class="prop-input" data-field="content.modes" value="${block.content?.modes || ''}">
      </div>
      <div class="field">
        <label style="font-size:11px;">Badge</label>
        <input type="text" class="prop-input" data-field="content.badge" value="${block.content?.badge || ''}">
      </div>
      <div class="field">
        <label style="font-size:11px;">Botón 1</label>
        <input type="text" class="prop-input" data-field="content.primaryCta" value="${block.content?.primaryCta || ''}">
      </div>
      <div class="field">
        <label style="font-size:11px;">Botón 2</label>
        <input type="text" class="prop-input" data-field="content.secondaryCta" value="${block.content?.secondaryCta || ''}">
      </div>
    `;
  }

  if (block.type === "process" || block.type === "faq" || block.type === "testimonials") {
    html += `
      <div class="field">
        <label style="font-size:11px;">Título</label>
        <input type="text" class="prop-input" data-field="content.title" value="${block.content?.title || ''}">
      </div>
      <p style="font-size:11px; color:var(--ink-soft); margin-top:12px;">Edita los items haciendo clic en cada bloque.</p>
    `;
  }

  html += `
    <div class="section-label">Estilos</div>
    <div class="field">
      <label style="font-size:11px;">Color de fondo</label>
      <input type="color" class="color-input" data-field="style.bgColor" value="${block.style?.bgColor || '#ffffff'}">
    </div>
    <div class="field">
      <label style="font-size:11px;">Color de texto</label>
      <input type="color" class="color-input" data-field="style.textColor" value="${block.style?.textColor || '#000000'}">
    </div>
    <div class="field">
      <label style="font-size:11px;">Padding</label>
      <input type="text" class="prop-input" data-field="style.padding" value="${block.style?.padding || '20px'}">
    </div>
  `;

  panel.innerHTML = html;

  // Attach change listeners
  panel.querySelectorAll(".prop-input, .color-input").forEach((input) => {
    input.addEventListener("input", (e) => updateBlockProperty(selectedBlockId, e.target.dataset.field, e.target.value));
  });
}

// ============================================================
// BLOCK MANAGEMENT
// ============================================================

function selectBlock(blockId) {
  selectedBlockId = blockId;
  renderBlocksList();
  renderCanvasBlocks();
  renderPropertiesPanel();
}

function editBlock(blockId) {
  selectBlock(blockId);
}

function deleteBlock(blockId) {
  if (!currentContent) return;
  currentContent.blocks = currentContent.blocks.filter((b) => b.id !== blockId);
  if (selectedBlockId === blockId) selectedBlockId = null;
  renderBlocksList();
  renderCanvasBlocks();
  renderPropertiesPanel();
}

function addBlock(type) {
  if (!currentContent) return;
  const template = blockTemplates[type] || blockTemplates.hero;
  const newBlock = {
    id: `${type}-${Date.now()}`,
    type: template.type,
    order: currentContent.blocks.length,
    content: JSON.parse(JSON.stringify(template.content)),
    style: JSON.parse(JSON.stringify(template.style))
  };
  currentContent.blocks.push(newBlock);
  selectedBlockId = newBlock.id;
  renderBlocksList();
  renderCanvasBlocks();
  renderPropertiesPanel();
}

function updateBlockProperty(blockId, fieldPath, value) {
  if (!currentContent) return;
  const block = currentContent.blocks.find((b) => b.id === blockId);
  if (!block) return;

  const keys = fieldPath.split(".");
  let obj = block;
  for (let i = 0; i < keys.length - 1; i++) {
    if (!obj[keys[i]]) obj[keys[i]] = {};
    obj = obj[keys[i]];
  }
  obj[keys[keys.length - 1]] = value;

  renderCanvasBlocks();
}

function applyPreset(name) {
  const preset = presetThemes[name] || presetThemes.gold;
  if (!currentContent) currentContent = {};
  currentContent.theme = preset;
  applyThemeToDom(preset);
}

function applyThemeToDom(theme) {
  const root = document.documentElement;
  Object.entries(theme).forEach(([key, value]) => {
    root.style.setProperty(`--${key === 'bgDeep' ? 'bg-deep' : key === 'ink' ? 'ink' : key}`, value);
  });
}

// ============================================================
// DRAG & DROP
// ============================================================

function onBlockDragStart(e) {
  isDragging = true;
  draggedBlockId = e.currentTarget.dataset.blockId;
  e.currentTarget.classList.add("dragging");
}

function onBlockDragEnd(e) {
  isDragging = false;
  e.currentTarget.classList.remove("dragging");
}

function onBlockDrop(e) {
  e.preventDefault();
  if (!draggedBlockId || !currentContent) return;

  const draggedIndex = currentContent.blocks.findIndex((b) => b.id === draggedBlockId);
  const targetId = e.currentTarget.dataset.blockId;
  const targetIndex = currentContent.blocks.findIndex((b) => b.id === targetId);

  if (draggedIndex !== -1 && targetIndex !== -1) {
    currentContent.blocks.splice(draggedIndex, 1);
    currentContent.blocks.splice(targetIndex, 0, currentContent.blocks[draggedIndex]);
    currentContent.blocks.forEach((b, i) => b.order = i);
    renderCanvasBlocks();
  }
}

// ============================================================
// SAVE & AUTH
// ============================================================

async function saveSiteContent() {
  if (!currentContent) return;

  const res = await fetch("/api/site-content", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(currentContent)
  });

  if (res.ok) {
    alert("Cambios guardados exitosamente.");
    return true;
  } else {
    alert("Error al guardar. Intenta de nuevo.");
    return false;
  }
}

async function loginAdmin() {
  const user = document.getElementById("login-user").value;
  const password = document.getElementById("login-pass").value;
  const errEl = document.getElementById("login-error");

  const res = await fetch("/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user, password })
  });

  if (res.ok) {
    showAdmin();
  } else {
    errEl.textContent = "Usuario o contraseña incorrectos.";
  }
}

async function logoutAdmin() {
  await fetch("/api/admin/logout", { method: "POST" });
  location.reload();
}

async function showAdmin() {
  loginView.style.display = "none";
  adminView.style.display = "block";

  const content = await loadSiteContent();
  if (content && content.theme) {
    applyThemeToDom(content.theme);
  }

  renderBlocksList();
  renderCanvasBlocks();
  renderPropertiesPanel();
}

// ============================================================
// EVENT LISTENERS
// ============================================================

document.getElementById("login-btn")?.addEventListener("click", loginAdmin);
document.getElementById("logout-btn")?.addEventListener("click", logoutAdmin);
document.getElementById("save-editor-btn")?.addEventListener("click", saveSiteContent);

document.getElementById("add-block-btn")?.addEventListener("click", () => {
  const type = prompt("Tipo de bloque:\nhero, process, faq, testimonials, cta");
  if (type && blockTemplates[type]) addBlock(type);
});

document.querySelectorAll(".preset-btn").forEach((btn) => {
  btn.addEventListener("click", () => applyPreset(btn.dataset.preset));
});

document.getElementById("site-brand")?.addEventListener("input", (e) => {
  if (currentContent) currentContent.brand = e.target.value;
});

document.getElementById("site-email")?.addEventListener("input", (e) => {
  if (currentContent) currentContent.email = e.target.value;
});

// Check if user is logged in
(async () => {
  const res = await fetch("/api/admin/products");
  if (res.ok) showAdmin();
})();
