const SERVER_API_PATH = "https://10.178.170.69:5504/api/";

export async function getUserLocation() {
  return await new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
    });
  });
}

export async function query(endpoint, payload) {
  return await fetch(SERVER_API_PATH + endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export const Waypoint = {
  withCoords(latitude, longitude) {
    return {
      location: {
        latLng: { latitude, longitude },
      },
    };
  },

  withAddress(address) {
    return { address };
  },
};

export function LocationBias(latitude, longitude, radius) {
  return {
    circle: {
      center: {
        latitude,
        longitude,
      },
      radius,
    },
  };
}
