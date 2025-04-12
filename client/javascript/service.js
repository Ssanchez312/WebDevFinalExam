const apiURL = "http://localhost:5261/api";
// User registration and login functions
async function registerUser() {
  console.log("registerUser function called");
  const userName = document.getElementById("reg-username").value;
  const password = document.getElementById("reg-password").value;

  const res = await fetch(`${apiURL}/users/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: userName, password }),
  });

  const data = await res.json();
  document.getElementById("auth-msg").textContent = data.message || data;
}

async function loginUser() {
  const username = document.getElementById("login-username").value;
  const password = document.getElementById("login-password").value;

  const res = await fetch(`${apiURL}/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (res.ok) {
    const data = await res.json();
    localStorage.setItem("user", JSON.stringify(data.user));
    document.getElementById("auth-msg").textContent = "Login successful!";
    window.location.href = "clothing.html";
  } else {
    const text = await res.text(); // fallback if not JSON
    document.getElementById("auth-msg").textContent = text || "Login failed.";
  }
}

window.registerUser = registerUser;
window.loginUser = loginUser;

// Clothing upload and closet functions
async function uploadClothing() {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) return alert("You must be logged in!");

  const name = document.getElementById("clothing-name").value;
  const type = document.getElementById("clothing-type").value;
  const description = document.getElementById("clothing-description").value;
  const imageUrl = document.getElementById("clothing-image").value;

  const res = await fetch(`${apiURL}/clothing/upload`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      type,
      description,
      imageUrl,
      userId: user.id,
    }),
  });

  const data = await res.json();
  alert(data.message || "Upload failed");
  loadCloset(); // refresh clothing list
}

async function loadCloset() {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) return;

  const res = await fetch(`${apiURL}/clothing/user/${user.id}`);
  const items = await res.json();

  const container = document.getElementById("closet");
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }

  items.forEach((item) => {
    const div = document.createElement("div");
    const nameElement = document.createElement("p");
    nameElement.textContent = `${item.name} (${item.type})`;

    const imageElement = document.createElement("img");
    imageElement.src = item.imageUrl;
    imageElement.alt = item.name;
    imageElement.width = 100;

    const descriptionElement = document.createElement("p");
    descriptionElement.textContent = item.description;

    const separator = document.createElement("hr");

    div.appendChild(nameElement);
    div.appendChild(imageElement);
    div.appendChild(descriptionElement);
    div.appendChild(separator);
    container.appendChild(div);
  });
}

window.uploadClothing = uploadClothing;
window.loadCloset = loadCloset;

// OUtfit generator functions
let selectedClothingIds = [];
function drag(ev) {
  ev.dataTransfer.setData("id", ev.target.dataset.id);
}

function allowDrop(ev) {
  ev.preventDefault();
}

function drop(ev) {
  ev.preventDefault();
  const id = ev.dataTransfer.getData("id");

  if (!selectedClothingIds.includes(parseInt(id))) {
    selectedClothingIds.push(parseInt(id));

    const img = ev.target.appendChild(document.createElement("img"));
    img.src = document.querySelector(`[data-id='${id}']`).src;
    img.style.width = "80px";
  }
}

async function saveOutfit() {
  const name = document.getElementById("outfit-name").value;
  const user = JSON.parse(localStorage.getItem("user"));
  if (!name || selectedClothingIds.length === 0)
    return alert("Fill all fields");

  const body = {
    name,
    userId: user.id,
    clothingItemIds: selectedClothingIds,
  };

  let res;
  if (editingOutfitId) {
    res = await fetch(`${apiURL}/outfits/update/${editingOutfitId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    editingOutfitId = null;
  } else {
    res = await fetch(`${apiURL}/outfits/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  const data = await res.json();
  alert(data.message || "Saved!");
  selectedClothingIds = [];
  loadOutfits();
}

function loadOutfits() {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) return;

  fetch(`${apiURL}/outfits/user/${user.id}`)
    .then((res) => res.json())
    .then((outfits) => {
      const container = document.getElementById("saved-outfits");
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }

      outfits.forEach((o) => {
        const div = document.createElement("div");
        const nameElement = document.createElement("p");
        nameElement.textContent = `${o.name} (ID: ${o.id})`;

        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.onclick = () => editOutfit(o.id);
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.onclick = () => deleteOutfit(o.id);

        div.appendChild(nameElement);
        div.appendChild(editButton);
        div.appendChild(deleteButton);
        container.appendChild(div);
      });
    });
}
window.allowDrop = allowDrop;
window.drag = drag;
window.drop = drop;
window.saveOutfit = saveOutfit;
window.loadOutfits = loadOutfits;

// Edit outfit function
let editingOutfitId = null;

function editOutfit(id) {
  const user = JSON.parse(localStorage.getItem("user"));
  fetch(`${apiURL}/outfits/user/${user.id}`)
    .then((res) => res.json())
    .then((outfits) => {
      const outfit = outfits.find((o) => o.id === id);
      if (!outfit) return alert("Outfit not found.");

      document.getElementById("outfit-name").value = outfit.name;
      const canvas = document.getElementById("outfit-canvas");
      while (canvas.firstChild) {
        canvas.removeChild(canvas.firstChild);
      }

      selectedClothingIds = [];

      outfit.clothingItemIds.forEach((id) => {
        const sourceImg = document.querySelector(`[data-id="${id}"]`);
        if (!sourceImg) return;

        const img = document.createElement("img");
        img.src = sourceImg.src;
        img.style.width = "80px";
        canvas.appendChild(img);
        selectedClothingIds.push(id);
      });

      editingOutfitId = id;
    });
}

function deleteOutfit(id) {
  if (!confirm("Are you sure you want to delete this outfit?")) return;

  fetch(`${apiURL}/outfits/delete/${id}`, {
    method: "DELETE",
  })
    .then((res) => res.json())
    .then((data) => {
      alert(data.message || "Outfit deleted.");
      loadOutfits();
    })
    .catch((err) => console.error("Delete failed:", err));
}
