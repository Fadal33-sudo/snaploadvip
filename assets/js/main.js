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
    RAPIDAPI_HOST: "auto-download-all-in-one.p.rapidapi.com"
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
        toast.className = 'fixed left-1/2 -translate-x-1/2 top-5 z-[60] w-[calc(100%-2rem)] max-w-xl rounded-xl border border-primary/20 bg-white/95 text-black shadow-xl backdrop-blur px-4 py-3 dark:bg-gray-900/95 dark:text-white dark:border-neonBlue/30 transition-opacity duration-300';
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
            return data?.user || null;
        } catch {
            return null;
        }
    }

    // --- Dark Mode Toggle ---
    const themeToggle = document.getElementById('themeToggle');
    const htmlElement = document.documentElement;
    
    // Check for saved theme preference or system preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        htmlElement.classList.add('dark');
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            htmlElement.classList.toggle('dark');
            const isDark = htmlElement.classList.contains('dark');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
        });
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

    function renderResultCard(data) {
        if (!resultContainer) return;
        
        // Response structure for Auto Download All In One API
        const title = data.title || data.filename || 'Video Result';
        const thumbnail = data.thumbnail || (data.picker && data.picker[0] && data.picker[0].thumb) || 'https://via.placeholder.com/640x360?text=No+Thumbnail';
        
        let videoUrl = '';
        let audioUrl = '';

        // Check 'medias' array (standard for this API)
        if (data.medias && Array.isArray(data.medias)) {
            const videoMedias = data.medias.filter(m => m.extension === 'mp4' && m.type === 'video');
            if (videoMedias.length > 0) {
                videoUrl = videoMedias[0].url;
            }

            const audioMedias = data.medias.filter(m => m.extension === 'mp3' || m.type === 'audio');
            if (audioMedias.length > 0) {
                audioUrl = audioMedias[0].url;
            }
        }

        // Check 'links' field if 'medias' didn't yield results
        if (!videoUrl && data.links) {
            if (Array.isArray(data.links)) {
                const mp4 = data.links.find(l => l.extension === 'mp4' || l.format === 'mp4');
                if (mp4) videoUrl = mp4.url || mp4.link;
            } else if (typeof data.links === 'object') {
                videoUrl = data.links.mp4 || data.links.video || data.links[0];
                audioUrl = data.links.mp3 || data.links.audio;
            }
        }
        
        // Fallback to top-level fields
        if (!videoUrl) videoUrl = data.url || data.link || '#';
        
        resultContainer.innerHTML = `
            <div class="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 md:p-6 border border-gray-200 dark:border-gray-700 animate-fade-in">
                <div class="flex flex-col md:flex-row gap-6">
                    <!-- Thumbnail -->
                    <div class="w-full md:w-1/3 shrink-0">
                        <img src="${thumbnail}" alt="Thumbnail" class="w-full h-auto rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                    </div>
                    
                    <!-- Details & Actions -->
                    <div class="flex-grow flex flex-col justify-between">
                        <div>
                            <h3 class="text-xl font-bold text-black dark:text-white line-clamp-2 mb-4">${title}</h3>
                        </div>
                        
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                            ${!isAudioMode ? `
                            <a href="${videoUrl}" target="_blank" download class="flex items-center justify-center gap-2 bg-primary hover:bg-primaryHover text-white font-semibold py-3 px-4 rounded-lg transition-colors shadow-sm">
                                <i class="fa-solid fa-video"></i>
                                Download MP4
                            </a>
                            ` : ''}
                            <a href="${audioUrl || '#'}" target="_blank" download class="flex items-center justify-center gap-2 border-2 border-primary text-primary dark:border-neonBlue dark:text-neonBlue hover:bg-primary hover:text-white dark:hover:bg-neonBlue dark:hover:text-black font-semibold py-3 px-4 rounded-lg transition-colors shadow-sm ${!audioUrl ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}">
                                <i class="fa-solid fa-music"></i>
                                Download MP3
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        resultContainer.classList.remove('hidden');
    }

    if (downloadBtn && downloadSpinner && videoUrlInput) {
        downloadBtn.addEventListener('click', async () => {
            let url = videoUrlInput.value.trim();
            if (!url) {
                showToast('Please paste a video URL first.');
                return;
            }

            // URL Cleaning Logic
            try {
                const urlObj = new URL(url);
                // Support short youtu.be links by keeping them or converting them
                // The API usually handles both, but let's clean tracking params
                const paramsToRemove = ['si', 'pp', 'feature', 'attr'];
                paramsToRemove.forEach(p => urlObj.searchParams.delete(p));
                url = urlObj.toString();
            } catch (e) {
                // Not a valid URL, will likely fail in fetch
            }
            
            // UI Loading State
            if (resultContainer) resultContainer.classList.add('hidden');
            downloadSpinner.classList.remove('hidden');
            downloadBtn.setAttribute('disabled', 'true');
            if (downloadBtnText) downloadBtnText.textContent = 'Raadinaya...';
            downloadBtn.classList.add('opacity-75', 'cursor-not-allowed');

            try {
                // Using Auto Download All In One API via RapidAPI
                const response = await fetch('https://auto-download-all-in-one.p.rapidapi.com/v1/get-info', {
                    method: 'POST',
                    headers: {
                        'x-rapidapi-key': CONFIG.RAPIDAPI_KEY,
                        'x-rapidapi-host': CONFIG.RAPIDAPI_HOST,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ url: url })
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('API Error Response:', errorText);
                    throw new Error('API request failed');
                }

                const data = await response.json();
                console.log('API Response Data:', data);
                
                if (!data || data.error || data.status === 'error') {
                    console.error('API Logic Error:', data);
                    throw new Error(data?.message || data?.text || 'Failed to fetch video');
                }

                renderResultCard(data);

            } catch (err) {
                console.error('Full Fetch Error:', err);
                showToast('Fadlan hubi link-ga aad soo gelisay.');
            } finally {
                downloadSpinner.classList.add('hidden');
                downloadBtn.removeAttribute('disabled');
                if (downloadBtnText) downloadBtnText.textContent = 'Download';
                downloadBtn.classList.remove('opacity-75', 'cursor-not-allowed');
            }
        });
    }

    const freePlanStartBtn = document.getElementById('freePlanStartBtn');
    if (freePlanStartBtn) {
        freePlanStartBtn.addEventListener('click', async () => {
            const user = await getCurrentUser();
            if (!user) {
                sessionStorage.setItem('ytvd_login_notice', 'Please log in or connect your Google account to use the Free plan.');
                sessionStorage.setItem('ytvd_pending_plan', 'free');
                sessionStorage.setItem('ytvd_post_login_redirect', 'index.html');
                window.location.href = 'login.html';
                return;
            }

            localStorage.setItem(PLAN_KEY, 'free');
            localStorage.setItem('ytvd_free_active', '1');
            sessionStorage.setItem('ytvd_show_free_notice', '1');
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
            const user = await getCurrentUser();
            if (!user) {
                sessionStorage.setItem('ytvd_login_notice', 'Please log in to your account to purchase a VIP plan.');
                sessionStorage.setItem('ytvd_post_login_redirect', 'vip.html');
                window.location.href = 'login.html';
                return;
            }
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
            <h3 class="text-xl font-bold text-black dark:text-white mb-2">Ku dar SnapLoad VIP</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-6 px-2">Ma rabtaa inaad u isticmaasho sidii App ahaan?</p>
            
            <div class="flex flex-col w-full gap-3">
                <button id="pwaInstallBtn" class="w-full py-3 bg-primary text-white dark:bg-neonBlue dark:text-black rounded-xl font-bold shadow-lg shadow-primary/25 dark:shadow-neonBlue/10 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
                    Install
                </button>
                <button id="pwaCloseBtn" class="w-full py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors">
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
