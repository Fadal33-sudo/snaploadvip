const CONFIG = { 
    // Supabase Production Keys 
    SUPABASE_URL: "https://biehreklleprccoozzbo.supabase.co", 
    SUPABASE_KEY: "sb_publishable_ZgbC-iw-na5mrV7cq-7UTg_-DmTZciv", 
    
    // PayPal Live Client ID (For real money) 
    PAYPAL_CLIENT_ID: "AdVhP8bN0y2KVJqYxaA2CgREyfWabMYb7JIsJdEG0JyLzxzjBg9FMLOawsuueGytWxHkCk4bQ7K7c37R",

    // EmailJS Configuration
    EMAILJS_SERVICE_ID: "service_h7gi8lt",
    EMAILJS_TEMPLATE_ID: "template_xt17vas",
    EMAILJS_PUBLIC_KEY: "SAZjsM7udbeGo5-2R"
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
    const downloadSpinner = document.getElementById('downloadSpinner');

    if (downloadBtn && downloadSpinner && videoUrlInput) {
        downloadBtn.addEventListener('click', () => {
            const url = videoUrlInput.value.trim();
            if (!url) {
                alert('Please paste a YouTube URL first.');
                return;
            }
            
            // Show loading spinner
            downloadSpinner.classList.remove('hidden');
            downloadBtn.setAttribute('disabled', 'true');
            downloadBtn.classList.add('opacity-75', 'cursor-not-allowed');

            // Simulate download process (e.g., API call)
            setTimeout(() => {
                downloadSpinner.classList.add('hidden');
                downloadBtn.removeAttribute('disabled');
                downloadBtn.classList.remove('opacity-75', 'cursor-not-allowed');
                alert('Download started for: ' + url);
                // Here you would integrate your actual backend logic
            }, 2000);
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

        sb.auth.onAuthStateChange((_event, session) => {
            updateSidebarAuthUI(session?.user || null);
        });
    } else {
        updateSidebarAuthUI(null);
    }
});
