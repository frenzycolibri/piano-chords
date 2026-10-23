const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const SOLFEGE = ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Si'];
const NATURAL_PITCHES = [0, 2, 4, 5, 7, 9, 11];
const ACCIDENTALS = new Map([[-2, '𝄫'], [-1, '♭'], [0, ''], [1, '♯'], [2, '𝄪']]);
const INVERSIONS = ['Root position', '1st inversion', '2nd inversion', '3rd inversion'];
const MINOR_TONICS = ['A', 'E', 'B', 'F#', 'C#', 'G#', 'Eb', 'Bb', 'F', 'C', 'G', 'D'];

const MAJOR_INTERVALS = [0, 2, 4, 5, 7, 9, 11];
const MINOR_INTERVALS = [0, 2, 3, 5, 7, 8, 10];

const MODES = [
    { id: 'major', name: 'major', intervals: MAJOR_INTERVALS, signature: MAJOR_INTERVALS, tonics: ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'Db', 'Ab', 'Eb', 'Bb', 'F'] },
    { id: 'minor', name: 'minor', intervals: MINOR_INTERVALS, signature: MINOR_INTERVALS, tonics: MINOR_TONICS },
    { id: 'harmonic-minor', name: 'harmonic minor', intervals: [0, 2, 3, 5, 7, 8, 11], signature: MINOR_INTERVALS, tonics: MINOR_TONICS },
];

const CHORD_TYPES = [
    { id: 'maj', name: 'maj', suffix: '', degrees: [0, 2, 4], intervals: [0, 4, 7] },
    { id: 'm', name: 'm', suffix: 'm', degrees: [0, 2, 4], intervals: [0, 3, 7] },
    { id: 'dim', name: 'dim', suffix: 'dim', degrees: [0, 2, 4], intervals: [0, 3, 6] },
    { id: 'aug', name: 'aug', suffix: 'aug', degrees: [0, 2, 4], intervals: [0, 4, 8] },
    { id: 'sus2', name: 'sus2', suffix: 'sus2', degrees: [0, 1, 4], intervals: [0, 2, 7] },
    { id: 'sus4', name: 'sus4', suffix: 'sus4', degrees: [0, 3, 4], intervals: [0, 5, 7] },
    { id: '7', name: '7', suffix: '7', degrees: [0, 2, 4, 6], intervals: [0, 4, 7, 10] },
    { id: 'maj7', name: 'maj7', suffix: 'maj7', degrees: [0, 2, 4, 6], intervals: [0, 4, 7, 11] },
    { id: 'm7', name: 'm7', suffix: 'm7', degrees: [0, 2, 4, 6], intervals: [0, 3, 7, 10] },
    { id: 'm7b5', name: 'm7♭5', suffix: 'm7♭5', degrees: [0, 2, 4, 6], intervals: [0, 3, 6, 10] },
    { id: 'dim7', name: 'dim7', suffix: 'dim7', degrees: [0, 2, 4, 6], intervals: [0, 3, 6, 9] },
    { id: 'mMaj7', name: 'm(maj7)', suffix: 'm(maj7)', degrees: [0, 2, 4, 6], intervals: [0, 3, 7, 11] },
];

const SCALES = [];
for (const mode of MODES) {
    for (const tonic of mode.tonics) {
        SCALES.push(buildScale(mode, tonic));
    }
}

function pitchClass(note) {
    return (NATURAL_PITCHES[note.letter] + note.accidental + 12) % 12;
}

function accidentalSymbol(accidental) {
    return ACCIDENTALS.get(accidental);
}

function inversionName(inversion) {
    return INVERSIONS[inversion];
}

function chordParts(chord) {
    const root = chord.notes[0];
    return { letter: letterName(root), solfege: solfegeName(root), suffix: chord.type.suffix };
}

function chordName(chord) {
    const { letter, solfege, suffix } = chordParts(chord);
    return suffix === '' ? `${letter} / ${solfege}` : `${letter} ${suffix} / ${solfege} ${suffix}`;
}

function noteNames(notes) {
    const letters = [];
    const solfege = [];
    for (const note of notes) {
        letters.push(letterName(note));
        solfege.push(solfegeName(note));
    }
    return `${letters.join(' – ')} / ${solfege.join(' – ')}`;
}

function chordsInScale(scale, type) {
    const chords = [];
    for (let root = 0; root < 7; root++) {
        const notes = [];
        for (const degree of type.degrees) {
            notes.push(scale.notes[(root + degree) % 7]);
        }
        if (hasIntervals(notes, type.intervals)) {
            chords.push({ scale, type, notes });
        }
    }
    return chords;
}

function voice(notes, inversion, startOctave) {
    const voiced = [];
    let octave = startOctave;
    for (let i = 0; i < notes.length; i++) {
        const note = notes[(inversion + i) % notes.length];
        let pitched = place(note, octave);
        while (voiced.length > 0 && pitched.midi <= voiced[voiced.length - 1].midi) {
            octave++;
            pitched = place(note, octave);
        }
        voiced.push(pitched);
    }
    return voiced;
}

function place(note, octave) {
    return {
        ...note,
        midi: 12 * (octave + 1) + NATURAL_PITCHES[note.letter] + note.accidental,
        position: octave * 7 + note.letter,
    };
}

function hasIntervals(notes, intervals) {
    const rootPitch = pitchClass(notes[0]);
    for (let i = 0; i < notes.length; i++) {
        if ((pitchClass(notes[i]) - rootPitch + 12) % 12 !== intervals[i]) {
            return false;
        }
    }
    return true;
}

function buildScale(mode, tonicName) {
    const tonic = { letter: LETTERS.indexOf(tonicName[0]), accidental: { '': 0, '#': 1, 'b': -1 }[tonicName.slice(1)] };
    const signature = [];
    for (const note of spell(tonic, mode.signature)) {
        signature[note.letter] = note.accidental;
    }
    return {
        id: `${tonicName}-${mode.id}`,
        name: `${letterName(tonic)} / ${solfegeName(tonic)} ${mode.name}`,
        notes: spell(tonic, mode.intervals),
        signature,
    };
}

function spell(tonic, intervals) {
    const tonicPitch = pitchClass(tonic);
    const notes = [];
    for (let degree = 0; degree < 7; degree++) {
        const letter = (tonic.letter + degree) % 7;
        const offset = (tonicPitch + intervals[degree] - NATURAL_PITCHES[letter] + 12) % 12;
        notes.push({ letter, accidental: offset > 6 ? offset - 12 : offset });
    }
    return notes;
}

function letterName(note) {
    return `${LETTERS[note.letter]}${accidentalSymbol(note.accidental)}`;
}

function solfegeName(note) {
    return `${SOLFEGE[note.letter]}${accidentalSymbol(note.accidental)}`;
}
