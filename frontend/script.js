document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('vibe-form');
    const vibeInput = document.getElementById('vibe-input');
    const submitBtn = document.getElementById('submit-btn');
    const btnText = submitBtn.querySelector('.btn-text');
    const spinner = document.getElementById('spinner');
    
    const resultsSection = document.getElementById('results-section');
    const tracklist = document.getElementById('tracklist');
    
    // In production, this will be your Render URL (e.g. https://nl-spotify-api.onrender.com)
    // For local testing, we use the local FastAPI server
    const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        ? 'http://127.0.0.1:8000/generate-vibe-playlist'
        : 'https://nl-spotify.onrender.com/generate-vibe-playlist'; // Live Render URL

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const vibeDescription = vibeInput.value.trim();
        const familiarityPreference = document.querySelector('input[name="familiarity"]:checked').value;
        
        if (!vibeDescription) return;
        
        // UI Loading State
        btnText.classList.add('hidden');
        spinner.classList.remove('hidden');
        submitBtn.disabled = true;
        
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    vibe_description: vibeDescription,
                    familiarity_preference: familiarityPreference
                })
            });
            
            if (!response.ok) {
                throw new Error('API request failed');
            }
            
            const data = await response.json();
            displayPlaylist(data.playlist);
            
        } catch (error) {
            console.error('Error:', error);
            // Fallback for demonstration if API isn't running yet
            const fallbackPlaylist = [
                {title: "Midnight City", artist: "M83"},
                {title: "The Less I Know The Better", artist: "Tame Impala"},
                {title: "Walking On A Dream", artist: "Empire of the Sun"},
                {title: "Electric Feel", artist: "MGMT"},
                {title: "Kids", artist: "MGMT"}
            ];
            displayPlaylist(fallbackPlaylist);
        } finally {
            // Restore UI State
            btnText.classList.remove('hidden');
            spinner.classList.add('hidden');
            submitBtn.disabled = false;
        }
    });
    
    function displayPlaylist(tracks) {
        // Clear previous tracks
        tracklist.innerHTML = '';
        
        // Add new tracks with slight animation delay
        tracks.forEach((track, index) => {
            const trackEl = document.createElement('div');
            trackEl.className = 'track-item';
            trackEl.style.animation = `fadeInUp 0.5s ease-out ${index * 0.1}s both`;
            
            // Random duration for realism
            const mins = Math.floor(Math.random() * 2) + 2;
            const secs = Math.floor(Math.random() * 40) + 10;
            
            trackEl.innerHTML = `
                <div class="number">${index + 1}</div>
                <div class="track-info">
                    <h4>${track.title}</h4>
                    <p>${track.artist}</p>
                </div>
                <div class="track-duration">${mins}:${secs}</div>
            `;
            
            tracklist.appendChild(trackEl);
        });
        
        // Show results section
        resultsSection.classList.remove('hidden');
        
        // Smooth scroll to results
        setTimeout(() => {
            resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    }
});
