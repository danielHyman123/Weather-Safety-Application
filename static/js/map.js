// var map = L.map('map').setView([51.505, -0.09], 13);
// L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
//     maxZoom: 19,
//     attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
// }).addTo(map);

// // Fetch and add Kontur disaster data
// fetch("/https://keycloak01.kontur.io/auth/realms/kontur/protocol/openid-connect/token/") // Endpoint to fetch disaster data
//     .then(config => config.json())
//     .then(data => {
//         L.geoJSON(data, {
//             style: { color: 'red', weight: 2 },
//             onEachFeature: (feature, layer) => {
//                 let popupContent = '<div><strong>Disaster Information</strong><br>';

//                 if (feature.properties) {
//                     // Add common disaster properties
//                     if (feature.properties.name) {
//                         popupContent += `Name: ${feature.properties.name}<br>`;
//                     }
//                     if (feature.properties.type) {
//                         popupContent += `Type: ${feature.properties.type}<br>`;
//                     }
//                     if (feature.properties.severity) {
//                         popupContent += `Severity: ${feature.properties.severity}<br>`;
//                     }
//                     if (feature.properties.date) {
//                         popupContent += `Date: ${feature.properties.date}<br>`;
//                     }
//                     // Add any other properties that might be available
//                     Object.keys(feature.properties).forEach(key => {
//                         if (!['name', 'type', 'severity', 'date'].includes(key)) {
//                             popupContent += `${key}: ${feature.properties[key]}<br>`;
//                         }
//                     });
//                 } else {
//                     popupContent += 'Disaster Area - No additional details available';
//                 }

//                 popupContent += '</div>';
//                 layer.bindPopup(feature.properties.name || 'Disaster Area');
//             }
//         }).addTo(map);
//     });



// /*
// var map = L.map('map').setView([51.505, -0.09], 13);

// // Add OpenStreetMap tiles
// L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
//     maxZoom: 19,
//     attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
// }).addTo(map);

// // Fetch and add Kontur disaster data from your Django backend
// fetch('/kontur-data/')
//     .then(response => {
//         if (!response.ok) {
//             throw new Error(`HTTP error! status: ${response.status}`);
//         }
//         return response.json();
//     })
//     .then(data => {
//         console.log('Kontur data received:', data);

//         // Check if data has features (GeoJSON format)
//         if (data.features && data.features.length > 0) {
//             L.geoJSON(data, {
//                 style: function (feature) {
//                     return {
//                         color: '#ff0000',
//                         weight: 2,
//                         opacity: 0.8,
//                         fillColor: '#ff0000',
//                         fillOpacity: 0.3
//                     };
//                 },
//                 onEachFeature: function (feature, layer) {
//                     // Create popup content with available properties
//                     let popupContent = '<div><strong>Disaster Information</strong><br>';

//                     if (feature.properties) {
//                         // Add common disaster properties
//                         if (feature.properties.name) {
//                             popupContent += `Name: ${feature.properties.name}<br>`;
//                         }
//                         if (feature.properties.type) {
//                             popupContent += `Type: ${feature.properties.type}<br>`;
//                         }
//                         if (feature.properties.severity) {
//                             popupContent += `Severity: ${feature.properties.severity}<br>`;
//                         }
//                         if (feature.properties.date) {
//                             popupContent += `Date: ${feature.properties.date}<br>`;
//                         }
//                         // Add any other properties that might be available
//                         Object.keys(feature.properties).forEach(key => {
//                             if (!['name', 'type', 'severity', 'date'].includes(key)) {
//                                 popupContent += `${key}: ${feature.properties[key]}<br>`;
//                             }
//                         });
//                     } else {
//                         popupContent += 'Disaster Area - No additional details available';
//                     }

//                     popupContent += '</div>';
//                     layer.bindPopup(popupContent);
//                 }
//             }).addTo(map);

//             // Optionally fit map bounds to show all disaster areas
//             // map.fitBounds(L.geoJSON(data).getBounds());
//         } else {
//             console.log('No disaster features found in the data');
//         }
//     })
//     .catch(error => {
//         console.error('Error fetching Kontur data:', error);
//         // Optionally show user-friendly error message
//         alert('Failed to load disaster data. Please try again later.');
//     });
//     */


var map = L.map('map').setView([51.505, -0.09], 13);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

// Function to load disaster data
function loadDisasterData() {
    // Get current map bounds for more relevant data
    const bounds = map.getBounds();
    const bbox = `${bounds.getWest()},${bounds.getSouth()},${bounds.getEast()},${bounds.getNorth()}`;

    fetch(`/kontur-data/?bbox=${bbox}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Received disaster data:', data);

            if (data.error) {
                console.error('API Error:', data.error);
                return;
            }

            if (data.features && data.features.length > 0) {
                // Add disaster data to map
                L.geoJSON(data, {
                    style: function (feature) {
                        // Different colors for different disaster types
                        const disasterType = feature.properties.type || feature.properties.event_type || 'unknown';
                        let color = 'red'; // default

                        switch (disasterType.toLowerCase()) {
                            case 'flood':
                            case 'flooding':
                                color = 'blue';
                                break;
                            case 'earthquake':
                                color = 'orange';
                                break;
                            case 'wildfire':
                            case 'fire':
                                color = 'red';
                                break;
                            case 'hurricane':
                            case 'cyclone':
                                color = 'purple';
                                break;
                            default:
                                color = 'red';
                        }

                        return {
                            color: color,
                            weight: 3,
                            opacity: 0.8,
                            fillOpacity: 0.3
                        };
                    },
                    onEachFeature: function (feature, layer) {
                        let popupContent = '<div style="max-width: 200px;"><strong>Disaster Information</strong><br>';

                        if (feature.properties) {
                            // Add common disaster properties
                            const props = feature.properties;

                            if (props.name || props.title) {
                                popupContent += `<strong>Name:</strong> ${props.name || props.title}<br>`;
                            }
                            if (props.type || props.event_type) {
                                popupContent += `<strong>Type:</strong> ${props.type || props.event_type}<br>`;
                            }
                            if (props.severity || props.magnitude) {
                                popupContent += `<strong>Severity:</strong> ${props.severity || props.magnitude}<br>`;
                            }
                            if (props.date || props.start_date) {
                                const date = new Date(props.date || props.start_date);
                                popupContent += `<strong>Date:</strong> ${date.toLocaleDateString()}<br>`;
                            }
                            if (props.description) {
                                popupContent += `<strong>Description:</strong> ${props.description}<br>`;
                            }
                            if (props.status) {
                                popupContent += `<strong>Status:</strong> ${props.status}<br>`;
                            }

                            // Add any other important properties
                            Object.keys(props).forEach(key => {
                                if (!['name', 'title', 'type', 'event_type', 'severity', 'magnitude', 'date', 'start_date', 'description', 'status'].includes(key)) {
                                    if (props[key] && typeof props[key] !== 'object') {
                                        popupContent += `<strong>${key}:</strong> ${props[key]}<br>`;
                                    }
                                }
                            });
                        } else {
                            popupContent += 'Disaster Area - No additional details available<br>';
                        }

                        popupContent += '</div>';
                        layer.bindPopup(popupContent);
                    }
                }).addTo(map);

                console.log(`Added ${data.features.length} disaster features to map`);
            } else {
                console.log('No disaster data found for current area');
            }
        })
        .catch(error => {
            console.error('Error fetching disaster data:', error);
        });
}

// Load disaster data when map is ready
map.whenReady(function () {
    loadDisasterData();

    // Reload data when map is moved significantly
    map.on('moveend', function () {
        loadDisasterData();
    });
});