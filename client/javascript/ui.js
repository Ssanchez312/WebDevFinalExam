window.addEventListener("DOMContentLoaded", async () => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) {
    alert("You must be logged in!");
    window.location.href = "index.html";
    return;
  }

  const res = await fetch(`${apiURL}/clothing/user/${user.id}`);
  const items = await res.json();

  const closet = document.getElementById("closet");
  if (closet) {
    while (closet.firstChild) {
      closet.removeChild(closet.firstChild);
    }

    items.forEach(item => {
      const img = document.createElement("img");
      img.src = `${apiURL}${item.imageUrl}`;
      img.alt = item.name;
      img.draggable = true;
      img.dataset.id = item.id;
      img.classList.add("clothing-item");
      img.addEventListener("dragstart", drag);
      closet.appendChild(img);
    });
  }

  if (typeof loadOutfits === "function") {
    loadOutfits(); 
  }
});

//Login functionality
window.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("login-btn");

  if (loginBtn) {
    loginBtn.addEventListener("click", async (e) => {
      e.preventDefault();

      const username = document.getElementById("login-username").value;
      const password = document.getElementById("login-password").value;

      const res = await fetch(`${apiURL}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("user", JSON.stringify(data.user));
        window.location.href = "clothing.html"; // 👈 where to go after login
      } else {
        document.getElementById("auth-msg").textContent = data.message;
      }
    });
  }
});



//Reset outfit button functionality
document.addEventListener("DOMContentLoaded", () => {
  const resetBtn = document.getElementById("resetOutfitBtn");

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      const canvas = document.getElementById("outfit-canvas");
      if (canvas) {
        while (canvas.firstChild) {
          canvas.removeChild(canvas.firstChild);
        }
      }
      selectedClothingIds = []; 
    });
  }
});

window.addEventListener("DOMContentLoaded", () => {
  const uploadForm = document.getElementById("uploadForm");
  if (uploadForm) {
    uploadForm.addEventListener("submit", async (e) => {
      console.log("Form submitted"); 
      e.preventDefault();

      const formData = new FormData(uploadForm);
      const user = JSON.parse(localStorage.getItem("user"));
      if (user) {
        formData.append("userId", user.id);
      }

      const res = await fetch(`${apiURL}/clothing/upload`, {
        method: "POST",
        body: formData
      });

      const data = await res.json();
      alert(data.message);
    });
  }
});
