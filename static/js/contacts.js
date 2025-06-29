const addContactBtn = document.getElementById('addContactBtn');
const friendButtons = document.getElementById('friendButtons');

let friendCounter = 1;

addContactBtn.addEventListener('click', () => {
    const name = prompt("Enter friend's name:");
    const lat = prompt("Enter friend's latitude:");
    const lng = prompt("Enter friend's longitude:");

    if (!name || !lat || !lng) return;

    const btn = document.createElement('button');
    btn.textContent = name;
    btn.dataset.lat = lat;
    btn.dataset.lng = lng;

    btn.addEventListener('click', () => {
        alert(`Navigating to ${name}'s location at (${lat}, ${lng})`);
        // Optionally center map here if using Leaflet or Google Maps
        // map.setView([parseFloat(lat), parseFloat(lng)], 13);
    });

    friendButtons.appendChild(btn);
    friendCounter++;
});