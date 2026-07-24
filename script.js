const musicBtn = document.getElementById("musicBtn");
const weddingAudio = document.getElementById("weddingAudio");
const addressBtn = document.getElementById("addressBtn");
const addressModal = document.getElementById("addressModal");

function setupMusicToggle() {
  if (!musicBtn || !weddingAudio) return;

  let playing = false;
  weddingAudio.volume = 0.35;

  const note = musicBtn.querySelector(".music-note");

  function updateButtonState() {
    musicBtn.classList.toggle("is-playing", playing);
    musicBtn.setAttribute("aria-label", playing ? "توقف موسیقی" : "پخش موسیقی");
    if (note) note.textContent = playing ? "Ⅱ" : "♪";
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
