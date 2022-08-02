//Increase or decrease input value
function increase(element) {
    let el = document.querySelector(`[name="${element}"]`);
    el.value = parseInt(el.value) + 1;
}

function decrease(element) {
    let el = document.querySelector(`[name="${element}"]`);
    if (parseInt(el.value) > 0) {
        el.value = parseInt(el.value) - 1;
    }
}

//Modal OPEN/CLOSE
const bck = document.getElementById("background");

document.querySelector(".close-modal").addEventListener("click", () => {
    document.querySelector(".modal").style.display = "none";
    bck.classList.remove("active-background");
    bck.classList.add("inactive-background");
})

document.querySelector(".settings").addEventListener("click", () => {
    document.querySelector(".modal").style.display = "block";
    bck.classList.add("active-background");
    bck.classList.remove("inactive-background");
})

//Change font
const fontBtns = document.querySelectorAll('.font-input');


fontBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
        fontBtns.forEach(btn => {
            btn.classList.remove("active-font")
        })
        e.target.classList.add("active-font");
    })
});

//Change color
const colorBtns = document.querySelectorAll('.color-input');

colorBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
        colorBtns.forEach(btn => {
            btn.classList.remove("active-color")
        })
        e.target.classList.add("active-color");
    })

});

//Apply selected font & colors
const applyBtn = document.getElementById("apply-btn");
let root = document.documentElement;

applyBtn.addEventListener("click", () => {
    let clockNumbers = document.querySelector(".container-inner .time")

    for (let i = 0; i < fontBtns.length; i++) {
        if (fontBtns[0].classList.contains("active-font")) {
            root.style.setProperty('--font-choice', 'Kumbh Sans');
            clockNumbers.style.letterSpacing = "-5px";
            document.documentElement.style.fontSize = "16px";
        } else if (fontBtns[1].classList.contains("active-font")) {
            clockNumbers.style.letterSpacing = "0px";
            root.style.setProperty('--font-choice', 'Roboto Slab');
            document.documentElement.style.fontSize = "16px";
        } else {
            clockNumbers.style.letterSpacing = "-10px";
            root.style.setProperty('--font-choice', 'Space Mono');
            document.documentElement.style.fontSize = "14px";
        }
    }
})
applyBtn.addEventListener("click", () => {
    for (let j = 0; j < colorBtns.length; j++) {
        if (colorBtns[0].classList.contains("active-color")) {
            root.style.setProperty('--color-choice', '#F87070');
        } else if (colorBtns[1].classList.contains("active-color")) {
            root.style.setProperty('--color-choice', '#70F3F8');
        } else {
            root.style.setProperty('--color-choice', '#D881F8');
        }
    }
})




// Timer

document.addEventListener('DOMContentLoaded', () => {
    // Let's check if the browser supports notifications
    if ('Notification' in window) {
        // If notification permissions have neither been granted or denied
        if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
            // ask the user for permission
            Notification.requestPermission().then(function (permission) {
                // If permission is granted
                if (permission === 'granted') {
                    // Create a new notification
                    new Notification(
                        'Awesome! You will be notified at the start of each session'
                    );
                }
            });
        }
    }
    switchMode('pomodoro');
});


const timer = {
    pomodoro: document.getElementById("pomodoro").value,
    shortBreak: document.getElementById("short-break").value,
    longBreak: document.getElementById("long-break").value,
    longBreakInterval: 4,
    sessions: 0
};
applyBtn.addEventListener('click', handleMode);
applyBtn.addEventListener("click", () => {
    timer.pomodoro = document.getElementById("pomodoro").value;
    timer.shortBreak = document.getElementById("short-break").value;
    timer.longBreak = document.getElementById("long-break").value;
    stopTimer();
    updateClock();
    switchMode('pomodoro')
});
let interval;

const playSound = new Audio('./assets/play.mp3');
//const stopSound = new Audio('./assets/stop');
//stopSound.play();

const mainButton = document.getElementById('main-button');
mainButton.addEventListener('click', () => {
    const { action } = mainButton.dataset;
    if (action === 'start') {
        startTimer();
        playSound.play();
    } else {
        stopTimer();
    }
});

const modeButtons = document.querySelector("#mode-buttons");

modeButtons.addEventListener('click', handleMode);

function handleMode(event) {
    const { mode } = event.target.dataset;

    if (!mode) return;

    switchMode(mode);
    stopTimer();
}

function switchMode(mode) {
    timer.mode = mode;
    timer.remainingTime = {
        total: timer[mode] * 60,
        minutes: timer[mode],
        seconds: 0,
    };

    document.querySelectorAll('div[data-mode]').forEach(e => e.classList.remove('active-choice'));
    document.querySelector(`[data-mode="${mode}"]`).classList.add('active-choice');
    updateClock();

    //document.getElementById('progress-border').setAttribute('stroke-dashoffset', '0')
}

function getRemainingTime(endTime) {
    const currentTime = Date.parse(new Date());
    const difference = endTime - currentTime;

    const total = Number.parseInt(difference / 1000, 10);
    const minutes = Number.parseInt((total / 60) % 60, 10);
    const seconds = Number.parseInt(total % 60, 10);

    return {
        total,
        minutes,
        seconds,
    };
}


function startTimer() {
    let { total } = timer.remainingTime;
    const endTime = Date.parse(new Date()) + total * 1000;

    if (timer.mode === 'pomodoro') timer.sessions++;

    mainButton.dataset.action = 'stop';
    mainButton.textContent = 'PAUSE';
    mainButton.classList.add('active');

    interval = setInterval(function () {
        timer.remainingTime = getRemainingTime(endTime);
        updateClock();

        total = timer.remainingTime.total;
        if (total <= 0) {
            clearInterval(interval);

            switch (timer.mode) {
                case 'pomodoro':
                    if (timer.sessions % timer.longBreakInterval === 0) {
                        switchMode('longBreak');
                    } else {
                        switchMode('shortBreak');
                    }
                    break;
                default:
                    switchMode('pomodoro');
            }
            document.querySelector(`[data-sound="${timer.mode}"]`).play();
            startTimer();
        }
    }, 1000);

}

function stopTimer() {
    clearInterval(interval);

    mainButton.dataset.action = 'start';
    mainButton.textContent = 'START';
}

function updateClock() {
    const { remainingTime } = timer;
    const minutes = `${remainingTime.minutes}`.padStart(2, '0')
    const seconds = `${remainingTime.seconds}`.padStart(2, '0')

    const min = document.getElementById('minutes');
    const sec = document.getElementById('seconds');

    min.textContent = minutes;
    sec.textContent = seconds;
    const text = timer.mode === 'pomodoro' ? 'Working' : 'Break time';
    document.title = `${minutes}:${seconds} — ${text}`;
    const progress = document.getElementById('progress-border');


    //Progress circle
    let timeFraction = 1023 / (timer[timer.mode] * 60);

    let progressTimer = timeFraction * timer.remainingTime.total;

    progress.style.strokeDashoffset = 1023 - progressTimer;

    console.log(timer[timer.mode]);
    console.log(timer.pomodoro);
    console.log(timer.shortBreak);
    console.log(timer.longBreak);

}