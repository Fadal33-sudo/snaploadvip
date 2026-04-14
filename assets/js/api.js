const YouTubeAPI = {
    // Function to extract video ID from various YouTube URL formats
    extractVideoId(url) {
        let videoId = null;
        try {
            const urlObj = new URL(url);
            if (urlObj.hostname.includes('youtu.be')) {
                videoId = urlObj.pathname.slice(1);
            } else if (urlObj.pathname.includes('/shorts/')) {
                videoId = urlObj.pathname.split('/shorts/')[1];
            } else if (urlObj.hostname.includes('youtube.com') && urlObj.pathname === '/watch') {
                videoId = urlObj.searchParams.get('v');
            }
        } catch (e) {
            console.error("Error extracting Video ID:", e);
        }
        return videoId;
    },

    async fetchVideoInfo(url) {
        const host = window.CONFIG.RAPIDAPI_HOST;
        const key = window.CONFIG.RAPIDAPI_KEY;
        
        const videoId = this.extractVideoId(url);
        
        if (!videoId) {
            throw new Error("Lama heli karo Video ID-ga link-ga.");
        }

        // Sida ay API-gani u shaqayso: wuxuu u baahan yahay Video ID-ga, ma aha URL-ka oo dhan
        const apiUrl = `https://${host}/get-videos-info/${videoId}?response_mode=default`;
        
        try {
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'x-rapidapi-key': key,
                    'x-rapidapi-host': host
                }
            });

            if (!response.ok) {
                const errorData = await response.text();
                console.error('API Error Response (raw):', errorData);
                let errorMessage = `API error: ${response.status}`;
                try {
                    const errorJson = JSON.parse(errorData);
                    errorMessage = errorJson.message || errorJson.error || errorData;
                } catch (parseError) {
                    // If not JSON, use raw text
                }
                throw new Error(errorMessage);
            }

            return await response.json();
        } catch (error) {
            console.error('API Fetch Error:', error);
            throw error;
        }
    }
};

// Ka dhig mid laga heli karo meel kasta
window.YouTubeAPI = YouTubeAPI;