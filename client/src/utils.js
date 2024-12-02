const SERVER_API_PATH = "http://localhost:5504/api/";

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

export async function query(endpoint, payload) {
  return await fetch(SERVER_API_PATH + endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}
