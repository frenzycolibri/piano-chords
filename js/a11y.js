const SPOKEN_SYMBOLS = new Map([['♯', ' sharp '], ['♭', ' flat '], ['𝄪', ' double sharp '], ['𝄫', ' double flat '], ['♮', ' natural '], ['→', ' to '], ['–', ',']]);

const liveRegion = document.getElementById('status');

function spoken(content) {
    let result = '';
    for (const character of content) {
        result += SPOKEN_SYMBOLS.get(character) ?? character;
    }
    return result;
}

function fillText(node, content) {
    fillAccessible(node, content, content);
}

function fillAccessible(node, content, ...visualParts) {
    const visual = document.createElement('span');
    visual.setAttribute('aria-hidden', 'true');
    visual.append(...visualParts);
    const hidden = document.createElement('span');
    hidden.className = 'visually-hidden';
    hidden.textContent = spoken(content);
    node.replaceChildren(visual, hidden);
}

function announce(message) {
    liveRegion.textContent = spoken(message);
}
