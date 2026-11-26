// A small C++ highlighter so lesson code can stay as plain strings.
// Colours: comments, strings, keywords, types, function names, numbers and
// punctuation each get their own class.

const KEYWORDS = "if|else|for|while|do|return|new|delete|break|continue|switch|case|default|throw|try|catch|const|static|auto|struct|class|public|private|template|typename|using|namespace|nullptr|true|false|this|sizeof";
const TYPES = "void|int|long|short|bool|char|double|float|unsigned|size_t|string|vector|list|map|set|pair|queue|stack|Node";

const TOKEN = new RegExp(
  [
    "(\\/\\/.*$)", // 1 comment
    '("(?:[^"\\\\]|\\\\.)*"|\'(?:[^\'\\\\]|\\\\.)*\')', // 2 string / char
    `\\b(${KEYWORDS})\\b`, // 3 keyword
    `\\b(${TYPES})\\b`, // 4 type
    "\\b([A-Za-z_]\\w*)(?=\\s*\\()", // 5 function name
    "\\b(\\d+(?:\\.\\d+)?)\\b", // 6 number
    "([{}()[\\];,<>=!&|+\\-*/%?:.^~]+)", // 7 punctuation
  ].join("|"),
  "g"
);

const CLASS_BY_GROUP = [null, "sp-comment", "sp-string", "sp-keyword", "sp-type", "sp-fn", "sp-number", "sp-symbol"];

export function highlight(line) {
  const parts = [];
  let last = 0;
  let match;

  TOKEN.lastIndex = 0;

  while ((match = TOKEN.exec(line)) !== null) {
    if (match[0] === "") {
      TOKEN.lastIndex++;
      continue;
    }
    if (match.index > last) parts.push(line.slice(last, match.index));

    const group = match.findIndex((m, i) => i > 0 && m !== undefined);
    parts.push(
      <span key={match.index} className={CLASS_BY_GROUP[group]}>
        {match[0]}
      </span>
    );

    last = match.index + match[0].length;
  }

  if (last < line.length) parts.push(line.slice(last));

  return parts;
}
