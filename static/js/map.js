// initialize map
const map = L.map("map").setView([40, 0], 2);      // world view
let spaceStationMarker; // variable to hold space station marker

updateSpaceStationMarker();
setInterval(updateSpaceStationMarker, 5000);
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

const disasterLayer = L.layerGroup().addTo(map);


//   2. Utility helpers
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

    const KONTUR_API_TOKEN = await loadConfig();

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

// Handle existing friends from Django template
let friends = document.getElementsByClassName('friend-name');
for (let i = 0; i < friends.length; i++) {
    let friend = friends[i];
    L.marker([friend.dataset.lat, friend.dataset.lng]).addTo(map)
        .bindPopup(friend.innerHTML)
        .openPopup();
    friend.addEventListener('click', (event) => {
        goToFriend(event, map, friend.dataset.lat, friend.dataset.lng);
    });
}

// Function to zoom to location
function goToFriend(event, mapInstance, lat, lng) {
    mapInstance.setView([lat, lng], 15);
}


function addFriend() {
    const name = document.getElementById('name').value;
    const friends = document.getElementById('category').value;
}

// Space station lat and long 
async function getSpaceStationLocation() {
    const url = "http://api.open-notify.org/iss-now.json";
    try {
        const resp = await fetch(url);
        if (!resp.ok) throw new Error(`ISS API ${resp.status}`);
        const events = await resp.json();           // <- array of event objects
        return [events.iss_position.latitude, events.iss_position.longitude];
    } catch (err) {
        console.error(err);
        return [0, 0];
    }
}

async function updateSpaceStationMarker() {
    const issLocation = await getSpaceStationLocation();
    if (!spaceStationMarker) {
        let myIcon = L.icon({
            iconUrl: '/static/icon/space-station-icon-removebg-preview.png',
            iconSize: [30, 30],
            iconAnchor: [20, 20]
        })
        spaceStationMarker = L.marker(issLocation, { icon: myIcon }).addTo(map);
        spaceStationMarker.bindPopup("Space Station").openPopup();
    } else {
        spaceStationMarker.setLatLng(issLocation);
    }
}

function goToSpaceStation() {
    map.setView(spaceStationMarker.getLatLng(), 15);
}


// Fetch the config file
async function loadConfig() {
    const response = await fetch('/static/js/config.json');
    const config = await response.json();
    return config.KONTUR_API_TOKEN;
}
