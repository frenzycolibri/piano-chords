const STORAGE_KEY = 'piano-chords-config';

const PRACTICE_TYPES = [
    { id: 'name', name: 'Chord name → piano' },
    { id: 'staff', name: 'Treble/bass clef notation → piano' },
];

const CONFIG_GROUPS = [
    { key: 'scales', title: 'Scales', options: SCALES },
    { key: 'chordTypes', title: 'Chord types', options: CHORD_TYPES },
    { key: 'practiceTypes', title: 'Practice types', options: PRACTICE_TYPES },
];

function loadConfig() {
    const config = defaultConfig();
    let stored = null;
    try {
        stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    } catch {
        return config;
    }
    if (stored === null) {
        return config;
    }
    for (const group of CONFIG_GROUPS) {
        if (Array.isArray(stored[group.key])) {
            config[group.key] = knownIds(group.options, stored[group.key]);
        }
    }
    return config;
}

function saveConfig(config) {
    const stored = {};
    for (const group of CONFIG_GROUPS) {
        stored[group.key] = [...config[group.key]];
    }
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    } catch {
    }
}

function resetConfig() {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch {
    }
    return defaultConfig();
}

function defaultConfig() {
    const config = {};
    for (const group of CONFIG_GROUPS) {
        config[group.key] = new Set();
        for (const option of group.options) {
            config[group.key].add(option.id);
        }
    }
    return config;
}

function knownIds(options, ids) {
    const known = new Set();
    for (const option of options) {
        if (ids.includes(option.id)) {
            known.add(option.id);
        }
    }
    return known;
}
