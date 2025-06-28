var map = L.map('map').setView([51.505, -0.09], 13);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
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