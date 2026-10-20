const screens = document.querySelectorAll('.screen');
const options = document.getElementById('options');
let config = loadConfig();

function show(id) {
    for (const screen of screens) {
        screen.hidden = screen.id !== id;
    }
    document.getElementById(id).querySelector('h1, h2').focus();
    if (id === 'configure') {
        renderOptions(options, config);
    }
    if (id === 'practice') {
        startPractice(config);
    }
}

for (const button of document.querySelectorAll('[data-screen]')) {
    button.addEventListener('click', () => show(button.dataset.screen));
}

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        show('home');
    }
});

document.getElementById('reset').addEventListener('click', () => {
    config = resetConfig();
    renderOptions(options, config);
});

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js');
}
