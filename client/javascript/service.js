const apiURL = "http://localhost:5261/api";

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
        userId: user.id
      })
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
  
    items.forEach(item => {
      const div = document.createElement("div");
    const nameElement = document.createElement("p");
    nameElement.innerHTML = `<strong>${item.name}</strong> (${item.type})`;

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
  
