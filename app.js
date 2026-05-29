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

  initAudio(); // 🔊 unlock sound on user tap

  isRunning = true;
  startBtn.textContent = "Running...";
  startBtn.disabled = true;

  buildSequence();
  index = 0;
  runStep();
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
}