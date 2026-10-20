function renderOptions(container, config) {
    const fieldsets = [];
    for (const group of CONFIG_GROUPS) {
        fieldsets.push(renderGroup(group, config));
    }
    container.replaceChildren(...fieldsets);
}

function renderGroup(group, config) {
    const selection = config[group.key];
    const fieldset = document.createElement('fieldset');
    fieldset.className = group.key;
    const legend = document.createElement('legend');
    legend.textContent = group.title;
    const all = checkbox('All');
    all.label.classList.add('all');
    const choices = document.createElement('div');
    choices.className = 'choices';
    const boxes = [];

    const sync = () => {
        all.input.checked = selection.size === group.options.length;
        all.input.indeterminate = selection.size > 0 && !all.input.checked;
    };

    for (const option of group.options) {
        const box = checkbox(option.name);
        box.input.checked = selection.has(option.id);
        box.input.addEventListener('change', () => {
            if (box.input.checked) {
                selection.add(option.id);
            } else {
                selection.delete(option.id);
            }
            sync();
            saveConfig(config);
        });
        boxes.push(box.input);
        choices.append(box.label);
    }

    all.input.addEventListener('change', () => {
        for (let i = 0; i < group.options.length; i++) {
            boxes[i].checked = all.input.checked;
            if (all.input.checked) {
                selection.add(group.options[i].id);
            } else {
                selection.delete(group.options[i].id);
            }
        }
        sync();
        saveConfig(config);
    });

    sync();
    fieldset.append(legend, all.label, choices);
    return fieldset;
}

function checkbox(text) {
    const label = document.createElement('label');
    label.className = 'option';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            input.click();
        }
    });
    const span = document.createElement('span');
    fillText(span, text);
    label.append(input, span);
    return { label, input };
}
