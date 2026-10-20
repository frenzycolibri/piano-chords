const SVG = 'http://www.w3.org/2000/svg';
const STEP = 5;
const SIGNATURE_X = 50;
const SIGNATURE_SPACING = 8;
const NOTE_GAP = 34;
const SECOND_OFFSET = 12;
const LEDGER_HALF = 9;
const SHARP_POSITIONS = [[3, 38], [0, 35], [4, 39], [1, 36], [5, 33], [2, 37], [6, 34]];
const FLAT_POSITIONS = [[6, 34], [2, 37], [5, 33], [1, 36], [4, 32], [0, 35], [3, 31]];

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
    const y = (position) => 40 - (position - clef.bottomLine) * STEP;
    const svg = element('svg', { class: 'staff', role: 'img', 'aria-label': staffLabel(clef) });

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
                svg.append(symbol(writtenAccidental(accidental), signatureX, y(position + clef.signatureShift)));
                signatureX += SIGNATURE_SPACING;
            }
        }
    }

    const noteX = signatureX + NOTE_GAP;
    const width = noteX + 30;
    svg.setAttribute('viewBox', `0 -45 ${width} 130`);
    for (let line = 0; line < 5; line++) {
        svg.prepend(element('line', { x1: 2, x2: width - 2, y1: line * 2 * STEP, y2: line * 2 * STEP, class: 'staff-line' }));
    }

    const sorted = [...notes].sort((a, b) => a.position - b.position);
    const xs = noteXs(sorted, noteX);
    for (let i = 0; i < sorted.length; i++) {
        for (const position of ledgerPositions(clef, sorted[i].position)) {
            svg.append(element('line', { x1: xs[i] - LEDGER_HALF, x2: xs[i] + LEDGER_HALF, y1: y(position), y2: y(position), class: 'ledger' }));
        }
        svg.append(element('ellipse', { cx: xs[i], cy: y(sorted[i].position), rx: 5.6, ry: 3.9, class: 'notehead' }));
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
        if (note.accidental === 2) {
            svg.append(element('path', { d: `M ${x - 3} ${y(note.position) - 3} l 6 6 m 0 -6 l -6 6`, class: 'double-sharp' }));
            continue;
        }
        svg.append(symbol(writtenAccidental(note.accidental), x, y(note.position)));
    }
    return svg;
}

function staffLabel(clef) {
    return `${clef.name} clef staff showing a chord`;
}

function symbol(text, x, y) {
    const node = element('text', { x, y, class: 'accidental' });
    node.textContent = text;
    return node;
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
