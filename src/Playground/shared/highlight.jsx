// Tiny C++ highlighter so stepper pages can keep their code as plain strings.
const TOKEN = /(\/\/.*$)|\b(if|else|return|new|while|for|nullptr|true|false|break)\b|\b(Node|int|void|bool|long|vector|string)\b|\b(\d+)\b|([{}()[\];,<>=!&|+\-*%?:.]+)/g;

const CLASS_BY_GROUP = [null, "sp-comment", "sp-keyword", "sp-type", "sp-number", "sp-symbol"];

export function highlight(line) {
  const parts = [];
  let last = 0;
  let match;

  TOKEN.lastIndex = 0;

  while ((match = TOKEN.exec(line)) !== null) {
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
