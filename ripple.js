// Water ripples that follow the mouse.
//
// How it works:
// 1. A small invisible "water surface" (a grid of numbers) is simulated here.
//    Moving the mouse drops a drop into it, and the waves spread out and fade.
// 2. Every frame the water is turned into an image.
// 3. The SVG filter "#water-ripple" (in index.html) uses that image
//    to bend the page content, like looking through water.

const page = document.querySelector(".page");
const rippleMap = document.getElementById("ripple-map");

// Don't run for people who turned on "reduce motion" in their computer settings
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (page && rippleMap && !reduceMotion) {
  startRipples();
}

function startRipples() {
  // Settings you can play with
  const CELL_SIZE = 4;       // one water cell = 4×4 pixels (smaller = smoother but slower)
  const FADE = 0.97;         // how long ripples last (closer to 1 = longer)
  const DROP_STRENGTH = 12;  // how strong each new drop is
  const DROP_RADIUS = 4;     // how wide each drop is (in water cells)
  const DROP_SPACING = 10;   // the mouse must move this many pixels before the next drop
  const BEND = 4;            // how much the waves bend the content

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  let columns, rows;         // size of the water grid
  let waterNow, waterBefore; // the water height now and one frame ago
  let image;                 // the picture we draw the water into
  let isRunning = false;
  let lastDropX = -999;      // where the last drop fell
  let lastDropY = -999;

  // Build (or rebuild) the water grid to match the page size
  function setSize() {
    columns = Math.ceil(page.offsetWidth / CELL_SIZE) + 2;
    rows = Math.ceil(page.offsetHeight / CELL_SIZE) + 2;
    waterNow = new Float32Array(columns * rows);
    waterBefore = new Float32Array(columns * rows);
    canvas.width = columns;
    canvas.height = rows;
    image = context.createImageData(columns, rows);

    // Stretch the water picture over the whole page
    rippleMap.setAttribute("width", columns * CELL_SIZE);
    rippleMap.setAttribute("height", rows * CELL_SIZE);
  }

  // Drop a drop into the water where the mouse is
  function addDrop(event) {
    if (event.pointerType === "touch") return; // phones: no effect

    // Only drop again after the mouse has moved a little
    const distance = Math.hypot(event.clientX - lastDropX, event.clientY - lastDropY);
    if (distance < DROP_SPACING) return;
    lastDropX = event.clientX;
    lastDropY = event.clientY;

    const box = page.getBoundingClientRect();
    const centerColumn = Math.round((event.clientX - box.left) / CELL_SIZE);
    const centerRow = Math.round((event.clientY - box.top) / CELL_SIZE);

    // A soft round drop: strongest in the middle, fading to 0 at the edge
    for (let dy = -DROP_RADIUS; dy <= DROP_RADIUS; dy++) {
      for (let dx = -DROP_RADIUS; dx <= DROP_RADIUS; dx++) {
        const row = centerRow + dy;
        const column = centerColumn + dx;
        const distanceFromCenter = Math.hypot(dx, dy) / DROP_RADIUS;
        if (distanceFromCenter > 1) continue;
        if (column < 1 || row < 1 || column > columns - 2 || row > rows - 2) continue;
        const softness = (Math.cos(distanceFromCenter * Math.PI) + 1) / 2;
        waterBefore[row * columns + column] += DROP_STRENGTH * softness;
      }
    }

    // Start the animation if the water was calm
    if (!isRunning) {
      isRunning = true;
      page.style.filter = "url(#water-ripple)";
      requestAnimationFrame(animate);
    }
  }

  // One step of the water: every cell moves toward the average of its neighbours
  function moveWater() {
    let totalMovement = 0;

    for (let row = 1; row < rows - 1; row++) {
      for (let column = 1; column < columns - 1; column++) {
        const i = row * columns + column;
        const neighbours =
          waterBefore[i - 1] + waterBefore[i + 1] +
          waterBefore[i - columns] + waterBefore[i + columns];
        const height = (neighbours / 2 - waterNow[i]) * FADE;
        waterNow[i] = height;
        totalMovement += Math.abs(height);
      }
    }

    // Swap: "now" becomes "before" for the next step
    const swap = waterBefore;
    waterBefore = waterNow;
    waterNow = swap;

    return totalMovement;
  }

  // Turn the water into a picture: red = push left/right, green = push up/down
  function drawWater() {
    const pixels = image.data;

    for (let row = 1; row < rows - 1; row++) {
      for (let column = 1; column < columns - 1; column++) {
        const i = row * columns + column;
        const slopeX = waterBefore[i - 1] - waterBefore[i + 1];
        const slopeY = waterBefore[i - columns] - waterBefore[i + columns];
        const p = i * 4;
        pixels[p] = 128 + slopeX * BEND;     // red (128 = no movement)
        pixels[p + 1] = 128 + slopeY * BEND; // green
        pixels[p + 2] = 128;                 // blue (not used)
        pixels[p + 3] = 255;                 // fully visible
      }
    }

    context.putImageData(image, 0, 0);
    const picture = canvas.toDataURL();
    rippleMap.setAttribute("href", picture);
    rippleMap.setAttributeNS("http://www.w3.org/1999/xlink", "href", picture); // older Safari
  }

  function animate() {
    const movement = moveWater();
    drawWater();

    // When the water is calm again, turn the filter off so the text is sharp
    if (movement < 1) {
      isRunning = false;
      page.style.filter = "";
      return;
    }
    requestAnimationFrame(animate);
  }

  // Fill the "no movement" color everywhere before the first drop
  function resetImage() {
    image.data.fill(128);
    for (let p = 3; p < image.data.length; p += 4) image.data[p] = 255;
  }

  setSize();
  resetImage();
  window.addEventListener("pointermove", addDrop);
  window.addEventListener("resize", function () {
    setSize();
    resetImage();
  });
}
