const musicBtn = document.getElementById("musicBtn");
const weddingAudio = document.getElementById("weddingAudio");
const addressBtn = document.getElementById("addressBtn");
const addressModal = document.getElementById("addressModal");

function setupMusicToggle() {
  if (!musicBtn || !weddingAudio) return;

  let playing = false;
  let floatingNoteTimer = null;
  weddingAudio.volume = 0.35;

  const note = musicBtn.querySelector(".music-note");

  function createFloatingNote() {
    const floatingNote = document.createElement("span");
    const duration = 1400 + Math.random() * 900;

    floatingNote.className = "music-note-bubble";
    floatingNote.textContent = ["♪", "♫", "♩"][Math.floor(Math.random() * 3)];
    floatingNote.style.setProperty("--note-x", `${-14 + Math.random() * 28}px`);
    floatingNote.style.setProperty("--note-drift", `${-42 + Math.random() * 84}px`);
    floatingNote.style.setProperty("--note-size", `${18 + Math.random() * 11}px`);
    floatingNote.style.setProperty("--note-duration", `${duration}ms`);
    musicBtn.append(floatingNote);

    window.setTimeout(() => floatingNote.remove(), duration + 100);
  }

  function updateFloatingNotes() {
    window.clearInterval(floatingNoteTimer);
    musicBtn.querySelectorAll(".music-note-bubble").forEach((floatingNote) => floatingNote.remove());

    if (!playing) return;

    createFloatingNote();
    floatingNoteTimer = window.setInterval(createFloatingNote, 620);
  }

  function updateButtonState() {
    musicBtn.classList.toggle("is-playing", playing);
    musicBtn.setAttribute("aria-label", playing ? "توقف موسیقی" : "پخش موسیقی");
    if (note) note.textContent = "♪";
    updateFloatingNotes();
  }

  musicBtn.addEventListener("click", async () => {
    if (!playing) {
      try {
        await weddingAudio.play();
        playing = true;
      } catch (error) {
        playing = false;
      }
    } else {
      weddingAudio.pause();
      playing = false;
    }

    updateButtonState();
  });

  updateButtonState();
}

function setupAddressModal() {
  if (!addressBtn || !addressModal) return;

  function closeModal() {
    addressModal.classList.remove("is-open");
    addressModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    addressBtn.focus();
  }

  addressBtn.addEventListener("click", () => {
    addressModal.classList.add("is-open");
    addressModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    addressModal.querySelector(".address-modal-close")?.focus();
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

setupMusicToggle();
setupAddressModal();
