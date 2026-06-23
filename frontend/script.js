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

    // Accordion Elements
    const moodHeader = document.getElementById('mood-header');
    const moodSelectorsContainer = document.getElementById('mood-selectors');
    const activityHeader = document.getElementById('activity-header');
    const activitySelectorsContainer = document.getElementById('activity-selectors');

    // Category Views
    const categoryBtns = document.querySelectorAll('.category-btn');
    const contentViews = document.querySelectorAll('.content-view');

    // Dislike/Like buttons
    const likeBtns = document.querySelectorAll('.like-btn');
    const dislikeBtns = document.querySelectorAll('.dislike-btn');

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
            // Ensure we are in discovery view when searching
            switchToView('view-discovery');
            // Auto open the accordion to show results visually
            moodHeader.classList.remove('collapsed');
            moodSelectorsContainer.classList.remove('collapsed');
            fetchPlaylist(searchInput.value, 'medium');
        }
    });

    // Accordion Toggle Logic
    moodHeader.addEventListener('click', () => {
        moodHeader.classList.toggle('collapsed');
        moodSelectorsContainer.classList.toggle('collapsed');
    });

    activityHeader.addEventListener('click', () => {
        activityHeader.classList.toggle('collapsed');
        activitySelectorsContainer.classList.toggle('collapsed');
    });

    // View Switching Logic
    function switchToView(targetId) {
        categoryBtns.forEach(btn => {
            if(btn.dataset.target === targetId) btn.classList.add('active');
            else btn.classList.remove('active');
        });
        
        contentViews.forEach(view => {
            if (view.id === targetId) {
                view.classList.remove('hidden');
                view.classList.add('active');
            } else {
                view.classList.add('hidden');
                view.classList.remove('active');
            }
        });
    }

    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            switchToView(btn.dataset.target);
        });
    });

    // Dislike/Like Button Logic
    likeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            btn.classList.toggle('active');
            // Ensure dislike is unchecked if like is checked
            if (btn.classList.contains('active')) {
                dislikeBtns.forEach(d => d.classList.remove('active'));
            }
        });
    });

    dislikeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            btn.classList.toggle('active');
            // Ensure like is unchecked if dislike is checked
            if (btn.classList.contains('active')) {
                likeBtns.forEach(l => l.classList.remove('active'));
            }
        });
    });

    // Mood & Activity Selection
    moodSelectors.forEach(item => {
        item.addEventListener('click', () => {
            moodSelectors.forEach(m => m.classList.remove('active'));
            item.classList.add('active');
            currentMood = item.dataset.mood;
            activeMoodTitle.textContent = currentMood;
            activeMoodTitle.style.color = '#fff';
            // Auto-collapse after selection
            moodHeader.classList.add('collapsed');
            moodSelectorsContainer.classList.add('collapsed');
            
            // Auto-open activity if it hasn't been selected yet
            if (!currentActivity) {
                activityHeader.classList.remove('collapsed');
                activitySelectorsContainer.classList.remove('collapsed');
            }
            
            checkAndGenerate();
        });
    });

    activitySelectors.forEach(item => {
        item.addEventListener('click', () => {
            activitySelectors.forEach(a => a.classList.remove('active'));
            item.classList.add('active');
            currentActivity = item.dataset.activity;
            activeActivityTitle.textContent = currentActivity;
            activeActivityTitle.style.color = '#fff';
            // Auto-collapse after selection
            activityHeader.classList.add('collapsed');
            activitySelectorsContainer.classList.add('collapsed');
            
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
        switchToView('view-discovery');
        const query = "Surprise me with something completely unexpected, random, and genre-bending.";
        fetchPlaylist(query, 'low');
        
        // Visually reset selectors
        moodSelectors.forEach(m => m.classList.remove('active'));
        activitySelectors.forEach(a => a.classList.remove('active'));
        activeMoodTitle.textContent = "What's your mood?";
        activeActivityTitle.textContent = "What are you doing?";
        activeMoodTitle.style.color = '';
        activeActivityTitle.style.color = '';
        currentMood = null;
        currentActivity = null;
        searchInput.value = '';
        
        // Reset accordion state
        moodHeader.classList.add('collapsed');
        moodSelectorsContainer.classList.add('collapsed');
        activityHeader.classList.add('collapsed');
        activitySelectorsContainer.classList.add('collapsed');
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
