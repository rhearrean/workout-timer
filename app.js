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
let selectedWorkout = "abs";
let pushupSet = 1;
let pushupRest = Number(localStorage.getItem("pushupRest")) || 90;
let absRounds = Number(localStorage.getItem("absRounds")) || 3;
let isPushupMode = false;

const phaseEl = document.getElementById("phase");
const exerciseEl = document.getElementById("exercise");
const nextExerciseEl = document.getElementById("nextExercise");
const timerEl = document.getElementById("timer");

const startBtn = document.getElementById("startBtn");
const resetBtn = document.getElementById("resetBtn");
const completeSetBtn = document.getElementById("completeSetBtn");
const workoutSelect = document.getElementById("workoutSelect");
const settingsBtn = document.getElementById("settingsBtn");
const workoutPage = document.getElementById("workoutPage");
const settingsPage = document.getElementById("settingsPage");
const closeSettingsBtn = document.getElementById("closeSettingsBtn");
const markBothCompleteBtn = document.getElementById("markBothCompleteBtn");
const pushupRestSelect = document.getElementById("pushupRestSelect");
const absRoundsSelect = document.getElementById("absRoundsSelect");
const selectedWorkoutSummaryEl = document.getElementById("selectedWorkoutSummary");
const absStatusEl = document.getElementById("absStatus");
const pushupStatusEl = document.getElementById("pushupStatus");
const completedScreenEl = document.getElementById("completedScreen");
const appSections = document.querySelectorAll(".app-section");

startBtn.onclick = startWorkout;
resetBtn.onclick = resetWorkout;
completeSetBtn.onclick = completePushupSet;

workoutSelect.onchange = () => {
  selectedWorkout = workoutSelect.value;
  resetWorkout();
  updateWorkoutSummary();
};

pushupRestSelect.value = pushupRest;
absRoundsSelect.value = absRounds;

settingsBtn.onclick = () => {
  workoutPage.style.display = "none";
  settingsPage.style.display = "block";
};

closeSettingsBtn.onclick = () => {
  settingsPage.style.display = "none";
  workoutPage.style.display = "block";
};

markBothCompleteBtn.onclick = markBothWorkoutsCompleteToday;

pushupRestSelect.onchange = () => {
  pushupRest = Number(pushupRestSelect.value);
  localStorage.setItem("pushupRest", pushupRest);
  updateWorkoutSummary();
};

absRoundsSelect.onchange = () => {
  absRounds = Number(absRoundsSelect.value);
  localStorage.setItem("absRounds", absRounds);
  updateWorkoutSummary();
};

function markBothWorkoutsCompleteToday() {
  const confirmed = window.confirm(
    "Mark both the Abs Circuit and Pushup Sets complete for today?"
  );

  if (!confirmed) return;

  const today = getTodayKey();
  localStorage.setItem(`abs-${today}`, "done");
  localStorage.setItem(`pushups-${today}`, "done");

  clearOldWorkoutStatus();

  settingsPage.style.display = "none";
  workoutPage.style.display = "block";

  updateDailyStatus();
}

function updateWorkoutSummary() {
  if (selectedWorkout === "pushups") {
    selectedWorkoutSummaryEl.textContent = `3 sets · ${pushupRest}s rest`;
    return;
  }

  const roundLabel = absRounds === 1 ? "round" : "rounds";
  selectedWorkoutSummaryEl.textContent = `${absRounds} ${roundLabel} · 40s work / 20s rest`;
}

function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }

  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
}

function tone(frequency, duration = 0.14, volume = 0.09) {
  if (!audioCtx) return;

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = "sine";
  osc.frequency.value = frequency;
  gain.gain.value = volume;

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}

function beep() {
  tone(880, 0.12, 0.08);
}

function workBeep() {
  tone(1200, 0.15, 0.1);
}

function restBeep() {
  tone(600, 0.2, 0.1);
}

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

  for (let round = 1; round <= absRounds; round++) {
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
  if (isRunning) return;

  initAudio();

  isRunning = true;
  startBtn.textContent = "Running...";
  startBtn.disabled = true;
  workoutSelect.disabled = true;
  settingsBtn.disabled = true;
  settingsPage.style.display = "none";
  workoutPage.style.display = "block";

  if (selectedWorkout === "pushups") {
    startPushups();
    return;
  }

  buildSequence();
  index = 0;
  runStep();
}

function runStep() {
  if (index >= sequence.length) {
    markWorkoutComplete("abs");
    finishWorkout();
    return;
  }

  const step = sequence[index];
  const nextStep = sequence[index + 1];
  timeLeft = step.duration;

  phaseEl.textContent = step.phase;
  exerciseEl.textContent = step.name;
  nextExerciseEl.textContent = nextStep ? `Next: ${nextStep.name}` : "";
  timerEl.textContent = timeLeft;

  if (step.type === "work") {
    workBeep();
  } else {
    restBeep();
  }

  clearInterval(timer);

  timer = setInterval(() => {
    timeLeft--;
    timerEl.textContent = timeLeft;

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
    markWorkoutComplete("pushups");
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
  settingsBtn.disabled = false;

  isRunning = false;
  isPushupMode = false;

  updateDailyStatus();
}

function resetWorkout() {
  clearInterval(timer);

  isRunning = false;
  isPushupMode = false;

  startBtn.textContent = "Start";
  startBtn.disabled = false;
  workoutSelect.disabled = false;
  settingsBtn.disabled = false;
  completeSetBtn.style.display = "none";

  index = 0;
  phaseEl.textContent = "Ready";
  exerciseEl.textContent = "Press Start";
  nextExerciseEl.textContent = "";
  timerEl.textContent = "0";
}

function getTodayKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function markWorkoutComplete(workoutType) {
  const today = getTodayKey();
  localStorage.setItem(`${workoutType}-${today}`, "done");
  clearOldWorkoutStatus();
  updateDailyStatus();
}

function isWorkoutCompleteToday(workoutType) {
  const today = getTodayKey();
  return localStorage.getItem(`${workoutType}-${today}`) === "done";
}

function updateDailyStatus() {
  const absDone = isWorkoutCompleteToday("abs");
  const pushupsDone = isWorkoutCompleteToday("pushups");

  absStatusEl.textContent = absDone ? "Abs ✓" : "Abs —";
  pushupStatusEl.textContent = pushupsDone ? "Pushups ✓" : "Pushups —";

  absStatusEl.classList.toggle("doneToday", absDone);
  pushupStatusEl.classList.toggle("doneToday", pushupsDone);

  updateCompletedScreen(absDone, pushupsDone);
}

function updateCompletedScreen(absDone, pushupsDone) {
  const allDone = absDone && pushupsDone && !isRunning;

  completedScreenEl.style.display = allDone ? "block" : "none";

  appSections.forEach(section => {
    section.classList.toggle("app-hidden", allDone);
  });
}

function clearOldWorkoutStatus() {
  const today = getTodayKey();

  Object.keys(localStorage).forEach(key => {
    const isWorkoutKey = key.startsWith("abs-") || key.startsWith("pushups-");
    const isTodayKey = key.endsWith(today);

    if (isWorkoutKey && !isTodayKey) {
      localStorage.removeItem(key);
    }
  });
}

clearOldWorkoutStatus();
updateWorkoutSummary();
updateDailyStatus();
