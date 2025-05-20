let similarSounds = {};
let soundSet = new Set();
let buffer = "";
let currentURL = "";
let currentKeydownHandler = null;
const VOWELS = ['a','e','i','o','u'];
let currentVolume = 1;



chrome.runtime.onMessage.addListener((msg) => {
   if (msg.type === 'updateVolume') {
        currentVolume = parseFloat(msg.volume);
        console.log("Volumen actualizado dinámicamente:", currentVolume);
      }
    });


  chrome.storage.local.get('volume', ({ volume }) => {
    currentVolume = volume ?? 1;
  });
  

  chrome.storage.onChanged.addListener(changes => {

    if (changes.selectedVoice) {
      const { personality, gender } = changes.selectedVoice.newValue;
      setPersonality(personality, gender);
    }
  });


fetch(chrome.runtime.getURL('similarSounds.json'))
  .then(r => r.json())
  .then(data => {
    similarSounds = data;
    soundSet = new Set(Object.keys(data));
  });


chrome.storage.local.get('selectedVoice', ({ selectedVoice }) => {
  if (selectedVoice) {
    const { personality, gender } = selectedVoice;
    setPersonality(personality, gender);
  }
});

function setPersonality(personality, gender) {
  currentURL = `Animalese/${gender}/${personality}/`;
  buffer = "";

  if (currentKeydownHandler) {
    document.removeEventListener('keydown', currentKeydownHandler);
  }

  currentKeydownHandler = function(e) {
    const key = e.key.toLowerCase();
    if (/^[a-z]$/.test(key)) {
      handleLetter(key, currentURL);
    } else if (/[0-9]/.test(key)) {
      playNumbers(key);
    } else if (/[?¿!¡]/.test(key)) {
      playSpecials(key);
    } else if (key === ' ') {
      flushBufferAndPlay(currentURL);
    }
  };
  document.addEventListener('keydown', currentKeydownHandler);

}

function handleLetter(letter, url) {   
    buffer += letter;

    if (buffer.length === 2 && VOWELS.includes(buffer[0]) && buffer[0] === buffer[1]) {
        playSound(buffer[0],url);
        playSound(buffer[1],url);
        buffer = "";
        return;
    }

    if (buffer.length < 2) return;

    if (soundSet.has(buffer)) {
        playSound(buffer,url);
        buffer = "";
        return;
    }

    if (soundSet.has(buffer[0])) {
        playSound(buffer[0],url);
    }

    buffer = buffer[1];
}
function playSound(syllable, url) {
    const mapped = similarSounds[syllable] || syllable;
    const src = chrome.runtime.getURL(`${url}Voice_Kana_${mapped}.wav`);
    const audio = new Audio(src)
    audio.volume = currentVolume;
    audio.play()
}
function flushBufferAndPlay(url) {
    while (buffer.length > 0) {
        if (buffer.length === 1 && soundSet.has(buffer)) {
            playSound(buffer, url);
            buffer = "";
            return;
        }
        if (buffer.length >= 2) {
            let candidate = buffer.slice(0, 2);
            if (soundSet.has(candidate)) {
                playSound(candidate, url);
                buffer = buffer.slice(2);
                continue;
            }
        }

        if (soundSet.has(buffer[0])) {
            playSound(buffer[0], url);
        }
        buffer = buffer.slice(1);
    }
}
function playNumbers(keyNumber) {
    const src = chrome.runtime.getURL(`Animalese/numbers/Npc_Vocal_Girl_U_${keyNumber}.wav`);
    const audio = new Audio(src)
    audio.volume = currentVolume;
    audio.play();
}

function playSpecials(keySpecial) {
    let path = "";
    if (keySpecial === "?" || keySpecial === "¿") {
        path = "Animalese/Emotes/curiosity.mp3";
    } else if (keySpecial === "!" || keySpecial === "¡") {
        path = "Animalese/Emotes/surprise.mp3";
    }
    console.log(path);
    const src = chrome.runtime.getURL(path);
    const audio = new Audio(src)
    audio.volume = currentVolume;
    audio.play();
}



