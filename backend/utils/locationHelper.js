// Haversine formula to calculate distance between two coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 3959; // Earth's radius in miles
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
    Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}

function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

// Major US cities database (top cities by population)
const US_MAJOR_CITIES = [
  // Top 100 US cities
  { name: 'New York', state: 'NY', lat: 40.7128, lng: -74.0060 },
  { name: 'Los Angeles', state: 'CA', lat: 34.0522, lng: -118.2437 },
  { name: 'Chicago', state: 'IL', lat: 41.8781, lng: -87.6298 },
  { name: 'Houston', state: 'TX', lat: 29.7604, lng: -95.3698 },
  { name: 'Phoenix', state: 'AZ', lat: 33.4484, lng: -112.0740 },
  { name: 'Philadelphia', state: 'PA', lat: 39.9526, lng: -75.1652 },
  { name: 'San Antonio', state: 'TX', lat: 29.4241, lng: -98.4936 },
  { name: 'San Diego', state: 'CA', lat: 32.7157, lng: -117.1611 },
  { name: 'Dallas', state: 'TX', lat: 32.7767, lng: -96.7970 },
  { name: 'San Jose', state: 'CA', lat: 37.3382, lng: -121.8863 },

  // Florida cities
  { name: 'Miami', state: 'FL', lat: 25.7617, lng: -80.1918 },
  { name: 'Miami Beach', state: 'FL', lat: 25.7907, lng: -80.1300 },
  { name: 'Coral Gables', state: 'FL', lat: 25.7217, lng: -80.2683 },
  { name: 'Hialeah', state: 'FL', lat: 25.8576, lng: -80.2781 },
  { name: 'Hollywood', state: 'FL', lat: 26.0112, lng: -80.1495 },
  { name: 'Fort Lauderdale', state: 'FL', lat: 26.1224, lng: -80.1373 },
  { name: 'Pembroke Pines', state: 'FL', lat: 26.0034, lng: -80.2962 },
  { name: 'Miramar', state: 'FL', lat: 25.9873, lng: -80.3323 },
  { name: 'Pompano Beach', state: 'FL', lat: 26.2379, lng: -80.1248 },
  { name: 'Deerfield Beach', state: 'FL', lat: 26.3184, lng: -80.0998 },
  { name: 'Boca Raton', state: 'FL', lat: 26.3683, lng: -80.1289 },
  { name: 'Delray Beach', state: 'FL', lat: 26.4615, lng: -80.0728 },
  { name: 'West Palm Beach', state: 'FL', lat: 26.7153, lng: -80.0534 },
  { name: 'Jacksonville', state: 'FL', lat: 30.3322, lng: -81.6557 },
  { name: 'Tampa', state: 'FL', lat: 27.9506, lng: -82.4572 },
  { name: 'Orlando', state: 'FL', lat: 28.5383, lng: -81.3792 },
  { name: 'St. Petersburg', state: 'FL', lat: 27.7676, lng: -82.6403 },
  { name: 'Tallahassee', state: 'FL', lat: 30.4383, lng: -84.2807 },
  { name: 'Cape Coral', state: 'FL', lat: 26.5629, lng: -81.9495 },
  { name: 'Port St. Lucie', state: 'FL', lat: 27.2730, lng: -80.3582 },
  { name: 'Pembroke Park', state: 'FL', lat: 25.9859, lng: -80.1695 },
  { name: 'Aventura', state: 'FL', lat: 25.9565, lng: -80.1395 },
  { name: 'Sunny Isles Beach', state: 'FL', lat: 25.9429, lng: -80.1226 },
  { name: 'Hallandale Beach', state: 'FL', lat: 25.9812, lng: -80.1484 },
  { name: 'Kendall', state: 'FL', lat: 25.6790, lng: -80.3174 },
  { name: 'Homestead', state: 'FL', lat: 25.4687, lng: -80.4776 },
  { name: 'Cutler Bay', state: 'FL', lat: 25.5808, lng: -80.3468 },

  // Texas cities
  { name: 'Austin', state: 'TX', lat: 30.2672, lng: -97.7431 },
  { name: 'Fort Worth', state: 'TX', lat: 32.7555, lng: -97.3308 },
  { name: 'El Paso', state: 'TX', lat: 31.7619, lng: -106.4850 },
  { name: 'Arlington', state: 'TX', lat: 32.7357, lng: -97.1081 },
  { name: 'Corpus Christi', state: 'TX', lat: 27.8006, lng: -97.3964 },
  { name: 'Plano', state: 'TX', lat: 33.0198, lng: -96.6989 },

  // California cities
  { name: 'San Francisco', state: 'CA', lat: 37.7749, lng: -122.4194 },
  { name: 'Fresno', state: 'CA', lat: 36.7378, lng: -119.7871 },
  { name: 'Sacramento', state: 'CA', lat: 38.5816, lng: -121.4944 },
  { name: 'Long Beach', state: 'CA', lat: 33.7701, lng: -118.1937 },
  { name: 'Oakland', state: 'CA', lat: 37.8044, lng: -122.2712 },
  { name: 'Bakersfield', state: 'CA', lat: 35.3733, lng: -119.0187 },
  { name: 'Anaheim', state: 'CA', lat: 33.8366, lng: -117.9143 },
  { name: 'Santa Ana', state: 'CA', lat: 33.7455, lng: -117.8677 },
  { name: 'Riverside', state: 'CA', lat: 33.9533, lng: -117.3962 },
  { name: 'Stockton', state: 'CA', lat: 37.9577, lng: -121.2908 },

  // Other major cities
  { name: 'Indianapolis', state: 'IN', lat: 39.7684, lng: -86.1581 },
  { name: 'Columbus', state: 'OH', lat: 39.9612, lng: -82.9988 },
  { name: 'Charlotte', state: 'NC', lat: 35.2271, lng: -80.8431 },
  { name: 'Seattle', state: 'WA', lat: 47.6062, lng: -122.3321 },
  { name: 'Denver', state: 'CO', lat: 39.7392, lng: -104.9903 },
  { name: 'Washington', state: 'DC', lat: 38.9072, lng: -77.0369 },
  { name: 'Boston', state: 'MA', lat: 42.3601, lng: -71.0589 },
  { name: 'Nashville', state: 'TN', lat: 36.1627, lng: -86.7816 },
  { name: 'Memphis', state: 'TN', lat: 35.1495, lng: -90.0490 },
  { name: 'Portland', state: 'OR', lat: 45.5152, lng: -122.6784 },
  { name: 'Oklahoma City', state: 'OK', lat: 35.4676, lng: -97.5164 },
  { name: 'Las Vegas', state: 'NV', lat: 36.1699, lng: -115.1398 },
  { name: 'Louisville', state: 'KY', lat: 38.2527, lng: -85.7585 },
  { name: 'Baltimore', state: 'MD', lat: 39.2904, lng: -76.6122 },
  { name: 'Milwaukee', state: 'WI', lat: 43.0389, lng: -87.9065 },
  { name: 'Albuquerque', state: 'NM', lat: 35.0844, lng: -106.6504 },
  { name: 'Tucson', state: 'AZ', lat: 32.2226, lng: -110.9747 },
  { name: 'Mesa', state: 'AZ', lat: 33.4152, lng: -111.8315 },
  { name: 'Atlanta', state: 'GA', lat: 33.7490, lng: -84.3880 },
  { name: 'Colorado Springs', state: 'CO', lat: 38.8339, lng: -104.8214 },
  { name: 'Raleigh', state: 'NC', lat: 35.7796, lng: -78.6382 },
  { name: 'Virginia Beach', state: 'VA', lat: 36.8529, lng: -75.9780 },
  { name: 'Omaha', state: 'NE', lat: 41.2565, lng: -95.9345 },
  { name: 'Minneapolis', state: 'MN', lat: 44.9778, lng: -93.2650 },
  { name: 'Tulsa', state: 'OK', lat: 36.1540, lng: -95.9928 },
  { name: 'Cleveland', state: 'OH', lat: 41.4993, lng: -81.6944 },
  { name: 'Wichita', state: 'KS', lat: 37.6872, lng: -97.3301 },
  { name: 'New Orleans', state: 'LA', lat: 29.9511, lng: -90.0715 }
];

/**
 * Get surrounding cities within a specified radius
 * @param {number} lat - Latitude of the center point
 * @param {number} lng - Longitude of the center point
 * @param {number} radiusMiles - Radius in miles (default: 25)
 * @param {number} limit - Maximum number of cities to return (default: 10)
 * @returns {Array} Array of city objects with distance
 */
async function getSurroundingCities(lat, lng, radiusMiles = 25, limit = 10) {
  try {
    // Calculate distance to all cities
    const citiesWithDistance = US_MAJOR_CITIES.map(city => {
      const distance = calculateDistance(lat, lng, city.lat, city.lng);
      return {
        ...city,
        distance: Math.round(distance * 10) / 10 // Round to 1 decimal
      };
    });

    // Filter cities within radius
    const nearbyCities = citiesWithDistance.filter(
      city => city.distance <= radiusMiles
    );

    // Sort by distance (closest first)
    nearbyCities.sort((a, b) => a.distance - b.distance);

    // Return limited number of cities
    return nearbyCities.slice(0, limit);
  } catch (error) {
    console.error('Error getting surrounding cities:', error);
    return [];
  }
}

/**
 * Get the current city based on coordinates
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Object|null} City object or null
 */
function getCurrentCity(lat, lng) {
  let closestCity = null;
  let minDistance = Infinity;

  for (const city of US_MAJOR_CITIES) {
    const distance = calculateDistance(lat, lng, city.lat, city.lng);
    if (distance < minDistance) {
      minDistance = distance;
      closestCity = { ...city, distance: Math.round(distance * 10) / 10 };
    }
  }

  return closestCity;
}

/**
 * Get search variations for a keyword and city
 * @param {string} keyword - Search keyword (e.g., "Mexican food")
 * @param {string} city - City name
 * @param {string} state - State abbreviation (optional)
 * @returns {Array} Array of search query variations
 */
function getSearchVariations(keyword, city, state = '') {
  const variations = [
    `${keyword} in ${city}`,
    `${keyword} ${city}`,
    `best ${keyword} in ${city}`,
    `${keyword} near ${city}`,
    `top ${keyword} ${city}`
  ];

  // Add state variations if provided
  if (state) {
    variations.push(`${keyword} ${city} ${state}`);
    variations.push(`best ${keyword} ${city} ${state}`);
  }

  return variations;
}

module.exports = {
  calculateDistance,
  getSurroundingCities,
  getCurrentCity,
  getSearchVariations,
  US_MAJOR_CITIES
};
