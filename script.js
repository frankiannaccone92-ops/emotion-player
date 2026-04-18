const video = document.getElementById('video');
const emotionText = document.getElementById('emotion-text');
const spotifyWrapper = document.getElementById('spotify-wrapper');
const spotifyPlayer = document.getElementById('spotify-player');

const playlists = {
    happy: "https://open.spotify.com/embed/playlist/IL_TUO_ID_HAPPY", 
    sad: "https://open.spotify.com/embed/playlist/IL_TUO_ID_SAD",
    angry: "https://open.spotify.com/embed/playlist/IL_TUO_ID_ANGRY", 
    neutral: "https://open.spotify.com/embed/playlist/IL_TUO_ID_NEUTRAL"
};

let appSbloccata = false;

async function startApp() {
    try {
        await faceapi.nets.tinyFaceDetector.loadFromUri('models');
        await faceapi.nets.faceExpressionNet.loadFromUri('models');
        
        // Messaggio per l'utente su Mobile
        emotionText.innerHTML = "MODELLI PRONTI.<br><span style='color:white; cursor:pointer;'>TOCCA QUI PER ATTIVARE CAMERA E AUDIO</span>";
        
        // Sblocco al tocco (fondamentale per telefono)
        window.addEventListener('click', () => {
            if (!appSbloccata) {
                appSbloccata = true;
                startVideo();
            }
        }, { once: true });

    } catch (err) {
        console.error(err);
        emotionText.innerText = "ERRORE CARICAMENTO MODELLI";
    }
}

function startVideo() {
    navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user" } // Forza la camera frontale su telefono
    })
    .then(stream => {
        video.srcObject = stream;
        emotionText.innerText = "INQUADRA IL VISO...";
    })
    .catch(err => {
        emotionText.innerText = "ERRORE WEBCAM: ACCONSENTI L'USO";
    });
}

video.addEventListener('play', () => {
    setInterval(async () => {
        const detections = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions()).withFaceExpressions();
        
        if (detections) {
            const expressions = detections.expressions;
            const highestEmotion = Object.keys(expressions).reduce((a, b) => expressions[a] > expressions[b] ? a : b);
            
            if (expressions[highestEmotion] > 0.6) {
                const traduzione = {
                    happy: "FELICITÀ", sad: "TRISTEZZA", angry: "RABBIA", neutral: "NEUTRALE",
                    surprised: "SORPRESA", fearful: "PAURA", disgusted: "DISGUSTO"
                };

                emotionText.innerHTML = `EMOZIONE: ${traduzione[highestEmotion]}`;
                
                const playlistUrl = playlists[highestEmotion] || playlists.neutral;
                
                // Su telefono Spotify Embed richiede che l'utente sia loggato nel browser
                if (spotifyPlayer.src !== playlistUrl) {
                    spotifyPlayer.src = playlistUrl;
                    spotifyWrapper.style.display = 'block';
                }
            }
        }
    }, 3000);
});

startApp();
