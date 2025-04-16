var numberInput = document.getElementById('numberInput').value;
var tableSize = parseInt(numberInput) + 1;
var logData = {}; // Object to store log data for each pin
var mapping = {}; // Object to store classification of keys on the mini keyboard
var allKeys = {}; // Object to store all keys from allKeys.json
var config = {}; // Object to store configuration from config.json
var cursorOn = null; // Variable to store the id of the element that has focus

// Load all keys from allKeys.json
fetch('allKeys.json')
    .then(response => response.json())
    .then(data => {
        allKeys = data;
        console.log('Loaded allKeys.json:', allKeys);
    })
    .catch(error => console.error('Error loading allKeys.json:', error));

// Load configuration from config.json
fetch('config.json')
    .then(response => response.json())
    .then(data => {
        config = data;
        console.log('Loaded config.json:', config);
    })
    .catch(error => console.error('Error loading config.json:', error));

// Add event listeners for export and load buttons
document.getElementById('exportButton').addEventListener('click', exportData);
document.getElementById('advancedSettingsToggle').addEventListener('click', toggleAdvancedSettings);
document.getElementById('loadButton').addEventListener('click', function() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    fileInput.addEventListener('change', loadData);
    fileInput.click();
});

loadDefaultFile(); // Load default file on page load

function generateTable() {
    resetMiniKeyboard();
    numberInput = document.getElementById('numberInput').value;
    tableSize = parseInt(numberInput) + 1;
    const buttonContainer = document.getElementById('buttonContainer');
    const tableContainer = document.getElementById('tableContainer');
    const textInputContainer = document.getElementById('textInputContainer');
    buttonContainer.innerHTML = ''; // Clear previous buttons if any
    tableContainer.innerHTML = ''; // Clear previous table if any
    textInputContainer.innerHTML = ''; // Clear previous text input if any

    if (isNaN(tableSize) || tableSize < 2) {
        alert('Please enter a valid number greater than 0');
        return;
    }

    // Generate buttons
    for (let i = 1; i < tableSize; i++) {
        if (!logData[`P${i}`]) {
            logData[`P${i}`] = []; // Initialize log data for each pin if there isn't any
        }
        createButton(i, buttonContainer, textInputContainer, tableContainer);
    }

    // Generate table
    const table = document.createElement('table');
    table.classList.add('scrollable-table');
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');

    for (let i = 0; i < tableSize; i++) {
        const row = document.createElement('tr');
        for (let j = 0; j < tableSize; j++) {
            const cell = document.createElement(i === 0 ? 'th' : 'td');
            if (i === 0 && j === 0) {
                cell.textContent = ''; // Leave the cell at (0,0) blank
            } else if (i === 0) {
                if (j === 1) {
                    cell.textContent = 'Logs';
                } else {
                    cell.textContent = `P${j}`; // Label header cells in the first row
                }
            } else if (j === 0) {
                cell.textContent = `P${i}`;
                cell.classList.add('header-cell');
            } else if (j === 1) {
                cell.textContent = `P${i} log: `;
                cell.id = `log-${i}`;
                cell.classList.add('log-cell');
                // Add onClick to trigger the corresponding button click
                cell.addEventListener('click', function(event) {
                    // Check if the click is on a span or its child
                    if (event.target.tagName.toLowerCase() === 'span' || event.target.parentElement.tagName.toLowerCase() === 'span') {
                        return;
                    }
                    const button = document.getElementById(`PinBtn${i}`);
                    if (button) {
                        button.click();
                    }
                });
            } else if (i === j) {
                cell.classList.add('null-cell');
                cell.textContent = 'null';
            } else if (i > j) {
                cell.classList.add('null-cell');
                cell.textContent = 'mirror';
            } else {
                cell.textContent = ''; // Leave other cells empty
                cell.id = `log-${j}-${i}`;
            }
            cell.addEventListener('mousemove', showTooltip);
            cell.addEventListener('mouseout', hideTooltip);
            row.appendChild(cell);
        }
        if (i === 0) {
            thead.appendChild(row);
        } else {
            tbody.appendChild(row);
        }
    }
    table.appendChild(thead);
    table.appendChild(tbody);
    tableContainer.appendChild(table);
}

function createButton(i, buttonContainer, textInputContainer, tableContainer) {
    const button = document.createElement('button');
    button.textContent = `P${i}`;
    button.id = `PinBtn${i}`;
    button.addEventListener('click', function() {
        // Remove highlight from all buttons
        const buttons = buttonContainer.getElementsByTagName('button');
        for (let btn of buttons) {
            btn.classList.remove('highlight');
        }
        // Add highlight to the clicked button
        button.classList.add('highlight');

        //Update cursorOn
        cursorOn = button.id;

        // Highlight the corresponding log cell
        const logCells = tableContainer.getElementsByClassName('log-cell');
        for (let cell of logCells) {
            cell.classList.remove('highlight');
        }
        const logCell = document.getElementById(`log-${i}`);
        if (logCell) {
            logCell.classList.add('highlight');
            logCell.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        // When a log-cell is selected, turn each entry in it into a span that can be clicked on - after they are clicked on, the span will show a x on the right which can be clicked to remove the entry
        updateAllLogCells();
        updateLogCell(logCell, i);

        // Show long text input and clear button
        textInputContainer.innerHTML = ''; // Clear previous text input if any
        const textInput = document.createElement('input');
        textInput.type = 'text';
        textInput.style.width = '20%';
        textInput.addEventListener('keydown', function(event) {
            event.preventDefault();
            const key = event.code;
            if (!logData[`P${i}`].includes(key)) {
            logData[`P${i}`].push(key);
            updateAllLogCells();
            compileTable(); // only needs to recompile the table when a new key is added
            }
            // console.log(`Key pressed: ${key}, Code: ${event.code}`);
            //put focus back on text input box after every key press incase the key somehow makes the focus lost
            textInput.focus();
        });
        textInputContainer.appendChild(textInput);

        const clearButton = document.createElement('button');
        clearButton.textContent = `Clear P${i} logs`;
        clearButton.addEventListener('click', function() {
            logData[`P${i}`] = [];
            updateAllLogCells();
            textInput.focus(); // Return focus to the text input
        });
        textInputContainer.appendChild(clearButton);

        const compileTableButton = document.createElement('button');
        compileTableButton.textContent = 'Recompile table';
        compileTableButton.addEventListener('click', compileTable);
        textInputContainer.appendChild(compileTableButton);

        textInput.focus(); // Focus on the text input
        });
        buttonContainer.appendChild(button);
    }
    function updateLogCell(logCell, pinIndex) {

        //if log cell != cursorOn, reset the log cell to be regular text, no spans and not selectable
        if (logCell.id !== `log-${cursorOn.slice(6)}`) {
            logCell.innerHTML = `P${pinIndex} log: ${logData[`P${pinIndex}`].join(', ')}`;
            return;
        }
        //otherwise, turn each entry in the log cell into a span that can be clicked on - after they are clicked on, the span will show a x on the right which can be clicked to remove the entry
        logCell.innerHTML = `P${pinIndex} log: `;
        logData[`P${pinIndex}`].forEach(entry => {
        const span = document.createElement('span');
        span.textContent = entry;
        span.style.marginRight = '5px';
        span.style.cursor = 'pointer';
        span.style.borderRadius = '5px';
        span.style.padding = '2px';
        span.style.paddingLeft = '5px';
        span.style.paddingRight = '5px';
        span.dataset.pinIndex = pinIndex;
        span.dataset.entry = entry;
        span.addEventListener('click', function() {
            // Revert all spans to normal styling
            const allSpans = document.querySelectorAll('span[data-pin-index]');
            allSpans.forEach(s => {
            s.style.backgroundColor = '';
            s.style.color = '';
            s.innerHTML = s.textContent.replace(/\s*x$/, '');
            });

            // Apply styling to the clicked span
            span.style.backgroundColor = 'black';
            span.style.color = 'white';
            span.innerHTML = `${entry}&nbsp;<span style="color: white; cursor: pointer; display: inline;">x</span>`;
            span.querySelector('span').addEventListener('click', function() {
            logData[`P${pinIndex}`] = logData[`P${pinIndex}`].filter(e => e !== entry);
            updateAllLogCells();
            });
        });
        logCell.appendChild(span);
        });
    }

    function updateAllLogCells() {
        for (let pin in logData) {
        const pinNumber = pin.slice(1);
        const logCell = document.getElementById(`log-${pinNumber}`);
        if (logCell) {
            updateLogCell(logCell, pinNumber);
        }
        }
    }

function compileTable() {
    // Initialize key classification object
    mapping = {};

    // Loop through every pair of pins and find out what the mapping is
    for (let x = 2; x < tableSize; x++) {
        for (let y = 1; y < x; y++) {
            const cell = document.getElementById(`log-${x}-${y}`);
            if (cell) {
                const intersection = logData[`P${x}`].filter(value => logData[`P${y}`].includes(value));
                if (intersection.length === 0) {
                    cell.textContent = 'null';
                    cell.classList.add('null-cell');
                } else {
                    cell.classList.remove('null-cell');
                    if(intersection.length === 1) {
                        cell.textContent = `${intersection[0]}`;
                        cell.classList.add('valid-cell');
                    }
                    else{
                        cell.textContent = `${intersection.join(', ')}`;
                        cell.classList.add('error-cell');
                    }
                }
            }
        }
    }

    // Classify keys on the mini keyboard
    const validKeys = new Set();
    const errorKeys = new Set();

    for (let x = 2; x < tableSize; x++) {
        for (let y = 1; y < x; y++) {
            const intersection = logData[`P${x}`].filter(value => logData[`P${y}`].includes(value));
            if (intersection.length === 1) {
                validKeys.add(intersection[0]);
            } else if (intersection.length > 1) {
                intersection.forEach(key => errorKeys.add(key));
            }
        }
    }

    Object.keys(allKeys).forEach(key => {
        if (!mapping[key]) {
            mapping[key] = {};
        }
        if (validKeys.has(key)) {
            mapping[key].state = 'valid';
            // Add mapping info if valid
            mapping[key].mapping = [];
            for (let x = 2; x < tableSize; x++) {
            for (let y = 1; y < x; y++) {
                const intersection = logData[`P${x}`].filter(value => logData[`P${y}`].includes(value));
                if (intersection.length === 1 && intersection[0] === key) {
                mapping[key].mapping = [x, y];
                break;
                }
            }
            }
        } else if (errorKeys.has(key)) {
            mapping[key].state = 'error';
            mapping[key].mapping = [];
            for (let pin in logData) {
            if (logData[pin].includes(key)) {
                mapping[key].mapping.push(parseInt(pin.slice(1)));
            }
            }
        } else {
            mapping[key].state = 'null';
            mapping[key].mapping = [];
        }
    });

    // Apply classifications to mini keyboard keys
    const miniKeyboardKeys = document.querySelectorAll('.mini-keyboard .key');
    miniKeyboardKeys.forEach(key => {
        key.classList.remove('valid', 'error', 'null');
        if (mapping[key.id]) {
            key.classList.add(mapping[key.id].state);
        }
    });
    //log out the key classification
    // console.log(mapping);
}

function showTooltip(event) {
    const tooltip = document.getElementById('tooltip');
    if (!tooltip) {
        const newTooltip = document.createElement('div');
        newTooltip.id = 'tooltip';
        newTooltip.classList.add('tooltip');
        document.body.appendChild(newTooltip);
    }
    const tooltipElement = document.getElementById('tooltip');
    tooltipElement.style.display = 'block';
    if (/^log-\d+-\d+$/.test(event.target.id)) {
        const [_, x, y] = event.target.id.split('-');
        tooltipElement.textContent = `P${y} - P${x}: ${event.target.textContent}`;
    }else if (event.target.classList.contains('key')) {
        const key = event.target.id;
        const mappingInfo = mapping[key].state == "valid" ? mapping[key].mapping.join(', ') : 'Error or Null with mapping: '+ mapping[key].mapping.join(', ');
        tooltipElement.textContent = `Key: ${key}, Mapping: ${mappingInfo}`;
    }else{
        tooltipElement.style.display = 'none';
    }
    tooltipElement.style.left = `${event.pageX + 10}px`;
    tooltipElement.style.top = `${event.pageY + 10}px`;
}

function hideTooltip() {
    const tooltip = document.getElementById('tooltip');
    if (tooltip) {
        tooltip.style.display = 'none';
    }
}

// Add this function to check for errors in the data
function checkForErrors() { 
    // returns 0: no errors, 1: critical error (doens't allow export), 2: warning
    // Check if logData is empty
    if (Object.keys(logData).length === 0) {
        alert('No log data to export! Create a table first.');
        return 1;
    }
    // Check if all keys specified in config.premap are present in mapping
    const missingKeys = config.premap.filter(key => !mapping[key] || mapping[key].state !== 'valid');
    if (missingKeys.length > 0) {
        console.error(`The following keys are missing or not valid: ${missingKeys.join(', ')}. Please make sure the keys needed are mapped correctly before exporting. Visit https://fireworks-studios.gitbook.io/fireworks-studios for more documentation.`);
        return 2;
    }
    return 0;
}

function exportData() {
    // Check for errors in the data before export
    const errorCheck = checkForErrors();
    if (errorCheck == 1) {
        return;
    }

    // Prepare the data to be exported
    const exportData = {
        metadata: {
            keyboardModel: document.getElementById('keyboardModel').value,
            totalPins: tableSize - 1,
            cursorOn: cursorOn
        },
        mapping: {},
        logData: logData
    };

    // Add valid keys to the mapping object, starting with config.premap
    config.premap.forEach(key => {
        if (mapping[key] && mapping[key].state === 'valid') {
            exportData.mapping[key] = mapping[key].mapping;
        }
    });

    // Add other valid keys to the mapping object
    Object.keys(mapping).forEach(key => {
        if (mapping[key].state === 'valid' && !exportData.mapping[key]) {
            exportData.mapping[key] = mapping[key].mapping;
        }
    });

    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const fileName = document.getElementById('keyboardModel').value;
    if (fileName) {
        a.download = `${fileName} mapping.json`;
    } else {
        a.download = 'keyboard mapping.json';
    }
    a.href = url;
    a.click();
    URL.revokeObjectURL(url);

    console.log('Exported log data:', exportData);
    if (errorCheck == 2) {
        alert('Log data exported successfully with warnings. Check the console for more details.');
    } else {
        alert('Log data exported successfully! Check your downloads folder.');
    }
}

function loadData(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const content = e.target.result;
            const loadedData = JSON.parse(content);

            document.getElementById('numberInput').value = loadedData.metadata.totalPins;
            document.getElementById('keyboardModel').value = loadedData.metadata.keyboardModel;

            logData = loadedData.logData; 
            console.log('Loaded log data:', logData);
            generateTable();
            // Loop through each pin and load in the log cell data
            for (let pin in logData) {
                const pinNumber = pin.slice(1);
                console.log(`Pin: ${pin}, Log: ${logData[pin]}`);
                const logCell = document.getElementById(`log-${pinNumber}`);
                if (logCell) {
                    logCell.textContent = `${pin} log: ${logData[pin].join(', ')}`;
                }
            }
            cursorOn = loadedData.metadata.cursorOn;
            //trigger the onclick of the cursorOn button
            if (cursorOn) {
                const cursorElement = document.getElementById(cursorOn);
                if (cursorElement) {
                    cursorElement.click();
                } else {
                    console.error(`Element with ID ${cursorOn} not found.`);
                }
            } else {
                console.error('cursorOn is null or empty.');
            }
            compileTable();
        };
        reader.readAsText(file);
    }
}

function loadDefaultFile(){
    // Load default file
    fetch('Dell KB216t mapping.json') // Adjusted path to one level above
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load default mapping file.');
            }
            return response.json();
        })
        .then(loadedData => {
            // Create a mock event object to pass the loaded data to loadData
            const mockEvent = {
                target: {
                    files: [new Blob([JSON.stringify(loadedData)], { type: 'application/json' })]
                }
            };
            loadData(mockEvent); // Call loadData with the mock event
        })
        .catch(error => console.error('Error loading default mapping file:', error));
}

// Add event listeners for mini keyboard keys to show tooltips
const miniKeyboardKeys = document.querySelectorAll('.mini-keyboard .key');
miniKeyboardKeys.forEach(key => {
    key.addEventListener('mousemove', showTooltip);
    key.addEventListener('mouseout', hideTooltip);
});

function resetMiniKeyboard() {
    const miniKeyboardKeys = document.querySelectorAll('.mini-keyboard .key');
    miniKeyboardKeys.forEach(key => {
        key.classList.remove('valid', 'error', 'null');
    });
}

function toggleAdvancedSettings() {
    const tableSection = document.getElementById('tableSection');
    const keyboardModelContainer = document.getElementById('keyboardModelContainer');
    const advancedSettingsToggle = document.getElementById('advancedSettingsToggle');

    if (tableSection && keyboardModelContainer) {
        tableSection.classList.toggle('hidden');
        keyboardModelContainer.classList.toggle('hidden');
        // Update the button text based on the visibility state
        if (tableSection.classList.contains('hidden')) {
            advancedSettingsToggle.textContent = 'Show Advanced Settings';
        } else {
            advancedSettingsToggle.textContent = 'Hide Advanced Settings';
        }
    } else {
        console.error('Elements with IDs "tableSection" or "keyboardModelContainer" not found.');
    }
}