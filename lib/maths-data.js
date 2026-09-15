/**
 * Raw maths content — the starter pack for Reception and Year 1.
 *
 * Each entry is one "skill" that becomes a full topic (lesson + practice +
 * quiz), the same shape as a phonics sound, but the questions are generated
 * by type (count / compare / shape / addition / subtraction / bonds)
 * instead of from a word list — see lib/maths.js.
 */

export const MATHS_TRAILS = [
  {
    id: 'counting-corner',
    name: 'Counting Corner',
    blurb: 'Counting, comparing and number names to 10.',
    emoji: '🔢',
    color: 'leaf',
  },
  {
    id: 'adding-taking-away',
    name: 'Adding & Taking Away',
    blurb: 'Addition and subtraction within 10.',
    emoji: '➕',
    color: 'sky',
  },
  {
    id: 'shape-safari',
    name: 'Shape Safari',
    blurb: 'Spotting and naming everyday shapes.',
    emoji: '🔺',
    color: 'coral',
  },
];

const COUNTING_ICONS = ['🍎', '⭐', '🚗', '🐝', '🎈', '🧸', '🍪', '🐟', '🎨', '🦋'];

const SHAPES = [
  { name: 'Circle', emoji: '🔵' },
  { name: 'Square', emoji: '⬛' },
  { name: 'Triangle', emoji: '🔺' },
  { name: 'Star', emoji: '⭐' },
  { name: 'Heart', emoji: '❤️' },
  { name: 'Diamond', emoji: '🔶' },
];

export const MATHS_TOPICS = [
  {
    id: 'counting-to-10',
    subject: 'numbers',
    trail: 'counting-corner',
    grade: 'reception',
    type: 'count',
    display: '5',
    name: 'Counting to 10',
    intro: "We're learning to count how many things are in a group, all the way up to 10.",
    chant: '1, 2, 3, 4, 5 — let’s count and come alive! 6, 7, 8, 9, 10 — let’s count again!',
    icons: COUNTING_ICONS,
    range: [1, 10],
  },
  {
    id: 'compare-numbers',
    subject: 'numbers',
    trail: 'counting-corner',
    grade: 'reception',
    type: 'compare',
    display: '>',
    name: 'More or Fewer',
    intro: "We're learning to spot which number is bigger and which is smaller.",
    chant: 'Bigger, smaller, can you tell? Compare the numbers — you know them well!',
    range: [1, 10],
  },
  {
    id: 'shapes-basic',
    subject: 'shapes',
    trail: 'shape-safari',
    grade: 'reception',
    type: 'shape',
    display: '⬛',
    name: 'Spot the Shape',
    intro: "We're learning to spot and name shapes like circles, squares and triangles.",
    chant: 'Round is a circle, four sides the same is a square — shapes are everywhere!',
    shapes: SHAPES,
  },
  {
    id: 'addition-to-10',
    subject: 'numbers',
    trail: 'adding-taking-away',
    grade: 'year1',
    type: 'addition',
    display: '+',
    name: 'Addition to 10',
    intro: "We're learning to add two numbers together, with the answer up to 10.",
    chant: 'Put them together, count them all — addition helps us have a ball!',
  },
  {
    id: 'subtraction-to-10',
    subject: 'numbers',
    trail: 'adding-taking-away',
    grade: 'year1',
    type: 'subtraction',
    display: '−',
    name: 'Subtraction to 10',
    intro: "We're learning to take away, starting with numbers up to 10.",
    chant: 'Take some away and see what’s left — subtraction is a super test!',
  },
  {
    id: 'number-bonds-10',
    subject: 'numbers',
    trail: 'adding-taking-away',
    grade: 'year1',
    type: 'bonds',
    display: '10',
    name: 'Number Bonds to 10',
    intro: "We're learning pairs of numbers that add up to make 10.",
    chant: 'Ten is the target, find the pair — number bonds are everywhere!',
  },
];
