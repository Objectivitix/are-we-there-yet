const synth = window.speechSynthesis;

export default function speak(text) {
  const utterance = new SpeechSynthesisUtterance(text);

  window.speechSynthesis.speak(utterance);
}
