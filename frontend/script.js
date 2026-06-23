document.addEventListener('DOMContentLoaded', () => {
    // API Setup
    const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        ? 'http://127.0.0.1:8000/generate-vibe-playlist'
        : 'https://nl-spotify.onrender.com/generate-vibe-playlist';

    // DOM Elements
    const searchInput = document.getElementById('vibe-search');
    const searchDropdown = document.getElementById('search-dropdown');
    
    const moodSelectors = document.querySelectorAll('.selector-item.mood');
    const activeMoodTitle = document.getElementById('active-mood-title');
    
    const activitySelectors = document.querySelectorAll('.selector-item.activity');
    const activeActivityTitle = document.getElementById('active-activity-title');
    
    const surpriseBtn = document.getElementById('surprise-btn');
    const loadingIndicator = document.getElementById('loading-indicator');
    const upNextList = document.getElementById('up-next-list');
    
    // Right panel and bottom player elements
    const rpTitle = document.getElementById('rp-title');
    const rpArtist = document.getElementById('rp-artist');
    const rpAboutArtist = document.getElementById('rp-about-artist');
    const bpTitle = document.getElementById('bp-title');
    const bpArtist = document.getElementById('bp-artist');

    // State
    let currentMood = 'Happy';
    let currentActivity = null;

    // Search Dropdown Logic
    searchInput.addEventListener('focus', () => {
        searchDropdown.classList.remove('hidden');
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-container')) {
            searchDropdown.classList.add('hidden');
        }
    });

    // Handle Enter in Search Box
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchDropdown.classList.add('hidden');
            fetchPlaylist(searchInput.value, 'medium');
        }
    });

    // Mood & Activity Selection
    moodSelectors.forEach(item => {
        item.addEventListener('click', () => {
            moodSelectors.forEach(m => m.classList.remove('active'));
            item.classList.add('active');
            currentMood = item.dataset.mood;
            activeMoodTitle.textContent = currentMood;
            checkAndGenerate();
        });
    });

    activitySelectors.forEach(item => {
        item.addEventListener('click', () => {
            activitySelectors.forEach(a => a.classList.remove('active'));
            item.classList.add('active');
            currentActivity = item.dataset.activity;
            activeActivityTitle.textContent = currentActivity;
            checkAndGenerate();
        });
    });

    // Trigger API if both mood and activity are selected
    function checkAndGenerate() {
        if (currentMood && currentActivity) {
            const query = `Feeling ${currentMood} and doing ${currentActivity}`;
            fetchPlaylist(query, 'low'); // "low" familiarity for pure discovery
        }
    }

    // Surprise Me Button
    surpriseBtn.addEventListener('click', () => {
        const query = "Surprise me with something completely unexpected, random, and genre-bending.";
        fetchPlaylist(query, 'low');
        
        // Visually reset selectors
        moodSelectors.forEach(m => m.classList.remove('active'));
        activitySelectors.forEach(a => a.classList.remove('active'));
        activeMoodTitle.textContent = "What's your mood?";
        activeActivityTitle.textContent = "What are you doing?";
        currentMood = null;
        currentActivity = null;
        searchInput.value = '';
    });

    // Fetch from FastAPI Backend
    async function fetchPlaylist(vibeDescription, familiarityPreference) {
        if (!vibeDescription) return;
        
        loadingIndicator.classList.remove('hidden');
        
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    vibe_description: vibeDescription,
                    familiarity_preference: familiarityPreference
                })
            });
            
            if (!response.ok) throw new Error('API failed');
            
            const data = await response.json();
            updateUIWithPlaylist(data.playlist);
            
        } catch (error) {
            console.error('Error:', error);
            // Fallback for demo purposes
            updateUIWithPlaylist([
                {title: "Neon Echoes", artist: "Synthwave Masters"},
                {title: "Midnight Drive", artist: "The Outrunners"},
                {title: "Digital Sunset", artist: "Pixel Dreams"},
                {title: "Cyber City", artist: "Future Sounds"}
            ]);
        } finally {
            loadingIndicator.classList.add('hidden');
        }
    }

    function updateUIWithPlaylist(tracks) {
        if (!tracks || tracks.length === 0) return;
        
        // Update currently playing (First track)
        const mainTrack = tracks[0];
        rpTitle.textContent = mainTrack.title;
        rpArtist.textContent = mainTrack.artist;
        rpAboutArtist.textContent = mainTrack.artist;
        bpTitle.textContent = mainTrack.title;
        bpArtist.textContent = mainTrack.artist;
        
        // Update Up Next list
        upNextList.innerHTML = '';
        for (let i = 1; i < tracks.length; i++) {
            const track = tracks[i];
            const item = document.createElement('div');
            item.className = 'up-next-item';
            item.innerHTML = `
                <div class="up-next-icon"><i class="fa-solid fa-music"></i></div>
                <div class="up-next-info">
                    <h4>${track.title}</h4>
                    <p>${track.artist}</p>
                </div>
            `;
            upNextList.appendChild(item);
        }
    }
});
