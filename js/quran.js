// =========================================
// Al-Qur'an - Tampil Ayat + Terjemahan
// Sumber: equran.id API
// =========================================
document.addEventListener("DOMContentLoaded", function () {
    const surahListEl = document.getElementById("surahList");
    const searchInput = document.getElementById("searchSurah");
    const loadingEl = document.getElementById("loadingState");
    const errorEl = document.getElementById("errorState");
    const quranHeader = document.querySelector(".quran-header-title");
    const quranSub = document.querySelector(".quran-header-sub");
    const searchContainer = document.querySelector(".search-container");
    const quranFooter = document.querySelector(".quran-footer");

    let allSurahs = [];
    let currentView = "list"; // "list" atau "detail"

    // Fetch daftar surah
    async function fetchSurahs() {
        try {
            loadingEl.style.display = "block";
            errorEl.style.display = "none";
            surahListEl.innerHTML = "";

            const response = await fetch("https://equran.id/api/v2/surat");
            if (!response.ok) throw new Error("Gagal memuat data");

            const data = await response.json();
            allSurahs = data.data || [];

            loadingEl.style.display = "none";
            renderSurahs(allSurahs);
        } catch (err) {
            loadingEl.style.display = "none";
            errorEl.style.display = "block";
            console.error("Error fetching surahs:", err);
        }
    }

    // Render daftar surah
    function renderSurahs(surahs) {
        currentView = "list";
        surahListEl.innerHTML = "";
        searchContainer.style.display = "block";
        quranHeader.textContent = "Al-Qur'an";
        quranSub.textContent = "Pilih surah untuk membaca";
        if (quranFooter) quranFooter.style.display = "block";

        if (surahs.length === 0) {
            surahListEl.innerHTML = `
                <div style="text-align:center;padding:40px 0;color:#718096;font-size:0.85rem;">
                    Tidak ditemukan surah yang cocok
                </div>
            `;
            return;
        }

        surahs.forEach(function (surah) {
            const card = document.createElement("div");
            card.className = "surah-card";
            card.onclick = function () {
                fetchAyat(surah.nomor, surah.namaLatin, surah.nama);
            };

            const ayatCount = surah.jumlahAyat || 0;
            const turun = surah.tempatTurun || "Mekah";

            card.innerHTML = `
                <div class="surah-number">${surah.nomor}</div>
                <div class="surah-info">
                    <div class="surah-name-latin">${surah.namaLatin}</div>
                    <div class="surah-detail">${turun} • ${ayatCount} Ayat</div>
                </div>
                <div class="surah-name-arab">${surah.nama}</div>
                <div class="surah-arrow">❮</div>
            `;
            surahListEl.appendChild(card);
        });
    }

    // Fetch ayat dari surah tertentu
    async function fetchAyat(nomorSurah, namaLatin, namaArab) {
        try {
            currentView = "detail";
            searchContainer.style.display = "none";
            if (quranFooter) quranFooter.style.display = "none";
            quranHeader.textContent = namaLatin;
            quranSub.textContent = namaArab;

            loadingEl.style.display = "block";
            errorEl.style.display = "none";
            surahListEl.innerHTML = "";

            const response = await fetch("https://equran.id/api/v2/surat/" + nomorSurah);
            if (!response.ok) throw new Error("Gagal memuat ayat");

            const data = await response.json();
            const ayatList = data.data.ayat || [];

            loadingEl.style.display = "none";
            renderAyat(ayatList, nomorSurah, namaLatin);
        } catch (err) {
            loadingEl.style.display = "none";
            errorEl.style.display = "block";
            console.error("Error fetching ayat:", err);
        }
    }

    // Render daftar ayat
    function renderAyat(ayatList, nomorSurah, namaLatin) {
        surahListEl.innerHTML = "";

        // Tombol kembali
        const backBtn = document.createElement("div");
        backBtn.className = "surah-card";
        backBtn.style.marginBottom = "16px";
        backBtn.style.background = "#043927";
        backBtn.style.color = "#ffffff";
        backBtn.onclick = function () {
            renderSurahs(allSurahs);
        };
        backBtn.innerHTML = `
            <div style="display:flex;align-items:center;gap:10px;width:100%;">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:20px;height:20px;">
                    <path d="M15 18l-6-6 6-6" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span style="font-weight:600;font-size:0.85rem;">Kembali ke daftar surah</span>
            </div>
        `;
        surahListEl.appendChild(backBtn);

        // Info surah
        const infoCard = document.createElement("div");
        infoCard.className = "surah-card";
        infoCard.style.flexDirection = "column";
        infoCard.style.alignItems = "center";
        infoCard.style.textAlign = "center";
        infoCard.style.padding = "24px 16px";
        infoCard.style.marginBottom = "16px";
        infoCard.style.background = "linear-gradient(135deg, #043927 0%, #065a3e 100%)";
        infoCard.innerHTML = `
            <div style="color:#d4af37;font-size:1.5rem;font-weight:700;font-family:'Amiri',serif;margin-bottom:8px;">${ayatList[0]?.teksArab?.split(" ")[0] || ""}</div>
            <div style="color:#ffffff;font-size:1.1rem;font-weight:700;margin-bottom:4px;">${namaLatin}</div>
            <div style="color:rgba(255,255,255,0.6);font-size:0.75rem;">${ayatList.length} Ayat</div>
        `;
        surahListEl.appendChild(infoCard);

        // Daftar ayat
        ayatList.forEach(function (ayat) {
            const ayatCard = document.createElement("div");
            ayatCard.className = "ayat-card";
            ayatCard.innerHTML = `
                <div class="ayat-header">
                    <div class="ayat-number">${ayat.nomorAyat}</div>
                    <div class="ayat-bismillah">${ayat.nomorAyat === 1 && nomorSurah !== 9 && nomorSurah !== 1 ? 'بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ' : ''}</div>
                </div>
                <div class="ayat-arab">${ayat.teksArab}</div>
                <div class="ayat-latin">${ayat.teksLatin}</div>
                <div class="ayat-terjemah">${ayat.teksIndonesia}</div>
            `;
            surahListEl.appendChild(ayatCard);
        });
    }

    // Filter surah berdasarkan pencarian
    searchInput.addEventListener("input", function () {
        if (currentView !== "list") return;
        const keyword = this.value.toLowerCase().trim();
        if (keyword === "") {
            renderSurahs(allSurahs);
            return;
        }
        const filtered = allSurahs.filter(function (s) {
            return (
                s.namaLatin.toLowerCase().includes(keyword) ||
                s.nama.toLowerCase().includes(keyword) ||
                s.nomor.toString().includes(keyword)
            );
        });
        renderSurahs(filtered);
    });

    // Retry button
    document.getElementById("retryBtn").addEventListener("click", fetchSurahs);

    // Mulai fetch
    fetchSurahs();
});
