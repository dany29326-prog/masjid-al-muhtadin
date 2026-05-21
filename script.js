// script.js - Masjid Al Muhtadin

// ==================== DATA MASJID ====================
const MAGHRIB_TIME = "17:48";
const PRAYER_TIMES = {
    subuh: "04:25",
    dzuhur: "11:57",
    ashar: "15:20",
    maghrib: "17:48",
    isya: "19:02"
};

// ==================== COUNTDOWN ====================
let countdownInterval;

function updateCountdown() {
    const now = new Date();
    const maghrib = new Date();
    const [hours, minutes] = MAGHRIB_TIME.split(":");
    maghrib.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    let diff = maghrib - now;
    if (diff < 0) {
        maghrib.setDate(maghrib.getDate() + 1);
        diff = maghrib - now;
    }
    
    const totalSeconds = Math.floor(diff / 1000);
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    const timerElement = document.getElementById('countdown-timer');
    if (timerElement) {
        timerElement.innerText = `${hrs.toString().padStart(2,'0')}:${mins.toString().padStart(2,'0')}:${secs.toString().padStart(2,'0')}`;
    }
    
    const progressElement = document.getElementById('countdown-progress');
    if (progressElement) {
        const maxDiff = 12 * 3600;
        let progress = 100 - (totalSeconds / maxDiff) * 100;
        progress = Math.min(100, Math.max(0, progress));
        progressElement.style.width = progress + "%";
        
        if (totalSeconds < 3600 && totalSeconds > 0) {
            progressElement.classList.add('bg-yellow-400');
        }
    }
}

// ==================== HIGHLIGHT JADWAL ====================
function highlightCurrentPrayer() {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMin = now.getMinutes();
    
    const times = [
        { name: "subuh", hour: 4, minute: 25 },
        { name: "dzuhur", hour: 11, minute: 57 },
        { name: "ashar", hour: 15, minute: 20 },
        { name: "maghrib", hour: 17, minute: 48 },
        { name: "isya", hour: 19, minute: 2 }
    ];
    
    let activeIndex = -1;
    for (let i = 0; i < times.length; i++) {
        let t = times[i];
        let totalMin = t.hour * 60 + t.minute;
        let nowMin = currentHour * 60 + currentMin;
        if (nowMin >= totalMin) activeIndex = i;
    }
    
    const items = document.querySelectorAll('.prayer-item');
    items.forEach((item, idx) => {
        if (idx === activeIndex) {
            item.classList.add('prayer-active');
            item.classList.remove('bg-white', 'text-gray-700');
        } else {
            item.classList.remove('prayer-active');
            item.classList.add('bg-white', 'text-gray-700');
        }
    });
    
    if (activeIndex === -1 && items[0]) {
        items[0].classList.add('prayer-active');
    }
}

// ==================== PROGRESS BAR DONASI ====================
function animateProgress() {
    const donasi1 = document.querySelectorAll('.progress-animate');
    if (donasi1[0]) donasi1[0].style.width = '65%';
    if (donasi1[1]) donasi1[1].style.width = '72%';
}

// ==================== TOAST NOTIFICATION ====================
function toastNotif(msg) {
    let toast = document.createElement('div');
    toast.innerText = msg;
    toast.className = 'toast';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 1500);
}

// ==================== OPEN MAPS ====================
function openMaps() {
    window.open("https://maps.google.com/?q=Jl.+Raya+Ciamas+Bogor", "_blank");
}

// ==================== NAVIGASI HALAMAN ====================
function showPage(pageId) {
    // Sembunyikan semua halaman
    document.querySelectorAll('.page-content').forEach(page => {
        page.classList.add('hidden');
    });
    
    // Tampilkan halaman yang dipilih
    const targetPage = document.getElementById(`page-${pageId}`);
    if (targetPage) {
        targetPage.classList.remove('hidden');
    }
    
    // Update active state bottom nav
    document.querySelectorAll('.nav-item').forEach(nav => {
        nav.classList.remove('active');
        if (nav.getAttribute('data-page') === pageId) {
            nav.classList.add('active');
        }
    });
    
    // Animasi progress jika ke home
    if (pageId === 'home') {
        setTimeout(animateProgress, 100);
        highlightCurrentPrayer();
    }
}

// ==================== LOAD KONTEN DINAMIS ====================
function loadPageContent() {
    // Update countdown
    if (document.getElementById('countdown-timer')) {
        updateCountdown();
        if (countdownInterval) clearInterval(countdownInterval);
        countdownInterval = setInterval(updateCountdown, 1000);
    }
    
    // Animate progress
    animateProgress();
    highlightCurrentPrayer();
    
    // Update highlight setiap menit
    setInterval(highlightCurrentPrayer, 60000);
}

// ==================== EVENT LISTENER ====================
document.addEventListener('DOMContentLoaded', function() {
    loadPageContent();
    
    // Setup bottom nav click
    document.querySelectorAll('.nav-item').forEach(nav => {
        nav.addEventListener('click', (e) => {
            let page = nav.getAttribute('data-page');
            showPage(page);
        });
    });
    
    // Tampilkan home sebagai default
    showPage('home');
});

// Export functions untuk global use
window.toastNotif = toastNotif;
window.openMaps = openMaps;