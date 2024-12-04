import "./Embed.css";

export default function Embed() {
  return (
    <div className="embed">
      <iframe
        className="embed__iframe"
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.835434509366!2d-122.41941518468113!3d37.77492967975939!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80858064cf1f4e4b%3A0x8e01bdfb3014d3c1!2sSan%20Francisco%2C%20CA!5e0!3m2!1sen!2sus!4v1699546644701!5m2!1sen!2sus"
        title="Google Maps Embed"
        allowFullScreen
      ></iframe>
    </div>
  );
}
