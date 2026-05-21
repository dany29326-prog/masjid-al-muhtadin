document.addEventListener("DOMContentLoaded", function () {
    // ===== CHECKBOX AMAL (localStorage) & RESET HARIAN =====
    const checkboxes = document.querySelectorAll(".amal-checkbox");
    
    // Dapatkan tanggal hari ini (format: YYYY-MM-DD) berdasarkan timezone lokal
    const getTodayDateString = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    const todayStr = getTodayDateString();
    const lastCheckedDate = localStorage.getItem("amal_last_checked_date");

    // Jika hari berganti (tanggal berbeda), reset seluruh amal
    if (lastCheckedDate !== todayStr) {
        checkboxes.forEach(function (checkbox) {
            localStorage.setItem(checkbox.id, "false");
            checkbox.checked = false;
        });
        localStorage.setItem("amal_last_checked_date", todayStr);
    }

    // Fungsi memperbarui visual progress bar
    function updateAmalProgress() {
        const total = checkboxes.length;
        if (total === 0) return;
        
        let checkedCount = 0;
        checkboxes.forEach(function (checkbox) {
            if (checkbox.checked) checkedCount++;
        });

        const percentage = Math.round((checkedCount / total) * 100);
        
        const progressBadge = document.getElementById("amalProgressBadge");
        const progressFill = document.getElementById("amalProgressFill");

        if (progressBadge) {
            progressBadge.textContent = `${checkedCount}/${total} Selesai`;
        }
        if (progressFill) {
            progressFill.style.width = `${percentage}%`;
        }
    }

    // Pasang status awal & event listener
    checkboxes.forEach(function (checkbox) {
        const savedStatus = localStorage.getItem(checkbox.id);
        if (savedStatus === "true") { 
            checkbox.checked = true; 
        } else {
            checkbox.checked = false;
        }

        checkbox.addEventListener("change", function () {
            localStorage.setItem(checkbox.id, checkbox.checked);
            updateAmalProgress();
        });
    });

    // Inisialisasi progress bar saat pertama dimuat
    updateAmalProgress();


    // ===== JADWAL SHOLAT SUKOHARJO (INTEGRASI API & CACHING) =====
    // Default static data sebagai fallback offline
    let jadwalSholat = [
        { nama: "Subuh",     namaEn: "Fajr",    jam: "04:31" },
        { nama: "Dzuhur",    namaEn: "Dhuhr",   jam: "11:38" },
        { nama: "Ashar",     namaEn: "Asr",     jam: "14:57" },
        { nama: "Maghrib",   namaEn: "Maghrib", jam: "17:37" },
        { nama: "Isya",      namaEn: "Isha",    jam: "18:47" }
    ];

    const sholatTitleEl = document.querySelector(".sholat-title");
    const jamEl = document.querySelectorAll(".countdown-item .time-digit");
    const labelEl = document.querySelectorAll(".countdown-item .time-label");

    // Fungsi memperbarui UI Tabel Jadwal Lengkap di HTML
    function updateScheduleTableUI(timings) {
        const mapping = {
            subuh: timings.Fajr,
            terbit: timings.Sunrise,
            dzuhur: timings.Dhuhr,
            ashar: timings.Asr,
            maghrib: timings.Maghrib,
            isya: timings.Isha
        };

        for (const [key, val] of Object.entries(mapping)) {
            if (!val) continue;
            const cleanTime = val.split(" ")[0]; // hilangkan zona waktu jika ada
            const item = document.querySelector(`.jadwal-item[data-sholat="${key}"]`);
            if (item) {
                const jamWaktuEl = item.querySelector(".waktu-jam");
                if (jamWaktuEl) jamWaktuEl.textContent = cleanTime;
            }
        }
    }

    // Fungsi memperbarui array jadwalSholat dari data API
    function updateJadwalSholatArray(timings) {
        jadwalSholat = [
            { nama: "Subuh",     namaEn: "Fajr",    jam: timings.Fajr.split(" ")[0] },
            { nama: "Dzuhur",    namaEn: "Dhuhr",   jam: timings.Dhuhr.split(" ")[0] },
            { nama: "Ashar",     namaEn: "Asr",     jam: timings.Asr.split(" ")[0] },
            { nama: "Maghrib",   namaEn: "Maghrib", jam: timings.Maghrib.split(" ")[0] },
            { nama: "Isya",      namaEn: "Isha",    jam: timings.Isha.split(" ")[0] }
        ];
    }

    // Fungsi membersihkan dan menerjemahkan nama bulan Hijriah ke Bahasa Indonesia
    function getCleanHijriMonth(monthEn) {
        const months = {
            "Muharram": "Muharram", "Safar": "Safar", "Rabi' al-awwal": "Rabiul Awal",
            "Rabi' ath-thani": "Rabiul Akhir", "Jumada al-ula": "Jumadil Awal", "Jumada al-akhirah": "Jumadil Akhir",
            "Rajab": "Rajab", "Sha'ban": "Sya'ban", "Ramadan": "Ramadhan",
            "Shawwal": "Syawal", "Dhu al-qi'dah": "Dzulqadah", "Dhu al-hijjah": "Dzulhijjah",
            "Muḥarram": "Muharram", "Ṣafar": "Safar", "Rabīʿ al-awwal": "Rabiul Awal",
            "Rabīʿ al-thānī": "Rabiul Akhir", "Rabīʿ ath-thānī": "Rabiul Akhir", "Jumādā al-ūlā": "Jumadil Awal",
            "Jumādā al-ākhirah": "Jumadil Akhir", "Shaʿbān": "Sya'ban", "Ramaḍān": "Ramadhan",
            "Dhū al-qaʿdah": "Dzulqadah", "Dhū al-ḥijjah": "Dzulhijjah", "Dhu al-Qi'dah": "Dzulqadah",
            "Dhu al-Hijjah": "Dzulhijjah"
        };
        
        const cleanKey = monthEn.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
        return months[monthEn] || months[cleanKey] || cleanKey;
    }

    // Fungsi memformat tanggal Masehi ke Bahasa Indonesia
    function getIndonesianGregorianDate() {
        const today = new Date();
        const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
        const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
        
        const dayName = days[today.getDay()];
        const dayNum = today.getDate();
        const monthName = months[today.getMonth()];
        const year = today.getFullYear();
        
        return `${dayName}, ${dayNum} ${monthName} ${year}`;
    }

    // Fungsi memperbarui teks Kalender Hijriyah di UI
    function updateHijriDateUI(hijri) {
        const hijriIslamText = document.getElementById("hijriIslamText");
        const hijriMasehiText = document.getElementById("hijriMasehiText");

        // Tanggal Masehi selalu tersedia secara lokal, langsung tampilkan
        if (hijriMasehiText) {
            hijriMasehiText.textContent = getIndonesianGregorianDate();
        }

        if (hijriIslamText) {
            if (hijri && hijri.month && hijri.month.en) {
                const cleanMonth = getCleanHijriMonth(hijri.month.en);
                hijriIslamText.textContent = `${parseInt(hijri.day)} ${cleanMonth} ${hijri.year} H`;
            } else {
                // Fallback: hitung perkiraan Hijriah lokal dari Masehi
                // Ini muncul saat offline dan tidak ada cache sama sekali
                hijriIslamText.textContent = "Memuat kalender...";
            }
        }
    }

    // Tampilkan tanggal Masehi segera tanpa menunggu API
    updateHijriDateUI(null);

    // Fungsi fetch jadwal sholat dari API dengan Caching
    async function initJadwalSholat() {
        const cachedDate = localStorage.getItem("jadwal_shalat_date");
        const cachedData = localStorage.getItem("jadwal_shalat_cache");

        // Jika ada cache untuk hari ini, gunakan langsung
        if (cachedDate === todayStr && cachedData) {
            try {
                const parsed = JSON.parse(cachedData);
                // Deteksi cache lama (format datar, tidak memiliki .timings) dan hapus
                if (!parsed.timings) {
                    console.warn("Cache jadwal format lama terdeteksi, menghapus dan fetch ulang...");
                    localStorage.removeItem("jadwal_shalat_cache");
                    localStorage.removeItem("jadwal_shalat_date");
                    // Lanjut ke fetch baru di bawah
                } else {
                    const timings = parsed.timings;
                    const hijri = parsed.hijri || null;

                    updateJadwalSholatArray(timings);
                    updateScheduleTableUI(timings);
                    updateHijriDateUI(hijri);
                    updateCountdown();
                    console.log("Memuat Jadwal Sholat & Tanggal Hijriah dari Cache Lokal (Hari Ini)");
                    return;
                }
            } catch (e) {
                console.error("Gagal parse cache jadwal sholat, mencoba fetch ulang...", e);
                localStorage.removeItem("jadwal_shalat_cache");
                localStorage.removeItem("jadwal_shalat_date");
            }
        }

        // Jika tidak ada cache / ganti hari, fetch dari API Aladhan (Metode 11 Kemenag)
        try {
            console.log("Melakukan Fetch Jadwal Sholat Baru dari Aladhan API...");
            const response = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=Sukoharjo&country=Indonesia&method=11`);
            if (!response.ok) throw new Error("Respon API bermasalah");

            const result = await response.json();
            const timings = result.data.timings;
            const hijri = result.data.date.hijri;

            if (timings) {
                // Simpan ke cache beserta tanggal Hijriah
                const cacheObj = { timings, hijri };
                localStorage.setItem("jadwal_shalat_cache", JSON.stringify(cacheObj));
                localStorage.setItem("jadwal_shalat_date", todayStr);

                // Update UI dan Array
                updateJadwalSholatArray(timings);
                updateScheduleTableUI(timings);
                updateHijriDateUI(hijri);
                updateCountdown();
                console.log("Jadwal Sholat & Tanggal Hijriah berhasil di-fetch dan disimpan di cache!");
            }
        } catch (err) {
            console.warn("Koneksi gagal atau offline. Menggunakan Jadwal Sholat Statis Bawaan (Fallback):", err);
            // Gunakan data bawaan statis
            updateCountdown();
            updateHijriDateUI(null);
        }
    }

    function getTimeInMinutes(timeStr) {
        const [h, m] = timeStr.split(":").map(Number);
        return h * 60 + m;
    }

    function pad(n) {
        return n.toString().padStart(2, "0");
    }

    function updateCountdown() {
        const now = new Date();
        const nowMinutes = now.getHours() * 60 + now.getMinutes();
        const nowSeconds = now.getSeconds();

        // Cari waktu sholat berikutnya
        let nextSholat = null;
        for (let i = 0; i < jadwalSholat.length; i++) {
            const waktu = getTimeInMinutes(jadwalSholat[i].jam);
            if (waktu > nowMinutes) {
                nextSholat = jadwalSholat[i];
                break;
            }
        }

        // Jika sudah lewat semua, ambil Subuh besok
        if (!nextSholat) {
            nextSholat = jadwalSholat[0];
        }

        // Update judul countdown
        sholatTitleEl.textContent = "Adzan " + nextSholat.nama;

        // Hitung total detik
        const nextTime = getTimeInMinutes(nextSholat.jam);
        let diffMinutes = nextTime - nowMinutes;
        if (diffMinutes < 0) {
            diffMinutes = (24 * 60) - nowMinutes + nextTime;
        }

        let totalSeconds = diffMinutes * 60 - nowSeconds;
        if (totalSeconds < 0) totalSeconds = 0;

        const hours = Math.floor(totalSeconds / 3600);
        const mins = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;

        jamEl[0].textContent = pad(hours);
        jamEl[1].textContent = pad(mins);
        jamEl[2].textContent = pad(secs);

        labelEl[0].textContent = hours === 1 ? "Jam" : "Jam";
        labelEl[1].textContent = mins === 1 ? "Menit" : "Menit";
        labelEl[2].textContent = secs === 1 ? "Detik" : "Detik";

        // Update active class di jadwal grid secara aman berbasis data-sholat (Memperbaiki bug Terbit)
        const activeSholatKey = nextSholat.nama.toLowerCase();
        const allJadwalItems = document.querySelectorAll(".jadwal-item");
        
        allJadwalItems.forEach((item) => {
            item.classList.remove("active");
            if (item.getAttribute("data-sholat") === activeSholatKey) {
                item.classList.add("active");
            }
        });
    }

    // Inisialisasi awal jadwal & jalankan countdown interval
    initJadwalSholat();
    setInterval(updateCountdown, 1000);


    // ===== HIKMAH HARI INI (Rotasi Harian) =====
    const hikmahList = [
        { judul: "🌟 Mutiara Hikmah", teks: '"Barang siapa yang berjalan menuju masjid, maka Allah akan menyediakan baginya tempat di surga setiap kali ia pergi dan pulang."', sumber: "HR. Bukhari & Muslim" },
        { judul: "🌟 Mutiara Hikmah", teks: '"Sebaik-baik manusia adalah yang paling bermanfaat bagi manusia."', sumber: "HR. Ahmad" },
        { judul: "🌟 Mutiara Hikmah", teks: '"Barang siapa yang menempuh jalan untuk mencari ilmu, maka Allah akan memudahkan baginya jalan menuju surga."', sumber: "HR. Muslim" },
        { judul: "🌟 Mutiara Hikmah", teks: '"Janganlah kamu marah, maka bagimu surga."', sumber: "HR. Thabrani" },
        { judul: "🌟 Mutiara Hikmah", teks: '"Sesungguhnya bersama kesulitan ada kemudahan."', sumber: "QS. Al-Insyirah: 6" },
        { judul: "🌟 Mutiara Hikmah", teks: '"Barang siapa yang bersyukur, maka sesungguhnya ia bersyukur untuk dirinya sendiri."', sumber: "QS. Luqman: 12" },
        { judul: "🌟 Mutiara Hikmah", teks: '"Senyummu di hadapan saudaramu adalah sedekah."', sumber: "HR. Tirmidzi" },
        { judul: "🌟 Mutiara Hikmah", teks: '"Janganlah kalian saling membenci, saling dengki, dan saling membelakangi. Jadilah hamba Allah yang bersaudara."', sumber: "HR. Bukhari & Muslim" },
        { judul: "🌟 Mutiara Hikmah", teks: '"Barang siapa yang beriman kepada Allah dan hari akhir, hendaklah ia berkata baik atau diam."', sumber: "HR. Bukhari & Muslim" },
        { judul: "🌟 Mutiara Hikmah", teks: '"Allah tidak membebani seseorang melainkan sesuai dengan kesanggupannya."', sumber: "QS. Al-Baqarah: 286" },
        { judul: "🌟 Mutiara Hikmah", teks: '"Maka nikmat Tuhanmu yang manakah yang kamu dustakan?"', sumber: "QS. Ar-Rahman: 13" },
        { judul: "🌟 Mutiara Hikmah", teks: '"Dan barang siapa yang bertakwa kepada Allah, niscaya Dia akan memberikan jalan keluar dan memberinya rezeki dari arah yang tidak disangka-sangka."', sumber: "QS. Ath-Thalaq: 2-3" },
        { judul: "🌟 Mutiara Hikmah", teks: '"Sebaik-baik kalian adalah yang belajar Al-Qur\'an dan mengajarkannya."', sumber: "HR. Bukhari" },
        { judul: "🌟 Mutiara Hikmah", teks: '"Janganlah kalian meremehkan kebaikan sekecil apa pun, meskipun hanya bertemu dengan saudaramu dengan wajah yang berseri."', sumber: "HR. Muslim" },
        { judul: "🌟 Mutiara Hikmah", teks: '"Perumpamaan orang yang berdzikir kepada Tuhannya dan yang tidak, seperti orang hidup dan orang mati."', sumber: "HR. Bukhari" },
        { judul: "🌟 Mutiara Hikmah", teks: '"Dan mohonlah ampun kepada Tuhanmu, kemudian bertobatlah kepada-Nya. Sesungguhnya Tuhanku Maha Penyayang lagi Maha Pengasih."', sumber: "QS. Hud: 90" },
        { judul: "🌟 Mutiara Hikmah", teks: '"Barang siapa yang menutupi aib seorang muslim, maka Allah akan menutupi aibnya di dunia dan akhirat."', sumber: "HR. Muslim" },
        { judul: "🌟 Mutiara Hikmah", teks: '"Sesungguhnya shalat itu mencegah dari perbuatan keji dan mungkar."', sumber: "QS. Al-Ankabut: 45" },
        { judul: "🌟 Mutiara Hikmah", teks: '"Tidaklah suatu kaum berkumpul di salah satu rumah Allah (masjid) untuk membaca Kitabullah dan mempelajarinya, melainkan ketenteraman akan turun kepada mereka."', sumber: "HR. Muslim" },
        { judul: "🌟 Mutiara Hikmah", teks: '"Dan janganlah kamu berputus asa dari rahmat Allah. Sesungguhnya tiada yang berputus asa dari rahmat Allah melainkan orang-orang yang kafir."', sumber: "QS. Yusuf: 87" },
        { judul: "🌟 Mutiara Hikmah", teks: '"Raihlah lima perkara sebelum lima perkara: mudamu sebelum tuamu, sehatmu sebelum sakitmu, kayamu sebelum miskinmu, waktu luangmu sebelum sibukmu, dan hidupmu sebelum matimu."', sumber: "HR. Hakim" },
        { judul: "🌟 Mutiara Hikmah", teks: '"Sesungguhnya Allah tidak akan mengubah keadaan suatu kaum sebelum mereka mengubah keadaan diri mereka sendiri."', sumber: "QS. Ar-Ra\'d: 11" },
        { judul: "🌟 Mutiara Hikmah", teks: '"Barang siapa yang beriman kepada Allah dan hari akhir, maka muliakanlah tetangganya."', sumber: "HR. Bukhari & Muslim" },
        { judul: "🌟 Mutiara Hikmah", teks: '"Dan bersabarlah. Sesungguhnya Allah beserta orang-orang yang sabar."', sumber: "QS. Al-Anfal: 46" },
        { judul: "🌟 Mutiara Hikmah", teks: '"Tidak akan beriman salah seorang di antara kalian hingga ia mencintai untuk saudaranya apa yang ia cintai untuk dirinya sendiri."', sumber: "HR. Bukhari & Muslim" },
        { judul: "🌟 Mutiara Hikmah", teks: '"Wahai orang-orang yang beriman, berdzikirlah kepada Allah dengan dzikir sebanyak-banyaknya."', sumber: "QS. Al-Ahzab: 41" },
        { judul: "🌟 Mutiara Hikmah", teks: '"Sesungguhnya amal yang paling dicintai Allah adalah yang paling kontinu (terus-menerus) walaupun sedikit."', sumber: "HR. Bukhari & Muslim" },
        { judul: "🌟 Mutiara Hikmah", teks: '"Dan Tuhanmu berfirman: Berdoalah kepada-Ku, niscaya akan Aku perkenankan bagimu."', sumber: "QS. Ghafir: 60" },
        { judul: "🌟 Mutiara Hikmah", teks: '"Barang siapa yang memberi makan orang yang berpuasa, maka baginya pahala seperti orang yang berpuasa tanpa mengurangi pahala orang tersebut sedikit pun."', sumber: "HR. Tirmidzi" },
        { judul: "🌟 Mutiara Hikmah", teks: '"Dan carilah pada apa yang telah dianugerahkan Allah kepadamu (kebahagiaan) negeri akhirat, dan janganlah kamu melupakan bagianmu dari (kenikmatan) dunia."', sumber: "QS. Al-Qashash: 77" }
    ];

    function updateHikmah() {
        const today = new Date();
        const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
        const index = dayOfYear % hikmahList.length;

        const judulEl = document.getElementById("hikmahJudul");
        const teksEl = document.getElementById("hikmahTeks");
        const sumberEl = document.getElementById("hikmahSumber");

        if (judulEl && teksEl && sumberEl) {
            judulEl.textContent = hikmahList[index].judul;
            teksEl.textContent = hikmahList[index].teks;
            sumberEl.textContent = "— " + hikmahList[index].sumber;
        }
    }

    // ===== FLOATING SCROLL DOTS LOGIC =====
    const appContainer = document.querySelector(".app-container");
    const scrollDots = document.querySelectorAll(".scroll-dot");

    if (appContainer && scrollDots.length > 0) {
        appContainer.addEventListener("scroll", function () {
            const screenHeight = appContainer.clientHeight;
            const scrollTop = appContainer.scrollTop;
            const activeIndex = Math.round(scrollTop / screenHeight);

            scrollDots.forEach((dot, idx) => {
                if (idx === activeIndex) {
                    dot.classList.add("active");
                } else {
                    dot.classList.remove("active");
                }
            });
        });

        // Click to scroll to screen
        scrollDots.forEach((dot, idx) => {
            dot.addEventListener("click", function () {
                const screenHeight = appContainer.clientHeight;
                appContainer.scrollTo({
                    top: idx * screenHeight,
                    behavior: "smooth"
                });
            });
        });
    }

    updateHikmah();
});
