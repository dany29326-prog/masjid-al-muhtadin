// =========================================
// Al-Qur'an - Fetch API dari equran.id
// =========================================
document.addEventListener("DOMContentLoaded", function () {
    const surahListEl = document.getElementById("surahList");
    const searchInput = document.getElementById("searchSurah");
    const loadingEl = document.getElementById("loadingState");
    const errorEl = document.getElementById("errorState");

    let allSurahs = [];

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
        surahListEl.innerHTML = "";
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
                window.open("https://equran.id/surat/" + surah.nomor, "_blank");
            };

            const ayatCount = surah.jumlah_ayat || 0;
            const turun = surah.tempat_turun || "Mekah";

            card.innerHTML = `
                <div class="surah-number">${surah.nomor}</div>
                <div class="surah-info">
                    <div class="surah-name-latin">${surah.nama_latin}</div>
                    <div class="surah-detail">${turun} • ${ayatCount} Ayat</div>
                </div>
                <div class="surah-name-arab">${surah.nama}</div>
                <div class="surah-arrow">❮</div>
            `;
            surahListEl.appendChild(card);
        });
    }

    // Filter surah berdasarkan pencarian
    searchInput.addEventListener("input", function () {
        const keyword = this.value.toLowerCase().trim();
        if (keyword === "") {
            renderSurahs(allSurahs);
            return;
        }
        const filtered = allSurahs.filter(function (s) {
            return (
                s.nama_latin.toLowerCase().includes(keyword) ||
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
