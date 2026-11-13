// Colouring runs on every keystroke, so a pasted megabyte of text would make typing lag. Past this
// size the box still works, it just is not coloured. A real form description is a few kilobytes.
const MAX_HIGHLIGHTED_LENGTH = 100_000;

export { MAX_HIGHLIGHTED_LENGTH };
