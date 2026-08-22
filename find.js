// Read localStorage -> Display donations -> Search/filter -> Request Food -> Update status -> localStorage

const foodList = document.getElementById("foodList");
const searchFood = document.getElementById("searchFood");
const noResults = document.getElementById("noResults");

// Show all donations when the page first loads
displayFoodList(getDonations());

// Update results as the user types in the search bar
searchFood.addEventListener("input", function () {
  const searchTerm = searchFood.value.toLowerCase();

  const donations = getDonations();

  const filteredDonations = donations.filter(function (donation) {
    return (
      donation.foodName.toLowerCase().includes(searchTerm) ||
      donation.category.toLowerCase().includes(searchTerm) ||
      donation.location.toLowerCase().includes(searchTerm)
    );
  });

  displayFoodList(filteredDonations);
});

// Get donations from localStorage
function getDonations() {
  return JSON.parse(localStorage.getItem("donations")) || [];
}

// Save donations back to localStorage
function saveDonations(donations) {
  localStorage.setItem("donations", JSON.stringify(donations));
}

// Build and show donation cards on the Find page
function displayFoodList(donations) {
  foodList.innerHTML = "";

  if (donations.length === 0) {
    noResults.classList.remove("d-none");
    return;
  }

  noResults.classList.add("d-none");

  donations.forEach(function (donation) {
    const isRequested = donation.status === "Requested";
    const badgeClass = isRequested ? "badge-requested" : "badge-available";

    const buttonHTML = isRequested
      ? `<button class="btn btn-secondary w-100" disabled>Requested</button>`
      : `<button class="btn btn-fr-primary w-100" onclick="requestFood(${donation.id})">Request Food</button>`;

    const cardHTML = `
            <div class="col-md-6 col-lg-4">
                <div class="donation-card">
                    <h5>${donation.foodName}</h5>
                    <p class="mb-1"><strong>Category:</strong> ${donation.category}</p>
                    <p class="mb-1"><strong>Quantity:</strong> ${donation.quantity}</p>
                    <p class="mb-1"><strong>Location:</strong> ${donation.location}</p>
                    <p class="mb-1"><strong>Pickup:</strong> ${donation.pickup}</p>
                    <p class="mb-2"><strong>Expiry:</strong> ${donation.expiry}</p>
                    <span class="badge ${badgeClass} mb-3">${donation.status}</span>
                    ${buttonHTML}
                </div>
            </div>
        `;

    foodList.innerHTML += cardHTML;
  });
}

// Mark a donation as Requested and save it, so it survives a page refresh
function requestFood(id) {
  const donations = getDonations();

  donations.forEach(function (donation) {
    if (donation.id === id) {
      donation.status = "Requested";
    }
  });

  saveDonations(donations);

  // Refresh the list, keeping the current search applied
  const searchTerm = searchFood.value.toLowerCase();
  const filteredDonations = donations.filter(function (donation) {
    return (
      donation.foodName.toLowerCase().includes(searchTerm) ||
      donation.category.toLowerCase().includes(searchTerm) ||
      donation.location.toLowerCase().includes(searchTerm)
    );
  });

  displayFoodList(filteredDonations);
}
