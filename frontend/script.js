// Global function for card clicks (Music, Podcasts, Audiobooks, Live, Events)
window.playCard = function(el, title, artist) {
    document.getElementById('bp-title').textContent = title;
    document.getElementById('bp-artist').textContent = artist;
    document.getElementById('rp-title').textContent = title;
    document.getElementById('rp-artist').textContent = artist;
    document.getElementById('rp-about-artist').textContent = artist;
    const playBtn = document.querySelector('.control-btn.play-pause i');
    if (playBtn) {
        playBtn.className = 'fa-solid fa-pause';
        setTimeout(() => { playBtn.className = 'fa-solid fa-play'; }, 3000);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // API Setup - try backend but always show something instantly
    const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        ? 'http://127.0.0.1:8000/generate-vibe-playlist'
        : 'https://nl-spotify.onrender.com/generate-vibe-playlist';

    // Mood-based curated fallback tracks for instant response
    const MOOD_TRACKS = {
        Happy: [
            {title: "Can't Stop the Feeling", artist: "Justin Timberlake", duration: "3:57", color: "bg-yellow"},
            {title: "Uptown Funk", artist: "Mark Ronson ft. Bruno Mars", duration: "4:30", color: "bg-orange"},
            {title: "Happy", artist: "Pharrell Williams", duration: "3:53", color: "bg-pink"},
            {title: "Good as Hell", artist: "Lizzo", duration: "2:39", color: "bg-green"},
            {title: "Dancing Queen", artist: "ABBA", duration: "3:51", color: "bg-indigo"},
        ],
        Relaxed: [
            {title: "Sunset Lover", artist: "Petit Biscuit", duration: "3:46", color: "bg-teal"},
            {title: "Chill Wave", artist: "Washed Out", duration: "4:10", color: "bg-blue"},
            {title: "Coffee", artist: "beabadoobee", duration: "2:38", color: "bg-green"},
            {title: "Sunday Best", artist: "Surfaces", duration: "3:00", color: "bg-yellow"},
            {title: "Motion", artist: "Koda", duration: "4:20", color: "bg-indigo"},
        ],
        Motivate: [
            {title: "Eye of the Tiger", artist: "Survivor", duration: "4:04", color: "bg-red"},
            {title: "Stronger", artist: "Kanye West", duration: "5:11", color: "bg-orange"},
            {title: "Hall of Fame", artist: "The Script ft. will.i.am", duration: "3:23", color: "bg-yellow"},
            {title: "Till I Collapse", artist: "Eminem", duration: "4:57", color: "bg-gray"},
            {title: "Power", artist: "Kanye West", duration: "4:52", color: "bg-pink"},
        ],
        Sleepy: [
            {title: "Weightless", artist: "Marconi Union", duration: "8:09", color: "bg-indigo"},
            {title: "Holocene", artist: "Bon Iver", duration: "5:35", color: "bg-blue"},
            {title: "River", artist: "Joni Mitchell", duration: "3:54", color: "bg-teal"},
            {title: "Retrograde", artist: "James Blake", duration: "5:05", color: "bg-purple"},
            {title: "The Night Will Always Win", artist: "Manchester Orchestra", duration: "4:24", color: "bg-gray"},
        ],
        Party: [
            {title: "Blinding Lights", artist: "The Weeknd", duration: "3:22", color: "bg-pink"},
            {title: "Levitating", artist: "Dua Lipa", duration: "3:23", color: "bg-purple"},
            {title: "Save Your Tears", artist: "The Weeknd", duration: "3:36", color: "bg-red"},
            {title: "As It Was", artist: "Harry Styles", duration: "2:37", color: "bg-yellow"},
            {title: "Anti-Hero", artist: "Taylor Swift", duration: "3:21", color: "bg-teal"},
        ],
        Study: [
            {title: "Experience", artist: "Ludovico Einaudi", duration: "5:13", color: "bg-blue"},
            {title: "Comptine d'un autre été", artist: "Yann Tiersen", duration: "2:22", color: "bg-indigo"},
            {title: "River Flows in You", artist: "Yiruma", duration: "3:51", color: "bg-teal"},
            {title: "Divenire", artist: "Ludovico Einaudi", duration: "6:52", color: "bg-green"},
            {title: "Nuvole Bianche", artist: "Ludovico Einaudi", duration: "5:54", color: "bg-gray"},
        ],
        Work: [
            {title: "Get Lucky", artist: "Daft Punk ft. Pharrell", duration: "6:09", color: "bg-orange"},
            {title: "Instant Crush", artist: "Daft Punk ft. Julian Casablancas", duration: "5:38", color: "bg-yellow"},
            {title: "Digital Love", artist: "Daft Punk", duration: "4:58", color: "bg-pink"},
            {title: "Around the World", artist: "Daft Punk", duration: "7:09", color: "bg-blue"},
            {title: "One More Time", artist: "Daft Punk", duration: "5:20", color: "bg-red"},
        ],
        Workout: [
            {title: "HUMBLE.", artist: "Kendrick Lamar", duration: "2:57", color: "bg-red"},
            {title: "Run the World (Girls)", artist: "Beyoncé", duration: "3:56", color: "bg-orange"},
            {title: "Centuries", artist: "Fall Out Boy", duration: "3:48", color: "bg-gray"},
            {title: "Jump", artist: "Kris Kross", duration: "3:37", color: "bg-indigo"},
            {title: "Radioactive", artist: "Imagine Dragons", duration: "3:07", color: "bg-yellow"},
        ],
        Travel: [
            {title: "On the Road Again", artist: "Willie Nelson", duration: "2:33", color: "bg-teal"},
            {title: "Life is a Highway", artist: "Tom Cochrane", duration: "4:34", color: "bg-orange"},
            {title: "Fly Me to the Moon", artist: "Frank Sinatra", duration: "2:28", color: "bg-blue"},
            {title: "Route 66", artist: "Depeche Mode", duration: "4:26", color: "bg-indigo"},
            {title: "Africa", artist: "Toto", duration: "4:55", color: "bg-yellow"},
        ],
        Meditate: [
            {title: "Stairway to Heaven", artist: "Led Zeppelin", duration: "8:02", color: "bg-indigo"},
            {title: "Om Namah Shivaya", artist: "Deva Premal", duration: "7:14", color: "bg-teal"},
            {title: "Pure Shores", artist: "All Saints", duration: "3:42", color: "bg-blue"},
            {title: "Nature Sounds", artist: "Healing Earth", duration: "10:00", color: "bg-green"},
            {title: "Breathe", artist: "Pink Floyd", duration: "2:49", color: "bg-gray"},
        ],
    };

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
    const rpTitle = document.getElementById('rp-title');
    const rpArtist = document.getElementById('rp-artist');
    const rpAboutArtist = document.getElementById('rp-about-artist');
    const bpTitle = document.getElementById('bp-title');
    const bpArtist = document.getElementById('bp-artist');
    const moodHeader = document.getElementById('mood-header');
    const moodSelectorsContainer = document.getElementById('mood-selectors');
    const activityHeader = document.getElementById('activity-header');
    const activitySelectorsContainer = document.getElementById('activity-selectors');
    const categoryBtns = document.querySelectorAll('.category-btn');
    const contentViews = document.querySelectorAll('.content-view');
    const likeBtns = document.querySelectorAll('.like-btn');
    const dislikeBtns = document.querySelectorAll('.dislike-btn');

    // State
    let currentMood = null;
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

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && searchInput.value.trim()) {
            searchDropdown.classList.add('hidden');
            switchToView('view-discovery');
            showInstantResults('Search', searchInput.value);
        }
    });

    // Home button and Spotify logo — both return to the Discovery view
    const homeBtn = document.getElementById('home-btn');
    const spotifyLogo = document.getElementById('spotify-logo');
    
    function goHome() {
        switchToView('view-discovery');
        // Scroll main view back to top
        document.querySelector('.main-view').scrollTop = 0;
    }
    
    homeBtn.addEventListener('click', goHome);
    spotifyLogo.addEventListener('click', (e) => { e.preventDefault(); goHome(); });

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
            btn.classList.toggle('active', btn.dataset.target === targetId);
        });
        contentViews.forEach(view => {
            view.classList.toggle('hidden', view.id !== targetId);
            view.classList.toggle('active', view.id === targetId);
        });
    }

    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => switchToView(btn.dataset.target));
    });

    // Dislike/Like Button Logic
    likeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            btn.classList.toggle('active');
            if (btn.classList.contains('active')) dislikeBtns.forEach(d => d.classList.remove('active'));
        });
    });

    dislikeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            btn.classList.toggle('active');
            if (btn.classList.contains('active')) likeBtns.forEach(l => l.classList.remove('active'));
        });
    });

    // Mood Selection
    moodSelectors.forEach(item => {
        item.addEventListener('click', () => {
            moodSelectors.forEach(m => m.classList.remove('active'));
            item.classList.add('active');
            currentMood = item.dataset.mood;
            activeMoodTitle.textContent = currentMood;
            activeMoodTitle.style.color = '#fff';
            moodHeader.classList.add('collapsed');
            moodSelectorsContainer.classList.add('collapsed');
            if (!currentActivity) {
                activityHeader.classList.remove('collapsed');
                activitySelectorsContainer.classList.remove('collapsed');
            }
            showInstantResults(currentMood, currentActivity);
        });
    });

    // Activity Selection
    activitySelectors.forEach(item => {
        item.addEventListener('click', () => {
            activitySelectors.forEach(a => a.classList.remove('active'));
            item.classList.add('active');
            currentActivity = item.dataset.activity;
            activeActivityTitle.textContent = currentActivity;
            activeActivityTitle.style.color = '#fff';
            activityHeader.classList.add('collapsed');
            activitySelectorsContainer.classList.add('collapsed');
            showInstantResults(currentMood, currentActivity);
        });
    });

    // Surprise Me Button
    surpriseBtn.addEventListener('click', () => {
        switchToView('view-discovery');
        const moods = Object.keys(MOOD_TRACKS);
        const randomMood = moods[Math.floor(Math.random() * moods.length)];
        currentMood = randomMood;
        currentActivity = null;
        moodSelectors.forEach(m => m.classList.toggle('active', m.dataset.mood === randomMood));
        activeMoodTitle.textContent = `✨ ${randomMood} (Surprise!)`;
        activeActivityTitle.textContent = 'What are you doing?';
        activeMoodTitle.style.color = '#1ed760';
        activeActivityTitle.style.color = '';
        moodHeader.classList.add('collapsed');
        moodSelectorsContainer.classList.add('collapsed');
        activityHeader.classList.add('collapsed');
        activitySelectorsContainer.classList.add('collapsed');
        searchInput.value = '';
        showInstantResults(randomMood, null);
    });

    // ===== CORE FUNCTION: Show instant recommendations =====
    function showInstantResults(mood, activity) {
        // 1. Pick best matching track list immediately from local data
        const key = activity || mood;
        let tracks = MOOD_TRACKS[key] || MOOD_TRACKS[mood] || MOOD_TRACKS['Happy'];
        
        // Shuffle tracks for freshness
        tracks = [...tracks].sort(() => Math.random() - 0.5);

        // 2. Render recommendations immediately (no waiting)
        renderRecommendations(tracks, mood, activity);

        // 3. Also try the AI backend in background to enhance (optional)
        const label = activity && mood ? `Feeling ${mood} and doing ${activity}` : (mood || activity);
        fetchFromAPIInBackground(label);
    }

    function renderRecommendations(tracks, mood, activity) {
        // Remove old recs section if exists
        const existing = document.getElementById('recs-section');
        if (existing) existing.remove();

        const label = activity && mood 
            ? `🎵 AI Session: ${mood} + ${activity}` 
            : `🎵 ${mood || activity} Picks`;

        const section = document.createElement('div');
        section.id = 'recs-section';
        section.className = 'recs-section';
        section.innerHTML = `
            <h2 class="section-title">${label}</h2>
            <p class="recs-subtitle">Curated for your current state · Based on AI context</p>
            <div class="track-list" id="track-list"></div>
        `;

        const discoveryView = document.getElementById('view-discovery');
        discoveryView.appendChild(section);

        // Animate tracks in
        const trackList = section.querySelector('#track-list');
        tracks.forEach((track, i) => {
            const row = document.createElement('div');
            row.className = 'track-row';
            row.style.animationDelay = `${i * 80}ms`;
            row.innerHTML = `
                <div class="track-num">${i + 1}</div>
                <div class="track-art ${track.color}"></div>
                <div class="track-details">
                    <h4>${track.title}</h4>
                    <p>${track.artist}</p>
                </div>
                <div class="track-duration">${track.duration}</div>
                <button class="track-like-btn" title="Like"><i class="fa-regular fa-heart"></i></button>
                <button class="track-play-btn" title="Play"><i class="fa-solid fa-play"></i></button>
            `;

            // Click row to "play" it
            row.addEventListener('click', () => {
                document.querySelectorAll('.track-row').forEach(r => r.classList.remove('playing'));
                row.classList.add('playing');
                rpTitle.textContent = track.title;
                rpArtist.textContent = track.artist;
                rpAboutArtist.textContent = track.artist;
                bpTitle.textContent = track.title;
                bpArtist.textContent = track.artist;
                
                // Change bottom play button to pause
                const playBtn = document.querySelector('.control-btn.play-pause i');
                if (playBtn) {
                    playBtn.className = 'fa-solid fa-pause';
                    setTimeout(() => { playBtn.className = 'fa-solid fa-play'; }, 3000);
                }
            });

            trackList.appendChild(row);
        });

        // Also update right panel with first track
        updateRightPanel(tracks);
    }

    function updateRightPanel(tracks) {
        if (!tracks || tracks.length === 0) return;
        const mainTrack = tracks[0];
        rpTitle.textContent = mainTrack.title;
        rpArtist.textContent = mainTrack.artist;
        rpAboutArtist.textContent = mainTrack.artist;
        bpTitle.textContent = mainTrack.title;
        bpArtist.textContent = mainTrack.artist;

        upNextList.innerHTML = '';
        tracks.slice(1).forEach(track => {
            const item = document.createElement('div');
            item.className = 'up-next-item';
            item.innerHTML = `
                <div class="up-next-icon ${track.color}"></div>
                <div class="up-next-info">
                    <h4>${track.title}</h4>
                    <p>${track.artist}</p>
                </div>
            `;
            item.addEventListener('click', () => {
                rpTitle.textContent = track.title;
                rpArtist.textContent = track.artist;
                bpTitle.textContent = track.title;
                bpArtist.textContent = track.artist;
            });
            upNextList.appendChild(item);
        });
    }

    // Background AI call (does not block UI)
    async function fetchFromAPIInBackground(label) {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ vibe_description: label, familiarity_preference: 'low' }),
                signal: AbortSignal.timeout(8000) // 8 second timeout
            });
            if (!response.ok) return; // silently fail
            const data = await response.json();
            if (data.playlist && data.playlist.length > 0) {
                // Only update right panel if AI returns better data
                updateRightPanel(data.playlist);
            }
        } catch (e) {
            // API unavailable — UI already has fallback data shown, so no action needed
        }
    }
});
