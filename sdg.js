// Read localStorage -> Calculate project impact
// Fetch food-security API -> JSON -> Display statistics -> Chart.js visualization

const countrySelect = document.getElementById("countrySelect");
const apiAlert = document.getElementById("apiAlert");
const undernourishmentStat = document.getElementById("undernourishmentStat");
const undernourishmentYear = document.getElementById("undernourishmentYear");

// Country data fetched from the API is stored here so we don't
// have to call the API again every time the dropdown changes.
let countryRecords = [];

// Run on page load
calculateImpact();
loadFoodSecurityData();

// When the user picks a different country, just re-read the data
// we already fetched, instead of calling the API again.
countrySelect.addEventListener("change", function () {
  showCountryStat(countrySelect.value);
});

// ---------------- Project Impact (from our own localStorage data) ----------------

function calculateImpact() {
  const donations = JSON.parse(localStorage.getItem("donations")) || [];

  let totalPortions = 0;
  let totalRequests = 0;

  donations.forEach(function (donation) {
    const qty = parseInt(donation.quantity);
    if (!isNaN(qty)) {
      totalPortions = totalPortions + qty;
    }
    if (donation.status === "Requested") {
      totalRequests = totalRequests + 1;
    }
  });

  document.getElementById("totalDonations").textContent = donations.length;
  document.getElementById("totalPortions").textContent = totalPortions;
  document.getElementById("totalRequests").textContent = totalRequests;
}

// ---------------- Global Food Security API ----------------
//
// Data source: World Bank Open Data API (no API key required).
// Indicator SN.ITK.DEFC.ZS = "Prevalence of undernourishment (% of population)".
// This indicator is itself sourced from the FAO, so it directly matches
// the SDG 2 (Zero Hunger) theme of this project.
//
// We ask for the most recent value (mrv=1) for a small fixed list of
// countries in a single request.

async function loadFoodSecurityData() {
  const countryCodes = "IND;USA;BRA;NGA;CHN;ZAF;BGD;KEN";
  const apiUrl =
    "https://api.worldbank.org/v2/country/" +
    countryCodes +
    "/indicator/SN.ITK.DEFC.ZS?format=json&mrv=1&per_page=50";

  try {
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error("API request failed");
    }

    const data = await response.json();

    // The World Bank API returns an array: [metadata, records]
    const records = data[1];

    if (!records) {
      throw new Error("No data returned");
    }

    countryRecords = records;

    // Data loaded successfully, so clear any earlier error message
    apiAlert.innerHTML = "";

    showCountryStat(countrySelect.value);
  } catch (error) {
    apiAlert.innerHTML =
      '<div class="alert alert-danger">Could not load food security data right now. Please try again later.</div>';
    return;
  }

  // Building the chart is kept in its own try/catch so that a chart
  // problem (for example, Chart.js not loading) never overwrites the
  // success message above with a misleading "could not load data" alert.
  try {
    buildChart(countryRecords);
  } catch (error) {
    console.error("Could not build the food security chart:", error);
    document.getElementById("chartError").innerHTML =
      '<div class="alert alert-danger">The chart could not be displayed, but the data above is still accurate.</div>';
  }
}

// Show the stat card for one country using the data we already fetched
function showCountryStat(countryCode) {
  let found = null;

  countryRecords.forEach(function (record) {
    if (record.countryiso3code === countryCode) {
      found = record;
    }
  });

  if (found === null || found.value === null) {
    undernourishmentStat.textContent = "N/A";
    undernourishmentYear.textContent = "Data not available for this country";
    return;
  }

  undernourishmentStat.textContent = found.value + "%";
  undernourishmentYear.textContent =
    "Year: " + found.date + " (World Bank / FAO data)";
}

// Build a simple bar chart comparing countries
function buildChart(records) {
  const labels = [];
  const values = [];

  records.forEach(function (record) {
    // Only include countries that actually have a published value,
    // so we never show a made-up number.
    if (record.value !== null) {
      labels.push(record.country.value);
      values.push(record.value);
    }
  });

  const ctx = document.getElementById("foodSecurityChart");

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Prevalence of Undernourishment (%)",
          data: values,
          backgroundColor: "#2f8f4e",
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
      },
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}
