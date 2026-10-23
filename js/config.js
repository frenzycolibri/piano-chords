const STORAGE_KEY = 'piano-chords-config';

const SCALE_PRACTICE_TYPES = [
    { id: 'name', name: 'Scale name → piano' },
    { id: 'staff', name: 'Treble/bass clef notation → piano' },
];

const CHORD_PRACTICE_TYPES = [
    { id: 'name', name: 'Chord name → piano' },
    { id: 'staff', name: 'Treble/bass clef notation → piano' },
];

const CONFIG_SECTIONS = [
    {
        key: 'scales',
        title: 'Practice scales',
        groups: [
            { key: 'scales', title: 'Scales', options: SCALES },
            { key: 'practiceTypes', title: 'Practice types', options: SCALE_PRACTICE_TYPES },
        ],
    },
    {
        key: 'chords',
        title: 'Practice chords',
        groups: [
            { key: 'scales', title: 'Scales', options: SCALES },
            { key: 'chordTypes', title: 'Chord types', options: CHORD_TYPES },
            { key: 'practiceTypes', title: 'Practice types', options: CHORD_PRACTICE_TYPES },
        ],
    },
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
    for (const section of CONFIG_SECTIONS) {
        for (const group of section.groups) {
            const ids = stored[section.key]?.[group.key];
            if (Array.isArray(ids)) {
                config[section.key][group.key] = knownIds(group.options, ids);
            }
        }
    }
    return config;
}

function saveConfig(config) {
    const stored = {};
    for (const section of CONFIG_SECTIONS) {
        stored[section.key] = {};
        for (const group of section.groups) {
            stored[section.key][group.key] = [...config[section.key][group.key]];
        }
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
    for (const section of CONFIG_SECTIONS) {
        config[section.key] = {};
        for (const group of section.groups) {
            config[section.key][group.key] = new Set();
            for (const option of group.options) {
                config[section.key][group.key].add(option.id);
            }
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
