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
  while (closet.firstChild) {
    closet.removeChild(closet.firstChild);
  }

  items.forEach(item => {
    const img = document.createElement("img");
    img.src = item.imageUrl;
    img.alt = item.name;
    img.draggable = true;
    img.dataset.id = item.id;
    img.classList.add("clothing-item");
    img.addEventListener("dragstart", drag);
    closet.appendChild(img);
  });

  if (typeof loadOutfits === "function") {
    loadOutfits();
  }
});
