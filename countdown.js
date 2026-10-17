// Countdown to the site launch: 30 November 2026, 10:00 Israel time.
// "+02:00" is Israel's winter time zone (UTC+2).
const launchDate = new Date("2026-11-30T10:00:00+02:00");

// Turns 6 into "06" so every number has two digits
function twoDigits(number) {
  return String(number).padStart(2, "0");
}

function updateCountdown() {
  // How many seconds are left (never below 0)
  const secondsLeft = Math.max(0, Math.floor((launchDate - new Date()) / 1000));

  const weeks = Math.floor(secondsLeft / (7 * 24 * 60 * 60));
  const days = Math.floor(secondsLeft / (24 * 60 * 60)) % 7;
  const hours = Math.floor(secondsLeft / (60 * 60)) % 24;
  const minutes = Math.floor(secondsLeft / 60) % 60;
  const seconds = secondsLeft % 60;

  document.getElementById("countdown-weeks").textContent = twoDigits(weeks);
  document.getElementById("countdown-days").textContent = twoDigits(days);
  document.getElementById("countdown-hours").textContent = twoDigits(hours);
  document.getElementById("countdown-minutes").textContent = twoDigits(minutes);
  document.getElementById("countdown-seconds").textContent = twoDigits(seconds);
}

// Show the numbers right away, then update them every second
updateCountdown();
setInterval(updateCountdown, 1000);
