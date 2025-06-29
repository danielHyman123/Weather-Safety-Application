const addContactBtn = document.getElementById('addContactBtn');
// const friend_name = document.getElementById('friend-name');

addContactBtn.addEventListener('click', () => {
    const name = prompt("Enter friend's name:");
    const lat = prompt("Enter latitude:");
    const lng = prompt("Enter longitude:");

    addFriendButton(name, lat, lng);
});

function addFriendButton(name, lat, lng) {
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
}

function attachRightClickListeners(){
        // Use the correct CSS selector with a dot for class
    document.querySelectorAll('.friend-name').forEach(friendEl => {
        // Remove any existing event listeners to prevent duplicates
        friendEl.removeEventListener('contextmenu', deleteFriend);
        friendEl.addEventListener('contextmenu', deleteFriend);

    });
}

// // Function to handle right-click context menu for deleting a friend
function deleteFriend(e) {
    e.preventDefault();  // Prevent default right-click menu
    const id = this.dataset.id;
    const name = this.textContent.trim();

    if (confirm(`Delete friend "${name}"?`)) {
        fetch(`/delete-friend/${id}/`, {
            method: 'DELETE',
        })
        .then(res => res.json())
        .then(data => {
            if (data.status === 'deleted') {
                alert(`Friend "${name}" deleted`);
                location.reload();
            } else {
                alert('Error deleting friend');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error deleting friend');
        });
    }
}

// Attach event listeners when page loads
document.addEventListener('DOMContentLoaded', () => {
    attachRightClickListeners();
});