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

const phaseEl = document.getElementById("phase");
const exerciseEl = document.getElementById("exercise");
const timerEl = document.getElementById("timer");

const startBtn = document.getElementById("startBtn");
const resetBtn = document.getElementById("resetBtn");

startBtn.onclick = startWorkout;
resetBtn.onclick = resetWorkout;

/* ---------------- AUDIO BEEP ---------------- */
function beep() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();

  oscillator.type = "sine";
  oscillator.frequency.value = 880; // tone
  gain.gain.value = 0.08;

  oscillator.connect(gain);
  gain.connect(ctx.destination);

  oscillator.start();
  oscillator.stop(ctx.currentTime + 0.15);
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

  phaseEl.textContent = step.phase;

  // 👉 Add "Next up" preview
  if (nextStep) {
    exerciseEl.textContent = `${step.name} → Next: ${nextStep.name}`;
  } else {
    exerciseEl.textContent = step.name;
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
  timerEl.textContent = "0";
}