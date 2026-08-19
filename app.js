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

const todayPlan = [
  { id: "chinups", name: "Chin-up Progression", description: "Beginner program · Waiting for equipment" },
  { id: "pushups", name: "Pushup Sets", description: "3 sets" },
  { id: "abs", name: "Abs Circuit", description: "Timed circuit" }
];

let sequence = [];
let index = 0;
let timer = null;
let timeLeft = 0;
let isRunning = false;
let audioCtx = null;
let selectedWorkout = null;
let pushupSet = 1;
let pushupRest = Number(localStorage.getItem("pushupRest")) || 90;
let absRounds = Number(localStorage.getItem("absRounds")) || 3;
let isPushupMode = false;
let pushupRestEndsAt = null;

const phaseEl = document.getElementById("phase");
const exerciseEl = document.getElementById("exercise");
const nextExerciseEl = document.getElementById("nextExercise");
const timerEl = document.getElementById("timer");
const startBtn = document.getElementById("startBtn");
const resetBtn = document.getElementById("resetBtn");
const completeSetBtn = document.getElementById("completeSetBtn");
const settingsBtn = document.getElementById("settingsBtn");
const workoutPage = document.getElementById("workoutPage");
const settingsPage = document.getElementById("settingsPage");
const closeSettingsBtn = document.getElementById("closeSettingsBtn");
const markAllCompleteBtn = document.getElementById("markAllCompleteBtn");
const pushupRestSelect = document.getElementById("pushupRestSelect");
const absRoundsSelect = document.getElementById("absRoundsSelect");
const completedScreenEl = document.getElementById("completedScreen");
const completedSummaryEl = document.getElementById("completedSummary");
const restDayScreenEl = document.getElementById("restDayScreen");
const todayPlanEl = document.getElementById("todayPlan");
const planListEl = document.getElementById("planList");
const planProgressTextEl = document.getElementById("planProgressText");
const planProgressBarEl = document.getElementById("planProgressBar");
const chinupPlaceholderEl = document.getElementById("chinupPlaceholder");
const completeChinupBtn = document.getElementById("completeChinupBtn");
const skipChinupBtn = document.getElementById("skipChinupBtn");
const backToPlanBtn = document.getElementById("backToPlanBtn");
const workoutRunnerEl = document.getElementById("workoutRunner");
const runnerWorkoutNameEl = document.getElementById("runnerWorkoutName");
const runnerWorkoutSummaryEl = document.getElementById("runnerWorkoutSummary");
const runnerSkipBtn = document.getElementById("runnerSkipBtn");
const runnerBackBtn = document.getElementById("runnerBackBtn");

startBtn.onclick = startWorkout;
resetBtn.onclick = resetWorkout;
completeSetBtn.onclick = completePushupSet;
completeChinupBtn.onclick = () => resolveWorkout("chinups", "completed");
skipChinupBtn.onclick = () => confirmSkipWorkout("chinups");
backToPlanBtn.onclick = showTodayPlan;
runnerSkipBtn.onclick = () => confirmSkipWorkout(selectedWorkout);
runnerBackBtn.onclick = returnToPlan;

pushupRestSelect.value = pushupRest;
absRoundsSelect.value = absRounds;

settingsBtn.onclick = () => {
  workoutPage.style.display = "none";
  settingsPage.style.display = "block";
};

closeSettingsBtn.onclick = () => {
  settingsPage.style.display = "none";
  workoutPage.style.display = "block";
  showTodayPlan();
};

markAllCompleteBtn.onclick = markAllWorkoutsCompleteToday;

pushupRestSelect.onchange = () => {
  pushupRest = Number(pushupRestSelect.value);
  localStorage.setItem("pushupRest", pushupRest);
  renderTodayPlan();
};

absRoundsSelect.onchange = () => {
  absRounds = Number(absRoundsSelect.value);
  localStorage.setItem("absRounds", absRounds);
  renderTodayPlan();
};

function getTodayKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isRestDay() {
  return new Date().getDay() === 0;
}

function getWorkoutStatus(workoutId) {
  return localStorage.getItem(`plan-${workoutId}-${getTodayKey()}`) || "not_started";
}

function setWorkoutStatus(workoutId, status) {
  localStorage.setItem(`plan-${workoutId}-${getTodayKey()}`, status);
}

function isResolved(status) {
  return status === "completed" || status === "skipped";
}

function getCurrentWorkoutIndex() {
  return todayPlan.findIndex(item => !isResolved(getWorkoutStatus(item.id)));
}

function getWorkoutDescription(workoutId) {
  if (workoutId === "pushups") return `3 sets · ${pushupRest}s rest`;
  if (workoutId === "abs") {
    const roundLabel = absRounds === 1 ? "round" : "rounds";
    return `${absRounds} ${roundLabel} · 40s work / 20s rest`;
  }
  return "Beginner program · Waiting for equipment";
}

function renderTodayPlan() {
  const currentIndex = getCurrentWorkoutIndex();
  const resolvedCount = todayPlan.filter(item => isResolved(getWorkoutStatus(item.id))).length;

  planProgressTextEl.textContent = `${resolvedCount} / ${todayPlan.length} Finished`;
  planProgressBarEl.style.width = `${(resolvedCount / todayPlan.length) * 100}%`;
  planListEl.innerHTML = "";

  todayPlan.forEach((item, itemIndex) => {
    const status = getWorkoutStatus(item.id);
    const locked = currentIndex !== -1 && itemIndex > currentIndex;
    const current = itemIndex === currentIndex;
    const card = document.createElement("article");
    card.className = "plan-item";

    if (status === "completed") card.classList.add("completed");
    if (status === "skipped") card.classList.add("skipped");
    if (locked) card.classList.add("locked");
    if (current) card.classList.add("current");

    let statusText = getWorkoutDescription(item.id);
    let statusIcon = String(itemIndex + 1);

    if (status === "completed") {
      statusText = "Completed today";
      statusIcon = "✓";
    } else if (status === "skipped") {
      statusText = "Skipped today";
      statusIcon = "↷";
    } else if (locked) {
      const previousName = todayPlan[itemIndex - 1].name;
      statusText = `Complete or skip ${previousName} first`;
      statusIcon = "🔒";
    }

    card.innerHTML = `
      <div class="plan-item-top">
        <div class="plan-number">${statusIcon}</div>
        <div class="plan-item-content">
          <div class="plan-item-title">${item.name}</div>
          <p class="plan-item-status">${statusText}</p>
        </div>
      </div>
    `;

    if (current && status === "not_started") {
      const actions = document.createElement("div");
      actions.className = "plan-item-actions";

      const startButton = document.createElement("button");
      startButton.textContent = "Start";
      startButton.onclick = () => openWorkout(item.id);

      const skipButton = document.createElement("button");
      skipButton.textContent = "Skip";
      skipButton.className = "skip-btn";
      skipButton.onclick = () => confirmSkipWorkout(item.id);

      actions.append(startButton, skipButton);
      card.appendChild(actions);
    }

    planListEl.appendChild(card);
  });

  updateStatusScreen();
}

function openWorkout(workoutId) {
  if (isRestDay() || getWorkoutStatus(workoutId) !== "not_started") return;

  const currentIndex = getCurrentWorkoutIndex();
  const requestedIndex = todayPlan.findIndex(item => item.id === workoutId);
  if (requestedIndex !== currentIndex) return;

  selectedWorkout = workoutId;
  todayPlanEl.style.display = "none";
  completedScreenEl.style.display = "none";

  if (workoutId === "chinups") {
    chinupPlaceholderEl.style.display = "block";
    workoutRunnerEl.style.display = "none";
    return;
  }

  chinupPlaceholderEl.style.display = "none";
  workoutRunnerEl.style.display = "block";
  runnerWorkoutNameEl.textContent = workoutId === "pushups" ? "Pushup Sets" : "Abs Circuit";
  runnerWorkoutSummaryEl.textContent = getWorkoutDescription(workoutId);
  resetWorkout();
}

function showTodayPlan() {
  if (isRunning) return;
  selectedWorkout = null;
  chinupPlaceholderEl.style.display = "none";
  workoutRunnerEl.style.display = "none";
  todayPlanEl.style.display = "block";
  renderTodayPlan();
}

function returnToPlan() {
  if (isRunning) {
    const confirmed = window.confirm("Leave this workout? Current timer progress will be reset.");
    if (!confirmed) return;
  }
  resetWorkout();
  showTodayPlan();
}

function confirmSkipWorkout(workoutId) {
  if (!workoutId || isResolved(getWorkoutStatus(workoutId))) return;
  const workout = todayPlan.find(item => item.id === workoutId);
  const confirmed = window.confirm(`Skip ${workout.name} for today?`);
  if (!confirmed) return;

  resetWorkout();
  resolveWorkout(workoutId, "skipped");
}

function resolveWorkout(workoutId, status) {
  setWorkoutStatus(workoutId, status);
  clearOldWorkoutStatus();
  showTodayPlan();
}

function markAllWorkoutsCompleteToday() {
  const confirmed = window.confirm("Mark all three workouts complete for today?");
  if (!confirmed) return;

  todayPlan.forEach(item => setWorkoutStatus(item.id, "completed"));
  clearOldWorkoutStatus();
  settingsPage.style.display = "none";
  workoutPage.style.display = "block";
  showTodayPlan();
}

function initAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === "suspended") audioCtx.resume();
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

function beep() { tone(880, 0.12, 0.08); }
function workBeep() { tone(1200, 0.15, 0.1); }
function restBeep() { tone(600, 0.2, 0.1); }

function buildSequence() {
  sequence = [];
  warmup.forEach(e => sequence.push({ phase: "Warmup", name: e.name, type: "work", duration: e.time }));

  for (let round = 1; round <= absRounds; round++) {
    circuitExercises.forEach(ex => {
      sequence.push({ phase: `Circuit Round ${round}`, name: ex, type: "work", duration: 40 });
      sequence.push({ phase: `Circuit Round ${round}`, name: "Rest", type: "rest", duration: 20 });
    });
  }
}

function startWorkout() {
  if (isRunning || isRestDay() || !selectedWorkout) return;
  initAudio();
  isRunning = true;
  startBtn.textContent = "Running...";
  startBtn.disabled = true;
  settingsBtn.disabled = true;
  runnerSkipBtn.disabled = true;
  runnerBackBtn.disabled = true;

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
  step.type === "work" ? workBeep() : restBeep();
  clearInterval(timer);

  timer = setInterval(() => {
    timeLeft--;
    timerEl.textContent = timeLeft;
    if (timeLeft <= 3 && timeLeft > 0) beep();
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

function startNativePushupRestTimer(seconds) {
  const shortcutUrl = `shortcuts://run-shortcut?name=Fit%20Timer%20Rest&input=text&text=${encodeURIComponent(seconds)}`;
  window.location.href = shortcutUrl;
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
  pushupRestEndsAt = Date.now() + pushupRest * 1000;
  timerEl.textContent = timeLeft;
  restBeep();
  clearInterval(timer);

  timer = setInterval(updatePushupRestTimer, 1000);
  startNativePushupRestTimer(pushupRest);
}

function updatePushupRestTimer() {
  if (!pushupRestEndsAt) return;

  timeLeft = Math.max(0, Math.ceil((pushupRestEndsAt - Date.now()) / 1000));
  timerEl.textContent = timeLeft;

  if (timeLeft <= 3 && timeLeft > 0) beep();
  if (timeLeft > 0) return;

  clearInterval(timer);
  pushupRestEndsAt = null;
  pushupSet++;
  phaseEl.textContent = "Pushup Sets";
  exerciseEl.textContent = `Pushups - Set ${pushupSet}`;
  nextExerciseEl.textContent = "Do your reps, then tap Complete Set";
  timerEl.textContent = "GO";
  completeSetBtn.style.display = "inline-block";
  workBeep();
}

document.addEventListener("visibilitychange", () => {
  if (!document.hidden && isPushupMode && pushupRestEndsAt) {
    updatePushupRestTimer();
  }
});

function finishWorkout() {
  const completedWorkout = selectedWorkout;
  clearInterval(timer);
  isRunning = false;
  isPushupMode = false;
  pushupRestEndsAt = null;
  completeSetBtn.style.display = "none";
  startBtn.textContent = "Start";
  startBtn.disabled = false;
  settingsBtn.disabled = false;
  runnerSkipBtn.disabled = false;
  runnerBackBtn.disabled = false;
  setWorkoutStatus(completedWorkout, "completed");
  clearOldWorkoutStatus();
  selectedWorkout = null;
  showTodayPlan();
}

function resetWorkout() {
  clearInterval(timer);
  isRunning = false;
  isPushupMode = false;
  pushupRestEndsAt = null;
  startBtn.textContent = "Start";
  startBtn.disabled = false;
  settingsBtn.disabled = false;
  runnerSkipBtn.disabled = false;
  runnerBackBtn.disabled = false;
  completeSetBtn.style.display = "none";
  index = 0;
  phaseEl.textContent = "Ready";
  exerciseEl.textContent = "Press Start";
  nextExerciseEl.textContent = "";
  timerEl.textContent = "0";
}

function updateStatusScreen() {
  const restDay = isRestDay();
  const statuses = todayPlan.map(item => getWorkoutStatus(item.id));
  const allResolved = statuses.every(isResolved);
  const completedCount = statuses.filter(status => status === "completed").length;
  const skippedCount = statuses.filter(status => status === "skipped").length;

  restDayScreenEl.style.display = restDay ? "block" : "none";
  completedScreenEl.style.display = !restDay && allResolved ? "block" : "none";
  todayPlanEl.style.display = restDay || allResolved ? "none" : "block";

  if (allResolved) {
    completedSummaryEl.textContent = skippedCount
      ? `${completedCount} completed · ${skippedCount} skipped`
      : "All 3 workouts completed. Great job!";
  }
}

function clearOldWorkoutStatus() {
  const today = getTodayKey();
  Object.keys(localStorage).forEach(key => {
    const isPlanKey = key.startsWith("plan-");
    const isLegacyWorkoutKey = key.startsWith("abs-") || key.startsWith("pushups-");
    const isTodayKey = key.endsWith(today);
    if ((isPlanKey || isLegacyWorkoutKey) && !isTodayKey) localStorage.removeItem(key);
  });
}

clearOldWorkoutStatus();
renderTodayPlan();


const APP_VERSION = "3.13.2";

function setupAppUpdateFlow() {
  const updateSheet = document.getElementById("updateSheet");
  const installUpdateBtn = document.getElementById("installUpdateBtn");
  const laterUpdateBtn = document.getElementById("laterUpdateBtn");
  const updateStatus = document.getElementById("updateStatus");
  const updateSummary = document.getElementById("updateSummary");
  if (!updateSheet || !installUpdateBtn || !laterUpdateBtn || !updateStatus || !updateSummary) return;
  if (!("serviceWorker" in navigator)) return;

  let latestVersion = APP_VERSION;
  let isReloading = false;
  let installStarted = false;

  const showUpdateAvailable = available => {
    latestVersion = available.version;
    const changes = Array.isArray(available.summary) && available.summary.length
      ? available.summary
      : ["General improvements and fixes."];
    updateSummary.innerHTML = "";
    changes.forEach(change => {
      const item = document.createElement("li");
      item.textContent = change;
      updateSummary.appendChild(item);
    });
    installUpdateBtn.disabled = false;
    installUpdateBtn.textContent = "Install Update";
    laterUpdateBtn.disabled = false;
    updateStatus.textContent = `Version ${latestVersion} is ready. It will not install until you approve it.`;
    updateSheet.classList.remove("app-hidden");
  };

  const activateWorker = worker => {
    if (!worker) return;
    const activate = () => {
      if (worker.state === "installed") {
        worker.postMessage({ type: "SKIP_WAITING" });
      }
    };
    worker.addEventListener("statechange", activate);
    activate();
  };

  installUpdateBtn.addEventListener("click", async () => {
    if (installStarted || latestVersion === APP_VERSION) return;
    installStarted = true;
    installUpdateBtn.disabled = true;
    installUpdateBtn.textContent = "Installing…";
    laterUpdateBtn.disabled = true;
    updateStatus.textContent = "Installing the approved update. Fit Timer will reopen automatically.";

    try {
      const registration = await navigator.serviceWorker.register(
        `service-worker-v${encodeURIComponent(latestVersion)}.js`,
        { scope: "./", updateViaCache: "none" }
      );
      if (registration.waiting) activateWorker(registration.waiting);
      else if (registration.installing) activateWorker(registration.installing);
      else if (registration.active) window.location.reload();
    } catch {
      installStarted = false;
      installUpdateBtn.disabled = false;
      installUpdateBtn.textContent = "Try Again";
      laterUpdateBtn.disabled = false;
      updateStatus.textContent = "The update could not start. Check your connection and try again.";
    }
  });

  laterUpdateBtn.addEventListener("click", () => {
    updateSheet.classList.add("app-hidden");
  });

  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (isReloading) return;
    isReloading = true;
    window.location.reload();
  });

  const checkForUpdate = async () => {
    try {
      const response = await fetch(`version.json?time=${Date.now()}`, { cache: "no-store" });
      if (!response.ok) return;
      const available = await response.json();
      if (!available.version || available.version === APP_VERSION) return;
      showUpdateAvailable(available);
    } catch {
      // Stay on the current version when offline or when the update check fails.
    }
  };

  checkForUpdate();
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") checkForUpdate();
  });
  window.addEventListener("pageshow", checkForUpdate);
  setInterval(checkForUpdate, 5 * 60 * 1000);
}

setupAppUpdateFlow();
