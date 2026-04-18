// ... (tutta la parte iniziale resta uguale fino a scegliEmozioneFinale) ...

async function analizzaESputaRisultato() {
    const detection = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions()).withFaceExpressions();

    let finale = 'angry'; 

    if (detection) {
        const espressioni = detection.expressions;
        let scorePiuAlto = 0;
        for (const espressione in espressioni) {
            if (espressione !== 'neutral' && espressioni[espressione] > scorePiuAlto) {
                scorePiuAlto = espressioni[espressione];
                finale = espressione;
            }
        }
        if (scorePiuAlto < 0.25) finale = 'angry';
    }

    const traduttore = {
        happy: 'FELICITÀ', sad: 'TRISTEZZA', angry: 'RABBIA',
        fearful: 'PAURA', disgusted: 'DISGUSTO', surprised: 'SORPRESA'
    };

    emotionText.innerText = `MI TRASMETTI: ${traduttore[finale]}`;
    const playlist = canzoni.find(c => c.emozione_chiave === finale);
    
    if (playlist) {
        // RESET E CARICAMENTO: Su mobile carichiamo l'URL ma aspettiamo il click se non parte
        spotifyPlayer.src = playlist.spotify_url;
        spotifyWrapper.style.display = 'block';
        
        // Se siamo su mobile, rendiamo il testo un tasto cliccabile per sicurezza
        emotionText.innerHTML = `MI TRASMETTI: ${traduttore[finale]} <br> <span style="color:#39ff14; font-size:10px; cursor:pointer;">[ TOCCA QUI PER ATTIVARE AUDIO ]</span>`;
        emotionText.onclick = () => {
            spotifyPlayer.src = playlist.spotify_url; // Forza ricarica al tocco
        };
    }
}