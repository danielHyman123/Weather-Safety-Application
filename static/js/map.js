KONTUR_API_TOKEN = "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJjZDhoWXJtTUxpa1RGTUNaa0NGY1lxOTZPWm9hRE1LajZua2gza18wZ0FRIn0.eyJleHAiOjE3NTEzODMyMjcsImlhdCI6MTc1MTEyNDAyNywianRpIjoiYmNjNWFlNzUtMWVkNi00ZjI4LThjN2QtY2MyOTVlNDFiZTBlIiwiaXNzIjoiaHR0cHM6Ly9rZXljbG9hazAxLmtvbnR1ci5pby9yZWFsbXMva29udHVyIiwiYXVkIjpbImV2ZW50LWFwaSIsImFjY291bnQiXSwic3ViIjoiZjpiMzM1ZThiYS0yMWVhLTQzMmUtODViZi1jNzhjNWJlODEzMWU6ZGFuaWVsaHltYW4yMEBnbWFpbC5jb20iLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJrb250dXJfcGxhdGZvcm0iLCJzZXNzaW9uX3N0YXRlIjoiM2NiZTY0OGEtZDgyMy00ODI2LWJjMjUtMmQwMzE2NjE5NTMzIiwiYWxsb3dlZC1vcmlnaW5zIjpbImh0dHBzOi8vcHJvZC1kaXNhc3Rlci1uaW5qYS5rb250dXJsYWJzLmNvbSIsImh0dHBzOi8vZGlzYXN0ZXIubmluamEiLCJodHRwczovL2FwcHMua29udHVyLmlvIl0sInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJvZmZsaW5lX2FjY2VzcyIsInVtYV9hdXRob3JpemF0aW9uIiwiRVZFTlRBUElfcmVhZDpmZWVkOmtvbnR1ci1wdWJsaWMiXX0sInJlc291cmNlX2FjY2VzcyI6eyJldmVudC1hcGkiOnsicm9sZXMiOlsicmVhZDpmZWVkOmtvbnR1ci1wdWJsaWMiXX0sImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfX0sInNjb3BlIjoiZW1haWwgcHJvZmlsZSIsInNpZCI6IjNjYmU2NDhhLWQ4MjMtNDgyNi1iYzI1LTJkMDMxNjYxOTUzMyIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJuYW1lIjoiRGFuaWVsIEh5bWFuIiwicHJlZmVycmVkX3VzZXJuYW1lIjoiZGFuaWVsaHltYW4yMEBnbWFpbC5jb20iLCJnaXZlbl9uYW1lIjoiRGFuaWVsIEh5bWFuIiwiZmFtaWx5X25hbWUiOiIiLCJlbWFpbCI6ImRhbmllbGh5bWFuMjBAZ21haWwuY29tIiwidXNlcm5hbWUiOiJkYW5pZWxoeW1hbjIwQGdtYWlsLmNvbSJ9.rO2Oc0fj4P1ZjZGjTFwrd6bcqb1kesmtP7stkypyFDa76SB9j4vD9qjLJh2hYtspUffxIGHUwGmU9ocNE7vPLPrjf5OZ0TXYE0jG9aSOaR5YrmGbx_4BzlKXaHgMVVndYYbO2STl0RgqWfPkxRWqAeIY87QuP2lTk9lyPIKIMDqym1iyjXvWEKp0VpeviaZy7MKb4LfoXovZRhADtmKodwdoU6SF0L0tZp_Rpt7Uk-jFmaHrD5T8ttLCJJdncg0Iq88VPmKZ4AImaU_ecoSqcvH_AD7bCSUPo7FCnPFhd9rTBqSzoTM1Xw7ldW4XaSl3fNmHSrTi6rD2M2uwlcltww"

/* ─────────────────────────
   1. Map boot‑strap
   ───────────────────────── */
const map = L.map("map").setView([40, 0], 2);      // world view

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

const disasterLayer = L.layerGroup().addTo(map);

/* ─────────────────────────
   2. Utility helpers
   ───────────────────────── */
function getDisasterColor(type = "") {
    const t = type.toLowerCase();
    if (t.includes("flood")) return "#0066cc";
    if (t.includes("earthquake")) return "#ff6600";
    if (t.includes("fire")) return "#cc0000";
    if (t.includes("hurricane") ||
        t.includes("cyclone")) return "#6600cc";
    if (t.includes("drought")) return "#cc6600";
    return "#cc0033";
}

function formatDate(iso) {
    if (!iso) return "—";
    const d = new Date(iso);
    return isNaN(d) ? "—" : d.toLocaleString();
}

/* ─────────────────────────
   3. Core fetch & render
   ───────────────────────── */
async function loadDisasterData() {
    console.log("Loading disaster data…");
    disasterLayer.clearLayers();

    /* Build bbox from current map bounds */
    const b = map.getBounds();
    const bbox = `${b.getWest()},${b.getSouth()},${b.getEast()},${b.getNorth()}`;

    const url =
        `https://apps.kontur.io/events/v1/?feed=kontur-public` +
        `&limit=200&sortOrder=ASC&bbox=${bbox}`;

    try {
        const resp = await fetch(url, {
            headers: { Authorization: `Bearer ${KONTUR_API_TOKEN}` }
        });
        if (!resp.ok) throw new Error(`Kontur API ${resp.status}`);
        const events = await resp.json();           // <- array of event objects
        processDisasterEvents(Array.isArray(events) ? events : events.data);
    } catch (err) {
        console.error(err);
        showSampleData();                            // graceful fallback
    }
}

function processDisasterEvents(events) {
    if (!Array.isArray(events) || events.length === 0) {
        console.log("No events to render");
        return;
    }

    events.forEach(evt => {
        const color = getDisasterColor(evt.type);
        let layer = null;

        /*  A.  Prefer full geometry collection if present */
        if (evt.geometries &&
            evt.geometries.type === "FeatureCollection" &&
            evt.geometries.features?.length) {

            layer = L.geoJSON(evt.geometries, {
                style: {
                    color,
                    weight: 2,
                    opacity: 0.8,
                    fillColor: color,
                    fillOpacity: 0.3
                },
                pointToLayer: (feature, latlng) =>
                    L.circleMarker(latlng, {
                        radius: 6,
                        color,
                        fillColor: color,
                        fillOpacity: 0.7
                    })
            });

            /*  B.  Fallback: draw a single point at centroid */
        } else if (Array.isArray(evt.centroid) && evt.centroid.length === 2) {
            layer = L.circleMarker([evt.centroid[1], evt.centroid[0]], {
                radius: 8,
                color,
                fillColor: color,
                fillOpacity: 0.6,
                weight: 2
            });
        }

        if (!layer) return; // nothing drawable

        /* Popup with key event data */
        const popup = `
      <div style="max-width:240px">
        <h4>${evt.name || evt.properName || "Disaster Event"}</h4>
        <b>Type:</b> ${evt.type}<br>
        <b>Severity:</b> ${evt.severity}<br>
        <b>Started:</b> ${formatDate(evt.startedAt)}<br>
        <b>Updated:</b> ${formatDate(evt.updatedAt)}<br>
        ${evt.location ? `<b>Location:</b> ${evt.location}<br>` : ""}
        ${evt.description ? `<hr>${evt.description}` : ""}
      </div>`;

        layer.bindPopup(popup);
        disasterLayer.addLayer(layer);
    });

    console.log(`Rendered ${disasterLayer.getLayers().length} geometries`);
}

/* ─────────────────────────
   4.  Demo fallback / testing
   ───────────────────────── */
function showSampleData() {
    processDisasterEvents([
        {
            name: "Sample Earthquake",
            type: "EARTHQUAKE",
            severity: "SEVERE",
            startedAt: "2025-01-15T04:00:00Z",
            centroid: [-122.4194, 37.7749],
            geometries: null,
            description: "Sample quake for offline demo"
        }
    ]);
}

/* ─────────────────────────
   5.  Event hooks
   ───────────────────────── */
map.whenReady(loadDisasterData);

let debounce;
map.on("moveend", () => {
    clearTimeout(debounce);
    debounce = setTimeout(() => {
        if (map.getZoom() >= 4) loadDisasterData();
    }, 400);
});
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

let friends = document.getElementsByClassName('friend-name');
for (let i = 0; i < friends.length; i++) {
    let friend = friends[i];
    L.marker([friend.dataset.lat, friend.dataset.lng]).addTo(map)
    .bindPopup(friend.innerHTML)
    .openPopup();
    friend.addEventListener('click', (event) => {
        goToFriend(event, map, friend.dataset.lat, friend.dataset.lng);
    })
}

function goToFriend(event, map, lat, lng) {
    let friend = event.target;
    map.setView([lat, lng], 15);
}
