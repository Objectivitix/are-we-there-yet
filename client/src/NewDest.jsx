import { useState, useRef, useEffect } from "react";
import "./NewDest.css";

export default function NewDest({ onSubmit, onClose }) {
  const [input, setInput] = useState("");
  const dialogRef = useRef();

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  function handleSubmit() {
    const trimmed = input.trim();

    if (trimmed) {
      onSubmit(trimmed);
      setInput(""); // Clear input after submission
    }
  };

  return (
    <dialog ref={dialogRef} className="new-dest" onClose={onClose}>
      <p className="new-dest__title">New Destination</p>
      <input
        className="new-dest__input"
        type="text"
        placeholder="Where would you like to go?"
        value={input}
        onChange={(evt) => setInput(evt.target.value)}
      />
      <div className="new-dest__actions">
        <button className="new-dest__submit" onClick={handleSubmit}>
          Submit
        </button>
        <button className="new-dest__close" onClick={onClose}>
          Cancel
        </button>
      </div>
    </dialog>
  );
}
