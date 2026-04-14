const CONFIG = { 
    // Supabase Production Keys 
    SUPABASE_URL: "https://biehreklleprccoozzbo.supabase.co", 
    SUPABASE_KEY: "sb_publishable_ZgbC-iw-na5mrV7cq-7UTg_-DmTZciv", 
    
    // PayPal Live Client ID (For real money) 
    PAYPAL_CLIENT_ID: "AdVhP8bN0y2KVJqYxaA2CgREyfWabMYb7JIsJdEG0JyLzxzjBg9FMLOawsuueGytWxHkCk4bQ7K7c37R",

    // EmailJS Configuration
    EMAILJS_SERVICE_ID: "service_h7gi8lt",
    EMAILJS_TEMPLATE_ID: "template_xt17vas",
    EMAILJS_PUBLIC_KEY: "SAZjsM7udbeGo5-2R",

    // RapidAPI Configuration
    RAPIDAPI_KEY: "3636ef70f7msh2f51f6c81c32753p1b115ejsn96bd79a11c4a",
    RAPIDAPI_HOST: "youtube-video-fast-downloader-24-7.p.rapidapi.com"
};

// Make CONFIG globally available for supabaseClient.js if it runs later (not the case here but good for consistency)
window.CONFIG = CONFIG;

document.addEventListener('DOMContentLoaded', () => {
    const PLAN_KEY = 'ytvd_plan';

    // Ensure sb is initialized using CONFIG
    let sb = null;
    if (window.supabase && typeof window.supabase.createClient === 'function') {
        try {
            sb = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_KEY, {
                auth: {
                    persistSession: true,
                    autoRefreshToken: true,
                    detectSessionInUrl: true,
                },
            });
            window.supabaseClient = sb;
            console.log("Supabase Client initialized from main.js CONFIG");
        } catch (err) {
            console.error("Failed to initialize Supabase Client in main.js:", err);
            sb = window.supabaseClient || null;
        }
    } else {
        sb = window.supabaseClient || null;
    }

    function showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'fixed left-1/2 -translate-x-1/2 top-5 z-[60] w-[calc(100%-2rem)] max-w-xl rounded-xl border border-primary/20 bg-white/95 text-black shadow-xl backdrop-blur px-4 py-3 transition-opacity duration-300';
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('opacity-0');
            setTimeout(() => toast.remove(), 300);
        }, 4500);
    }

    function updateSidebarAuthUI(user) {
        const guestArea = document.getElementById('authGuestArea');
        const userArea = document.getElementById('authUserArea');
        const userNameEl = document.getElementById('authUserName');
        const logoutBtn = document.getElementById('logoutBtn');

        if (!guestArea || !userArea) return;

        if (user) {
            guestArea.classList.add('hidden');
            userArea.classList.remove('hidden');
            if (userNameEl) {
                userNameEl.textContent = user.user_metadata?.full_name || user.user_metadata?.name || user.email || 'User';
            }
            if (logoutBtn && !logoutBtn.dataset.bound) {
                logoutBtn.dataset.bound = '1';
                logoutBtn.addEventListener('click', async () => {
                    if (sb) {
                        try {
                            await sb.auth.signOut();
                        } catch {
                        }
                    }
                    updateSidebarAuthUI(null);
                });
            }
        } else {
            userArea.classList.add('hidden');
            guestArea.classList.remove('hidden');
            if (userNameEl) userNameEl.textContent = '';
        }
    }

    async function getCurrentUser() {
        if (!sb) return null;
        try {
            const { data } = await sb.auth.getUser();
            if (!data?.user) return null;
            
            // Fetch profile for VIP status
            const { data: profile } = await sb
                .from('profiles')
                .select('*')
                .eq('id', data.user.id)
                .single();
            
            return { ...data.user, profile };
        } catch {
            return null;
        }
    }

    // --- Loading Overlay Logic ---
    const loadingOverlay = document.getElementById('loadingOverlay');
    const loadingMessage = document.getElementById('loadingMessage');
    const adContainer = document.getElementById('adContainer'); // Re-added adContainer reference
    const adTimer = document.getElementById('adTimer'); // Re-added adTimer reference
    let messageInterval;

    const loadingMessages = [
        "Fetching video details...",
        "Checking VIP status..."
    ];

    function showLoading(isVip = false) {
        if (!loadingOverlay) return;
        
        loadingOverlay.classList.remove('hidden');
        loadingOverlay.classList.add('show');
        
        let msgIndex = 0;
        loadingMessage.textContent = loadingMessages[msgIndex];
        
        messageInterval = setInterval(() => {
            msgIndex = (msgIndex + 1) % loadingMessages.length;
            loadingMessage.textContent = loadingMessages[msgIndex];
        }, 800);

        // Ad logic for Free users
        if (!isVip && adContainer) {
            adContainer.classList.remove('hidden');
            let timeLeft = 3;
            adTimer.textContent = timeLeft;
            const timerInterval = setInterval(() => {
                timeLeft--;
                adTimer.textContent = timeLeft;
                if (timeLeft <= 0) clearInterval(timerInterval);
            }, 1000);
        } else if (adContainer) {
            adContainer.classList.add('hidden');
        }
    }

    function hideLoading() {
        if (!loadingOverlay) return;
        clearInterval(messageInterval);
        loadingOverlay.classList.remove('show');
        loadingOverlay.classList.add('hidden');
        if (adContainer) adContainer.classList.add('hidden'); // Ensure ad is hidden on hide
    }


    // --- Sidebar Toggle ---
    const menuBtn = document.getElementById('menuBtn');
    const closeMenuBtn = document.getElementById('closeMenuBtn');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');

    function openSidebar() {
        if (!sidebar) return;
        sidebar.classList.remove('translate-x-full');
        sidebarOverlay.classList.remove('hidden');
        // small delay for transition
        setTimeout(() => {
            sidebarOverlay.classList.remove('opacity-0');
        }, 10);
        document.body.style.overflow = 'hidden'; // prevent scrolling
    }

    function closeSidebar() {
        if (!sidebar) return;
        sidebar.classList.add('translate-x-full');
        sidebarOverlay.classList.add('opacity-0');
        setTimeout(() => {
            sidebarOverlay.classList.add('hidden');
        }, 300);
        document.body.style.overflow = '';
    }

    if (menuBtn) menuBtn.addEventListener('click', openSidebar);
    if (closeMenuBtn) closeMenuBtn.addEventListener('click', closeSidebar);
    if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeSidebar);

    // --- Navigation Logic ---
    const mainHeading = document.getElementById('mainHeading');
    const audioExtractorBtn = document.getElementById('audioExtractorBtn');
    const ytDownloaderBtn = document.getElementById('ytDownloaderBtn');
    let isAudioMode = false;

    if (audioExtractorBtn) {
        audioExtractorBtn.addEventListener('click', (e) => {
            e.preventDefault();
            isAudioMode = true;
            if (mainHeading) mainHeading.textContent = 'YouTube to MP3 Converter';
            if (videoUrlInput) videoUrlInput.placeholder = 'Paste YouTube link for MP3 extraction';
            closeSidebar();
            // Clear any previous results
            if (resultContainer) resultContainer.classList.add('hidden');
        });
    }

    if (ytDownloaderBtn) {
        ytDownloaderBtn.addEventListener('click', (e) => {
            // Default link behavior is fine since it's index.html, 
            // but we can also just reset the UI if already on page
            if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
                e.preventDefault();
                isAudioMode = false;
                if (mainHeading) mainHeading.textContent = 'The Best 4K YouTube Video Downloader with Audio';
                if (videoUrlInput) videoUrlInput.placeholder = 'Paste YouTube video link';
                closeSidebar();
                if (resultContainer) resultContainer.classList.add('hidden');
            }
        });
    }

    // --- Sidebar Dropdowns ---
    const dropdowns = document.querySelectorAll('.sidebar-dropdown');
    dropdowns.forEach(dropdown => {
        const btn = dropdown.querySelector('button');
        const content = dropdown.querySelector('.dropdown-content');
        const icon = dropdown.querySelector('i.fa-chevron-down');

        if (btn && content) {
            btn.addEventListener('click', () => {
                content.classList.toggle('hidden');
                content.classList.toggle('flex');
                if (icon) {
                    icon.classList.toggle('rotate-180');
                    icon.style.transition = 'transform 0.3s ease';
                }
            });
        }
    });

    // --- Paste Button Logic ---
    const pasteBtn = document.getElementById('pasteBtn');
    const videoUrlInput = document.getElementById('videoUrl');

    if (pasteBtn && videoUrlInput) {
        pasteBtn.addEventListener('click', async () => {
            try {
                const text = await navigator.clipboard.readText();
                if (text) {
                    videoUrlInput.value = text;
                }
            } catch (err) {
                console.error('Failed to read clipboard contents: ', err);
                alert('Please allow clipboard access to paste.');
            }
        });
    }

    // --- Download Button Logic ---
    const downloadBtn = document.getElementById('downloadBtn');
    const downloadBtnText = document.getElementById('downloadBtnText');
    const downloadSpinner = document.getElementById('downloadSpinner');
    const resultContainer = document.getElementById('resultContainer');

    function renderResultCard(result, isVip = false) {
        if (!resultContainer) return;
        
        // Response structure for YouTube Media Downloader API
        const title = result.title || result.filename || 'Video Result';
        
        // Handle thumbnails from different API structures
        let thumbnail = 'https://via.placeholder.com/640x360?text=No+Thumbnail';
        if (result.thumbnails && Array.isArray(result.thumbnails) && result.thumbnails.length > 0) {
            thumbnail = result.thumbnails[result.thumbnails.length - 1].url || result.thumbnails[0].url;
        } else if (result.thumbnail) {
            thumbnail = result.thumbnail;
        } else if (result.picker && result.picker[0] && result.picker[0].thumb) {
            thumbnail = result.picker[0].thumb;
        }
        
        let videoUrl = '';
        let audioUrl = '';

        // Handle YouTube Media Downloader structure
        if (result.videos && result.videos.items && Array.isArray(result.videos.items)) {
            // Find 720p or highest available for Free, or highest for VIP
            const videoItems = result.videos.items;
            if (isVip) {
                videoUrl = videoItems[0].url; // Usually sorted by quality desc
            } else {
                const freeVideo = videoItems.find(v => v.quality === '720p' || v.quality === '480p') || videoItems[videoItems.length - 1];
                videoUrl = freeVideo.url;
            }
        }
        
        if (result.audios && result.audios.items && Array.isArray(result.audios.items)) {
            audioUrl = result.audios.items[0].url;
        }

        // Check 'medias' array (fallback for previous API or similar ones)
        if (!videoUrl && result.medias && Array.isArray(result.medias)) {
            const videoMedias = result.medias.filter(m => m.extension === 'mp4' && m.type === 'video');
            if (videoMedias.length > 0) {
                videoUrl = videoMedias[0].url;
            }

            const audioMedias = result.medias.filter(m => m.extension === 'mp3' || m.type === 'audio');
            if (audioMedias.length > 0) {
                audioUrl = audioMedias[0].url;
            }
        }

        // Check 'links' field fallback
        if (!videoUrl && result.links) {
            if (Array.isArray(result.links)) {
                const mp4 = result.links.find(l => l.extension === 'mp4' || l.format === 'mp4');
                if (mp4) videoUrl = mp4.url || mp4.link;
            } else if (typeof result.links === 'object') {
                videoUrl = result.links.mp4 || result.links.video || result.links[0];
                audioUrl = result.links.mp3 || result.links.audio;
            }
        }
        
        // Fallback to top-level fields
        if (!videoUrl) videoUrl = result.url || result.link || '#';
        
        resultContainer.innerHTML = `
            <div class="bg-white rounded-xl p-4 md:p-6 border border-gray-100 shadow-soft animate-fade-in">
                <div class="flex flex-col md:flex-row gap-6">
                    <!-- Thumbnail -->
                    <div class="w-full md:w-1/3 shrink-0">
                        <img src="${thumbnail}" alt="Thumbnail" class="w-full h-auto rounded-lg shadow-sm border border-gray-100">
                    </div>
                    
                    <!-- Details & Actions -->
                    <div class="flex-grow flex flex-col justify-between">
                        <div>
                            <h3 class="text-xl font-bold text-[#212121] line-clamp-2 mb-2">${title}</h3>
                            ${!isVip ? `
                            <p class="text-xs text-gray-500 mb-4 flex items-center gap-1">
                                <i class="fa-solid fa-circle-info"></i> Limited to 720p for Free users
                            </p>
                            ` : `
                            <p class="text-xs text-green-500 mb-4 flex items-center gap-1">
                                <i class="fa-solid fa-crown"></i> VIP Unlocked: High Quality Available
                            </p>
                            `}
                        </div>
                        
                        <div class="flex flex-col gap-3">
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                ${!isAudioMode ? `
                                <a href="${videoUrl}" target="_blank" download class="flex items-center justify-center gap-2 bg-primary hover:bg-primaryHover text-white font-semibold py-3 px-4 rounded-lg transition-colors shadow-sm">
                                    <i class="fa-solid fa-video"></i>
                                    Download MP4
                                </a>
                                ` : ''}
                                <a href="${audioUrl || '#'}" target="_blank" download class="flex items-center justify-center gap-2 border-2 border-primary text-primary hover:bg-primary hover:text-white font-semibold py-3 px-4 rounded-lg transition-colors shadow-sm ${!audioUrl ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}">
                                    <i class="fa-solid fa-music"></i>
                                    Download MP3
                                </a>
                            </div>
                            
                            ${!isVip ? `
                            <a href="vip.html" class="w-full py-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-center rounded-lg text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2">
                                <i class="fa-solid fa-crown"></i>
                                Download in 4K? Upgrade to VIP
                            </a>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        resultContainer.classList.remove('hidden');
    }


    if (downloadBtn && videoUrlInput) {
        downloadBtn.addEventListener('click', async () => {
            let url = videoUrlInput.value.trim();
            if (!url) {
                showToast('Please paste a YouTube URL first.');
                return;
            }

            // Restrict to YouTube only (Shorts, youtu.be, and regular)
            if (!(url.includes('youtube.com') || url.includes('youtu.be'))) {
                showToast('Link-gani ma ahan YouTube sax ah. Fadlan isku day mid kale.');
                return;
            }

            // URL Cleaning Logic: Remove query parameters except video id if possible
            try {
                const urlObj = new URL(url);
                // Keep only the origin and pathname for youtu.be and shorts
                if (urlObj.hostname.includes('youtu.be') || urlObj.pathname.includes('/shorts/')) {
                     url = urlObj.origin + urlObj.pathname;
                } else if (urlObj.hostname.includes('youtube.com') && urlObj.pathname === '/watch') {
                     // For regular watch URLs, keep only the 'v' parameter
                     const videoId = urlObj.searchParams.get('v');
                     if (videoId) {
                         url = `${urlObj.origin}${urlObj.pathname}?v=${videoId}`;
                     } else {
                         url = urlObj.origin + urlObj.pathname;
                     }
                } else {
                     url = urlObj.origin + urlObj.pathname;
                }
            } catch (e) {
                // Not a valid URL object, leave it as is
            }
            
            // Check VIP status
            const user = await getCurrentUser();
            const isVip = user?.profile?.plan === 'pro' || user?.profile?.plan === 'lifetime' || user?.profile?.is_vip === true;

            // UI Loading State
            if (resultContainer) resultContainer.classList.add('hidden');
            showLoading(isVip);

            // For Free users, wait 3 seconds (simulating ad time)
            if (!isVip) {
                await new Promise(resolve => setTimeout(resolve, 3000));
            }

            try {
                console.log("Starting API fetch for URL:", url);
                
                // Use the new YouTubeAPI from api.js
                const result = await YouTubeAPI.fetchVideoInfo(url);
                console.log("API Response:", result);
                
                if (!result || result.error || result.status === 'error') {
                    console.error('API Logic Error:', result);
                    throw new Error(result?.message || result?.text || 'Failed to fetch video');
                }

                // If successful, render the card
                renderResultCard(result, isVip);

            } catch (err) {
                console.error('Full Fetch Error Trace:', err);
                showToast('Link-gani ma ahan YouTube sax ah. Fadlan isku day mid kale.');
            } finally {
                hideLoading();
            }
        });
    }


    const freePlanStartBtn = document.getElementById('freePlanStartBtn');
    if (freePlanStartBtn) {
        freePlanStartBtn.addEventListener('click', async () => {
            showLoading(false); // Free user starts here
            
            const user = await getCurrentUser();
            
            // Artificial delay for "Checking VIP status..." etc.
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            if (!user) {
                hideLoading();
                sessionStorage.setItem('ytvd_login_notice', 'Please log in or connect your Google account to use the Free plan.');
                sessionStorage.setItem('ytvd_pending_plan', 'free');
                sessionStorage.setItem('ytvd_post_login_redirect', 'index.html');
                window.location.href = 'login.html';
                return;
            }

            localStorage.setItem(PLAN_KEY, 'free');
            localStorage.setItem('ytvd_free_active', '1');
            sessionStorage.setItem('ytvd_show_free_notice', '1');
            
            hideLoading();
            window.location.href = 'index.html';
        });
    }


    // --- PayPal Integration ---
    async function sendWelcomeEmail(user, planName, amount, transactionId) {
        if (!window.emailjs) {
            console.error('EmailJS not loaded');
            return;
        }

        const templateParams = {
            to_email: user.email,
            user_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email.split('@')[0],
            plan_name: planName,
            amount: amount,
            transaction_id: transactionId
        };

        try {
            await emailjs.send(CONFIG.EMAILJS_SERVICE_ID, CONFIG.EMAILJS_TEMPLATE_ID, templateParams);
            console.log('Welcome email sent successfully');
        } catch (error) {
            console.error('Failed to send welcome email:', error);
        }
    }

    async function initPayPalButtons() {
        if (!window.paypal) return;

        const proBtn = document.getElementById('proPlanBtn');
        const lifetimeBtn = document.getElementById('lifetimePlanBtn');
        const proContainer = document.getElementById('paypal-button-container-pro');
        const lifetimeContainer = document.getElementById('paypal-button-container-lifetime');

        const handlePlanClick = async (planType, btn, container) => {
            showLoading(false); // Initial check
            const user = await getCurrentUser();
            
            // Artificial delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            if (!user) {
                hideLoading();
                sessionStorage.setItem('ytvd_login_notice', 'Please log in to your account to purchase a VIP plan.');
                sessionStorage.setItem('ytvd_post_login_redirect', 'vip.html');
                window.location.href = 'login.html';
                return;
            }
            
            hideLoading();
            btn.classList.add('hidden');
            container.classList.remove('hidden');
        };

        if (proBtn && proContainer) {
            proBtn.addEventListener('click', () => handlePlanClick('pro', proBtn, proContainer));
            paypal.Buttons({
                createOrder: (data, actions) => {
                    return actions.order.create({
                        purchase_units: [{ amount: { value: '5.00' }, description: 'Pro Plan Monthly' }]
                    });
                },
                onApprove: (data, actions) => {
                    return actions.order.capture().then(async details => {
                        const user = await getCurrentUser();
                        const transactionId = details.id;
                        localStorage.setItem(PLAN_KEY, 'pro');
                        
                        // Mark as VIP in Supabase
                        if (sb && user) {
                            await sb.from('profiles').update({ plan: 'pro' }).eq('id', user.id);
                            await sendWelcomeEmail(user, 'Pro Plan', '$5.00', transactionId);
                        }
                        
                        showToast('Payment successful! You are now a Pro User.');
                        window.location.href = 'index.html';
                    });
                }
            }).render('#paypal-button-container-pro');
        }

        if (lifetimeBtn && lifetimeContainer) {
            lifetimeBtn.addEventListener('click', () => handlePlanClick('lifetime', lifetimeBtn, lifetimeContainer));
            paypal.Buttons({
                createOrder: (data, actions) => {
                    return actions.order.create({
                        purchase_units: [{ amount: { value: '50.00' }, description: 'Lifetime Plan' }]
                    });
                },
                onApprove: (data, actions) => {
                    return actions.order.capture().then(async details => {
                        const user = await getCurrentUser();
                        const transactionId = details.id;
                        localStorage.setItem(PLAN_KEY, 'lifetime');
                        
                        // Mark as VIP in Supabase
                        if (sb && user) {
                            await sb.from('profiles').update({ plan: 'lifetime' }).eq('id', user.id);
                            await sendWelcomeEmail(user, 'Lifetime Plan', '$50.00', transactionId);
                        }
                        
                        showToast('Lacag bixinta waa lagu guuleystay! Hadda waxaad leedahay Lifetime Access.');
                        window.location.href = 'index.html';
                    });
                }
            }).render('#paypal-button-container-lifetime');
        }
    }

    if (window.location.pathname.includes('vip.html')) {
        // Load EmailJS
        const emailjsScript = document.createElement('script');
        emailjsScript.src = "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js";
        emailjsScript.onload = () => {
            emailjs.init(CONFIG.EMAILJS_PUBLIC_KEY);
            console.log('EmailJS initialized with key:', CONFIG.EMAILJS_PUBLIC_KEY);
        };
        document.head.appendChild(emailjsScript);

        const script = document.createElement('script');
        script.src = `https://www.paypal.com/sdk/js?client-id=${CONFIG.PAYPAL_CLIENT_ID}&currency=USD`;
        script.onload = initPayPalButtons;
        document.head.appendChild(script);
    }

    if (sb) {
        sb.auth.getSession().then(({ data }) => {
            const user = data?.session?.user || null;
            updateSidebarAuthUI(user);
            if (sessionStorage.getItem('ytvd_show_free_notice') === '1' && user) {
                sessionStorage.removeItem('ytvd_show_free_notice');
                showToast('Thank you for connecting your account. You can now start downloading in 720p.');
            }
        }).catch(() => {});

        sb.auth.onAuthStateChange((event, session) => {
            const user = session?.user || null;
            updateSidebarAuthUI(user);
            
            // Show PWA Install Prompt after login/signup
            if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
                if (user) {
                    setTimeout(showPWAInstallPrompt, 2000);
                }
            }
        });
    } else {
        updateSidebarAuthUI(null);
    }

    // --- PWA Service Worker & Install Prompt ---
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then(reg => console.log('Service Worker registered', reg))
                .catch(err => console.log('Service Worker registration failed', err));
        });
    }

    let deferredPrompt;
    let autoDismissTimeout;
    const pwaInstallBanner = document.createElement('div');
    pwaInstallBanner.id = 'pwaInstallBanner';
    pwaInstallBanner.innerHTML = `
        <div class="flex flex-col items-center text-center">
            <div class="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-4 shadow-xl shadow-primary/20 transform -rotate-6">
                <i class="fa-solid fa-clapperboard text-white text-3xl"></i>
            </div>
            <h3 class="text-xl font-bold text-black mb-2">Ku dar SnapLoad VIP</h3>
            <p class="text-sm text-gray-600 mb-6 px-2">Ma rabtaa inaad u isticmaasho sidii App ahaan?</p>
            
            <div class="flex flex-col w-full gap-3">
                <button id="pwaInstallBtn" class="w-full py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
                    Install
                </button>
                <button id="pwaCloseBtn" class="w-full py-2 text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors">
                    Cancel
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(pwaInstallBanner);

    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        console.log('beforeinstallprompt event fired');
    });

    function showPWAInstallPrompt() {
        if (deferredPrompt && !localStorage.getItem('pwa_dismissed')) {
            pwaInstallBanner.classList.remove('hide');
            pwaInstallBanner.classList.add('show');
            
            // Auto-dismiss after 3 seconds if no interaction
            autoDismissTimeout = setTimeout(() => {
                hidePWAInstallPrompt();
            }, 3000);
        }
    }

    function hidePWAInstallPrompt() {
        pwaInstallBanner.classList.remove('show');
        pwaInstallBanner.classList.add('hide');
        clearTimeout(autoDismissTimeout);
    }

    const pwaInstallBtn = document.getElementById('pwaInstallBtn');
    const pwaCloseBtn = document.getElementById('pwaCloseBtn');

    if (pwaInstallBtn) {
        pwaInstallBtn.addEventListener('click', async () => {
            clearTimeout(autoDismissTimeout);
            if (!deferredPrompt) return;
            hidePWAInstallPrompt();
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            console.log(`User response to the install prompt: ${outcome}`);
            deferredPrompt = null;
        });
    }

    if (pwaCloseBtn) {
        pwaCloseBtn.addEventListener('click', () => {
            hidePWAInstallPrompt();
            // Don't show again for 7 days
            localStorage.setItem('pwa_dismissed', Date.now());
        });
    }

});
