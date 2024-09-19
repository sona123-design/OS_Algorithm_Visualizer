const processList = document.getElementById('process-list');
const ganttChart = document.getElementById('gantt-chart');
const algorithmSelect = document.getElementById('algorithm-select');
const generateProcessesBtn = document.getElementById('generate-processes');
const startSchedulingBtn = document.getElementById('start-scheduling');
const processCountSlider = document.getElementById('process-count');
const timeQuantumSlider = document.getElementById('time-quantum');

let processes = [];

function generateProcesses() {
    processes = [];
    processList.innerHTML = '';
    const processCount = parseInt(processCountSlider.value);

    for (let i = 0; i < processCount; i++) {
        const process = {
            id: i + 1,
            arrivalTime: Math.floor(Math.random() * 10),
            burstTime: Math.floor(Math.random() * 10) + 1,
            priority: Math.floor(Math.random() * 5) + 1,
            remainingTime: 0
        };
        process.remainingTime = process.burstTime;
        processes.push(process);

        const processElement = document.createElement('div');
        processElement.classList.add('process');
        processElement.innerHTML = `
            <h3>Process ${process.id}</h3>
            <p>Arrival Time: ${process.arrivalTime}</p>
            <p>Burst Time: ${process.burstTime}</p>
            <p>Priority: ${process.priority}</p>
        `;
        processList.appendChild(processElement);
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function visualizeScheduling(schedule) {
    ganttChart.innerHTML = '';
    let currentTime = 0;

    for (const item of schedule) {
        const bar = document.createElement('div');
        bar.classList.add('gantt-bar');
        bar.style.width = `${item.duration * 30}px`;
        bar.setAttribute('data-process', `P${item.process}`);
        bar.setAttribute('data-time', `${currentTime}-${currentTime + item.duration}`);
        ganttChart.appendChild(bar);

        currentTime += item.duration;
        await sleep(500);
    }
}

async function fcfs() {
    const sortedProcesses = [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime);
    const schedule = [];
    let currentTime = 0;

    for (const process of sortedProcesses) {
        if (currentTime < process.arrivalTime) {
            currentTime = process.arrivalTime;
        }
        schedule.push({ process: process.id, duration: process.burstTime });
        currentTime += process.burstTime;
    }

    await visualizeScheduling(schedule);
}

async function sjf() {
    const schedule = [];
    let currentTime = 0;
    const remainingProcesses = [...processes];

    while (remainingProcesses.length > 0) {
        const availableProcesses = remainingProcesses.filter(p => p.arrivalTime <= currentTime);
        if (availableProcesses.length === 0) {
            currentTime++;
            continue;
        }

        const shortestJob = availableProcesses.reduce((prev, current) => 
            prev.burstTime < current.burstTime ? prev : current
        );

        schedule.push({ process: shortestJob.id, duration: shortestJob.burstTime });
        currentTime += shortestJob.burstTime;
        const index = remainingProcesses.findIndex(p => p.id === shortestJob.id);
        remainingProcesses.splice(index, 1);
    }

    await visualizeScheduling(schedule);
}

async function srjf() {
    const schedule = [];
    let currentTime = 0;
    const remainingProcesses = processes.map(p => ({ ...p }));

    while (remainingProcesses.length > 0) {
        const availableProcesses = remainingProcesses.filter(p => p.arrivalTime <= currentTime);
        if (availableProcesses.length === 0) {
            currentTime++;
            continue;
        }

        const shortestJob = availableProcesses.reduce((prev, current) => 
            prev.remainingTime < current.remainingTime ? prev : current
        );

        schedule.push({ process: shortestJob.id, duration: 1 });
        shortestJob.remainingTime--;
        currentTime++;

        if (shortestJob.remainingTime === 0) {
            const index = remainingProcesses.findIndex(p => p.id === shortestJob.id);
            remainingProcesses.splice(index, 1);
        }
    }

    await visualizeScheduling(schedule);
}

async function priorityScheduling() {
    const schedule = [];
    let currentTime = 0;
    const remainingProcesses = [...processes];

    while (remainingProcesses.length > 0) {
        const availableProcesses = remainingProcesses.filter(p => p.arrivalTime <= currentTime);
        if (availableProcesses.length === 0) {
            currentTime++;
            continue;
        }

        const highestPriority = availableProcesses.reduce((prev, current) => 
            prev.priority < current.priority ? prev : current
        );

        schedule.push({ process: highestPriority.id, duration: highestPriority.burstTime });
        currentTime += highestPriority.burstTime;
        const index = remainingProcesses.findIndex(p => p.id === highestPriority.id);
        remainingProcesses.splice(index, 1);
    }

    await visualizeScheduling(schedule);
}

async function roundRobin() {
    const schedule = [];
    let currentTime = 0;
    const remainingProcesses = processes.map(p => ({ ...p }));
    const timeQuantum = parseInt(timeQuantumSlider.value);

    while (remainingProcesses.length > 0) {
        const availableProcesses = remainingProcesses.filter(p => p.arrivalTime <= currentTime);
        if (availableProcesses.length === 0) {
            currentTime++;
            continue;
        }

        const currentProcess = availableProcesses.shift();
        const executionTime = Math.min(timeQuantum, currentProcess.remainingTime);

        schedule.push({ process: currentProcess.id, duration: executionTime });
        currentTime += executionTime;
        currentProcess.remainingTime -= executionTime;

        if (currentProcess.remainingTime > 0) {
            remainingProcesses.push(currentProcess);
        } else {
            const index = remainingProcesses.findIndex(p => p.id === currentProcess.id);
            if (index !== -1) {
                remainingProcesses.splice(index, 1);
            }
        }
    }

    await visualizeScheduling(schedule);
}

async function startScheduling() {
    const selectedAlgorithm = algorithmSelect.value;
    switch (selectedAlgorithm) {
        case 'fcfs':
            await fcfs();
            break;
        case 'sjf':
            await sjf();
            break;
        case 'srjf':
            await srjf();
            break;
        case 'priority':
            await priorityScheduling();
            break;
        case 'round-robin':
            await roundRobin();
            break;
    }
}

generateProcessesBtn.addEventListener('click', generateProcesses);
startSchedulingBtn.addEventListener('click', startScheduling);
processCountSlider.addEventListener('input', generateProcesses);

generateProcesses();