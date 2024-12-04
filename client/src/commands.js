const WAKEY_WAKEY = /(?:Hey|Hi|Hello|Yo) (?:Map|Matt)/;
const PLEASE = /(?: can you| could you| would you)?(?: please)?/;
const NAVIGATION = /(?: the)? (?:route|directions|trip|guidance|navigation)/;
const NEXT_STEP =
  /(?: the)? (?:next|upcoming|current|following) (?:step|turn|instruction|direction)/;

function hello(...regexps) {
  const arr = [WAKEY_WAKEY, ...regexps];
  return new RegExp(arr.map((regex) => regex.source).join(""), "i");
}

export default WAKEY_WAKEY;

export const BEGIN_NEW_NAVIGATION = [
  hello(PLEASE, / (?:navigate|direct|redirect|lead|guide|take|get)(?: me| us)? to (.+)/),
  hello(/ (?:I|we) (?:want to|wanna|would like to|need to|have to|got to) (?:go|get) to (.+)/),
  hello(/ how (?:do|does|can|will|would|could|should|may|might) (?:I|we|one) (?:go|get) to (.+)/),
  hello(PLEASE, / (?:show me the way|what's the way) to (.+)/),
  hello(/ how to (?:go|get) to (.+)/),
];

export const EXIT_NAVIGATION = [
  hello(
    /(?: (?:I|we) (?:want to|wanna|would like to|need to|have to|got to))?/,
    / (?:exit|clear|stop|end|cancel|close|halt)/,
    NAVIGATION,
  ),
  hello(PLEASE, / (?:exit|clear|stop|end|cancel|close|halt)/, NAVIGATION),
  hello(/ (?:I|we) (?:don't|no longer) (?:need|want|require)/, NAVIGATION),
];

export const REQUEST_UPDATE = [
  hello(/ are we there yet/),
  hello(/ give me an update/),
  hello(
    PLEASE,
    / (?:update me on|provide|give|give me|show|show me|say|repeat|restate|say again|tell me|tell me about|let me know|let me know about)/,
    NEXT_STEP,
  ),
  hello(/ (?:what's|what is)/, NEXT_STEP),
  hello(/ (?:what's|what is) (?:my|the|our) (?:ETA|travel time|distance)/),
  hello(
    / how much (?:further|longer|distance|time) (?:is|do we have|do I have|to) (?:left|remaining|to go)/,
  ),
  hello(/ how much (?:further|longer|distance|time) (?:until|till)/, NEXT_STEP),
  hello(
    / how (?:far|long|many meters|many more meters|many kilometers|many more kilometers) (?:until|till)/,
    NEXT_STEP,
  ),
];

export const DETAILED_LOOKAHEAD = [hello(/ what are my next (\w+) steps/)];

export const REQUEST_HELP = [hello(/ I need help/)];

const DIGIT_STRINGS = [
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
];

export function textToDigit(text) {
  return text.replace(new RegExp(DIGIT_STRINGS.join("|"), "gi"), (match) =>
    DIGIT_STRINGS.indexOf(match.toLowerCase()),
  );
}
