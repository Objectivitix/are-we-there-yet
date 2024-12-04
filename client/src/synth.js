const synth = window.speechSynthesis;

export function speak(...text) {
  for (const segment of text) {
    const utterance = new SpeechSynthesisUtterance(segment);
    synth.speak(utterance);
  }
}

export function cancelAllUtterances() {
  synth.cancel();
}
