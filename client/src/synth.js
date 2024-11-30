const synth = window.speechSynthesis;

export default function speak(text) {
  const utterance = new SpeechSynthesisUtterance(text);

  synth.speak(utterance);
}
