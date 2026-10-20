const BLACK_PITCHES = new Set([1, 3, 6, 8, 10]);
const MIDDLE_C = 60;
const KEY_NAMES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
const KEY_STEPS = new Map([['ArrowLeft', -1], ['ArrowDown', -1], ['ArrowRight', 1], ['ArrowUp', 1]]);

function keyName(midi) {
    return `${KEY_NAMES[midi % 12]}${Math.floor(midi / 12) - 1}`;
}

function buildKeyboard(element, lowest, highest, onPress) {
    let whiteCount = 0;
    for (let midi = lowest; midi <= highest; midi++) {
        if (!BLACK_PITCHES.has(midi % 12)) {
            whiteCount++;
        }
    }
    element.style.setProperty('--white-count', whiteCount);

    const keys = new Map();
    let whiteIndex = 0;
    for (let midi = lowest; midi <= highest; midi++) {
        const key = document.createElement('button');
        key.type = 'button';
        key.tabIndex = midi === MIDDLE_C ? 0 : -1;
        key.setAttribute('aria-label', spoken(keyName(midi)));
        key.setAttribute('aria-pressed', 'false');
        key.setAttribute('aria-describedby', 'keyboard-help');
        if (BLACK_PITCHES.has(midi % 12)) {
            key.className = 'key black';
            key.style.left = `${(whiteIndex / whiteCount) * 100}%`;
        } else {
            if (midi === MIDDLE_C) {
                const marker = document.createElement('div');
                marker.className = 'middle-c';
                marker.style.left = `${(whiteIndex / whiteCount) * 100}%`;
                element.append(marker);
            }
            key.className = 'key white';
            whiteIndex++;
            if (midi % 12 === 0) {
                key.textContent = keyName(midi);
            }
        }
        key.addEventListener('click', () => onPress(midi));
        key.addEventListener('keydown', (event) => {
            let target;
            if (KEY_STEPS.has(event.key)) {
                target = keys.get(midi + KEY_STEPS.get(event.key));
            } else if (event.key === 'Home') {
                target = keys.get(lowest);
            } else if (event.key === 'End') {
                target = keys.get(highest);
            }
            if (target === undefined) {
                return;
            }
            event.preventDefault();
            key.tabIndex = -1;
            target.tabIndex = 0;
            target.focus();
        });
        keys.set(midi, key);
        element.append(key);
    }
    return keys;
}
