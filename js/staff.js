const SVG = 'http://www.w3.org/2000/svg';
const STEP = 5;
const SIGNATURE_X = 50;
const SIGNATURE_SPACING = 8;
const NOTE_GAP = 34;
const SCALE_NOTE_SPACING = 30;
const NOTE_MARGIN = 30;
const SECOND_OFFSET = 12;
const LEDGER_HALF = 9;
const SHARP_POSITIONS = [[3, 38], [0, 35], [4, 39], [1, 36], [5, 33], [2, 37], [6, 34]];
const FLAT_POSITIONS = [[6, 34], [2, 37], [5, 33], [1, 36], [4, 32], [0, 35], [3, 31]];
const ACCIDENTAL_PATHS = new Map([
    [-2, (x, y) => `${flatPath(x - 3, y)} ${flatPath(x + 3, y)}`],
    [-1, (x, y) => flatPath(x, y)],
    [0, (x, y) => `M ${x - 2} ${y - 8} V ${y + 3} L ${x + 2} ${y + 1.5} M ${x + 2} ${y + 8} V ${y - 3} L ${x - 2} ${y - 1.5}`],
    [1, (x, y) => `M ${x - 1.5} ${y - 7} V ${y + 8} M ${x + 1.5} ${y - 8} V ${y + 7} M ${x - 4} ${y - 1.5} L ${x + 4} ${y - 3.5} M ${x - 4} ${y + 3.5} L ${x + 4} ${y + 1.5}`],
    [2, (x, y) => `M ${x - 3} ${y - 3} l 6 6 m 0 -6 l -6 6`],
]);

const CLEFS = [
    {
        name: 'Treble',
        lowest: 60,
        highest: 91,
        bottomLine: 30,
        signatureShift: 0,
        path: 'M 10 49 C 10 55 18 55 18 49 L 15 -8 C 14 -16 24 -14 22 -4 C 20 6 4 14 4 28 C 4 38 22 40 24 30 C 26 20 12 18 12 27 C 12 32 17 34 19 32',
        dots: [[10, 49, 2.5]],
    },
    {
        name: 'Bass',
        lowest: 29,
        highest: 60,
        bottomLine: 18,
        signatureShift: -14,
        path: 'M 6 12 C 6 2 26 0 26 14 C 26 28 14 36 4 42',
        dots: [[7, 12, 3.2], [31, 5, 1.8], [31, 15, 1.8]],
    },
];

function renderStaff(clef, signature, notes) {
    const { svg, y, noteX } = staffFrame(clef, signature, 'a chord', NOTE_MARGIN);

    const sorted = [...notes].sort((a, b) => a.position - b.position);
    const xs = noteXs(sorted, noteX);
    for (let i = 0; i < sorted.length; i++) {
        drawNote(svg, clef, y, xs[i], sorted[i].position);
    }

    const columns = [];
    for (let i = sorted.length - 1; i >= 0; i--) {
        const note = sorted[i];
        if (note.accidental === signature[note.letter]) {
            continue;
        }
        let column = columns.findIndex((positions) => positions.every((position) => Math.abs(position - note.position) >= 6));
        if (column === -1) {
            column = columns.length;
            columns.push([]);
        }
        columns[column].push(note.position);
        const x = noteX - 14 - column * 10;
        svg.append(accidentalMark(note.accidental, x, y(note.position)));
    }
    return svg;
}

function renderScaleStaff(clef, signature, notes) {
    const { svg, y, noteX } = staffFrame(clef, signature, 'a scale', (notes.length - 1) * SCALE_NOTE_SPACING + NOTE_MARGIN);
    for (let i = 0; i < notes.length; i++) {
        const x = noteX + i * SCALE_NOTE_SPACING;
        drawNote(svg, clef, y, x, notes[i].position);
        if (notes[i].accidental !== signature[notes[i].letter]) {
            svg.append(accidentalMark(notes[i].accidental, x - 14, y(notes[i].position)));
        }
    }
    return svg;
}

function staffFrame(clef, signature, subject, notesWidth) {
    const y = (position) => 40 - (position - clef.bottomLine) * STEP;
    const svg = element('svg', { class: 'staff', role: 'img', 'aria-label': staffLabel(clef, subject) });

    const clefGroup = element('g', { transform: 'translate(8 0)' });
    clefGroup.append(element('path', { d: clef.path, class: 'clef' }));
    for (const [cx, cy, r] of clef.dots) {
        clefGroup.append(element('circle', { cx, cy, r, class: 'clef-dot' }));
    }
    svg.append(clefGroup);

    let signatureX = SIGNATURE_X;
    for (const [accidental, positions] of [[1, SHARP_POSITIONS], [-1, FLAT_POSITIONS]]) {
        for (const [letter, position] of positions) {
            if (signature[letter] === accidental) {
                svg.append(accidentalMark(accidental, signatureX, y(position + clef.signatureShift)));
                signatureX += SIGNATURE_SPACING;
            }
        }
    }

    const noteX = signatureX + NOTE_GAP;
    const width = noteX + notesWidth;
    svg.setAttribute('viewBox', `0 -45 ${width} 130`);
    for (let line = 0; line < 5; line++) {
        svg.prepend(element('line', { x1: 2, x2: width - 2, y1: line * 2 * STEP, y2: line * 2 * STEP, class: 'staff-line' }));
    }
    return { svg, y, noteX };
}

function drawNote(svg, clef, y, x, position) {
    for (const ledger of ledgerPositions(clef, position)) {
        svg.append(element('line', { x1: x - LEDGER_HALF, x2: x + LEDGER_HALF, y1: y(ledger), y2: y(ledger), class: 'ledger' }));
    }
    svg.append(element('ellipse', { cx: x, cy: y(position), rx: 5.6, ry: 3.9, class: 'notehead' }));
}

function staffLabel(clef, subject) {
    return `${clef.name} clef staff showing ${subject}`;
}

function accidentalMark(accidental, x, y) {
    return element('path', { d: ACCIDENTAL_PATHS.get(accidental)(x, y), class: 'accidental' });
}

function flatPath(x, y) {
    return `M ${x - 2} ${y - 11} V ${y + 3.5} C ${x + 5} ${y} ${x + 3} ${y - 4.5} ${x - 2} ${y - 1}`;
}

function noteXs(sorted, noteX) {
    const xs = [];
    for (let i = 0; i < sorted.length; i++) {
        const displaced = i > 0 && sorted[i].position - sorted[i - 1].position === 1 && xs[i - 1] === noteX;
        xs.push(displaced ? noteX + SECOND_OFFSET : noteX);
    }
    return xs;
}

function ledgerPositions(clef, position) {
    const positions = [];
    for (let ledger = clef.bottomLine - 2; ledger >= position; ledger -= 2) {
        positions.push(ledger);
    }
    for (let ledger = clef.bottomLine + 10; ledger <= position; ledger += 2) {
        positions.push(ledger);
    }
    return positions;
}

function element(name, attributes) {
    const node = document.createElementNS(SVG, name);
    for (const [attribute, value] of Object.entries(attributes)) {
        node.setAttribute(attribute, value);
    }
    return node;
}
