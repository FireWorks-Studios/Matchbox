var numberInput = document.getElementById('numberInput').value;
var tableSize = parseInt(numberInput) + 1;
var logData = {}; // Object to store log data for each pin

// Add event listeners for export and load buttons
document.getElementById('exportButton').addEventListener('click', exportLogData);
document.getElementById('loadButton').addEventListener('click', function() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    fileInput.addEventListener('change', loadLogData);
    fileInput.click();
});

function generateTable() {
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
    button.addEventListener('click', function() {
        // Remove highlight from all buttons
        const buttons = buttonContainer.getElementsByTagName('button');
        for (let btn of buttons) {
            btn.classList.remove('highlight');
        }
        // Add highlight to the clicked button
        button.classList.add('highlight');

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

        // Show long text input and clear button
        textInputContainer.innerHTML = ''; // Clear previous text input if any
        const textInput = document.createElement('input');
        textInput.type = 'text';
        textInput.style.width = '20%';
        textInput.addEventListener('keydown', function(event) {
            const key = event.key;
            if (!logData[`P${i}`].includes(key)) {
                logData[`P${i}`].push(key);
                logCell.textContent = `P${i} log: ${logData[`P${i}`].join(', ')}`;
            }
            console.log(`Key pressed: ${key}, Code: ${event.code}`);
        });
        textInputContainer.appendChild(textInput);

        const clearButton = document.createElement('button');
        clearButton.textContent = `Clear P${i} logs`;
        clearButton.addEventListener('click', function() {
            logData[`P${i}`] = [];
            logCell.textContent = `P${i} log: `;
            textInput.focus(); // Return focus to the text input
        });
        textInputContainer.appendChild(clearButton);

        const compileTableButton = document.createElement('button');
        compileTableButton.textContent = 'Compile table';
        compileTableButton.addEventListener('click', compileTable);
        textInputContainer.appendChild(compileTableButton);

        textInput.focus(); // Focus on the text input
    });
    buttonContainer.appendChild(button);
}

function compileTable() {
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
    tooltipElement.textContent = `${event.target.id.slice(4)}, Value: ${event.target.textContent}`;
    tooltipElement.style.display = 'block';
    tooltipElement.style.left = `${event.pageX + 10}px`;
    tooltipElement.style.top = `${event.pageY + 10}px`;
}

function hideTooltip() {
    const tooltip = document.getElementById('tooltip');
    if (tooltip) {
        tooltip.style.display = 'none';
    }
}

function exportLogData() {
    //check if logData is empty
    if (Object.keys(logData).length === 0) {
        alert('No log data to export! Create a table first.');
        return;
    }
    const dataStr = JSON.stringify(logData, null, 2);
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
}

function loadLogData(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const content = e.target.result;
            logData = JSON.parse(content);
            document.getElementById('numberInput').value = Object.keys(logData).length;
            if(file.name.split(' mapping')[0] != 'keyboard' && file.name.includes('mapping')){
                document.getElementById('keyboardModel').value = file.name.split(' mapping')[0]; 
            }
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
            compileTable();
        };
        reader.readAsText(file);
    }
}