document.addEventListener('DOMContentLoaded', () => {
    // API Setup
    const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        ? 'http://127.0.0.1:8000/generate-vibe-playlist'
        : 'https://nl-spotify.onrender.com/generate-vibe-playlist';

    // DOM Elements
    const vibeForm = document.getElementById('vibe-form');
    const vibeInput = document.getElementById('vibe-input');
    const submitBtn = document.getElementById('submit-btn');
    const spinner = document.getElementById('spinner');
    const btnText = document.querySelector('.btn-text');
    
    // Dropdowns
    const moodDropdown = document.getElementById('mood-dropdown');
    const moodSelected = document.getElementById('mood-selected');
    const moodOptions = document.getElementById('mood-options');
    const activityDropdown = document.getElementById('activity-dropdown');
    const activitySelected = document.getElementById('activity-selected');
    const activityOptions = document.getElementById('activity-options');

    // Results & Player Elements
    const resultsSection = document.getElementById('results-section');
    const tracklist = document.getElementById('tracklist');
    const rpTitle = document.getElementById('rp-title');
    const rpArtist = document.getElementById('rp-artist');
    const bpTitle = document.getElementById('bp-title');
    const bpArtist = document.getElementById('bp-artist');
    const coverArtMini = document.querySelector('.cover-art-mini');
    const coverArtLarge = document.querySelector('.cover-art-large');
    
    const bpPlayBtn = document.getElementById('bp-play-btn');
    const bpProgress = document.getElementById('bp-progress');
    const bpCurrentTime = document.getElementById('bp-current-time');
    const bpDuration = document.getElementById('bp-duration');

    // State
    let selectedMood = null;
    let selectedActivity = null;
    let isPlaying = false;
    let progressInterval;
    let currentProgress = 0;

    // Dropdown Logic
    function setupDropdown(dropdown, selectedElem, optionsContainer, onSelect) {
        selectedElem.addEventListener('click', (e) => {
            e.stopPropagation();
            optionsContainer.classList.toggle('hidden');
        });

        const options = optionsContainer.querySelectorAll('.dropdown-option');
        options.forEach(opt => {
            opt.addEventListener('click', (e) => {
                e.stopPropagation();
                const val = opt.getAttribute('data-value');
                selectedElem.innerHTML = `${val} <i class="fa-solid fa-chevron-down"></i>`;
                optionsContainer.classList.add('hidden');
                onSelect(val);
            });
        });
    }

    setupDropdown(moodDropdown, moodSelected, moodOptions, (val) => selectedMood = val);
    setupDropdown(activityDropdown, activitySelected, activityOptions, (val) => selectedActivity = val);

    // Close dropdowns on outside click
    document.addEventListener('click', () => {
        moodOptions.classList.add('hidden');
        activityOptions.classList.add('hidden');
    });

    // Form Submission
    vibeForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const rawInput = vibeInput.value.trim();
        if (!rawInput && !selectedMood && !selectedActivity) return;

        // Build composite query
        let queryParts = [];
        if (rawInput) queryParts.push(rawInput);
        if (selectedMood) queryParts.push(`Feeling ${selectedMood}`);
        if (selectedActivity) queryParts.push(`Doing ${selectedActivity}`);
        const finalQuery = queryParts.join('. ');

        // UI Loading State
        btnText.classList.add('hidden');
        spinner.classList.remove('hidden');
        submitBtn.disabled = true;

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    vibe_description: finalQuery,
                    familiarity_preference: 'medium'
                })
            });
            
            if (!response.ok) throw new Error('API failed');
            
            const data = await response.json();
            renderTracks(data.playlist);
            
        } catch (error) {
            console.error('Error:', error);
            // Mock data fallback
            renderTracks([
                {title: "Neon Echoes", artist: "Synthwave Masters"},
                {title: "Midnight Drive", artist: "The Outrunners"},
                {title: "Digital Sunset", artist: "Pixel Dreams"},
                {title: "Cyber City", artist: "Future Sounds"}
            ]);
        } finally {
            btnText.classList.remove('hidden');
            spinner.classList.add('hidden');
            submitBtn.disabled = false;
        }
    });

    function renderTracks(tracks) {
        if (!tracks || tracks.length === 0) return;
        
        resultsSection.classList.remove('hidden');
        tracklist.innerHTML = '';
        
        tracks.forEach((track, index) => {
            const el = document.createElement('div');
            el.className = 'track-item';
            el.innerHTML = `
                <div class="track-num-col">
                    <span class="track-num">${index + 1}</span>
                    <i class="fa-solid fa-play track-play"></i>
                </div>
                <div class="track-info-col">
                    <div class="track-name">${track.title}</div>
                    <div class="track-artist">${track.artist}</div>
                </div>
                <div class="track-actions-col">
                    <button class="track-action like"><i class="fa-regular fa-heart"></i></button>
                    <button class="track-action dislike"><i class="fa-regular fa-thumbs-down"></i></button>
                    <button class="track-action"><i class="fa-solid fa-ellipsis"></i></button>
                </div>
            `;
            
            // Play track on click
            el.addEventListener('click', (e) => {
                // Ignore clicks on action buttons
                if (e.target.closest('.track-actions-col')) return;
                playTrack(track);
            });
            
            tracklist.appendChild(el);
        });
        
        // Auto-play first track
        playTrack(tracks[0]);
    }

    function playTrack(track) {
        // Update Side Panel
        rpTitle.textContent = track.title;
        rpArtist.textContent = track.artist;
        coverArtLarge.classList.add('bg-gradient-active');
        coverArtLarge.classList.remove('bg-gradient-yellow');
        
        // Update Bottom Player
        bpTitle.textContent = track.title;
        bpArtist.textContent = track.artist;
        coverArtMini.classList.add('active-art');
        
        bpDuration.textContent = "3:15"; // Mock duration
        
        // Reset and start playback mock
        clearInterval(progressInterval);
        currentProgress = 0;
        bpProgress.style.width = '0%';
        isPlaying = true;
        bpPlayBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
        
        progressInterval = setInterval(() => {
            if (!isPlaying) return;
            currentProgress += 0.5;
            if (currentProgress >= 100) {
                clearInterval(progressInterval);
                isPlaying = false;
                bpPlayBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
                return;
            }
            bpProgress.style.width = `${currentProgress}%`;
            
            // Update time mock
            const totalSeconds = (currentProgress / 100) * 195; // 195s = 3:15
            const m = Math.floor(totalSeconds / 60);
            const s = Math.floor(totalSeconds % 60).toString().padStart(2, '0');
            bpCurrentTime.textContent = `${m}:${s}`;
            
        }, 1000);
    }
    
    bpPlayBtn.addEventListener('click', () => {
        if (!bpTitle.textContent || bpTitle.textContent === "Ready to play") return;
        isPlaying = !isPlaying;
        bpPlayBtn.innerHTML = isPlaying ? '<i class="fa-solid fa-pause"></i>' : '<i class="fa-solid fa-play"></i>';
    });
});
