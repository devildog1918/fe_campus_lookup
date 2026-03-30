
const input = document.getElementById('campusInput');
const statusCard = document.getElementById('statusCard');
const resultArea = document.getElementById('resultArea');

let rows = [];

start();

async function start() {
  try {
    const response = await fetch('./field-engineers.csv', { cache: 'no-store' });
    if (!response.ok) throw new Error('Could not load field-engineers.csv');
    const text = await response.text();
    rows = parseCsv(text);
    statusCard.textContent = `Loaded ${rows.length} assignments.`;
    render('');
  } catch (error) {
    statusCard.textContent = error.message || 'Failed to load campus list.';
    showError('File Error', 'Make sure field-engineers.csv is in the same folder as the app files.');
  }
}

input.addEventListener('input', () => {
  input.value = input.value.toUpperCase();
  render(input.value);
});

function render(rawValue) {
  const query = normalize(rawValue);
  resultArea.innerHTML = '';

  if (!query) {
    statusCard.textContent = `Loaded ${rows.length} assignments.`;
    resultArea.appendChild(createCard('Ready', 'Enter campus initials to search.', 'neutral'));
    return;
  }

  const exactCode = rows.find(row => normalize(row.campus) === query);
  if (exactCode) {
    statusCard.textContent = 'Match found.';
    showMatch(exactCode);
    return;
  }

  const exactName = rows.find(row => normalize(row.campusName) === query);
  if (exactName) {
    statusCard.textContent = 'Match found.';
    showMatch(exactName);
    return;
  }

  const partialCode = rows.filter(row => normalize(row.campus).includes(query));
  const partialName = rows.filter(row => normalize(row.campusName).includes(query));

  const merged = dedupe([...partialCode, ...partialName]).slice(0, 10);

  if (merged.length) {
    statusCard.textContent = 'Possible matches found.';
    const card = createCard('Possible Matches', 'Tap a result to fill the search box.', 'warning');
    const list = document.createElement('div');
    list.className = 'list';

    merged.forEach(row => {
      const button = document.createElement('button');
      button.innerHTML = `
        <div><strong>${escapeHtml(row.campus || row.campusName)}</strong></div>
        <div class="sub">${escapeHtml(row.campusName)}</div>
        <div class="meta">Field Engineer: ${escapeHtml(row.engineer)}</div>
      `;
      button.addEventListener('click', () => {
        input.value = row.campus || row.campusName;
        render(input.value);
      });
      list.appendChild(button);
    });

    card.appendChild(list);
    resultArea.appendChild(card);
    return;
  }

  statusCard.textContent = 'No match found.';
  showError('No Match Found', `No campus matched "${escapeHtml(rawValue.trim())}".`);
}

function showMatch(row) {
  const card = createCard('Match Found', '', 'success');
  const big = document.createElement('div');
  big.className = 'big';
  big.textContent = row.campus || row.campusName;

  const sub = document.createElement('div');
  sub.className = 'sub';
  sub.textContent = row.campusName;

  const meta = document.createElement('div');
  meta.className = 'meta';
  meta.innerHTML = `Field Engineer: <strong>${escapeHtml(row.engineer)}</strong>`;

  card.appendChild(big);
  if (row.campus && normalize(row.campus) !== normalize(row.campusName)) {
    card.appendChild(sub);
  }
  card.appendChild(meta);
  resultArea.appendChild(card);
}

function showError(title, message) {
  resultArea.innerHTML = '';
  resultArea.appendChild(createCard(title, message, 'error'));
}

function createCard(title, message, tone) {
  const card = document.createElement('div');
  card.className = `result-card ${tone}`;

  const heading = document.createElement('h2');
  heading.textContent = title;
  card.appendChild(heading);

  if (message) {
    const body = document.createElement('div');
    body.innerHTML = message;
    card.appendChild(body);
  }

  return card;
}

function normalize(value) {
  return String(value || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '');
}

function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];

  const header = splitCsvLine(lines[0]).map(v => v.trim().toLowerCase());
  const campusIndex = header.indexOf('campus');
  const nameIndex = header.indexOf('campus name');
  const engineerIndex = header.indexOf('field engineer');

  if (campusIndex === -1 || nameIndex === -1 || engineerIndex === -1) {
    throw new Error('CSV must contain Campus, Campus Name, and Field Engineer columns.');
  }

  return lines.slice(1)
    .map(splitCsvLine)
    .map(parts => ({
      campus: (parts[campusIndex] || '').trim(),
      campusName: (parts[nameIndex] || '').trim(),
      engineer: (parts[engineerIndex] || '').trim()
    }))
    .filter(row => row.campusName && row.engineer);
}

function splitCsvLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}

function dedupe(items) {
  const seen = new Set();
  return items.filter(item => {
    const key = `${item.campus}|${item.campusName}|${item.engineer}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js').catch(() => {});
  });
}
