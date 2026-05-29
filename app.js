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

const phaseEl = document.getElementById("phase");
const exerciseEl = document.getElementById("exercise");
const timerEl = document.getElementById("timer");

document.getElementById("startBtn").onclick = startWorkout;
document.getElementById("resetBtn").onclick = resetWorkout;

function buildSequence() {
  sequence = [];

  // Warmup
  warmup.forEach(e => {
    sequence.push({
      phase: "Warmup",
      name: e.name,
      type: "work",
      duration: e.time
    });
  });

  // Circuit (3 rounds)
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

function startWorkout() {
  buildSequence();
  index = 0;
  runStep();
}

function runStep() {
  if (index >= sequence.length) {
    phaseEl.textContent = "Done!";
    exerciseEl.textContent = "Great job";
    timerEl.textContent = "🎉";
    return;
  }

  const step = sequence[index];
  timeLeft = step.duration;

  phaseEl.textContent = step.phase;
  exerciseEl.textContent = step.name;

  clearInterval(timer);
  timer = setInterval(() => {
    timeLeft--;
    timerEl.textContent = timeLeft;

    if (timeLeft <= 0) {
      clearInterval(timer);
      index++;
      runStep();
    }
  }, 1000);
}

function resetWorkout() {
  clearInterval(timer);
  index = 0;
  phaseEl.textContent = "Ready";
  exerciseEl.textContent = "Press Start";
  timerEl.textContent = "0";
}