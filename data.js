const SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/1xWRo_TaaJT83s4n5f7W4Apt9Da3M2Bd0q-UgcpyPnaE/gviz/tq?tqx=out:csv&sheet=hoja%2001";

function parseCSV(text) {
  const rows = [];
  let row = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const n = text[i + 1];

    if (c === '"' && inQuotes && n === '"') { cur += '"'; i++; continue; }
    if (c === '"') { inQuotes = !inQuotes; continue; }

    if (c === "," && !inQuotes) { row.push(cur); cur = ""; continue; }
    if ((c === "\n" || c === "\r") && !inQuotes) {
      if (c === "\r" && n === "\n") i++;
      row.push(cur); cur = "";
      if (row.some(x => x.trim() !== "")) rows.push(row);
      row = [];
      continue;
    }
    cur += c;
  }
  row.push(cur);
  if (row.some(x => x.trim() !== "")) rows.push(row);

  const headers = rows.shift().map(h => h.trim());
  return rows.map(r => {
    const obj = {};
    headers.forEach((h, idx) => obj[h] = (r[idx] ?? "").trim());
    return obj;
  });
}

async function loadArticles() {
  const res = await fetch(SHEET_CSV_URL, { cache: "no-store" });
  if (!res.ok) throw new Error("No se pudo leer el Google Sheet");
  const csv = await res.text();
  return parseCSV(csv);
}

function cardHTML(a) {
  const id = a["Identificador"] || "";
  const nombre = a["Nombre"] || "";
  const autores = a["Autores"] || "";
  const anio = a["Año"] || "";
  const doi = a["DOI"] || "";
  const estado = a["Estado"] || "";
  const pdf = a["PDF"] || ""; // si luego agrega columna PDF
  const extra = pdf ? `<a class="btn" href="${pdf}" target="_blank" rel="noopener">PDF</a>` : "";

  return `
    <article class="card">
      <div class="title">${nombre}</div>
      <div class="meta">
        <div><b>ID</b> ${id}</div>
        <div><b>Autores</b> ${autores}</div>
        <div><b>Fecha</b> ${anio}</div>
        <div><b>DOI</b> ${doi}</div>
        <div><b>Estado</b> ${estado}</div>
      </div>
      <div class="actions">${extra}</div>
    </article>
  `;
}
