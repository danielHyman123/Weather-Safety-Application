document.getElementById('addContactBtn').addEventListener('click', () => {
    const name = prompt("Enter friend's name:");
    const lat = prompt("Enter latitude:");
    const lng = prompt("Enter longitude:");

    if (name && lat && lng) {
        fetch('/add-friend/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, lat, lng })
        })
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success') {
                alert('Friend added!');
                location.reload(); // Optional: Refresh to show new friend
            } else {
                alert('Error adding friend');
            }
        });
    }
});