// CSV data path (assuming it is in the same directory as the script)
const csvFilePath = './data/states-data.csv';

function changeImage(imageSrc) {
  document.getElementById('current-image').src = imageSrc;
}

// Fetch state data from JSON files (state names and abbreviations)
async function fetchStateData() {
  try {
    const stateDataResponse = await fetch('./data/stateData.json');
    const stateData = await stateDataResponse.json();

    const stateAbbreviationsResponse = await fetch('./data/stateAbbreviations.json');
    const stateAbbreviations = await stateAbbreviationsResponse.json();

    return { stateData, stateAbbreviations };
  } catch (error) {
    console.error('Error loading JSON data:', error);
    return { stateData: {}, stateAbbreviations: {} };
  }
}

// Function to fetch and parse the CSV file
async function fetchMortalityData() {
  try {
    const response = await fetch(csvFilePath);
    const data = await response.text();
    const parsedData = d3.csvParse(data); // Parse CSV data

    // Debugging: Log the parsed data to see the structure
    console.log(parsedData);

    return parsedData;
  } catch (error) {
    console.error('Error loading CSV data:', error);
    return [];
  }
}

async function generateGrid() {
  const container = document.querySelector('.grid-container');
  const { stateData, stateAbbreviations } = await fetchStateData(); // Fetch both JSON files
  const mortalityData = await fetchMortalityData();

  // Create a map of states to mortality rates, causes of death, abortion info, and baby mortality from the CSV data
  const stateMortalityMap = {};
  const stateMainCodMap = {}; // To store the main cause of death
  const stateAbortionMap = {}; // To store abortion-related data
  const stateBabyMortalityMap = {}; // To store baby mortality data (if applicable)

  mortalityData.forEach(row => {
    const state = row.State; // Adjust based on your CSV header (e.g., 'State', 'Mortality', etc.)
    const mortalityRate = row.Mortality ? parseFloat(row.Mortality) : null;
    const mainCause = row.Cause || 'N/A';
    const abortionInfo = row.Abortion || 'N/A';
    const babyMortalityRate = row.BabyMortalityRate || 'N/A'; // If baby mortality data is available in your CSV

    // Store the data in the maps
    stateMortalityMap[state] = mortalityRate;
    stateMainCodMap[state] = mainCause;
    stateAbortionMap[state] = abortionInfo;
    stateBabyMortalityMap[state] = babyMortalityRate;
  });

  // Calculate the min and max mortality rate for dynamic color scaling
  const mortalityRates = Object.values(stateMortalityMap).filter(rate => rate !== null);
  const minRate = Math.min(...mortalityRates);
  const maxRate = Math.max(...mortalityRates);

  // Create a color scale based on light brown to dark brown (using oranges palette)
  const brownScale = d3.scaleSequential(d3.interpolateReds).domain([minRate, maxRate]);

  // Generate 96 grid items (8x12)
  for (let i = 1; i <= 96; i++) {
    const gridItem = document.createElement('div');
    gridItem.classList.add('grid-item');

    // Find the state corresponding to this number (assuming stateData maps state names to numbers)
    const state = Object.keys(stateData).find(state => stateData[state] === i);

    if (state) {
      const mortalityRate = stateMortalityMap[state];

      // If mortality data exists, color using the brown scale
      if (mortalityRate !== undefined) {
        gridItem.style.backgroundColor = brownScale(mortalityRate);
      } else {
        // If no data for this state, color gray
        gridItem.style.backgroundColor = 'mauve';
      }

      // Add state abbreviation to the grid item
      const abbreviation = stateAbbreviations[state];
      gridItem.textContent = abbreviation;

      // Add click event to toggle detailed state information near the grid item
      gridItem.addEventListener('click', (event) => {
        const stateDetails = {
          fullName: state, // Full state name
          mortalityRate: mortalityRate || 'N/A',
          mainCod: stateMainCodMap[state], // Get the main cause of death
          abortionInfo: stateAbortionMap[state], // Abortion rate information
          babyMortalityRate: stateBabyMortalityMap[state], // Baby mortality rate
        };

        // Show or hide the state details near the clicked grid item
        toggleStateInfoNear(gridItem, stateDetails);
      });

      container.appendChild(gridItem); // Append the grid item
    } else {
      // If there's no state for this number, make it invisible (opacity 0)
      gridItem.style.opacity = '0'; // Hide the grid item
      container.appendChild(gridItem); // Still append to maintain grid structure
    }
  }
}

// Function to show or hide the state info near the clicked grid item (toggle behavior)
function toggleStateInfoNear(gridItem, stateDetails) {
  let detailsContainer = document.querySelector('.state-details-container');

  // Check if the clicked grid item already has an open details container
  const existingDetailsContainer = document.querySelector('.state-details-container');
  const isSameItem = existingDetailsContainer && existingDetailsContainer.dataset.state === stateDetails.fullName;

  if (isSameItem) {
    // If it's the same grid item, remove the details container
    existingDetailsContainer.remove();
    return;
  }

  // If the details container doesn't exist or it's a new item, create it
  if (!detailsContainer) {
    detailsContainer = document.createElement('div');
    detailsContainer.classList.add('state-details-container');
    detailsContainer.dataset.state = stateDetails.fullName; // Add a custom dataset to track which state this is
    document.body.appendChild(detailsContainer); // Append the details container to the body
  }

  // Clear the previous content in the details container
  detailsContainer.innerHTML = '';

  // Add the state details to the container, including the main cause of death, abortion info, and baby mortality
  detailsContainer.innerHTML = `
    <h3>${stateDetails.fullName}</h3>
    <p><strong>Mortality rate per 100k live births:</strong> ${stateDetails.mortalityRate}</p>
    <p><strong>Most common cause of maternal death:</strong> ${stateDetails.mainCod}</p> <!-- Show the main cause of death -->
    <p><strong>Abortion status:</strong> ${stateDetails.abortionInfo}</p> <!-- Show abortion info -->
  `;

  // Position the details container near the clicked grid item
  const gridItemRect = gridItem.getBoundingClientRect();
  detailsContainer.style.position = 'absolute';
  detailsContainer.style.left = `${gridItemRect.left + window.scrollX + gridItemRect.width}px`; // Position to the right of the clicked item
  detailsContainer.style.top = `${gridItemRect.top + window.scrollY}px`; // Align vertically

  // Optional: Close the details if clicked outside of it
  document.addEventListener('click', (e) => {
    if (!detailsContainer.contains(e.target) && e.target !== gridItem) {
      detailsContainer.remove();
    }
  });
}

// Call the function to generate the grid
generateGrid();
