import "./Embed.css";

const UNSECURE_API_KEY = "AIzaSyDB1x0w6IiKtI0PhUUi0nEMZAgnsVKNlO4";
const DIRECTIONS_URL = "https://www.google.com/maps/embed/v1/directions";
const VIEW_URL = "https://www.google.com/maps/embed/v1/view";

function buildWaypointParam(waypoint) {
  if (waypoint?.location?.latLng) {
    const { latitude, longitude } = waypoint.location.latLng;
    return `${latitude},${longitude}`;
  }

  return waypoint;
};

export default function Embed({ origin, destination }) {
  let src;
  console.log(destination);

  if (origin && destination) {
    src = new URL(DIRECTIONS_URL);
    src.searchParams.set("origin", buildWaypointParam(origin));
    src.searchParams.set("destination", buildWaypointParam(destination));
  } else {
    src = new URL(VIEW_URL);
    src.searchParams.set("center", "45.3088,-75.8987");
    src.searchParams.set("zoom", 12);
  }

  src.searchParams.set("key", UNSECURE_API_KEY);

  return (
    <div className="embed">
      <iframe
        className="embed__iframe"
        src={src.toString()}
        referrerPolicy="no-referrer-when-downgrade"
        title="Google Maps Embed"
        allowFullScreen
      ></iframe>
    </div>
  );
}