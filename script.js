const checklistSelector = ".home-page .up-next .items-list li, .deliveries-page .coming-up .items-list li";
const checkedItems = loadCheckedItems();

document.addEventListener("click", (event) => {
  const routeCard = event.target.closest("[data-route]");

  if (routeCard) {
    window.location.href = routeCard.dataset.route;
    return;
  }

  const mapsLabel = event.target.closest(".maps-label");

  if (mapsLabel) {
    openStopInMaps(mapsLabel);
    return;
  }

  const checklistItem = event.target.closest(checklistSelector);

  if (checklistItem) {
    toggleChecklistItem(checklistItem);
  }
});

document.querySelectorAll(".maps-label").forEach((mapsLabel) => {
  mapsLabel.setAttribute("role", "button");
  mapsLabel.setAttribute("tabindex", "0");
  mapsLabel.setAttribute("aria-label", "Open route in Google Maps");
});

document.querySelectorAll(checklistSelector).forEach((item) => {
  item.setAttribute("role", "checkbox");
  item.setAttribute("tabindex", "0");
  applyChecklistState(item, checkedItems.has(getChecklistKey(item)));
});

document.addEventListener("keydown", (event) => {
  const mapsLabel = event.target.closest(".maps-label");

  if (mapsLabel && (event.key === "Enter" || event.key === " ")) {
    event.preventDefault();
    openStopInMaps(mapsLabel);
    return;
  }

  const checklistItem = event.target.closest(checklistSelector);

  if (!checklistItem || (event.key !== "Enter" && event.key !== " ")) {
    return;
  }

  event.preventDefault();
  toggleChecklistItem(checklistItem);
});

function openStopInMaps(mapsLabel) {
  const stopCard = mapsLabel.closest(".stop-card");
  const addressText = stopCard?.querySelector(".meta-row span:last-child")?.textContent;
  const destination = addressText?.replace(/\s+/g, " ").trim();

  if (!destination) {
    return;
  }

  const mapsUrl = new URL("https://www.google.com/maps/dir/");
  mapsUrl.searchParams.set("api", "1");
  mapsUrl.searchParams.set("destination", destination);
  mapsUrl.searchParams.set("travelmode", "driving");

  window.location.href = mapsUrl.toString();
}

function toggleChecklistItem(item) {
  const key = getChecklistKey(item);
  const isChecked = !checkedItems.has(key);

  if (isChecked) {
    checkedItems.add(key);
  } else {
    checkedItems.delete(key);
  }

  saveCheckedItems();
  document.querySelectorAll(checklistSelector).forEach((currentItem) => {
    if (getChecklistKey(currentItem) === key) {
      applyChecklistState(currentItem, isChecked);
    }
  });
}

function applyChecklistState(item, isChecked) {
  item.classList.toggle("is-checked", isChecked);
  item.setAttribute("aria-checked", String(isChecked));
}

function getChecklistKey(item) {
  const stopCard = item.closest(".stop-card");
  const stopName = stopCard?.querySelector("h3")?.textContent ?? "";
  const productName = item.querySelector("span:not(.fake-check)")?.textContent ?? "";

  return `${normalizeKeyPart(stopName)}::${normalizeKeyPart(productName)}`;
}

function normalizeKeyPart(value) {
  return value.replace(/\s+/g, " ").trim().toLowerCase();
}

function loadCheckedItems() {
  try {
    return new Set(JSON.parse(localStorage.getItem("morningDropCheckedItems") ?? "[]"));
  } catch {
    return new Set();
  }
}

function saveCheckedItems() {
  localStorage.setItem("morningDropCheckedItems", JSON.stringify([...checkedItems]));
}
