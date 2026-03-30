export default function FieldEngineerLookupPWA() {
  const { useEffect, useMemo, useState } = React;

  const [query, setQuery] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadCsv() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("./field-engineers.csv", { cache: "no-store" });
        if (!response.ok) {
          throw new Error("Could not load field-engineers.csv");
        }

        const text = await response.text();
        const parsed = parseCsv(text);

        if (active) {
          setRows(parsed);
        }
      } catch (err) {
        if (active) {
          setError(err.message || "Failed to load campus list.");
          setRows([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadCsv();

    return () => {
      active = false;
    };
  }, []);

  const normalized = normalizeCampus(query);

  const exactMatch = useMemo(() => {
    if (!normalized) return null;
    return rows.find((item) => normalizeCampus(item.campus) === normalized) || null;
  }, [normalized, rows]);

  const partialMatches = useMemo(() => {
    if (!normalized) return [];
    return rows.filter((item) => {
      const campus = normalizeCampus(item.campus);
      return campus.includes(normalized) && campus !== normalized;
    });
  }, [normalized, rows]);

  return (
    <div className="h-screen overflow-hidden bg-slate-100 p-3">
      <div className="mx-auto flex h-full max-w-md flex-col">
        <div className="flex h-full flex-col rounded-3xl bg-white p-4 shadow-xl">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold leading-tight text-slate-900">
                Field Engineer Lookup
              </h1>
              <p className="mt-1 text-xs text-slate-600">
                Enter campus initials.
              </p>
            </div>
            <div className="rounded-xl bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-600">
              CSV
            </div>
          </div>

          <div className="mt-3">
            <label className="mb-1 block text-xs font-medium text-slate-700">
              Campus Initials
            </label>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value.toUpperCase())}
              placeholder="Example: MHS"
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-xl uppercase shadow-sm outline-none focus:border-slate-500"
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck={false}
            />
          </div>

          {loading && (
            <div className="mt-4 flex-1 rounded-3xl border border-slate-200 bg-slate-50 p-5 text-slate-700">
              Loading campus assignments...
            </div>
          )}

          {!loading && error && (
            <div className="mt-4 flex-1 rounded-3xl border border-red-200 bg-red-50 p-5">
              <div className="text-xs font-semibold uppercase tracking-wide text-red-800">
                File Error
              </div>
              <div className="mt-2 text-sm text-slate-700">{error}</div>
              <div className="mt-2 text-xs text-slate-600">
                Make sure the app folder contains field-engineers.csv.
              </div>
            </div>
          )}

          {!loading && !error && normalized && exactMatch && (
            <div className="mt-4 flex-1 rounded-3xl border border-green-200 bg-green-50 p-5">
              <div className="text-xs font-semibold uppercase tracking-wide text-green-800">
                Match Found
              </div>
              <div className="mt-3 text-4xl font-bold leading-none text-slate-900">
                {exactMatch.campus}
              </div>
              <div className="mt-4 text-sm text-slate-600">Field Engineer</div>
              <div className="mt-1 text-2xl font-semibold leading-tight text-slate-900">
                {exactMatch.engineer}
              </div>
              {exactMatch.campusName && (
                <div className="mt-3 text-sm text-slate-600">
                  {exactMatch.campusName}
                </div>
              )}
            </div>
          )}

          {!loading && !error && normalized && !exactMatch && partialMatches.length > 0 && (
            <div className="mt-4 flex-1 overflow-hidden rounded-3xl border border-amber-200 bg-amber-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-amber-800">
                Possible Matches
              </div>
              <div className="mt-3 max-h-full space-y-2 overflow-auto pr-1">
                {partialMatches.slice(0, 4).map((item) => (
                  <button
                    key={`${item.campus}-${item.engineer}`}
                    onClick={() => setQuery(item.campus)}
                    className="block w-full rounded-2xl bg-white p-3 text-left shadow-sm transition hover:shadow-md"
                  >
                    <div className="text-lg font-bold leading-none text-slate-900">
                      {item.campus}
                    </div>
                    <div className="mt-1 text-sm text-slate-700">{item.engineer}</div>
                    {item.campusName && (
                      <div className="mt-1 text-xs text-slate-500">{item.campusName}</div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {!loading && !error && normalized && !exactMatch && partialMatches.length === 0 && (
            <div className="mt-4 flex-1 rounded-3xl border border-red-200 bg-red-50 p-5">
              <div className="text-xs font-semibold uppercase tracking-wide text-red-800">
                No Match Found
              </div>
              <div className="mt-3 text-lg font-semibold text-slate-900">{normalized}</div>
              <div className="mt-2 text-sm text-slate-700">
                No campus matched that entry.
              </div>
            </div>
          )}

          {!loading && !error && !normalized && (
            <div className="mt-4 flex-1 rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-800">
                Ready
              </div>
              <div className="mt-3 text-3xl font-bold text-slate-900">{rows.length}</div>
              <div className="mt-1 text-sm text-slate-700">Campus assignments loaded</div>
              <div className="mt-4 text-xs text-slate-600">
                Replace field-engineers.csv anytime to update the list.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function normalizeCampus(value) {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");
}

function parseCsv(text) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) return [];

  const header = splitCsvLine(lines[0]).map((item) => item.trim().toLowerCase());

  const campusIndex = header.findIndex(
    (item) => item === "campus" || item === "campus initials" || item === "campus id"
  );

  const campusNameIndex = header.findIndex(
    (item) => item === "campus name"
  );

  const engineerIndex = header.findIndex(
    (item) => item === "engineer" || item === "field engineer"
  );

  if (campusIndex === -1 || engineerIndex === -1) {
    throw new Error("CSV must contain Campus and Field Engineer columns.");
  }

  return lines
    .slice(1)
    .map((line) => splitCsvLine(line))
    .map((parts) => ({
      campus: String(parts[campusIndex] || "").trim(),
      campusName: campusNameIndex >= 0 ? String(parts[campusNameIndex] || "").trim() : "",
      engineer: String(parts[engineerIndex] || "").trim(),
    }))
    .filter((row) => row.campus && row.engineer)
    .sort((a, b) => a.campus.localeCompare(b.campus));
}

function splitCsvLine(line) {
  const result = [];
  let current = "";
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
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}
