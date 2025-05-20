let similarSounds = {};
let soundSet = new Set();
let buffer = "";
const listFemale = document.getElementById('female-personality-list');
const listMale = document.getElementById('male-personality-list');
let currentURL = "";
let currentKeydownHandler = null;

window.addEventListener('keydown', (e) => {
  iframe.contentWindow.postMessage({ type: 'keydown', data: { key: e.key } }, '*');
});
window.addEventListener('message', (event) => {
    if (event.data?.type === 'close-extension') {
      window.parent.postMessage({ type: 'close-extension' }, '*');
    }
    if (event.data?.type === 'set-selected-voice') {
        const { personality, gender } = event.data.data;
        console.log("Recibida voz guardada:", personality, gender);
        setPersonality(personality, gender);
      }
  });

document.getElementById('btn-close').addEventListener('click', () => {
    window.parent.postMessage({ type: 'close-extension' }, '*');
});

console.log("entra en script.js")
window.addEventListener('DOMContentLoaded', () => {
    console.log("entra en script de botones")
    const btnFemale = document.getElementById('btn-female');
    const btnMale = document.getElementById('btn-male');
    const femaleList = document.getElementById('female-personality-list');
    const maleList = document.getElementById('male-personality-list');
    const volumeSlider = document.getElementById('volume-slider');

    chrome.storage.local.get('volume', ({ volume }) => {
        const savedVolume = volume ?? 1; 
        volumeSlider.value = savedVolume;
        chrome.storage.local.set({ volume: savedVolume });
      });
      

      volumeSlider.addEventListener('input', () => {
        const volume = parseFloat(volumeSlider.value);
        chrome.storage.local.set({ volume });
        

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (!tabs[0]?.id) return;
          chrome.tabs.sendMessage(tabs[0].id, {
            type: 'updateVolume',
            volume
          });
        });
      });


    chrome.storage.local.get('selectedVoice', ({ selectedVoice }) => {
        if (selectedVoice) {
          const { personality, gender } = selectedVoice;
          console.log("Voz restaurada:", personality, gender);
          setPersonality(personality, gender);

          const list = gender === 'Female' ? femaleList : maleList;
          Array.from(list.querySelectorAll('li')).forEach(li => {
            const name = li.querySelector('.left').textContent.trim();
            li.classList.toggle('selected', name === personality);
          });
          Array.from(list.querySelectorAll('li')).forEach(li => {
            const span = li.querySelector('.left');
            const children = Array.from(span.childNodes);
            const personalityTextNode = children.find(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim());
            const name = personalityTextNode ? personalityTextNode.textContent.trim() : "";
            li.classList.toggle('selected', name === personality);
          });

          if (gender === 'Female') {
            femaleList.style.display = 'block';
            maleList.style.display   = 'none';
          } else {
            maleList.style.display   = 'block';
            femaleList.style.display = 'none';
          }

        }
      });

    btnFemale.addEventListener('click', () => {
      femaleList.style.display = 'block';
      maleList.style.display = 'none';
    });

    btnMale.addEventListener('click', () => {
      maleList.style.display = 'block';
      femaleList.style.display = 'none';
    });

    femaleList.style.display = 'block';
    maleList.style.display = 'none';
});


fetch('./similarSounds.json')
  .then(response => response.json())
  .then(data => {
    console.log("Cargado JSON:", data);
    similarSounds = data;
    soundSet = new Set(Object.keys(similarSounds));
  })
  .catch(error => console.error("Error cargando JSON:", error));

const VOWELS = ['a', 'e', 'i', 'o', 'u'];

listMale.addEventListener('click', function (e){
    const li = e.target.closest('li');
    console.log(li);
    if (li) {
      const personalitySpan = li.querySelector('.left');
      if (personalitySpan) {
        const personalitySelected = personalitySpan.textContent.trim();
        console.log("Seleccionado en addEventListener:", personalitySelected);
        setPersonality(personalitySelected, "Male");
        readWord(personalitySelected,"Male");
      }
    }
})

listFemale.addEventListener('click', function (e) {
    const li = e.target.closest('li');
    console.log(li);
    if (li) {
      const personalitySpan = li.querySelector('.left');
      if (personalitySpan) {
        const personalitySelected = personalitySpan.textContent.trim();
        console.log("Seleccionado:", personalitySelected);
        setPersonality(personalitySelected, "Female");
        readWord(personalitySelected,"Female");
      }
    }
  });

  function readWord(personalitySelected,gender){
    console.log("lool")
    const a = `Animalese/${gender}/${personalitySelected}/Voice_Kana_a.wav`;
    console.log(a)
    const pi = `Animalese/${gender}/${personalitySelected}/Voice_Kana_pi.wav`;
    const po = `Animalese/${gender}/${personalitySelected}/Voice_Kana_po.wav`;
    const audioPi= new Audio(pi);
    const audioPo= new Audio(po);

 
    audioPi.addEventListener('ended', () => audioPo.play());

    audioPi.play();

}

function setPersonality(personality, gender){
    currentURL = `Animalese/${gender}/${personality}/`;
    buffer = "";
    console.log("setPersonality:", personality, gender);

    chrome.storage.local.set({
        selectedVoice: {
          personality,
          gender
        }
      });

      [listFemale, listMale].forEach(list => {
        Array.from(list.querySelectorAll('li')).forEach(li => {
          li.classList.remove('selected');
        });
      });
      
    
      const targetList = gender === 'Female' ? listFemale : listMale;
      Array.from(targetList.querySelectorAll('li')).forEach(li => {
        const name = li.querySelector('.left').textContent.trim();
        if (name === personality) {
          li.classList.add('selected');
        }
      });

    if (currentKeydownHandler) {
        document.removeEventListener('keydown', currentKeydownHandler);
    }

    currentKeydownHandler = function (e) {
        console.log("PEPERONI");
        const keyPressed = e.key.toLowerCase();
        if (/^[a-z]$/.test(keyPressed)) {
            handleLetter(keyPressed, currentURL);
        } else if ("1234567890".includes(keyPressed)) {
            playNumbers(keyPressed);
        } else if (["?", "¿", "!", "¡"].includes(keyPressed)) {
            playSpecials(keyPressed);
            console.log("bueno hasta aqui llego", keyPressed)
        } else if (keyPressed === " ") {
            flushBufferAndPlay(currentURL);
        }
    };
}

function playNumbers(keyNumber) {
    const src = new Audio(chrome.runtime.getURL(`Animalese/numbers/Npc_Vocal_Girl_U_${keyNumber}.wav`));
    const audio = new Audio(src)
    audio.volume = currentVolume;
    audio.play();
}

function playSpecials(keySpecial) {
    console.log("joder1")
    let path = "";
    if (keySpecial === "?" || keySpecial === "¿") {
        path = "Animalese/Emotes/curiosity.mp3";
    } else if (keySpecial === "!" || keySpecial === "¡") {
        path = "Animalese/Emotes/surprise.mp3";
    }
    const src = new Audio(chrome.runtime.getURL(path));
    const audio = new Audio(src)
    audio.volume = currentVolume;
    audio.play();
}