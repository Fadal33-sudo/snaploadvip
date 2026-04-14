const YouTubeAPI = {
    async fetchVideoInfo(url) {
        const host = 'youtube-video-fast-downloader-24-7.p.rapidapi.com';
        const key = '3636ef70f7msh2f51f6c81c32753p1b115ejsn96bd79a11c4a';
        
        // Sida uu codsaday isticmaalaha: U dir URL-ka dhamaystiran API-ga
        const apiUrl = `https://${host}/get-videos-info/${encodeURIComponent(url)}?response_mode=default`;
        
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
                console.error('API Error Response:', errorData);
                throw new Error(`API error: ${response.status}`);
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