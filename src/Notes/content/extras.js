// Depth added to every note, kept apart from the core text so it is easy to
// review:
//   example   a worked trace on a small input ({ input, cols, rows: [[…3 cells]] })
//             Traces for the sorts and searches were produced by running the
//             note's own code, so every row matches what the code really does.
//   why       one line per complexity case: what makes it that cost
//   use       { when: [...], avoid: [...] }
//   pitfalls  more common mistakes (appended to the note's own)
//   quiz      more questions (appended)

const SORT = ["Step", "Array after", "What happened"];
const SEARCH = ["Step", "Probe", "Decision"];

export const EXTRAS = {
  /* ---------- foundations ---------- */

  "big-o": {
    complexityRows: [
      ["Constant", "O(1)"],
      ["Logarithmic", "O(log n)"],
      ["Linearithmic", "O(n log n)"],
      ["Exponential", "O(2ⁿ)"],
    ],
    example: {
      input: "count the work() calls for n = 8",
      cols: ["Loop shape", "Calls at n = 8", "Grows like"],
      rows: [
        ["one loop to n", "8", "n → O(n)"],
        ["loop that halves n", "3", "log₂ 8 = 3 → O(log n)"],
        ["loop to n, inner loop doubling", "24", "8 × 3 → O(n log n)"],
        ["two nested loops to n", "64", "8 × 8 → O(n²)"],
        ["every subset of n items", "256", "2⁸ → O(2ⁿ)"],
      ],
    },
    use: {
      when: ["Comparing two algorithms before writing either.", "Predicting whether code will survive 10× more data."],
      avoid: ["Comparing algorithms of the same class on small inputs: constants and cache effects decide those.", "Treating O as exact time: O(n) can still be slower than O(n log n) at small n."],
    },
    pitfalls: ["O(n + m) is not O(n) when m can be much larger than n. Keep both variables when both can grow."],
    quiz: [
      {
        q: "A loop runs i = 1, 2, 4, 8, … while i < n. How many times does it run?",
        options: ["n", "n / 2", "About log₂ n", "√n"],
        answer: 2,
        why: "i doubles each time, so it reaches n after about log₂ n steps.",
      },
      {
        q: "Two loops run one after another, each to n. What is the total?",
        options: ["O(n²)", "O(2n) = O(n)", "O(log n)", "O(n log n)"],
        answer: 1,
        why: "Sequential loops add: n + n = 2n, and constants drop. Only nesting multiplies.",
      },
    ],
  },

  /* ---------- sorting ---------- */

  "bubble-sort": {
    example: {
      input: "[5, 2, 8, 1, 4]",
      cols: SORT,
      rows: [
        ["Pass 1", "[2, 5, 1, 4, 8]", "3 swaps; 8 bubbles to the end and is final"],
        ["Pass 2", "[2, 1, 4, 5, 8]", "2 swaps; 5 is final"],
        ["Pass 3", "[1, 2, 4, 5, 8]", "1 swap; 4 is final"],
        ["Pass 4", "[1, 2, 4, 5, 8]", "no swaps, so the flag stops the sort early"],
      ],
    },
    why: {
      best: "Already sorted: one pass of n − 1 comparisons, no swaps, then the flag stops it.",
      average: "About half of all pairs are out of order, and each one costs a swap.",
      worst: "Reversed input: every pair is out of order, n(n − 1)/2 swaps.",
      space: "Swaps happen in place; only a couple of loop variables.",
    },
    use: {
      when: ["Teaching what a swap, a pass and an invariant are.", "Tiny or almost-sorted arrays where the early exit kicks in."],
      avoid: ["Anything with more than a few hundred elements: insertion sort is just as simple and faster."],
    },
    quiz: [
      {
        q: "How many swaps does bubble sort make on [3, 2, 1]?",
        options: ["1", "2", "3", "6"],
        answer: 2,
        why: "Every pair is inverted: (3,2), (3,1), (2,1). Each inversion costs exactly one swap.",
      },
    ],
  },

  "selection-sort": {
    example: {
      input: "[5, 2, 8, 1, 4]",
      cols: SORT,
      rows: [
        ["i = 0", "[1, 2, 8, 5, 4]", "minimum 1 (index 3) swaps with 5"],
        ["i = 1", "[1, 2, 8, 5, 4]", "minimum 2 is already at index 1"],
        ["i = 2", "[1, 2, 4, 5, 8]", "minimum 4 (index 4) swaps with 8"],
        ["i = 3", "[1, 2, 4, 5, 8]", "minimum 5 is already at index 3; done"],
      ],
    },
    why: {
      best: "Even on sorted input, each pass must scan the whole suffix to be sure of its minimum.",
      average: "n − 1 + n − 2 + … + 1 comparisons regardless of the data.",
      worst: "Same count: the data never changes how many comparisons are made.",
      space: "Only the index of the current minimum is stored.",
    },
    use: {
      when: ["Writes are expensive (flash memory, large records): at most n − 1 swaps.", "You need a simple, predictable number of steps."],
      avoid: ["Nearly sorted data: unlike insertion sort, it gets no faster.", "You need stability."],
    },
    pitfalls: ["Starting the inner loop at i instead of i + 1 is harmless but wastes one comparison per pass; starting it at 0 breaks the sort."],
    quiz: [
      {
        q: "After 2 passes of selection sort on [4, 3, 1, 2], what is the array?",
        options: ["[1, 2, 4, 3]", "[1, 3, 4, 2]", "[3, 4, 1, 2]", "[1, 2, 3, 4]"],
        answer: 0,
        why: "Pass 1 swaps 1 to the front: [1, 3, 4, 2]. Pass 2 swaps 2 into index 1: [1, 2, 4, 3].",
      },
    ],
  },

  "insertion-sort": {
    example: {
      input: "[5, 2, 8, 1, 4]",
      cols: SORT,
      rows: [
        ["key = 2", "[2, 5, 8, 1, 4]", "5 shifts right; 2 drops into index 0"],
        ["key = 8", "[2, 5, 8, 1, 4]", "8 is bigger than everything before it: no shifts"],
        ["key = 1", "[1, 2, 5, 8, 4]", "8, 5, 2 shift right; 1 drops into index 0"],
        ["key = 4", "[1, 2, 4, 5, 8]", "8, 5 shift right; 4 drops into index 2"],
      ],
    },
    why: {
      best: "Sorted input: each key compares once with its left neighbour and stays put.",
      average: "Each key shifts past about half of the sorted prefix.",
      worst: "Reversed input: each key shifts past the entire prefix, n(n − 1)/2 shifts.",
      space: "Only the key being inserted is held aside.",
    },
    use: {
      when: ["Small arrays (libraries switch to it below ~16 elements).", "Data that is almost sorted, or arriving one item at a time."],
      avoid: ["Large random or reversed data."],
    },
    quiz: [
      {
        q: "How many shifts does insertion sort make on [2, 1, 3, 5, 4]?",
        options: ["0", "2", "4", "10"],
        answer: 1,
        why: "Shifts equal inversions: (2,1) and (5,4). Two shifts in total.",
      },
    ],
  },

  "merge-sort": {
    example: {
      input: "[5, 2, 8, 1, 4]",
      cols: ["Step", "Pieces", "Array after"],
      rows: [
        ["split", "[5, 2, 8] | [1, 4]", "halve until every piece has one element"],
        ["merge", "[5] + [2] → [2, 5]", "[2, 5, 8, 1, 4]"],
        ["merge", "[2, 5] + [8] → [2, 5, 8]", "[2, 5, 8, 1, 4]"],
        ["merge", "[1] + [4] → [1, 4]", "[2, 5, 8, 1, 4]"],
        ["merge", "[2, 5, 8] + [1, 4] → [1, 2, 4, 5, 8]", "[1, 2, 4, 5, 8]"],
      ],
    },
    why: {
      best: "It always splits all the way down and merges all the way up, sorted input or not.",
      average: "log n levels of halving, and each level merges n elements in total.",
      worst: "Same as average: the split never depends on the values.",
      space: "The merge needs a buffer as large as the range being merged.",
    },
    use: {
      when: ["You need a guaranteed O(n log n) and stability.", "Sorting linked lists (merging needs no random access) or data on disk (external sort)."],
      avoid: ["Memory is tight: quick sort or heap sort work in place."],
    },
    pitfalls: ["Computing mid as (lo + hi) / 2 can overflow on huge arrays; use lo + (hi − lo) / 2."],
    quiz: [
      {
        q: "How many levels of splitting does merge sort make on 16 elements?",
        options: ["2", "4", "8", "16"],
        answer: 1,
        why: "16 → 8 → 4 → 2 → 1: log₂ 16 = 4 levels.",
      },
    ],
  },

  "quick-sort": {
    example: {
      input: "[5, 2, 8, 1, 4], pivot = last element",
      cols: SORT,
      rows: [
        ["pivot 4", "[2, 1, 4, 5, 8]", "2 and 1 are smaller and move left; 4 lands at index 2, final"],
        ["pivot 1", "[1, 2, 4, 5, 8]", "left part [2, 1]: 1 lands at index 0"],
        ["pivot 8", "[1, 2, 4, 5, 8]", "right part [5, 8]: 8 lands at index 4; done"],
      ],
    },
    why: {
      best: "Every pivot splits its range in half: log n levels of O(n) partitioning.",
      average: "Random pivots split unevenly but well enough; the expected depth is still O(log n).",
      worst: "The pivot is always the smallest or largest: n levels, n + (n − 1) + … comparisons.",
      space: "The recursion stack: O(log n) deep with good pivots, O(n) in the worst case.",
    },
    use: {
      when: ["General-purpose in-memory sorting (std::sort is a quick sort hybrid).", "You want speed and in-place sorting more than stability."],
      avoid: ["Stability matters.", "Adversarial or already-sorted input with a fixed pivot choice."],
    },
    pitfalls: ["Many equal keys make Lomuto partition degrade towards O(n²); three-way partitioning fixes it."],
    quiz: [
      {
        q: "Partition [3, 7, 1, 6, 4] with the last element as pivot. Where does 4 end up?",
        options: ["Index 0", "Index 2", "Index 3", "Index 4"],
        answer: 1,
        why: "Only 3 and 1 are smaller than 4, so 4 lands right after them, at index 2.",
      },
    ],
  },

  "radix-sort": {
    example: {
      input: "[170, 45, 75, 90, 802, 24, 2, 66]",
      cols: ["Digit", "Array after", "What happened"],
      rows: [
        ["ones", "[170, 90, 802, 2, 24, 45, 75, 66]", "stable sort on the last digit"],
        ["tens", "[802, 2, 24, 45, 66, 170, 75, 90]", "stable sort on the middle digit (802 and 2 both have 0)"],
        ["hundreds", "[2, 24, 45, 66, 75, 90, 170, 802]", "stable sort on the first digit: sorted"],
      ],
    },
    why: {
      best: "Always d passes, each a counting sort over n values and k digit buckets.",
      average: "Same: the work depends on the number of digits, not on the order.",
      worst: "Same, but d grows with the largest value, so very large keys mean many passes.",
      space: "An output array of n plus k counters per pass.",
    },
    use: {
      when: ["Many integers or fixed-length strings (IDs, phone numbers, dates).", "Keys have few digits compared with log n."],
      avoid: ["Floating-point or variable-length keys without extra work.", "A small n, where the passes cost more than a comparison sort."],
    },
    quiz: [
      {
        q: "How many passes does LSD radix sort (base 10) make when the largest value is 4096?",
        options: ["3", "4", "10", "4096"],
        answer: 1,
        why: "4096 has four digits, so there is one pass for each: ones, tens, hundreds, thousands.",
      },
    ],
  },

  "bucket-sort": {
    example: {
      input: "[29, 25, 3, 49, 9, 37, 21, 43], k = 4 buckets",
      cols: ["Bucket", "Contents → sorted", "Range"],
      rows: [
        ["bucket 0", "[3, 9] → [3, 9]", "values 3–14"],
        ["bucket 1", "[25, 21] → [21, 25]", "values 15–26"],
        ["bucket 2", "[29, 37] → [29, 37]", "values 27–38"],
        ["bucket 3", "[49, 43] → [43, 49]", "values 39–49"],
        ["join", "[3, 9, 21, 25, 29, 37, 43, 49]", "read the buckets in order"],
      ],
    },
    why: {
      best: "Values spread evenly: each bucket gets about n / k items, so sorting them is cheap.",
      average: "With uniform data and k ≈ n, the expected size of every bucket is constant.",
      worst: "Everything lands in one bucket and the inner sort does all the work: O(n²) with insertion sort, O(n log n) with std::sort as written here.",
      space: "The k buckets together hold all n values.",
    },
    use: {
      when: ["Values are spread roughly evenly over a known range (e.g. random floats in [0, 1)).", "As the inner step of other sorts on uniform data."],
      avoid: ["Clustered or skewed data.", "When you don't know the range in advance."],
    },
    pitfalls: ["The textbook O(n²) worst case assumes insertion sort inside each bucket. With std::sort, as in this code, the worst case is O(n log n)."],
    quiz: [
      {
        q: "What does bucket sort's O(n + k) average assume about the input?",
        options: ["It is sorted", "It is uniformly distributed over the range", "It has no duplicates", "n is a power of two"],
        answer: 1,
        why: "Only uniform data guarantees that each bucket receives just a few values.",
      },
      {
        q: "With k = 4 buckets over the range 0–99, which bucket does 63 go into?",
        options: ["0", "1", "2", "3"],
        answer: 2,
        why: "63 · 4 / 100 = 2.52, which rounds down to bucket 2 (values 50–74).",
      },
    ],
  },

  "count-sort": {
    example: {
      input: "[4, 2, 2, 8, 3, 3, 1], k = 8",
      cols: ["Step", "count[] or output", "What it means"],
      rows: [
        ["count", "[0, 1, 2, 2, 1, 0, 0, 0, 1]", "count[v] = how many times v appears (index 0 … 8)"],
        ["prefix", "[0, 1, 3, 5, 6, 6, 6, 6, 7]", "count[v] = how many values are ≤ v"],
        ["place", "[1, 2, 2, 3, 3, 4, 8]", "walk right to left; x goes to index −−count[x]"],
      ],
    },
    why: {
      best: "One pass to count, one over the k counters, one to place: always n + k.",
      average: "Same three passes whatever the order.",
      worst: "Same: but a huge range k makes the counter pass dominate.",
      space: "k + 1 counters and an n-element output array.",
    },
    use: {
      when: ["Small integer ranges: marks out of 100, ages, letters.", "As the stable inner sort of radix sort."],
      avoid: ["A range much larger than n (sorting 10 values up to 10⁹)."],
    },
    quiz: [
      {
        q: "After the prefix step count[3] = 5. Walking right to left, the first 3 met goes to which index?",
        options: ["3", "4", "5", "2"],
        answer: 1,
        why: "It is placed at −−count[3] = 4, the last slot for 3s. The next 3 goes to index 3, which keeps the sort stable.",
      },
      {
        q: "Counting sort on a million exam marks between 0 and 100 takes about…",
        options: ["O(n log n)", "O(n²)", "O(n + 101), so effectively O(n)", "O(101²)"],
        answer: 2,
        why: "k = 101 is tiny next to n, so the n-sized passes dominate: linear time.",
      },
    ],
  },

  /* ---------- searching ---------- */

  "linear-search": {
    example: {
      input: "[3, 8, 12, 17, 21, 26, 30, 34, 41, 47], target 21",
      cols: SEARCH,
      rows: [
        ["i = 0 … 3", "3, 8, 12, 17", "none is 21, keep going"],
        ["i = 4", "a[4] = 21", "match: return 4"],
      ],
    },
    why: {
      best: "The target is the first element.",
      average: "A present target is equally likely anywhere: about n / 2 checks.",
      worst: "The target is last, or missing: all n elements are checked.",
      space: "Just the loop index.",
    },
    use: {
      when: ["Unsorted data you search once or rarely.", "Very small arrays, or linked lists where there is no random access."],
      avoid: ["Repeated searches on the same large data: sort once, then binary search, or use a hash table."],
    },
    pitfalls: ["Returning −1 inside the loop on the first mismatch: the search must only fail after checking everything."],
    quiz: [
      {
        q: "How many comparisons does linear search make for a missing target in 50 elements?",
        options: ["1", "25", "50", "6"],
        answer: 2,
        why: "It can only report 'not found' after checking all 50.",
      },
      {
        q: "Which can linear search do that binary search cannot?",
        options: ["Run in O(log n)", "Search unsorted data", "Use less memory", "Find the middle element"],
        answer: 1,
        why: "Linear search makes no assumption about order.",
      },
    ],
  },

  "binary-search": {
    example: {
      input: "[3, 8, 12, 17, 21, 26, 30, 34, 41, 47], target 34",
      cols: SEARCH,
      rows: [
        ["lo 0, hi 9", "mid 4 → 21", "21 < 34: discard the left half, lo = 5"],
        ["lo 5, hi 9", "mid 7 → 34", "found: return 7"],
      ],
    },
    why: {
      best: "The very first middle element is the target.",
      average: "Each comparison halves the range, so about log₂ n halvings are needed.",
      worst: "Missing target: the range halves until it is empty, ⌊log₂ n⌋ + 1 checks.",
      space: "The iterative version keeps only lo, hi and mid.",
    },
    use: {
      when: ["Sorted arrays searched many times.", "Any yes/no question that flips once over a range (\"binary search on the answer\")."],
      avoid: ["Unsorted data, or linked lists (finding the middle is O(n))."],
    },
    quiz: [
      {
        q: "Search for 5 in [1, 3, 5, 7, 9, 11, 13]. Which index is checked first?",
        options: ["0", "2", "3", "6"],
        answer: 2,
        why: "mid = 0 + (6 − 0) / 2 = 3, which holds 7. Then the search moves left.",
      },
    ],
  },

  "jump-search": {
    example: {
      input: "[3, 8, 12, 17, 21, 26, 30, 34, 41, 47], target 30, block ⌊√10⌋ = 3",
      cols: SEARCH,
      rows: [
        ["jump", "a[2] = 12", "< 30: the target is further on"],
        ["jump", "a[5] = 26", "< 30: jump again"],
        ["stop", "a[8] = 41", "≥ 30: the target, if present, is in [6, 8]"],
        ["scan", "a[6] = 30", "found: return 6"],
      ],
    },
    why: {
      best: "The target is the first element checked in the first block.",
      average: "About √n jumps to reach the block plus up to √n steps scanning it.",
      worst: "The target is at the end of the last block: n / √n + √n = 2√n steps.",
      space: "Just the block boundaries.",
    },
    use: {
      when: ["Sorted data where stepping backwards is expensive, so you want to go back only once."],
      avoid: ["Normal arrays with random access: binary search is faster (log n vs √n)."],
    },
    pitfalls: ["Any block size m works, but the cost n/m + m is only smallest at m = √n. A block of 10 on a million elements means 100,000 jumps."],
    quiz: [
      {
        q: "Roughly how many steps does jump search need in the worst case for n = 10,000?",
        options: ["14", "100", "200", "10,000"],
        answer: 2,
        why: "√10,000 = 100 jumps plus up to 100 scan steps: about 200.",
      },
      {
        q: "At most how many times does jump search move backwards?",
        options: ["0", "1", "√n", "log n"],
        answer: 1,
        why: "Once: after overshooting, it steps back to the start of the block and only scans forwards.",
      },
    ],
  },

  "interpolation-search": {
    example: {
      input: "[3, 8, 12, 17, 21, 26, 30, 34, 41, 47], target 30",
      cols: SEARCH,
      rows: [
        ["lo 0, hi 9", "pos = 0 + (30 − 3)·9 / (47 − 3) = 5", "a[5] = 26 < 30: lo = 6"],
        ["lo 6, hi 9", "pos = 6 + (30 − 30)·3 / (47 − 30) = 6", "a[6] = 30: found in two probes"],
      ],
    },
    why: {
      best: "The first estimate lands exactly on the target.",
      average: "On uniform data each estimate shrinks the range to about √n: O(log log n) probes.",
      worst: "Skewed values make every estimate land near one end, removing one element per probe.",
      space: "Only lo, hi and pos.",
    },
    use: {
      when: ["Large sorted arrays of evenly spread numbers (IDs, timestamps)."],
      avoid: ["Skewed or clustered values.", "Small arrays, where the extra arithmetic doesn't pay off."],
    },
    quiz: [
      {
        q: "In [10, 20, 30, …, 100], where is the first probe for target 70?",
        options: ["Index 4", "Index 6", "Index 7", "Index 9"],
        answer: 1,
        why: "pos = 0 + (70 − 10)·9 / (100 − 10) = 6, which is exactly where 70 sits.",
      },
      {
        q: "What must the code rule out before computing pos?",
        options: ["lo == 0", "a[hi] == a[lo], which would divide by zero", "An even array length", "Negative targets"],
        answer: 1,
        why: "The formula divides by a[hi] − a[lo]. When the range holds equal values, it must be handled on its own.",
      },
    ],
  },

  "median-search": {
    example: {
      input: "[6, 9, 1, 8, 3, 7, 2], k = 3 (the median)",
      cols: ["Pivot", "Array after", "Decision"],
      rows: [
        ["pivot 2", "[1, 2, 6, 8, 3, 7, 9]", "lands at index 1; k = 3 is to the right"],
        ["pivot 9", "[1, 2, 6, 8, 3, 7, 9]", "lands at index 6; k = 3 is to the left"],
        ["pivot 7", "[1, 2, 6, 3, 7, 8, 9]", "lands at index 4; k = 3 is to the left"],
        ["pivot 3", "[1, 2, 3, 6, 7, 8, 9]", "lands at index 2; k = 3 is to the right"],
        ["pivot 6", "[1, 2, 3, 6, 7, 8, 9]", "lands at index 3 = k: the median is 6"],
      ],
    },
    why: {
      best: "The first pivot lands exactly at k: one partition of n elements.",
      average: "Each partition discards a constant fraction: n + n/2 + n/4 + … ≈ 2n.",
      worst: "Pivots keep landing at the far end (as with 2 and 9 above), removing one element each time.",
      space: "The loop version needs no recursion stack.",
    },
    use: {
      when: ["You need the median, a percentile or the k smallest items, not a full sort."],
      avoid: ["You must not reorder the input (copy it first).", "You need guaranteed O(n): use median of medians or a random pivot."],
    },
    pitfalls: ["The worst case above comes from the fixed last-element pivot; picking the pivot at random makes it vanishingly unlikely."],
    quiz: [
      {
        q: "To find the median of 9 elements with 0-based k, which k do you ask for?",
        options: ["k = 3", "k = 4", "k = 5", "k = 9"],
        answer: 1,
        why: "The median is the 5th smallest, which is index 4 when counting from 0.",
      },
      {
        q: "Quickselect partitions with pivot p landing at index 6, and k = 2. What next?",
        options: ["Search [0, 5]", "Search [7, n − 1]", "Return a[6]", "Sort both sides"],
        answer: 0,
        why: "k is left of the pivot's final position, so only the left part can contain it.",
      },
    ],
  },

  "exponential-search": {
    example: {
      input: "[3, 8, 12, 17, 21, 26, 30, 34, 41, 47], target 30",
      cols: SEARCH,
      rows: [
        ["check 0", "a[0] = 3", "not the target"],
        ["double", "a[1] = 8, a[2] = 12, a[4] = 21", "all ≤ 30: keep doubling i"],
        ["stop", "a[8] = 41", "> 30: the target is in [4, 8]"],
        ["binary", "mid 6 → 30", "found: return 6"],
      ],
    },
    why: {
      best: "The target is at index 0.",
      average: "About log i doublings to pass the target at index i, then a binary search over a range of size i.",
      worst: "The target is near the end: both phases are O(log n).",
      space: "A handful of indices.",
    },
    use: {
      when: ["Sorted data of unknown or unbounded length (streams, infinite lists).", "Targets likely near the front."],
      avoid: ["Small arrays of known length: plain binary search is simpler."],
    },
    pitfalls: ["The code calls a range version, binarySearch(a, lo, hi, target): the same loop as the binary search note, but starting from the given lo and hi instead of 0 and n − 1."],
    quiz: [
      {
        q: "The target is at index 100. What range does the binary search phase cover?",
        options: ["[0, 100]", "[64, 128]", "[50, 100]", "[100, 200]"],
        answer: 1,
        why: "i doubles to 64 (still ≤ target) and then 128 (past it), so the range is [64, 128].",
      },
      {
        q: "The target sits at index i in a huge sorted array. Exponential search costs…",
        options: ["O(i)", "O(log i)", "O(log n) always", "O(√i)"],
        answer: 1,
        why: "About log i doublings to pass it, then a binary search over a range of size about i.",
      },
    ],
  },

  "fibonacci-search": {
    example: {
      input: "[3, 8, 12, 17, 21, 26, 30, 34, 41, 47], target 30",
      cols: SEARCH,
      rows: [
        ["setup", "F = 13, 8, 5", "13 is the smallest Fibonacci number ≥ 10"],
        ["probe 4", "a[4] = 21", "< 30: offset = 4, step down one Fibonacci number"],
        ["probe 7", "a[7] = 34", "> 30: step down two Fibonacci numbers"],
        ["probe 5", "a[5] = 26", "< 30: offset = 5, step down one"],
        ["probe 6", "a[6] = 30", "found: return 6"],
      ],
    },
    why: {
      best: "The first probe hits the target.",
      average: "Each probe shrinks the range to about 62% or 38% of its size: O(log n) probes.",
      worst: "Still O(log n), with about 1.44 log₂ n probes in the worst case.",
      space: "Three Fibonacci numbers and an offset.",
    },
    use: {
      when: ["Hardware where division is slow, or when probes near the front are cheaper."],
      avoid: ["Ordinary code on modern CPUs: binary search is simpler and just as fast."],
    },
    pitfalls: ["Starting offset at 0 instead of −1 shifts every probe one place right, and the first element can never be found."],
    quiz: [
      {
        q: "For an array of 20 elements, which Fibonacci number does the search start from?",
        options: ["13", "21", "34", "20"],
        answer: 1,
        why: "It needs the smallest Fibonacci number ≥ 20, which is 21.",
      },
      {
        q: "When a[i] > target, the remaining range has how many elements?",
        options: ["F(m − 1)", "F(m − 2)", "Half the range", "F(m)"],
        answer: 1,
        why: "The search moves down two Fibonacci numbers: the left part, of F(m − 2) elements, is kept.",
      },
    ],
  },

  /* ---------- hashing ---------- */

  "hash-tables": {
    example: {
      input: "m = 10, h(k) = k mod 10, linear probing; insert 15, 25, 35, 7, 45",
      cols: ["Insert", "Probe sequence", "Lands in"],
      rows: [
        ["15", "5", "slot 5"],
        ["25", "5 → 6", "slot 6 (collision with 15)"],
        ["35", "5 → 6 → 7", "slot 7"],
        ["7", "7 → 8", "slot 8: it never hashed to 5, but the cluster pushed it on"],
        ["45", "5 → 6 → 7 → 8 → 9", "slot 9, after 4 collisions"],
      ],
    },
    why: {
      best: "The key's slot is free (or its chain is empty): one hash, one access.",
      average: "With load factor α, a chain or probe run has expected length about 1 + α.",
      worst: "Every key collides into one chain or one cluster: the table degrades to a list.",
      space: "m slots plus the n stored keys (and chain nodes).",
    },
    use: {
      when: ["Fast lookup, insert and delete by key: dictionaries, caches, counting, deduplication."],
      avoid: ["You need keys in sorted order or range queries: use a balanced BST (std::map).", "Worst-case guarantees matter more than average speed."],
    },
    quiz: [
      {
        q: "In the worked example, why did 7 end up in slot 8 although 7 mod 10 = 7?",
        options: ["The hash function is wrong", "Slot 7 was taken by 35's probe run", "7 is odd", "The table was full"],
        answer: 1,
        why: "35 had already probed into slot 7. That is primary clustering: unrelated keys collide with the cluster.",
      },
    ],
  },

  /* ---------- linear structures ---------- */

  arrays: {
    facts: [
      { label: "Memory", value: "One contiguous block" },
      { label: "Cache", value: "Very friendly" },
      { label: "C++", value: "array / vector" },
    ],
    complexityRows: [
      ["Access by index", "O(1)"],
      ["Insert / delete at end", "O(1)"],
      ["Insert / delete middle", "O(n)"],
      ["Space", "O(n)"],
    ],
    example: {
      input: "insert 9 at index 1 into [4, 7, 2, 5]",
      cols: ["Step", "Array", "What happened"],
      rows: [
        ["grow", "[4, 7, 2, 5, _]", "make room for one more element"],
        ["shift", "[4, 7, 2, 5, 5]", "a[4] = a[3], working from the back"],
        ["shift", "[4, 7, 2, 2, 5]", "a[3] = a[2]"],
        ["shift", "[4, 7, 7, 2, 5]", "a[2] = a[1]; index 1 is now free to overwrite"],
        ["write", "[4, 9, 7, 2, 5]", "a[1] = 9: 3 shifts for n − k = 3 elements"],
      ],
    },
    use: {
      when: ["You access by position a lot, or iterate in order (cache-friendly).", "The size is known or grows at the end."],
      avoid: ["Frequent inserts and deletes at the front or middle."],
    },
    pitfalls: [
      "Off-by-one bounds: valid indices are 0 … n − 1, and a[n] is outside the array.",
      "vector::push_back is O(1) only amortised: an occasional resize copies everything.",
    ],
    quiz: [
      {
        q: "Deleting the element at index 2 from an array of 10 elements needs how many shifts?",
        options: ["2", "7", "8", "10"],
        answer: 1,
        why: "Elements at indices 3 … 9 (seven of them) each move one slot left.",
      },
      {
        q: "Why is a[i] O(1)?",
        options: ["Arrays are sorted", "The address is base + i × size", "The CPU caches everything", "Arrays are small"],
        answer: 1,
        why: "One multiplication and one addition give the address, whatever i is.",
      },
    ],
  },

  "linked-list": {
    facts: [
      { label: "Memory", value: "Nodes scattered on the heap" },
      { label: "Per node", value: "Value + next pointer" },
      { label: "C++", value: "forward_list / list" },
    ],
    complexityRows: [
      ["Insert / delete head", "O(1)"],
      ["Access k-th node", "O(k)"],
      ["Insert / delete tail", "O(n)"],
      ["Space", "O(n)"],
    ],
    example: {
      input: "insert 9 at position 2 into 4 → 7 → 2 → null",
      cols: ["Step", "Pointers", "What happened"],
      rows: [
        ["create", "node(9) → null", "new node, not yet linked"],
        ["walk", "cur = 4, then cur = 7", "stop at position 1, just before the spot"],
        ["link", "9 → 2", "node->next = cur->next: the new node points at the rest"],
        ["hook", "7 → 9", "cur->next = node: the list now reaches 9"],
        ["result", "4 → 7 → 9 → 2 → null", "two pointer writes, nothing shifted"],
      ],
    },
    use: {
      when: ["Frequent inserts and deletes at known positions, or at the front.", "Building stacks, queues and adjacency lists."],
      avoid: ["Random access by index.", "Tight memory or cache-sensitive loops: pointer chasing is slow."],
    },
    quiz: [
      {
        q: "Deleting node B from A → B → C needs which single pointer change?",
        options: ["B->next = A", "A->next = C", "C->next = A", "head = C"],
        answer: 1,
        why: "A now skips straight to C, and B can be freed.",
      },
    ],
  },

  stack: {
    example: {
      input: "push 3, push 8, pop, push 5, peek",
      cols: ["Operation", "Stack (bottom → top)", "top / result"],
      rows: [
        ["push 3", "[3]", "top = 0"],
        ["push 8", "[3, 8]", "top = 1"],
        ["pop", "[3]", "returns 8, top = 0"],
        ["push 5", "[3, 5]", "top = 1"],
        ["peek", "[3, 5]", "returns 5, nothing removed"],
      ],
    },
    why: {
      best: "Push and pop touch only the top.",
      average: "Same: no searching or shifting.",
      worst: "Same for an array stack. A growing vector occasionally copies, but that is O(1) amortised.",
      space: "One slot per element.",
    },
    use: {
      when: ["Undo, back buttons, matching brackets, expression evaluation, DFS, recursion by hand."],
      avoid: ["You need to reach items in the middle or at the bottom."],
    },
    pitfalls: ["With a fixed array, pushing onto a full stack overwrites memory past the end unless you check top == MAX − 1."],
    quiz: [
      {
        q: "Checking \"( [ ) ]\" for balanced brackets with a stack: what goes wrong?",
        options: ["Nothing, it is balanced", "')' meets '[' on top: mismatch", "The stack overflows", "']' is never pushed"],
        answer: 1,
        why: "When ')' arrives the top of the stack is '[', which doesn't match, so the string is unbalanced.",
      },
      {
        q: "Evaluate the postfix expression 2 3 4 * + with a stack.",
        options: ["20", "14", "24", "9"],
        answer: 1,
        why: "Push 2, 3, 4; '*' pops 3 and 4 and pushes 12; '+' pops 2 and 12 and pushes 14.",
      },
    ],
  },

  queue: {
    example: {
      input: "circular queue, CAP = 4: enqueue A, B, C, dequeue, enqueue D, E",
      cols: ["Operation", "Slots [0 1 2 3]", "front / rear / size"],
      rows: [
        ["enqueue A, B, C", "[A B C _]", "0 / 2 / 3"],
        ["dequeue", "[_ B C _]", "returns A; 1 / 2 / 2"],
        ["enqueue D", "[_ B C D]", "1 / 3 / 3"],
        ["enqueue E", "[E B C D]", "rear wraps to 0: 1 / 0 / 4, full"],
      ],
    },
    why: {
      best: "Enqueue and dequeue each move one index.",
      average: "Same: the % wrap-around reuses freed slots without shifting.",
      worst: "Same for a circular buffer. A naive array queue that shifts on dequeue is O(n).",
      space: "CAP slots, used or not.",
    },
    use: {
      when: ["Processing in arrival order: BFS, print jobs, task scheduling, buffering streams."],
      avoid: ["You need the smallest or most urgent item first: use a priority queue (heap)."],
    },
    pitfalls: ["Dequeuing by shifting every element left makes each dequeue O(n). Move the front index instead."],
    quiz: [
      {
        q: "In a circular queue with CAP = 5, rear = 4. Where does the next enqueue go?",
        options: ["Index 5", "Index 0", "Index 4", "It overflows"],
        answer: 1,
        why: "rear = (4 + 1) % 5 = 0, provided the queue is not full.",
      },
      {
        q: "Which traversal uses a queue?",
        options: ["Depth-first search", "Breadth-first search", "In-order traversal", "Binary search"],
        answer: 1,
        why: "BFS visits nodes level by level, in the order they were discovered: first in, first out.",
      },
    ],
  },

  /* ---------- trees ---------- */

  bst: {
    example: {
      input: "insert 50, 30, 70, 20, 40, 60, 80, then delete 50",
      cols: ["Step", "Tree (in-order)", "What happened"],
      rows: [
        ["insert 50, 30, 70", "30 · 50 · 70", "50 is the root; 30 goes left, 70 right"],
        ["insert 20, 40", "20 · 30 · 40 · 50 · 70", "both are less than 50, so they go to 30's children"],
        ["insert 60, 80", "20 · 30 · 40 · 50 · 60 · 70 · 80", "a perfectly balanced tree of height 3"],
        ["delete 50", "two children", "its successor is the leftmost node of the right subtree: 60"],
        ["copy and remove", "20 · 30 · 40 · 60 · 70 · 80", "60 replaces 50 at the root; the old 60 leaf is removed"],
      ],
    },
    why: {
      best: "The key is at the root.",
      average: "Random insert orders keep the average node depth near 1.39 log₂ n, so paths are short.",
      worst: "Sorted inserts build a chain of height n: every operation walks all of it.",
      space: "One node per key, plus O(h) recursion stack.",
    },
    use: {
      when: ["Ordered data with inserts and deletes: sorted output, range queries, nearest key."],
      avoid: ["Input that may arrive sorted: use a self-balancing tree (AVL, red-black) instead."],
    },
    pitfalls: ["Inserting a duplicate key: decide up front whether to ignore it, count it, or always send it one way."],
    quiz: [
      {
        q: "What is the in-order traversal of the BST built by inserting 8, 3, 10, 1, 6?",
        options: ["8, 3, 10, 1, 6", "1, 3, 6, 8, 10", "1, 6, 3, 10, 8", "8, 3, 1, 6, 10"],
        answer: 1,
        why: "In-order traversal of any BST visits the keys in sorted order.",
      },
    ],
  },

  "avl-tree": {
    example: {
      input: "insert 10, 20, 30, 25, 27",
      cols: ["Insert", "Tree after", "Fix"],
      rows: [
        ["10, 20", "10 → right 20", "balance factor of 10 is −1: still allowed"],
        ["30", "20 (10, 30)", "10 hits −2 with a right-heavy right child: RR, rotate left at 10"],
        ["25", "20 (10, 30 (25, ·))", "every balance factor is within ±1"],
        ["27", "20 (10, 27 (25, 30))", "30 hits +2 with a right-heavy left child: LR, rotate 25 left, then 30 right"],
      ],
    },
    why: {
      best: "Even the best case walks a root-to-leaf path, which is O(log n) long.",
      average: "The balance rule keeps the height under about 1.44 log₂ n.",
      worst: "Same bound: rotations stop the tree from ever becoming a chain.",
      space: "One node per key plus a stored height.",
    },
    use: {
      when: ["Ordered data with guaranteed O(log n) operations, especially read-heavy workloads."],
      avoid: ["Very write-heavy workloads, where red-black trees do fewer rotations.", "Unordered lookups only: a hash table is simpler and faster."],
    },
    quiz: [
      {
        q: "A node has a left subtree of height 3 and a right subtree of height 1. Is it AVL-balanced?",
        options: ["Yes, bf = 2 is allowed", "No, bf = +2 needs a rotation", "Yes, only leaves matter", "It depends on the root"],
        answer: 1,
        why: "The balance factor is 3 − 1 = +2, outside −1 … +1.",
      },
    ],
  },

  /* ---------- recursion ---------- */

  factorial: {
    example: {
      input: "factorial(4)",
      cols: ["Frame", "Waits on", "Returns"],
      rows: [
        ["factorial(4)", "4 × factorial(3)", "4 × 6 = 24"],
        ["factorial(3)", "3 × factorial(2)", "3 × 2 = 6"],
        ["factorial(2)", "2 × factorial(1)", "2 × 1 = 2"],
        ["factorial(1)", "nothing: base case", "1"],
      ],
    },
    why: {
      best: "Every call reduces n by one until the base case: n calls.",
      average: "The same n calls, each doing one multiplication.",
      worst: "The same.",
      space: "n frames are on the call stack at the deepest point.",
    },
    use: {
      when: ["Learning recursion: the call stack and the unwinding are easy to follow."],
      avoid: ["Production code: a simple loop computes n! in O(1) space."],
    },
    quiz: [
      {
        q: "factorial(0) with the code shown returns…",
        options: ["0", "1", "It recurses forever", "−1"],
        answer: 1,
        why: "n ≤ 1 is the base case, and 0! is defined as 1.",
      },
      {
        q: "What happens if you change the base case to n == 1 and call factorial(0)?",
        options: ["Returns 1", "Returns 0", "Recurses past 0 forever: stack overflow", "Compile error"],
        answer: 2,
        why: "0 never equals 1, so it calls −1, −2, … until the stack runs out.",
      },
    ],
  },

  "tower-of-hanoi": {
    example: {
      input: "3 disks from A to C (B spare): 7 moves",
      cols: ["Move", "Disk", "Why"],
      rows: [
        ["1–3", "1: A→C, 2: A→B, 1: C→B", "move the top two disks out of the way, onto B"],
        ["4", "3: A→C", "the biggest disk goes straight to its target"],
        ["5–7", "1: B→A, 2: B→C, 1: A→C", "move the two disks from B on top of it"],
      ],
    },
    why: {
      best: "There is no shortcut: every solution needs at least 2ⁿ − 1 moves.",
      average: "Each extra disk doubles the work and adds one move.",
      worst: "The same 2ⁿ − 1.",
      space: "The recursion is n calls deep.",
    },
    use: {
      when: ["Understanding how trusting the recursive call solves a problem you can't plan move by move."],
      avoid: ["Expecting it to finish for large n: 30 disks is already over a billion moves."],
    },
    pitfalls: ["Printing the move before or after both recursive calls. The big disk moves between them: clear the way, move it, then rebuild on top."],
    quiz: [
      {
        q: "In the 3-disk solution, which move is the 4th?",
        options: ["Disk 1 A → C", "Disk 3 A → C", "Disk 2 B → C", "Disk 1 B → A"],
        answer: 1,
        why: "The 2² − 1 = 3 moves before it clear the top two disks, so move 4 is the big disk.",
      },
      {
        q: "How many times does the smallest disk move when solving with n disks?",
        options: ["n", "2ⁿ⁻¹", "2ⁿ − 1", "1"],
        answer: 1,
        why: "It moves every other move: 2ⁿ⁻¹ times (4 of the 7 moves for n = 3).",
      },
    ],
  },

  "fibonacci-sequence": {
    complexityRows: [
      ["Naive recursion", "O(2ⁿ)"],
      ["Memoized", "O(n)"],
      ["Bottom-up DP", "O(n)"],
      ["Space (memo)", "O(n)"],
    ],
    example: {
      input: "fib(5)",
      cols: ["Version", "Calls made", "Why"],
      rows: [
        ["naive", "15", "fib(3) is computed 2 times, fib(2) 3 times, fib(1) 5 times"],
        ["memoized", "9", "each fib(k) is computed once; repeated calls are table lookups"],
        ["bottom-up", "0 calls, 4 additions", "dp[2] … dp[5] filled left to right"],
      ],
    },
    use: {
      when: ["Introducing dynamic programming: the same idea solves knapsack, edit distance and many more."],
      avoid: ["Naive recursion beyond n ≈ 40: it takes seconds, then minutes."],
    },
    pitfalls: ["fib(93) overflows a 64-bit signed integer. Use unsigned or a bigint, or reduce modulo something."],
    quiz: [
      {
        q: "How many calls does naive fib(5) make in total?",
        options: ["5", "9", "15", "32"],
        answer: 2,
        why: "calls(n) = calls(n − 1) + calls(n − 2) + 1 with calls(0) = calls(1) = 1, giving 15 for n = 5.",
      },
      {
        q: "Bottom-up fib only ever needs which values to compute the next one?",
        options: ["All earlier values", "The last two", "Only the last one", "None"],
        answer: 1,
        why: "fib(n) = fib(n − 1) + fib(n − 2), so two variables are enough: O(1) space.",
      },
    ],
  },

  permutations: {
    example: {
      input: "[1, 2, 3] with the swap method",
      cols: ["Choice for position 0", "Then permute the rest", "Results"],
      rows: [
        ["swap a[0], a[0] → 1", "[2, 3] gives 23, 32", "123, 132"],
        ["swap a[0], a[1] → 2", "[1, 3] gives 13, 31", "213, 231"],
        ["swap a[0], a[2] → 3", "[2, 1] gives 21, 12", "321, 312"],
      ],
    },
    why: {
      best: "Every one of the n! orderings is produced, and printing each costs n.",
      average: "The same: the recursion tree always has n! leaves.",
      worst: "The same.",
      space: "The recursion is n levels deep (plus the output, if you keep it).",
    },
    use: {
      when: ["Brute force over orderings for small n: seating plans, tiny travelling-salesman instances."],
      avoid: ["n above about 10 or 11: 12! is already 479 million orderings."],
    },
    pitfalls: ["With duplicate values the swap method prints repeats. Skip a swap if the same value was already tried at position k."],
    quiz: [
      {
        q: "With the swap method, which permutation of [1, 2, 3] is printed 5th?",
        options: ["231", "312", "321", "213"],
        answer: 2,
        why: "The order is 123, 132, 213, 231, 321, 312: swapping 1 and 3 first gives 321 before 312.",
      },
      {
        q: "How many orderings does a 5-letter word with all different letters have?",
        options: ["25", "60", "120", "3125"],
        answer: 2,
        why: "5! = 120.",
      },
    ],
  },

  "subset-sum": {
    example: {
      input: "[3, 5, 2], target 7: include before exclude",
      cols: ["Subset tried", "Sum", "Outcome"],
      rows: [
        ["{3, 5}", "8", "over the target: prune the whole branch"],
        ["{3, 2}", "5", "no items left: dead end"],
        ["{3}", "3", "no items left: dead end"],
        ["{5, 2}", "7", "hits the target: done, without ever trying {5} or {2}"],
      ],
    },
    why: {
      best: "The very first path taken reaches the target.",
      average: "Many branches are explored; pruning helps but doesn't change the exponential shape.",
      worst: "No subset works: all 2ⁿ include/exclude combinations are tried.",
      space: "The recursion goes n levels deep.",
    },
    use: {
      when: ["Small n, or as the first version before writing the O(n · target) DP."],
      avoid: ["Large n with a small target: dynamic programming is far faster."],
    },
    pitfalls: ["Checking sum == target only at i == n misses subsets that hit the target early. Check it first, as the code does."],
    quiz: [
      {
        q: "With target 0, what does subsetSum return immediately?",
        options: ["false", "true: the empty subset", "It depends on the items", "It recurses forever"],
        answer: 1,
        why: "sum == target holds before any item is chosen: the empty set sums to 0.",
      },
      {
        q: "The DP version of subset sum runs in…",
        options: ["O(2ⁿ)", "O(n · target)", "O(n log n)", "O(target²)"],
        answer: 1,
        why: "It fills a table of n rows and target + 1 columns, each cell in O(1).",
      },
    ],
  },

  "n-queens": {
    example: {
      input: "N = 4, one queen per row (columns 0–3)",
      cols: ["Row", "Try", "Outcome"],
      rows: [
        ["0", "column 0", "safe, place it"],
        ["1", "columns 2, then 3", "safe each time, but every path below dead-ends"],
        ["0", "column 0 fails", "backtrack all the way up and move the first queen"],
        ["0 → 3", "columns 1, 3, 0, 2", "safe at every row: solution [1, 3, 0, 2]"],
      ],
    },
    why: {
      best: "Pruning can reach a solution quickly: 4-Queens needs only 8 placements in the trace above.",
      average: "Pruning on unsafe squares cuts the tree massively compared with all Nᴺ placements.",
      worst: "Without clever pruning, up to N choices in the first row, N − 1 in the next…: O(N!).",
      space: "One column per row, and N levels of recursion.",
    },
    use: {
      when: ["Learning backtracking and constraint checking.", "Constraint problems like Sudoku that share the same shape."],
      avoid: ["Counting solutions for large N by plain backtracking: use bitmasks or smarter search."],
    },
    pitfalls: ["Testing safety against all N rows instead of only the rows already filled reads unset values."],
    quiz: [
      {
        q: "Queens at (row 0, col 1) and (row 2, col 3) are on the same…",
        options: ["Row", "Column", "Diagonal", "Nothing: they're safe"],
        answer: 2,
        why: "|0 − 2| = |1 − 3| = 2, so they share a diagonal.",
      },
      {
        q: "How many solutions does the 4-Queens puzzle have?",
        options: ["0", "1", "2", "4"],
        answer: 2,
        why: "[1, 3, 0, 2] and its mirror [2, 0, 3, 1].",
      },
    ],
  },
};
