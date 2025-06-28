//Contact attributes
const fullName = "", phone = "", email = "", friendEmail = "", locate = "";
const createContactBtn = document.getElementById("createContact");
const contactContainer = document.querySelector(".contacts-section ul"); // Target the ul element

const contactAttributes = {
    fullName: fullName,
    phone: phone,
    email: email,
    friendEmail: friendEmail,
    locate: locate
}

createContactBtn.addEventListener("click", createNewContact);

function createNewContact() {
    // Create a list item to maintain the structure
    const newListItem = document.createElement("li");
    
    // Create the contact button
    const newContact = document.createElement("button");
    newContact.textContent = "New Contact";
    
    // Add the button to the list item
    newListItem.appendChild(newContact);
    
    // Add a dash after the button (to match existing structure)
    newListItem.appendChild(document.createTextNode(" -"));
    
    // Append to the contacts list
    contactContainer.appendChild(newListItem);
}