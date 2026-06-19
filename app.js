const workoutSelect = document.getElementById("workoutSelect");
const completeSetBtn = document.getElementById("completeSetBtn");

let selectedWorkout = "abs";
let pushupSet = 1;
let pushupRest = 90;
let isPushupMode = false;

workoutSelect.onchange = () => {
  selectedWorkout = workoutSelect.value;
  resetWorkout();
};

completeSetBtn.onclick = completePushupSet;

const nextExerciseEl = document.getElementById("nextExercise");

const warmup = [
  { name: "Jumping Jacks", time: 30 },
  { name: "High Knees", time: 30 },
  { name: "Torso Twists", time: 15 },
  { name: "Arm Circles", time: 15 },
  { name: "Squats", time: 30 }
];

const circuitExercises = [
  "Plank Shoulder Taps",
  "Leg Raises",
  "Mountain Climbers",
  "Bicycle Crunches",
  "Squat to Reach"
];

let sequence = [];
let index = 0;
let timer = null;
let timeLeft = 0;
let isRunning = false;
let audioCtx = null;

const phaseEl = document.getElementById("phase");
const exerciseEl = document.getElementById("exercise");
const timerEl = document.getElementById("timer");

const startBtn = document.getElementById("startBtn");
const resetBtn = document.getElementById("resetBtn");

const absStatusEl = document.getElementById("absStatus");
const pushupStatusEl = document.getElementById("pushupStatus");

startBtn.onclick = startWorkout;
resetBtn.onclick = resetWorkout;

function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }

  // iOS requires resume after user gesture
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
}

/* ---------------- AUDIO BEEP ---------------- */
function beep() {
  if (!audioCtx) return;

  const oscillator = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  oscillator.type = "sine";
  oscillator.frequency.value = 880;
  gain.gain.value = 0.08;

  oscillator.connect(gain);
  gain.connect(audioCtx.destination);

  oscillator.start();
  oscillator.stop(audioCtx.currentTime + 0.12);
}

function startBeep() {
  workBeep();

  setTimeout(() => {
    workBeep();
  }, 120);
}

function workBeep() {
  if (!audioCtx) return;

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = "sine";
  osc.frequency.value = 1200;

  gain.gain.value = 0.1;

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start();
  osc.stop(audioCtx.currentTime + 0.15);
}

function restBeep() {
  if (!audioCtx) return;

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = "sine";
  osc.frequency.value = 600;

  gain.gain.value = 0.1;

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start();
  osc.stop(audioCtx.currentTime + 0.2);
}

/* ---------------- SEQUENCE BUILDER ---------------- */
function buildSequence() {
  sequence = [];

  warmup.forEach(e => {
    sequence.push({
      phase: "Warmup",
      name: e.name,
      type: "work",
      duration: e.time
    });
  });

  for (let round = 1; round <= 3; round++) {
    circuitExercises.forEach(ex => {
      sequence.push({
        phase: `Circuit Round ${round}`,
        name: ex,
        type: "work",
        duration: 40
      });

      sequence.push({
        phase: `Circuit Round ${round}`,
        name: "Rest",
        type: "rest",
        duration: 20
      });
    });
  }
}

/* ---------------- START ---------------- */
function startWorkout() {
  if (isRunning) return;

  initAudio();

  isRunning = true;
  startBtn.textContent = "Running...";
  startBtn.disabled = true;
  workoutSelect.disabled = true;

  if (selectedWorkout === "pushups") {
    startPushups();
    return;
  }

  buildSequence();
  index = 0;
  runStep();
}

function startPushups() {
  isPushupMode = true;
  pushupSet = 1;

  phaseEl.textContent = "Pushup Sets";
  exerciseEl.textContent = "Pushups - Set 1";
  nextExerciseEl.textContent = "Do your reps, then tap Complete Set";
  timerEl.textContent = "GO";

  completeSetBtn.style.display = "inline-block";

  workBeep();
}

function completePushupSet() {
  if (!isPushupMode) return;

  if (pushupSet >= 3) {
    finishWorkout();
    return;
  }

  completeSetBtn.style.display = "none";

  phaseEl.textContent = "Rest";
  exerciseEl.textContent = `Set ${pushupSet} Complete`;
  nextExerciseEl.textContent = `Next: Pushups - Set ${pushupSet + 1}`;

  timeLeft = pushupRest;
  timerEl.textContent = timeLeft;

  restBeep();

  clearInterval(timer);

  timer = setInterval(() => {
    timeLeft--;
    timerEl.textContent = timeLeft;

    if (timeLeft <= 3 && timeLeft > 0) {
      beep();
    }

    if (timeLeft <= 0) {
      clearInterval(timer);
      pushupSet++;

      phaseEl.textContent = "Pushup Sets";
      exerciseEl.textContent = `Pushups - Set ${pushupSet}`;
      nextExerciseEl.textContent = "Do your reps, then tap Complete Set";
      timerEl.textContent = "GO";

      completeSetBtn.style.display = "inline-block";
      workBeep();
    }
  }, 1000);
}

function finishWorkout() {
  clearInterval(timer);

  phaseEl.textContent = "Done!";
  exerciseEl.textContent = "Great job";
  nextExerciseEl.textContent = "";
  timerEl.textContent = "🎉";

  completeSetBtn.style.display = "none";
  startBtn.textContent = "Start";
  startBtn.disabled = false;
  workoutSelect.disabled = false;

  isRunning = false;
  isPushupMode = false;
}

/* ---------------- STEP RUNNER ---------------- */
function runStep() {
  if (index >= sequence.length) {
    phaseEl.textContent = "Done!";
    exerciseEl.textContent = "Great job";
    timerEl.textContent = "🎉";

    startBtn.textContent = "Start";
    startBtn.disabled = false;
    isRunning = false;
    return;
  }

  const step = sequence[index];
  timeLeft = step.duration;

  if (step.type === "work") {
  workBeep();
} else {
  restBeep();
}

  const nextStep = sequence[index + 1];

exerciseEl.textContent = step.name;

if (nextStep) {
  nextExerciseEl.textContent = `Next: ${nextStep.name}`;
} else {
  nextExerciseEl.textContent = "";
}

  timerEl.textContent = timeLeft;

  clearInterval(timer);

  timer = setInterval(() => {
    timeLeft--;
    timerEl.textContent = timeLeft;

    /* ---------------- WARNING BEEPS ---------------- */
    if (timeLeft <= 3 && timeLeft > 0) {
      beep();
    }

    if (timeLeft <= 0) {
      clearInterval(timer);
      index++;
      runStep();
    }
  }, 1000);
}

/* ---------------- RESET ---------------- */
function resetWorkout() {
  clearInterval(timer);

  isRunning = false;
  startBtn.textContent = "Start";
  startBtn.disabled = false;

  index = 0;
  phaseEl.textContent = "Ready";
  exerciseEl.textContent = "Press Start";
  nextExerciseEl.textContent = "";
  timerEl.textContent = "0";
  workoutSelect.disabled = false;
  completeSetBtn.style.display = "none";
  isPushupMode = false;
}

function getTodayKey() {
  return new Date().toISOString().split("T")[0];
}

function markWorkoutComplete(workoutType) {
  const today = getTodayKey();
  localStorage.setItem(`${workoutType}-${today}`, "done");
  updateDailyStatus();
}

function isWorkoutCompleteToday(workoutType) {
  const today = getTodayKey();
  return localStorage.getItem(`${workoutType}-${today}`) === "done";
}

function updateDailyStatus() {
  const absDone = isWorkoutCompleteToday("abs");
  const pushupsDone = isWorkoutCompleteToday("pushups");

  absStatusEl.textContent = absDone
    ? "Abs Circuit: Done today ✅"
    : "Abs Circuit: Not done today";

  pushupStatusEl.textContent = pushupsDone
    ? "Pushups: Done today ✅"
    : "Pushups: Not done today";

  absStatusEl.classList.toggle("doneToday", absDone);
  pushupStatusEl.classList.toggle("doneToday", pushupsDone);
}