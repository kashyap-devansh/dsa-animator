export function randomArray(size = 16) {
  const arr = [];

  for (let i = 0; i < size; i++) {
    arr.push(Math.floor(Math.random() * 90) + 10);
  }

  return arr;
}

export function sortedUniqueArray(size = 12) {
  const values = new Set();

  while (values.size < size) {
    values.add(Math.floor(Math.random() * 90) + 10);
  }

  return Array.from(values).sort((a, b) => a - b);
}

// Usually a value from the array so searches mostly succeed, sometimes a miss.
export function randomTarget(arr) {
  if (Math.random() < 0.8) return arr[Math.floor(Math.random() * arr.length)];

  let miss;
  do miss = Math.floor(Math.random() * 90) + 10;
  while (arr.includes(miss));

  return miss;
}
