let iframe; 

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type !== 'toggle-ui') return;


  if (!iframe) {
    iframe = document.createElement('iframe');
    iframe.id = 'custom-extension-popup';
    iframe.src = chrome.runtime.getURL('index.html');
    Object.assign(iframe.style, {
      backgroundColor: 'transparent',
      position: 'fixed',
      top: '0px',
      right: '0px',
      width: '520px',
      height: '400px',
      border: 'none',
      borderRadius: '20px',
      zIndex: '9999',
      display: 'block'      
    });
    iframe.tabIndex = -1;
    document.body.appendChild(iframe);


    document.addEventListener('keydown', e => {
      iframe.contentWindow.postMessage({
        type: 'keydown',
        data: { key: e.key }
      }, '*');
    });


    window.addEventListener('message', ev => {
      if (ev.data?.type === 'close-extension') {
        iframe.style.display = 'none';
      }
    });

    return; 
  }


  iframe.style.display =
    iframe.style.display === 'none' ? 'block' : 'none';
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'updateVolume') {
    const newVolume = request.volume;

    updateAllAudioVolumes(newVolume);
  }
});

function updateAllAudioVolumes(volume) {
  const audios = document.querySelectorAll('audio');
  audios.forEach(audio => {
    audio.volume = volume;
  });


  if (window.currentAudio) {
    window.currentAudio.volume = volume;
  }
}


function readWord(word, url) {
  let i = 0;

  function getNextSyllable() {
    if (i >= word.length) return null;

    if (i + 1 < word.length) {
      const pair = word[i] + word[i + 1];
      if (soundSet.has(pair)) {
        i += 2;
        return pair;
      }
    }

    if (soundSet.has(word[i])) {
      return word[i++];
    }

    i++;
    return getNextSyllable();
  }

  function playNext() {
    const syllable = getNextSyllable();
    if (!syllable) return;

    const mapped = similarSounds[syllable] || syllable;
    const src = chrome.runtime.getURL(`${url}Voice_Kana_${mapped}.wav`);
    const audio = new Audio(src);
    audio.volume = currentVolume;
    audio.play();

    audio.addEventListener('ended', () => {
      setTimeout(playNext, 40); 
    });
  }

  playNext();
}