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

function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius in km
    const toRad = x => x * Math.PI / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}
/* ─────────────────────────
   Fixed Core fetch & render with proper timing
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
        //Load Kontur API for Disaster data
        const KONTUR_API_TOKEN = await loadConfig();

        const resp = await fetch(url, {
            headers: { Authorization: `Bearer ${KONTUR_API_TOKEN}` }
        });

        if (!resp.ok) throw new Error(`Kontur API ${resp.status}`);

        const events = await resp.json();
        const eventArray = Array.isArray(events) ? events : events.data;

        console.log(`API returned ${eventArray ? eventArray.length : 0} events`);

        processDisasterEvents(eventArray);

        // Return success status for chaining
        return { success: true, eventCount: eventArray ? eventArray.length : 0 };

    } catch (err) {
        console.error("API failed, showing sample data:", err);
        showSampleData();
        return { success: false, error: err.message };
    }
}

function processDisasterEvents(events) {
    if (!Array.isArray(events) || events.length === 0) {
        console.log("No events to render");
        return;
    }

    console.log(`Processing ${events.length} disaster events`);

    events.forEach((evt, index) => {
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
            // Note: Kontur API typically returns [lng, lat], so we swap for Leaflet [lat, lng]
            layer = L.circleMarker([evt.centroid[1], evt.centroid[0]], {
                radius: 8,
                color,
                fillColor: color,
                fillOpacity: 0.6,
                weight: 2
            });
        }

        if (!layer) {
            console.log(`Could not create layer for event ${index}:`, evt);
            return;
        }

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

    console.log(`Successfully rendered ${disasterLayer.getLayers().length} disaster layers`);
}

// Fixed timing for initial load
async function initializeMapWithData() {
    console.log("Initializing map with disaster data...");

    try {
        const result = await loadDisasterData();
        console.log("Disaster data loaded:", result);

        // Only check proximity after disasters are loaded
        setTimeout(() => {
            console.log("Running proximity check after disaster data loaded");
            checkFriendDisasterProximity();
        }, 500); // Small delay to ensure layers are fully added

    } catch (error) {
        console.error("Failed to initialize map data:", error);
    }
}

// Fixed event hooks with proper async handling
map.whenReady(() => {
    console.log("Map is ready, initializing data...");
    initializeMapWithData();
});

let debounce;
map.on("moveend", () => {
    clearTimeout(debounce);
    debounce = setTimeout(async () => {
        if (map.getZoom() >= 4) {
            console.log("Map moved, reloading data...");
            try {
                await loadDisasterData();
                // Check proximity after data reloads
                setTimeout(() => {
                    checkFriendDisasterProximity();
                }, 500);
            } catch (error) {
                console.error("Error reloading data on map move:", error);
            }
        }
    }, 400);
});

// Enhanced debugging function
function debugDisasterLayers() {
    console.log("=== DISASTER LAYER DEBUG ===");
    console.log(`Total layers in disasterLayer: ${disasterLayer.getLayers().length}`);

    disasterLayer.getLayers().forEach((layer, index) => {
        console.log(`Layer ${index}:`, {
            type: layer.constructor.name,
            hasGetBounds: typeof layer.getBounds === 'function',
            hasGetLatLng: typeof layer.getLatLng === 'function',
            bounds: layer.getBounds ? layer.getBounds() : null,
            latlng: layer.getLatLng ? layer.getLatLng() : null,
            popup: layer.getPopup() ? layer.getPopup().getContent().substring(0, 100) : 'No popup'
        });
    });

    console.log("=== END DEBUG ===");
}

// Test function to manually trigger proximity check
function testProximityCheck() {
    console.log("=== MANUAL PROXIMITY TEST ===");
    debugDisasterLayers();
    checkFriendDisasterProximity();
}

function checkFriendDisasterProximity() {
    console.log("=== PROXIMITY CHECK START ===");
    console.log("Checking friend-disaster proximity...");

    const proximityRadiusKm = 20;

    // Get friends from DOM elements
    const friendElements = document.getElementsByClassName('friend-name');
    const friends = Array.from(friendElements).map(f => ({
        name: f.innerText.trim(),
        lat: parseFloat(f.dataset.lat),
        lng: parseFloat(f.dataset.lng)
    })).filter(f => !isNaN(f.lat) && !isNaN(f.lng));

    console.log(`Found ${friends.length} friends with valid coordinates:`, friends);

    if (friends.length === 0) {
        console.log('No friends with valid coordinates found');
        return;
    }

    const disasterLayers = disasterLayer.getLayers();
    console.log(`Found ${disasterLayers.length} disaster layers`);

    // Debug disaster layers
    disasterLayers.forEach((layer, index) => {
        let center = null;
        if (layer.getBounds) {
            center = layer.getBounds().getCenter();
        } else if (layer.getLatLng) {
            center = layer.getLatLng();
        }
        console.log(`Disaster ${index}:`, {
            center: center,
            type: layer.constructor.name,
            popup: layer.getPopup() ? 'Has popup' : 'No popup'
        });
    });

    if (disasterLayers.length === 0) {
        console.log('⚠️ No disaster layers found! This might be why proximity check shows 0 disasters.');
        console.log('Try running testProximityCheck() in console after disasters load');
        return;
    }

    const affectedFriends = [];

    friends.forEach(friend => {
        console.log(`Checking friend: ${friend.name} at [${friend.lat}, ${friend.lng}]`);
        let isAffected = false;

        for (let layer of disasterLayers) {
            if (isAffected) break;

            let disasterCenter;
            let disasterType = 'Unknown';

            if (layer.getBounds) {
                disasterCenter = layer.getBounds().getCenter();
            } else if (layer.getLatLng) {
                disasterCenter = layer.getLatLng();
            }

            if (layer.getPopup()) {
                const popupContent = layer.getPopup().getContent();
                const typeMatch = popupContent.match(/<b>Type:<\/b>\s*([^<\n]+)/);
                if (typeMatch) {
                    disasterType = typeMatch[1].trim();
                }
            }

            if (disasterCenter) {
                const distance = haversineDistance(
                    friend.lat, friend.lng,
                    disasterCenter.lat, disasterCenter.lng
                );

                console.log(`Distance from ${friend.name} to ${disasterType}: ${distance.toFixed(2)}km`);

                if (distance <= proximityRadiusKm) {
                    affectedFriends.push({
                        name: friend.name,
                        hazard: disasterType,
                        distance: Math.round(distance * 10) / 10,
                        coordinates: {
                            lat: friend.lat,
                            lng: friend.lng
                        }
                    });
                    isAffected = true;
                    console.log(`⚠️ ${friend.name} is affected by ${disasterType}!`);
                }
            } else {
                console.log('Could not determine disaster center for layer');
            }
        }
    });

    console.log(`=== PROXIMITY CHECK COMPLETE ===`);
    console.log(`Affected friends: ${affectedFriends.length}`);

    if (affectedFriends.length > 0) {
        handleProximityAlerts(affectedFriends);
    } else {
        console.log('No friends are currently near disaster zones.');
    }
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
// Enhanced alert handling
function handleProximityAlerts(affectedFriends) {
    if (!affectedFriends || affectedFriends.length === 0) {
        return;
    }

    console.log(`Found ${affectedFriends.length} affected friends`);

    // Show individual alerts
    affectedFriends.forEach(friend => {
        const message = `⚠️ ${friend.name} is ${friend.distance}km from a ${friend.hazard.toUpperCase()} zone!`;
        alert(message);
        console.log(message);

        // Highlight the friend's marker on map
        highlightFriendMarker(friend);
    });

    // Show summary notification for multiple friends
    if (affectedFriends.length > 1) {
        const summaryMessage = `⚠️ WARNING: ${affectedFriends.length} friends are near disaster zones!`;
        console.log(summaryMessage);
        showNotification(summaryMessage, 'warning');
    }
}

// Improved friend marker highlighting
function highlightFriendMarker(friend) {
    map.eachLayer(layer => {
        if (layer instanceof L.Marker) {
            const popup = layer.getPopup();
            if (popup && popup.getContent().includes(friend.name)) {
                // Create a pulsing danger icon
                const dangerIcon = L.divIcon({
                    className: 'danger-friend-marker',
                    html: '<div style="background-color: red; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-size: 16px; animation: pulse 2s infinite;">⚠️</div>',
                    iconSize: [30, 30],
                    iconAnchor: [15, 15]
                });
                layer.setIcon(dangerIcon);

                // Add CSS for pulsing animation if not already added
                if (!document.getElementById('danger-marker-styles')) {
                    const style = document.createElement('style');
                    style.id = 'danger-marker-styles';
                    style.textContent = `
                        @keyframes pulse {
                            0% { transform: scale(1); opacity: 1; }
                            50% { transform: scale(1.2); opacity: 0.7; }
                            100% { transform: scale(1); opacity: 1; }
                        }
                    `;
                    document.head.appendChild(style);
                }
            }
        }
    });
}
