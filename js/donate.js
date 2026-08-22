// Donation form -> Validation -> Create donation object -> localStorage -> Display donations

const donationForm = document.getElementById("donationForm");
const formAlert = document.getElementById("formAlert");
const donationsList = document.getElementById("donationsList");

// Run once the page loads so previously saved donations show up
displayDonations();

donationForm.addEventListener("submit", function (event) {
  event.preventDefault();

  // Get values from the form
  const foodName = document.getElementById("foodName").value.trim();
  const category = document.getElementById("category").value;
  const quantity = document.getElementById("quantity").value.trim();
  const location = document.getElementById("location").value.trim();
  const expiry = document.getElementById("expiry").value;
  const pickup = document.getElementById("pickup").value;

  // Basic validation - all fields must be filled
  if (
    foodName === "" ||
    category === "" ||
    quantity === "" ||
    location === "" ||
    expiry === "" ||
    pickup === ""
  ) {
    formAlert.innerHTML =
      '<div class="alert alert-danger">Please fill in all the fields.</div>';
    return;
  }

  // Create the donation object
  const donation = {
    id: Date.now(),
    foodName: foodName,
    category: category,
    quantity: quantity,
    location: location,
    expiry: expiry,
    pickup: pickup,
    status: "Available",
  };

  // Get existing donations, add the new one, and save back
  const donations = getDonations();
  donations.push(donation);
  saveDonations(donations);

  // Show success message
  formAlert.innerHTML =
    '<div class="alert alert-success">Donation listed successfully!</div>';

  // Reset the form
  donationForm.reset();

  // Refresh the list of donations shown on the page
  displayDonations();
});

// Get donations from localStorage (returns an empty array if none exist)
function getDonations() {
  return JSON.parse(localStorage.getItem("donations")) || [];
}

// Save donations array back to localStorage
function saveDonations(donations) {
  localStorage.setItem("donations", JSON.stringify(donations));
}

// Build and show donation cards on the Donate page
function displayDonations() {
  const donations = getDonations();

  donationsList.innerHTML = "";

  if (donations.length === 0) {
    donationsList.innerHTML =
      '<p class="text-center text-muted">You have not listed any donations yet.</p>';
    return;
  }

  donations.forEach(function (donation) {
    const badgeClass =
      donation.status === "Available" ? "badge-available" : "badge-requested";

    const cardHTML = `
            <div class="col-md-6 col-lg-4">
                <div class="donation-card">
                    <h5>${donation.foodName}</h5>
                    <p class="mb-1"><strong>Category:</strong> ${donation.category}</p>
                    <p class="mb-1"><strong>Quantity:</strong> ${donation.quantity}</p>
                    <p class="mb-1"><strong>Location:</strong> ${donation.location}</p>
                    <p class="mb-1"><strong>Pickup:</strong> ${donation.pickup}</p>
                    <p class="mb-2"><strong>Expiry:</strong> ${donation.expiry}</p>
                    <span class="badge ${badgeClass}">${donation.status}</span>
                </div>
            </div>
        `;

    donationsList.innerHTML += cardHTML;
  });
}
