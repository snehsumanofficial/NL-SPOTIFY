// Global function for card clicks (Music, Podcasts, Audiobooks, Live, Events)
window.playCard = function (el, title, artist) {
    document.getElementById('bp-title').textContent = title;
    document.getElementById('bp-artist').textContent = artist;
    document.getElementById('rp-title').textContent = title;
    document.getElementById('rp-artist').textContent = artist;
    document.getElementById('rp-about-artist').textContent = artist;

    // Update image
    const imgSrc = el.querySelector('img') ? el.querySelector('img').src : null;
    const rpImg = document.getElementById('rp-img');
    const rpIcon = document.querySelector('.rp-icon');
    const bpImg = document.getElementById('bp-img');
    const bpIcon = document.querySelector('.bp-icon');

    if (imgSrc) {
        if (rpImg) { rpImg.src = imgSrc; rpImg.style.display = 'block'; }
        if (rpIcon) { rpIcon.style.display = 'none'; }
        if (bpImg) { bpImg.src = imgSrc; bpImg.style.display = 'block'; }
        if (bpIcon) { bpIcon.style.display = 'none'; }
    } else {
        if (rpImg) { rpImg.style.display = 'none'; }
        if (rpIcon) { rpIcon.style.display = 'block'; }
        if (bpImg) { bpImg.style.display = 'none'; }
        if (bpIcon) { bpIcon.style.display = 'block'; }
    }

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

    // Mood-based curated fallback tracks with real album art images
    const MOOD_TRACKS = {
        Happy: [
            { title: "Can't Stop the Feeling", artist: "Justin Timberlake", duration: "3:57", img: "https://upload.wikimedia.org/wikipedia/en/4/4c/Justin_Timberlake_-_Can%27t_Stop_the_Feeling.png" },
            { title: "Uptown Funk", artist: "Mark Ronson ft. Bruno Mars", duration: "4:30", img: "https://upload.wikimedia.org/wikipedia/en/c/c8/Mark_Ronson_-_Uptown_Funk_%28feat._Bruno_Mars%29.png" },
            { title: "Happy", artist: "Pharrell Williams", duration: "3:53", img: "https://upload.wikimedia.org/wikipedia/en/7/79/Pharrell_Williams_-_Happy.png" },
            { title: "Good as Hell", artist: "Lizzo", duration: "2:39", img: "https://picsum.photos/seed/lizzogoodasHell/60/60" },
            { title: "Dancing Queen", artist: "ABBA", duration: "3:51", img: "https://upload.wikimedia.org/wikipedia/en/5/5d/Arrival_-_ABBA.jpg" },
        ],
        Relaxed: [
            { title: "Sunset Lover", artist: "Petit Biscuit", duration: "3:46", img: "https://picsum.photos/seed/sunsetlover/60/60" },
            { title: "Chill Wave", artist: "Washed Out", duration: "4:10", img: "https://picsum.photos/seed/chillwave/60/60" },
            { title: "Coffee", artist: "beabadoobee", duration: "2:38", img: "https://picsum.photos/seed/beabadoobee/60/60" },
            { title: "Sunday Best", artist: "Surfaces", duration: "3:00", img: "https://picsum.photos/seed/sundaybest/60/60" },
            { title: "Motion", artist: "Koda", duration: "4:20", img: "https://picsum.photos/seed/kodamotion/60/60" },
        ],
        Motivate: [
            { title: "Eye of the Tiger", artist: "Survivor", duration: "4:04", img: "https://upload.wikimedia.org/wikipedia/en/2/2e/Eyeofthetiger.jpg" },
            { title: "Stronger", artist: "Kanye West", duration: "5:11", img: "https://upload.wikimedia.org/wikipedia/en/9/9e/Kanyewest_graduation.jpg" },
            { title: "Hall of Fame", artist: "The Script ft. will.i.am", duration: "3:23", img: "https://picsum.photos/seed/halloffame/60/60" },
            { title: "Till I Collapse", artist: "Eminem", duration: "4:57", img: "https://upload.wikimedia.org/wikipedia/en/3/35/Eminem_-_The_Eminem_Show.jpg" },
            { title: "POWER", artist: "Kanye West", duration: "4:52", img: "https://upload.wikimedia.org/wikipedia/en/1/12/Mbdtf.jpg" },
        ],
        Sleepy: [
            { title: "Weightless", artist: "Marconi Union", duration: "8:09", img: "https://picsum.photos/seed/weightless/60/60" },
            { title: "Holocene", artist: "Bon Iver", duration: "5:35", img: "https://upload.wikimedia.org/wikipedia/en/a/a5/Bon_Iver_-_Bon_Iver_%28album_cover%29.jpg" },
            { title: "River", artist: "Joni Mitchell", duration: "3:54", img: "https://upload.wikimedia.org/wikipedia/en/a/a8/Blue_–_Joni_Mitchell.jpg" },
            { title: "Retrograde", artist: "James Blake", duration: "5:05", img: "https://picsum.photos/seed/jamesblake/60/60" },
            { title: "Night Will Always Win", artist: "Manchester Orchestra", duration: "4:24", img: "https://picsum.photos/seed/manchesterorch/60/60" },
        ],
        Party: [
            { title: "Blinding Lights", artist: "The Weeknd", duration: "3:22", img: "https://upload.wikimedia.org/wikipedia/en/c/c1/The_Weeknd_-_After_Hours.png" },
            { title: "Levitating", artist: "Dua Lipa", duration: "3:23", img: "https://upload.wikimedia.org/wikipedia/en/f/f5/Dua_Lipa_-_Future_Nostalgia_%28Official_Album_Cover%29.png" },
            { title: "Save Your Tears", artist: "The Weeknd", duration: "3:36", img: "https://picsum.photos/seed/saveyourtears/60/60" },
            { title: "As It Was", artist: "Harry Styles", duration: "2:37", img: "https://upload.wikimedia.org/wikipedia/en/b/b5/Harry_Styles_-_Fine_Line.png" },
            { title: "Anti-Hero", artist: "Taylor Swift", duration: "3:21", img: "https://upload.wikimedia.org/wikipedia/en/9/9f/Midnights_-_Taylor_Swift.png" },
        ],
        Study: [
            { title: "Experience", artist: "Ludovico Einaudi", duration: "5:13", img: "https://picsum.photos/seed/einaudiexp/60/60" },
            { title: "Comptine d'un autre été", artist: "Yann Tiersen", duration: "2:22", img: "https://picsum.photos/seed/amelie/60/60" },
            { title: "River Flows in You", artist: "Yiruma", duration: "3:51", img: "https://picsum.photos/seed/yiruma/60/60" },
            { title: "Divenire", artist: "Ludovico Einaudi", duration: "6:52", img: "https://picsum.photos/seed/divenire/60/60" },
            { title: "Nuvole Bianche", artist: "Ludovico Einaudi", duration: "5:54", img: "https://picsum.photos/seed/nuvoleb/60/60" },
        ],
        Work: [
            { title: "Get Lucky", artist: "Daft Punk ft. Pharrell", duration: "6:09", img: "https://upload.wikimedia.org/wikipedia/en/a/a7/Random_Access_Memories.jpg" },
            { title: "Instant Crush", artist: "Daft Punk ft. Julian Casablancas", duration: "5:38", img: "https://upload.wikimedia.org/wikipedia/en/a/a7/Random_Access_Memories.jpg" },
            { title: "Digital Love", artist: "Daft Punk", duration: "4:58", img: "https://picsum.photos/seed/daftdigital/60/60" },
            { title: "Around the World", artist: "Daft Punk", duration: "7:09", img: "https://picsum.photos/seed/daftaround/60/60" },
            { title: "One More Time", artist: "Daft Punk", duration: "5:20", img: "https://picsum.photos/seed/daftonetime/60/60" },
        ],
        Workout: [
            { title: "HUMBLE.", artist: "Kendrick Lamar", duration: "2:57", img: "https://upload.wikimedia.org/wikipedia/en/a/a2/Kendrick_Lamar_-_DAMN.png" },
            { title: "Run the World (Girls)", artist: "Beyoncé", duration: "3:56", img: "https://picsum.photos/seed/beyonce4/60/60" },
            { title: "Centuries", artist: "Fall Out Boy", duration: "3:48", img: "https://picsum.photos/seed/falloutboy/60/60" },
            { title: "Jump", artist: "Kris Kross", duration: "3:37", img: "https://picsum.photos/seed/kriskross/60/60" },
            { title: "Radioactive", artist: "Imagine Dragons", duration: "3:07", img: "https://picsum.photos/seed/imaginedragon/60/60" },
        ],
        Travel: [
            { title: "On the Road Again", artist: "Willie Nelson", duration: "2:33", img: "https://picsum.photos/seed/willienelson/60/60" },
            { title: "Life is a Highway", artist: "Tom Cochrane", duration: "4:34", img: "https://picsum.photos/seed/lifehighway/60/60" },
            { title: "Fly Me to the Moon", artist: "Frank Sinatra", duration: "2:28", img: "https://picsum.photos/seed/sinatra/60/60" },
            { title: "Route 66", artist: "Depeche Mode", duration: "4:26", img: "https://picsum.photos/seed/route66/60/60" },
            { title: "Africa", artist: "Toto", duration: "4:55", img: "https://picsum.photos/seed/totaafrica/60/60" },
        ],
        Meditate: [
            { title: "Stairway to Heaven", artist: "Led Zeppelin", duration: "8:02", img: "https://upload.wikimedia.org/wikipedia/en/2/26/Led_Zeppelin_-_Led_Zeppelin_IV.jpg" },
            { title: "Om Namah Shivaya", artist: "Deva Premal", duration: "7:14", img: "https://picsum.photos/seed/devapremal/60/60" },
            { title: "Pure Shores", artist: "All Saints", duration: "3:42", img: "https://picsum.photos/seed/allsaints/60/60" },
            { title: "Nature Sounds", artist: "Healing Earth", duration: "10:00", img: "https://picsum.photos/seed/naturesounds/60/60" },
            { title: "Breathe", artist: "Pink Floyd", duration: "2:49", img: "https://upload.wikimedia.org/wikipedia/en/3/3b/Dark_Side_of_the_Moon.png" },
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

    // Guard: exit early on pages that don't have the main search (e.g. explore.html)
    if (!searchInput) return;

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

    // Make dropdown items clickable
    const dropdownItems = document.querySelectorAll('.dropdown-item');
    dropdownItems.forEach(item => {
        item.addEventListener('click', () => {
            const query = item.textContent;
            searchInput.value = query;
            searchDropdown.classList.add('hidden');
            switchToView('view-discovery');
            showInstantResults('Search', query);
        });
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
                <img class="track-art-img" src="${track.img}" alt="${track.title}" onerror="this.style.background='#333';this.src=''"
                    style="width:40px;height:40px;border-radius:4px;object-fit:cover;flex-shrink:0;">
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

                // Update image
                const rpImg = document.getElementById('rp-img');
                const rpIcon = document.querySelector('.rp-icon');
                const bpImg = document.getElementById('bp-img');
                const bpIcon = document.querySelector('.bp-icon');

                if (track.img) {
                    if (rpImg) { rpImg.src = track.img; rpImg.style.display = 'block'; }
                    if (rpIcon) { rpIcon.style.display = 'none'; }
                    if (bpImg) { bpImg.src = track.img; bpImg.style.display = 'block'; }
                    if (bpIcon) { bpIcon.style.display = 'none'; }
                } else {
                    if (rpImg) { rpImg.style.display = 'none'; }
                    if (rpIcon) { rpIcon.style.display = 'block'; }
                    if (bpImg) { bpImg.style.display = 'none'; }
                    if (bpIcon) { bpIcon.style.display = 'block'; }
                }

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

    // AI Review Analyzer Logic
    const runBatchBtn = document.getElementById('run-batch-btn');
    const analyzerIngestion = document.getElementById('analyzer-ingestion');
    const analyzerProcessing = document.getElementById('analyzer-processing');
    const analyzerDashboard = document.getElementById('analyzer-dashboard');
    const analyzerProgress = document.getElementById('analyzer-progress');
    const pipelineSteps = document.querySelectorAll('.pipeline-step');

    if (runBatchBtn) {
        runBatchBtn.addEventListener('click', () => {
            analyzerIngestion.classList.add('hidden');
            analyzerProcessing.classList.remove('hidden');

            // Simulate processing pipeline
            let progress = 0;

            const interval = setInterval(() => {
                progress += 2;
                analyzerProgress.style.width = `${progress}%`;

                if (progress === 30) {
                    pipelineSteps[0].classList.remove('active');
                    pipelineSteps[0].querySelector('i').classList.remove('fa-spin');
                    pipelineSteps[1].classList.add('active');
                    pipelineSteps[1].querySelector('i').classList.add('fa-spin');
                } else if (progress === 70) {
                    pipelineSteps[1].classList.remove('active');
                    pipelineSteps[1].querySelector('i').classList.remove('fa-spin');
                    pipelineSteps[2].classList.add('active');
                    pipelineSteps[2].querySelector('i').classList.add('fa-spin');
                } else if (progress >= 100) {
                    clearInterval(interval);
                    pipelineSteps[2].classList.remove('active');
                    pipelineSteps[2].querySelector('i').classList.remove('fa-spin');

                    setTimeout(() => {
                        analyzerProcessing.classList.add('hidden');
                        analyzerDashboard.classList.remove('hidden');
                        analyzerDashboard.style.animation = 'fadeIn 0.5s ease-in-out';
                    }, 500);
                }
            }, 50); // Completes in 2.5 seconds total (100 / 2 = 50 steps * 50ms = 2500ms)
        });
    }

});
