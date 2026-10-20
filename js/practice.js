const LOWEST_KEY = 29;
const HIGHEST_KEY = 91;
const SPARKLE_COUNT = 24;
const CELEBRATION_MS = 1100;
const NO_CHORDS_MESSAGE = 'No chords match the current configuration.';

const practice = document.getElementById('practice');
const question = document.getElementById('question');
const keys = buildKeyboard(document.getElementById('keyboard'), LOWEST_KEY, HIGHEST_KEY, toggle);
const selected = new Set();
let chords = [];
let practiceTypes = [];
let challenge = null;
let locked = true;
let answered = false;
let timer = 0;

practice.addEventListener('click', (event) => {
    if (!answered || event.target.closest('.back') !== null) {
        return;
    }
    event.stopPropagation();
    event.preventDefault();
    next();
}, true);

document.getElementById('skip').addEventListener('click', () => {
    if (challenge !== null) {
        next();
    }
});

function startPractice(config) {
    clearSparkles();
    answered = false;
    chords = [];
    for (const scale of SCALES) {
        if (!config.scales.has(scale.id)) {
            continue;
        }
        for (const type of CHORD_TYPES) {
            if (config.chordTypes.has(type.id)) {
                chords.push(...chordsInScale(scale, type));
            }
        }
    }
    practiceTypes = [...config.practiceTypes];
    challenge = null;
    clearSelection();

    if (chords.length === 0 || practiceTypes.length === 0) {
        locked = true;
        question.replaceChildren(text('p', 'message', NO_CHORDS_MESSAGE));
        announce(NO_CHORDS_MESSAGE);
        return;
    }
    next();
}

function next() {
    let candidate;
    do {
        candidate = createChallenge();
    } while (challenge !== null && candidate.signature === challenge.signature);
    challenge = candidate;
    clearSelection();
    clearSparkles();
    answered = false;
    locked = false;
    question.replaceChildren(panel('challenge', ...challenge.content));
    announce(challenge.questionText);
}

function createChallenge() {
    const chord = pick(chords);
    const inversion = Math.floor(Math.random() * chord.notes.length);
    const practiceType = pick(practiceTypes);
    const signature = `${chord.scale.id}|${chord.type.id}|${chord.notes[0].letter}|${inversion}|${practiceType}`;
    const scaleName = text('p', 'scale-name', chord.scale.name);

    if (practiceType === 'staff') {
        const { clef, notes } = pick(staffVoicings(chord.notes, inversion));
        const targets = new Set();
        for (const note of notes) {
            targets.add(note.midi);
        }
        return {
            signature,
            exact: true,
            targets,
            size: notes.length,
            content: [scaleName, renderStaff(clef, chord.scale.signature, notes)],
            questionText: `${chord.scale.name}. ${staffLabel(clef)}.`,
            answer: [chordNameNode(chord), text('p', 'inversion', inversionName(inversion))],
            answerText: `${chordName(chord)}, ${inversionName(inversion)}`,
        };
    }

    const targets = new Set();
    for (const note of chord.notes) {
        targets.add(pitchClass(note));
    }
    const { clef, notes } = pick(staffVoicings(chord.notes, inversion));
    return {
        signature,
        exact: false,
        targets,
        size: chord.notes.length,
        bass: pitchClass(chord.notes[inversion]),
        content: [scaleName, chordNameNode(chord), text('p', 'inversion', inversionName(inversion))],
        questionText: `${chord.scale.name}. ${chordName(chord)}, ${inversionName(inversion)}.`,
        answer: [renderStaff(clef, chord.scale.signature, notes), text('p', 'note-names', noteNames(notes))],
        answerText: noteNames(notes),
    };
}

function staffVoicings(notes, inversion) {
    const voicings = [];
    for (const clef of CLEFS) {
        for (let octave = Math.floor(clef.lowest / 12) - 1; octave <= Math.floor(clef.highest / 12) - 1; octave++) {
            const voiced = voice(notes, inversion, octave);
            if (voiced[0].midi >= clef.lowest && voiced[voiced.length - 1].midi <= clef.highest) {
                voicings.push({ clef, notes: voiced });
            }
        }
    }
    return voicings;
}

function toggle(midi) {
    if (locked) {
        return;
    }
    const key = keys.get(midi);
    if (selected.has(midi)) {
        selected.delete(midi);
        key.classList.remove('correct', 'wrong');
        announce(`${keyName(midi)} unselected`);
    } else {
        selected.add(midi);
        const result = isCorrect(midi) ? 'correct' : 'wrong';
        key.classList.add(result);
        announce(`${keyName(midi)} ${result}`);
    }
    key.setAttribute('aria-pressed', String(selected.has(midi)));
    if (isComplete()) {
        celebrate();
    }
}

function isCorrect(midi) {
    return challenge.targets.has(challenge.exact ? midi : midi % 12);
}

function isComplete() {
    if (selected.size !== challenge.size) {
        return false;
    }
    const pitches = new Set();
    for (const midi of selected) {
        if (!isCorrect(midi)) {
            return false;
        }
        pitches.add(midi % 12);
    }
    if (challenge.exact) {
        return true;
    }
    return pitches.size === challenge.size && Math.min(...selected) % 12 === challenge.bass;
}

function celebrate() {
    locked = true;
    answered = true;
    question.append(panel('answer', ...challenge.answer, text('p', 'continue', 'Tap or press Enter to continue')));
    announce(`Correct! ${challenge.answerText}. Press Enter to continue.`);
    const sparkles = document.createElement('div');
    sparkles.className = 'sparkles';
    sparkles.setAttribute('aria-hidden', 'true');
    for (let i = 0; i < SPARKLE_COUNT; i++) {
        const sparkle = document.createElement('span');
        sparkle.textContent = '✦';
        const angle = (i / SPARKLE_COUNT) * 2 * Math.PI;
        const distance = 80 + Math.random() * 140;
        sparkle.style.setProperty('--x', `${Math.cos(angle) * distance}px`);
        sparkle.style.setProperty('--y', `${Math.sin(angle) * distance}px`);
        sparkle.style.animationDelay = `${Math.random() * 150}ms`;
        sparkles.append(sparkle);
    }
    practice.append(sparkles);
    timer = setTimeout(() => sparkles.remove(), CELEBRATION_MS);
}

function clearSparkles() {
    clearTimeout(timer);
    for (const sparkles of practice.querySelectorAll('.sparkles')) {
        sparkles.remove();
    }
}

function panel(className, ...content) {
    const node = document.createElement('div');
    node.className = `panel ${className}`;
    node.append(...content);
    return node;
}

function clearSelection() {
    for (const midi of selected) {
        keys.get(midi).classList.remove('correct', 'wrong');
        keys.get(midi).setAttribute('aria-pressed', 'false');
    }
    selected.clear();
}

function pick(items) {
    return items[Math.floor(Math.random() * items.length)];
}

function text(tag, className, content) {
    const node = document.createElement(tag);
    node.className = className;
    fillText(node, content);
    return node;
}

function chordNameNode(chord) {
    const node = document.createElement('p');
    node.className = 'chord-name';
    const { letter, solfege, suffix } = chordParts(chord);
    fillAccessible(node, chordName(chord), letter, chordType(suffix), ' / ', solfege, chordType(suffix));
    return node;
}

function chordType(suffix) {
    const node = document.createElement('sup');
    node.className = 'chord-type';
    node.textContent = suffix;
    return node;
}
