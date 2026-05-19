document.addEventListener("DOMContentLoaded", function () {
    // ===== CHECKBOX AMAL (localStorage) =====
    const checkboxes = document.querySelectorAll(".amal-checkbox");
    checkboxes.forEach(function (checkbox) {
        const savedStatus = localStorage.getItem(checkbox.id);
        if (savedStatus === "true") { checkbox.checked = true; }
        checkbox.addEventListener("change", function () {
            localStorage.setItem(checkbox.id, checkbox.checked);
        });
    });

    // ===== JADWAL SHOLAT SUKOHARJO, JAWA TENGAH =====
    const jadwalSholat = [
        { nama: "Subuh",     namaEn: "Fajr",    jam: "04:31" },
        { nama: "Dzuhur",    namaEn: "Dhuhr",   jam: "11:38" },
        { nama: "Ashar",     namaEn: "Asr",     jam: "14:57" },
        { nama: "Maghrib",   namaEn: "Maghrib", jam: "17:37" },
        { nama: "Isya",      namaEn: "Isha",    jam: "18:47" }
    ];

    const sholatTitleEl = document.querySelector(".sholat-title");
    const jamEl = document.querySelectorAll(".countdown-item .time-digit");
    const labelEl = document.querySelectorAll(".countdown-item .time-label");
    const jadwalItems = document.querySelectorAll(".jadwal-item");

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
        let nextIndex = -1;
        for (let i = 0; i < jadwalSholat.length; i++) {
            const waktu = getTimeInMinutes(jadwalSholat[i].jam);
            if (waktu > nowMinutes) {
                nextSholat = jadwalSholat[i];
                nextIndex = i;
                break;
            }
        }

        // Jika sudah lewat semua, ambil Subuh besok
        if (!nextSholat) {
            nextSholat = jadwalSholat[0];
            nextIndex = 0;
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

        // Update active class di jadwal grid
        jadwalItems.forEach((item, idx) => {
            item.classList.remove("active");
            if (idx === nextIndex) {
                item.classList.add("active");
            }
        });
    }

    // Update setiap detik
    updateCountdown();
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

    updateHikmah();
});
