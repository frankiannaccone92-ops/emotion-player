const video = document.getElementById('video');
const emotionText = document.getElementById('current-emotion');
const countdownElement = document.getElementById('countdown');
const spotifyWrapper = document.getElementById('spotify-wrapper');
const spotifyPlayer = document.getElementById('spotify-player');

let canzoni = [];

// 1. Caricamento Playlist
fetch('./dataset.json')
    .then(response => response.json())
    .then(data => { canzoni = data; });

// 2. Caricamento Modelli IA
Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('./models'),
    faceapi.nets.faceExpressionNet.loadFromUri('./models')
]).then(startVideo);

function startVideo() {
    const constraints = { video: { facingMode: "user" } };
    navigator.mediaDevices.getUserMedia(constraints)
        .then((stream) => { video.srcObject = stream; })
        .catch(err => console.error("Accesso Camera Negato", err));
}

video.addEventListener('play', () => {
    let timeLeft = 5;
    countdownElement.innerText = timeLeft;
    const timer = setInterval(() => {
        timeLeft--;
        if (timeLeft > 0) {
            countdownElement.innerText = timeLeft;
        } else {
            clearInterval(timer);
            countdownElement.innerText = "+";
            setTimeout(() => {
                countdownElement.innerText = "";
                analizzaESputaRisultato();
            }, 800);
        }
    }, 1000);
});

async function analizzaESputaRisultato() {
    const detection = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions()).withFaceExpressions();

    // REGOLA D'ORO: Se il sistema non è sicuro al 100%, l'utente è considerato ARRABBIATO
    let finale = 'angry'; 

    if (detection) {
        const espressioni = detection.expressions;
        let scorePiuAlto = 0;

        for (const espressione in espressioni) {
            // Ignoriamo lo stato neutrale per forzare una reazione musicale
            if (espressione !== 'neutral' && espressioni[espressione] > scorePiuAlto) {
                scorePiuAlto = espressioni[espressione];
                finale = espressione;
            }
        }
        
        // Se l'emozione dominante è troppo debole, scatta il fallback sulla rabbia
        if (scorePiuAlto < 0.2) {
            finale = 'angry';
        }
    }

    const traduttore = {
        happy: 'FELICITÀ', sad: 'TRISTEZZA', angry: 'RABBIA',
        fearful: 'PAURA', disgusted: 'DISGUSTO', surprised: 'SORPRESA'
    };

    // Mostra il risultato e carica Spotify
    emotionText.innerText = `MI TRASMETTI: ${traduttore[finale]}`;
    const playlist = canzoni.find(c => c.emozione_chiave === finale);
    
    if (playlist) {
        spotifyPlayer.src = playlist.spotify_url;
        spotifyWrapper.style.display = 'block';
    }
}