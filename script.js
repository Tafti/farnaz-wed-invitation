const scratchCanvas = document.getElementById("scratchCanvas");
const scratchHint = document.getElementById("scratchHint");
const muteBtn = document.getElementById("muteBtn");
const weddingAudio = document.getElementById("weddingAudio");
const addressBtn = document.getElementById("addressBtn");
const addressModal = document.getElementById("addressModal");

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
    ctx.fillText("کلیک کنید", width / 2, height / 2 + 4);
  }

  let scratching = false;
  let hasTriggeredScratchAudio = false;
  let lastBrushPoint = null;
  let brushedDuringGesture = false;

  function activateCircleAudio() {
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

  function eraseBrushStroke(from, point) {
    const dx = point.x - from.x;
    const dy = point.y - from.y;
    const length = Math.hypot(dx, dy);

    // Do not draw a zero-length initial dab, which appears as a circle.
    if (length < 2) return;

    ctx.globalCompositeOperation = "destination-out";
    ctx.lineCap = "butt";
    ctx.lineJoin = "bevel";

    const normalX = -dy / length;
    const normalY = dx / length;
    const tangentX = dx / length;
    const tangentY = dy / length;

    // Uneven parallel bristles create a real brush texture instead of one solid line.
    for (let bristle = 0; bristle < 18; bristle += 1) {
      const offset = (bristle - 8.5) * 2.2 + (Math.random() - 0.5) * 1.4;
      const width = 0.9 + Math.random() * 2.1;
      const startJitter = (Math.random() - 0.5) * 7;
      const endJitter = (Math.random() - 0.5) * 7;

      ctx.lineWidth = width;
      ctx.beginPath();
      ctx.moveTo(
        from.x + normalX * offset + tangentX * startJitter,
        from.y + normalY * offset + tangentY * startJitter,
      );
      ctx.lineTo(
        point.x + normalX * offset + tangentX * endJitter,
        point.y + normalY * offset + tangentY * endJitter,
      );
      ctx.stroke();
    }

    lastBrushPoint = point;
    checkRevealProgress();
  }

  function eraseAt(event) {
    event.preventDefault();
    if (!scratching) return;

    const point = getPoint(event);
    const from = lastBrushPoint || point;
    const before = lastBrushPoint;

    eraseBrushStroke(from, point);
    if (before && Math.hypot(point.x - before.x, point.y - before.y) >= 2) {
      brushedDuringGesture = true;
    }
  }

  function eraseClickBrush(event) {
    if (brushedDuringGesture) {
      brushedDuringGesture = false;
      return;
    }

    const point = getPoint(event);
    const brushLength = 70;
    const from = { x: point.x - brushLength / 2, y: point.y + brushLength * 0.16 };
    const to = { x: point.x + brushLength / 2, y: point.y - brushLength * 0.16 };

    eraseBrushStroke(from, to);
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
    brushedDuringGesture = false;
    activateCircleAudio();
    lastBrushPoint = getPoint(event);
    if (scratchHint) scratchHint.style.opacity = "0.25";
  }

  function stopScratch() {
    scratching = false;
    lastBrushPoint = null;
    if (scratchHint) scratchHint.style.opacity = "0.8";
  }

  resizeCanvas();

  const resizeObserver = new ResizeObserver(() => resizeCanvas());
  resizeObserver.observe(container);

  const circleImage = container.querySelector("img");
  const activateEvents = ["pointerdown", "touchstart", "mousedown", "click"];

  [container, circleImage, scratchCanvas].filter(Boolean).forEach((target) => {
    activateEvents.forEach((eventName) => {
      target.addEventListener(eventName, activateCircleAudio, { capture: true, passive: true });
    });
  });

  scratchCanvas.addEventListener("mousedown", startScratch);
  scratchCanvas.addEventListener("mousemove", eraseAt);
  scratchCanvas.addEventListener("click", eraseClickBrush);
  window.addEventListener("mouseup", stopScratch);

  scratchCanvas.addEventListener("touchstart", startScratch, { passive: false });
  scratchCanvas.addEventListener("touchmove", eraseAt, { passive: false });
  scratchCanvas.addEventListener("touchend", (event) => {
    if (!brushedDuringGesture) {
      eraseClickBrush(event);
    }
    stopScratch();
  });
}

function setupMusicSample() {
  if (!muteBtn || !weddingAudio) return;

  let muted = sessionStorage.getItem("weddingMusicMuted") === "true";
  let playStarted = false;
  let playPending = null;

  weddingAudio.volume = 0.35;
  weddingAudio.muted = muted;
  weddingAudio.load();

  function updateMuteState() {
    weddingAudio.muted = muted;
    muteBtn.textContent = muted ? "صدا: خاموش" : "صدا: روشن";
    sessionStorage.setItem("weddingMusicMuted", String(muted));
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
          sessionStorage.setItem("weddingMusicPlaying", "true");
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

function setupAddressModal() {
  if (!addressBtn || !addressModal) return;

  const closeModal = () => {
    addressModal.classList.remove("is-open");
    addressModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    addressBtn.focus();
  };

  addressBtn.addEventListener("click", () => {
    addressModal.classList.add("is-open");
    addressModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    addressModal.querySelector("[data-close-address]")?.focus();
  });

  addressModal.querySelectorAll("[data-close-address]").forEach((element) => {
    element.addEventListener("click", closeModal);
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && addressModal.classList.contains("is-open")) {
      closeModal();
    }
  });
}

setupAddressModal();

// A separate page cannot preserve the same audio stream, but resumes the loop after navigation.
if (!scratchCanvas && sessionStorage.getItem("weddingMusicPlaying") === "true") {
  musicController?.start();
}
