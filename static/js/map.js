// Fetch the config file
async function loadConfig() {
    const response = await fetch('/static/js/config.json');
    const config = await response.json();
    return config.KONTUR_API_TOKEN;
}

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

        //Load Kontur API for Disaster data
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
        showSampleData();     // graceful fallback
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
map.whenReady(() =>{
    loadDisasterData();
    checkFriendDisasterProximity();
});

let debounce;
map.on("moveend", () => {
    clearTimeout(debounce);
    debounce = setTimeout(() => {
        if (map.getZoom() >= 4) {
            loadDisasterData(); 
            checkFriendDisasterProximity();
        }
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

async function checkFriendDisasterProximity() {

    async function checkFriendDisasterProximity() {
    console.log("Checking friend-disaster proximity...");
    const proximityRadiusKm = 20; // Adjustable radius in kilometers

    // Helper: Calculate distance between two lat/lng points (Haversine formula)
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

    try {
        // Method 1: Using Django API endpoint (recommended)
        const response = await fetch('/api/check-friend-disasters/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCsrfToken() // You'll need this function
            },
            body: JSON.stringify({
                disasters: getCurrentDisasterData(),
                proximity_radius: proximityRadiusKm
            })
        });

        if (response.ok) {
            const data = await response.json();
            handleProximityAlerts(data.affected_friends);
        } else {
            // Fallback to client-side checking
            clientSideProximityCheck();
        }
    } catch (error) {
        console.error('Error with Django API, falling back to client-side check:', error);
        // Fallback to client-side checking
        clientSideProximityCheck();
    }
}

// Client-side proximity checking (fallback)
function clientSideProximityCheck() {
    const proximityRadiusKm = 20;
    
    function haversineDistance(lat1, lon1, lat2, lon2) {
        const R = 6371;
        const toRad = x => x * Math.PI / 180;
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    // Get friends from DOM elements
    const friendElements = document.getElementsByClassName('friend-name');
    const friends = Array.from(friendElements).map(f => ({
        name: f.innerText.trim(),
        lat: parseFloat(f.dataset.lat),
        lng: parseFloat(f.dataset.lng)
    })).filter(f => !isNaN(f.lat) && !isNaN(f.lng));

    if (friends.length === 0) {
        console.log('No friends with valid coordinates found');
        return;
    }

    const disasterLayers = disasterLayer.getLayers();
    const affectedFriends = [];

    friends.forEach(friend => {
        let isAffected = false;
        
        for (let layer of disasterLayers) {
            if (isAffected) break; // One alert per friend
            
            let disasterCenter;
            let disasterType = 'Unknown';

            // Extract disaster center coordinates
            if (layer.getBounds) {
                // GeoJSON layer with bounds
                disasterCenter = layer.getBounds().getCenter();
            } else if (layer.getLatLng) {
                // CircleMarker layer
                disasterCenter = layer.getLatLng();
            }

            // Try to extract disaster type from popup content
            if (layer.getPopup && layer.getPopup()) {
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
                
                if (distance <= proximityRadiusKm) {
                    affectedFriends.push({
                        name: friend.name,
                        hazard: disasterType,
                        distance: Math.round(distance * 10) / 10, // Round to 1 decimal
                        coordinates: {
                            lat: friend.lat,
                            lng: friend.lng
                        }
                    });
                    isAffected = true;
                }
            }
        }
    });

    handleProximityAlerts(affectedFriends);
}

// Handle proximity alerts
function handleProximityAlerts(affectedFriends) {
    if (!affectedFriends || affectedFriends.length === 0) {
        console.log('No friends affected by current disasters.');
        return;
    }

    // Show alerts
    affectedFriends.forEach(friend => {
        const message = `⚠️ ${friend.name} is ${friend.distance}km from a ${friend.hazard.toUpperCase()} zone!`;
        alert(message);
        console.log(message);
        
        // Optional: Highlight the friend's marker on map
        highlightFriendMarker(friend);
    });

    // Optional: Show summary notification
    if (affectedFriends.length > 1) {
        const summaryMessage = `⚠️ WARNING: ${affectedFriends.length} friends are near disaster zones!`;
        console.log(summaryMessage);
        
        // You could also show this in a more sophisticated way
        showNotification(summaryMessage, 'warning');
    }
}

// Helper function to get current disaster data for API
function getCurrentDisasterData() {
    const disasters = [];
    const disasterLayers = disasterLayer.getLayers();
    
    disasterLayers.forEach(layer => {
        let center, type = 'Unknown';
        
        if (layer.getBounds) {
            center = layer.getBounds().getCenter();
        } else if (layer.getLatLng) {
            center = layer.getLatLng();
        }
        
        // Extract type from popup if available
        if (layer.getPopup && layer.getPopup()) {
            const popupContent = layer.getPopup().getContent();
            const typeMatch = popupContent.match(/<b>Type:<\/b>\s*([^<\n]+)/);
            if (typeMatch) {
                type = typeMatch[1].trim();
            }
        }
        
        if (center) {
            disasters.push({
                lat: center.lat,
                lng: center.lng,
                type: type
            });
        }
    });
    
    return disasters;
}

// Helper function to get CSRF token for Django
function getCsrfToken() {
    const cookieValue = document.cookie
        .split('; ')
        .find(row => row.startsWith('csrftoken='))
        ?.split('=')[1];
    
    if (cookieValue) {
        return cookieValue;
    }
    
    // Fallback: try to get from meta tag
    const csrfMeta = document.querySelector('meta[name="csrf-token"]');
    return csrfMeta ? csrfMeta.getAttribute('content') : '';
}

// Optional: Highlight friend marker when they're in danger
function highlightFriendMarker(friend) {
    // Find and highlight the friend's marker
    map.eachLayer(layer => {
        if (layer instanceof L.Marker) {
            const popup = layer.getPopup();
            if (popup && popup.getContent().includes(friend.name)) {
                // Add pulsing effect or change color
                layer.setIcon(L.divIcon({
                    className: 'danger-friend-marker',
                    html: '⚠️',
                    iconSize: [20, 20]
                }));
            }
        }
    });
}

// Optional: Show notification (you can customize this)
function showNotification(message, type = 'info') {
    // Create a simple notification div
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px;
        background: ${type === 'warning' ? '#ff6b35' : '#007bff'};
        color: white;
        border-radius: 5px;
        z-index: 10000;
        max-width: 300px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Enhanced version that checks periodically
function startPeriodicProximityCheck(intervalMinutes = 5) {
        // Check immediately
        checkFriendDisasterProximity();
    
        // Then check every N minutes
        const intervalMs = intervalMinutes * 60 * 1000;
        setInterval(() => {
            console.log('Performing periodic proximity check...');
            checkFriendDisasterProximity();
        }, intervalMs);
    }
}




//     console.log("Checking friend-disaster proximity...");
//     const proximityRadiusKm = 20; // You can adjust this as needed

//     // Helper: Calculate distance between two lat/lng points (Haversine formula)
//     function haversineDistance(lat1, lon1, lat2, lon2) {
//         const R = 6371; // Earth radius in km
//         const toRad = x => x * Math.PI / 180;

//         const dLat = toRad(lat2 - lat1);
//         const dLon = toRad(lon2 - lon1);
//         const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//                   Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
//                   Math.sin(dLon / 2) * Math.sin(dLon / 2);
//         const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//         return R * c;
//     }

//     const friendElements = document.getElementsByClassName('friend-name');
//     const friends = Array.from(friendElements).map(f => ({
//         name: f.innerText,
//         lat: parseFloat(f.dataset.lat),
//         lng: parseFloat(f.dataset.lng)
//     }));

//     const disasterLayers = disasterLayer.getLayers();
//     console.log('about to loop');
//     friends.forEach(friend => {
//         console.log('looping through friends');
//         for (let layer of disasterLayers) {
//             console.log('for layer of disaster');

            
//             let center;

//             // Case A: GeoJSON with features
//             if (layer.getBounds) {
//                 center = layer.getBounds().getCenter();
//             }
//             // Case B: Simple CircleMarker (centroid-based)
//             else if (layer.getLatLng) {
//                 center = layer.getLatLng();
//             }

//             if (center) {
//                 console.log('if center');
//                 const dist = haversineDistance(friend.lat, friend.lng, center.lat, center.lng);
//                 if (dist <= proximityRadiusKm) {
//                     alert(`⚠️ ${friend.name} is within ${proximityRadiusKm}km of a disaster zone!`);
//                     break; // one alert per friend
//                 }
//             }
//         }
//     });
// }


// //     try {
// //         const res = await fetch('/api/disasters/');
// //         const data = await res.json();

// //         if (data.status === 'success' && data.affected_friends.length > 0) {
// //             data.affected_friends.forEach(friend => {
// //                 alert(`⚠️ Friend "${friend.name}" is in a ${friend.hazard.toUpperCase()} zone!`);
// //                 console.log(`⚠️ Friend "${friend.name}" is in a ${friend.hazard.toUpperCase()} zone!`);

// //             });
// //         } else {
// //             console.log('No friends affected by current disasters.');
// //         }
// //     } catch (error) {
// //         console.error('Error checking disaster proximity:', error);
// //     }
 