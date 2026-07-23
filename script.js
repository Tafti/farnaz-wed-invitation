const scratchCanvas = document.getElementById("scratchCanvas");
const scratchHint = document.getElementById("scratchHint");
const muteBtn = document.getElementById("muteBtn");
const weddingAudio = document.getElementById("weddingAudio");

const cardData = {
  title: "دعوت نامه عروسی - فرناز و شهریار",
  venue: "تهران، گرند گاردن هال",
  date: "شنبه ۲۸ شهریور ۱۴۰۵ - ساعت ۱۸:۳۰",
};

function setupScratchCard(onFirstScratch) {
  if (!scratchCanvas) return;

  const container = scratchCanvas.parentElement;
  const ctx = scratchCanvas.getContext("2d", { willReadFrequently: true });
  if (!container || !ctx) return;

  function resizeCanvas() {
    const ratio = window.devicePixelRatio || 1;
    const { width, height } = container.getBoundingClientRect();

    scratchCanvas.width = Math.max(1, Math.floor(width * ratio));
    scratchCanvas.height = Math.max(1, Math.floor(height * ratio));
    scratchCanvas.style.width = `${width}px`;
    scratchCanvas.style.height = `${height}px`;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(ratio, ratio);
    paintOverlay(width, height);
  }

  function paintOverlay(width, height) {
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "#f7ebdd");
    gradient.addColorStop(0.5, "#f0c8a7");
    gradient.addColorStop(1, "#d28d62");

    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = "rgba(255, 255, 255, 0.23)";
    for (let i = 0; i < 12; i += 1) {
      ctx.beginPath();
      ctx.arc(Math.random() * width, Math.random() * height, 3 + Math.random() * 8, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = "rgba(91, 47, 38, 0.55)";
    ctx.font = `${Math.max(14, Math.floor(width * 0.085))}px Vazirmatn`;
    ctx.textAlign = "center";
    ctx.fillText("اینجا را خراش دهید", width / 2, height / 2 + 4);
  }

  let scratching = false;
  let hasTriggeredScratchAudio = false;

  function triggerScratchAudio() {
    if (hasTriggeredScratchAudio) return;
    const maybePromise = onFirstScratch?.();

    if (!maybePromise || typeof maybePromise.then !== "function") {
      hasTriggeredScratchAudio = true;
      return;
    }

    maybePromise.then((didStart) => {
      if (didStart) {
        hasTriggeredScratchAudio = true;
      }
    });
  }

  function getPoint(event) {
    const rect = scratchCanvas.getBoundingClientRect();
    const touch = event.touches?.[0] || event.changedTouches?.[0];
    const clientX = touch ? touch.clientX : event.clientX;
    const clientY = touch ? touch.clientY : event.clientY;

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  }

  function eraseAt(event) {
    event.preventDefault();
    if (!scratching) return;

    const { x, y } = getPoint(event);
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, 18, 0, Math.PI * 2);
    ctx.fill();
    checkRevealProgress();
  }

  function checkRevealProgress() {
    const sampleStep = 8;
    const data = ctx.getImageData(0, 0, scratchCanvas.width, scratchCanvas.height).data;
    let transparent = 0;
    let total = 0;

    for (let y = 0; y < scratchCanvas.height; y += sampleStep) {
      for (let x = 0; x < scratchCanvas.width; x += sampleStep) {
        const alpha = data[(y * scratchCanvas.width + x) * 4 + 3];
        total += 1;
        if (alpha < 80) transparent += 1;
      }
    }

    const cleared = (transparent / total) * 100;

    if (cleared > 55) {
      ctx.clearRect(0, 0, scratchCanvas.width, scratchCanvas.height);
      scratchCanvas.style.pointerEvents = "none";
      if (scratchHint) {
        scratchHint.textContent = "نمایان شد - منتظر دیدار شما هستیم";
      }
    }
  }

  function startScratch(event) {
    scratching = true;
    triggerScratchAudio();
    eraseAt(event);
    if (scratchHint) scratchHint.style.opacity = "0.25";
  }

  function stopScratch() {
    scratching = false;
    if (scratchHint) scratchHint.style.opacity = "0.8";
  }

  resizeCanvas();

  const resizeObserver = new ResizeObserver(() => resizeCanvas());
  resizeObserver.observe(container);

  container.addEventListener("pointerdown", triggerScratchAudio, { capture: true, passive: false });
  container.addEventListener("touchstart", triggerScratchAudio, { capture: true, passive: false });
  container.addEventListener("touchmove", triggerScratchAudio, { capture: true, passive: false });
  container.addEventListener("mousedown", triggerScratchAudio, { capture: true, passive: false });
  container.addEventListener("click", triggerScratchAudio, { capture: true, passive: true });
  scratchCanvas.addEventListener("pointerdown", triggerScratchAudio, { capture: true, passive: false });
  scratchCanvas.addEventListener("mousedown", startScratch);
  scratchCanvas.addEventListener("mousemove", eraseAt);
  window.addEventListener("mouseup", stopScratch);

  scratchCanvas.addEventListener("touchstart", startScratch, { passive: false });
  scratchCanvas.addEventListener("touchmove", eraseAt, { passive: false });
  window.addEventListener("touchend", stopScratch);
}

function setupMusicSample() {
  if (!muteBtn || !weddingAudio) return;

  let muted = false;
  let playStarted = false;
  let playPending = null;

  weddingAudio.volume = 0.35;
  weddingAudio.muted = false;
  weddingAudio.load();

  function updateMuteState() {
    weddingAudio.muted = muted;
    muteBtn.textContent = muted ? "صدا: خاموش" : "صدا: روشن";
  }

  function tryPlay() {
    if (playStarted) return true;
    if (playPending) return playPending;

    try {
      const result = weddingAudio.play();

      if (!result || typeof result.then !== "function") {
        playStarted = true;
        return true;
      }

      playPending = result
        .then(() => {
          playStarted = true;
          playPending = null;
          return true;
        })
        .catch(() => {
          playPending = null;
          return false;
        });

      return playPending;
    } catch (error) {
      // Mobile browsers may require first user interaction.
      return false;
    }
  }

  muteBtn.addEventListener("click", async () => {
    muted = !muted;
    updateMuteState();
    if (!muted) {
      await tryPlay();
    }
  });

  updateMuteState();

  return {
    start: tryPlay,
  };
}

const musicController = setupMusicSample();
setupScratchCard(() => {
  return musicController?.start();
});
