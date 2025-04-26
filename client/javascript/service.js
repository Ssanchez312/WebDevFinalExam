const apiURL = "http://localhost:5261/api";
let currentOutfitFilter = "";

// User registration and login functions
window.addEventListener("DOMContentLoaded", () => {
  const registerBtn = document.getElementById("register-btn");
  const loginBtn = document.getElementById("login-btn");

  if (registerBtn) {
    registerBtn.addEventListener("click", registerUser);
  }

  if (loginBtn) {
    loginBtn.addEventListener("click", loginUser);
  }
});
async function registerUser() {
  const username = document.getElementById("reg-username").value;
  const password = document.getElementById("reg-password").value;

  const res = await fetch(`${apiURL}/users/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json();
  document.getElementById("auth-msg").textContent = data.message;
  if (res.ok) localStorage.setItem("user", JSON.stringify(data.user));
}

async function loginUser() {
  const username = document.getElementById("login-username").value;
  const password = document.getElementById("login-password").value;

  const res = await fetch(`${apiURL}/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json();
  document.getElementById("auth-msg").textContent = data.message;
  if (res.ok) {
    localStorage.setItem("user", JSON.stringify(data.user));
    // Redirect or reload, if needed
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

    const img = document.createElement("img");
    img.src = document.querySelector(`[data-id='${id}']`).src;

    img.dataset.id = id;
    img.addEventListener("click", removeFromCanvas);
    ev.target.appendChild(img);
  }
}

function removeFromCanvas(ev) {
  const img = ev.target;
  const id = parseInt(img.dataset.id);

  selectedClothingIds = selectedClothingIds.filter(
    (clothingId) => clothingId !== id
  );

  img.remove();
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

async function loadOutfits() {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) return;

  const res = await fetch(`${apiURL}/outfits/user/${user.id}`);
  const outfits = await res.json();

  const container = document.getElementById("saved-outfits");
  if (!container) return;
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }

  const filtered = outfits.filter((o) =>
    o.name.toLowerCase().includes(currentOutfitFilter)
  );

  filtered.forEach((outfit) => {
    const outfitBox = document.createElement("div");
    outfitBox.classList.add("outfit-box");

    const title = document.createElement("p");
    title.textContent = `${outfit.name} (ID: ${outfit.id})`;
    outfitBox.appendChild(title);

    const preview = document.createElement("div");
    preview.classList.add("outfit-preview");

    outfit.clothingItemIds.forEach((id) => {
      const img = document.querySelector(`[data-id="${id}"]`);
      if (!img) return;

      const imgCopy = document.createElement("img");
      imgCopy.src = `${apiURL}${item.imageUrl}`;
      imgCopy.alt = "Clothing item";
      imgCopy.classList.add("preview-img");
      preview.appendChild(imgCopy);
    });

    outfitBox.appendChild(preview);

    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.onclick = () => editOutfit(outfit.id);

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.onclick = () => deleteOutfit(outfit.id);

    outfitBox.appendChild(editBtn);
    outfitBox.appendChild(deleteBtn);

    container.appendChild(outfitBox);
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
        img.src = `${apiURL}${item.imageUrl}`;
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

function applyOutfitFilter() {
  const input = document.getElementById("outfit-filter");
  currentOutfitFilter = input.value.trim().toLowerCase();
  loadOutfits();
}

function clearOutfitFilter() {
  document.getElementById("outfit-filter").value = "";
  currentOutfitFilter = "";
  loadOutfits();
}
