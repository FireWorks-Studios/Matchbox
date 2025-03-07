var numberInput = document.getElementById('numberInput').value;
var tableSize = parseInt(numberInput) + 1;
var logData = {}; // Object to store log data for each pin

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
        logData[`P${i}`] = []; // Initialize log data for each pin
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
                cell.textContent = `P${i}`; // Label header cells in the first column
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
            cell.addEventListener('mouseover', showTooltip);
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
    tooltipElement.textContent = `ID: ${event.target.id}, Value: ${event.target.textContent}`;
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