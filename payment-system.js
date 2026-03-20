/**
 * Payment System for @maramadhona
 * Powered by Hokto API
 */

const CONFIG = {
    API_KEY: "91b24c8aeb3d364a80742a847797553b",
    BASE_URL: "https://hokto.my.id/produksi/payment/",
    MIN_AMOUNT: 100
};

let pollingCounter = 0;

async function prosesDonasi() {
    const inputAmount = document.getElementById('amount');
    const btn = document.getElementById('btn-pay');
    const amount = parseInt(inputAmount.value);

    // Validasi
    if (isNaN(amount) || amount < CONFIG.MIN_AMOUNT) {
        alert(`Minimal donasi Rp ${CONFIG.MIN_AMOUNT} ya!`);
        return;
    }

    // Set UI Loading
    btn.disabled = true;
    btn.innerText = "GENERATING...";
    const partnerRef = "MARA-" + Date.now();

    try {
        // 1. Request QRIS
        const response = await fetch(`${CONFIG.BASE_URL}?api=create_qris`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-API-KEY": CONFIG.API_KEY
            },
            body: JSON.stringify({
                amount: amount,
                partnerReferenceNo: partnerRef
            })
        });

        const result = await response.json();

        if (result.status === "success" || result.qrString) {
            // Tampilkan QRIS
            // Catatan: Jika API mengembalikan string QR, gunakan generator library 
            // atau jika API mengembalikan URL gambar, langsung masukkan ke src.
            document.getElementById('qris-image').src = result.qrString || result.qrUrl;
            
            document.getElementById('setup-area').classList.add('hidden');
            document.getElementById('qris-area').classList.remove('hidden');

            // 2. Jalankan pengecekan otomatis
            mulaiCekStatus(partnerRef);
        } else {
            throw new Error("Gagal mendapatkan QRIS");
        }

    } catch (error) {
        console.error("Error:", error);
        alert("Waduh, ada gangguan koneksi ke API.");
        btn.disabled = false;
        btn.innerText = "GAS DONASI!";
    }
}

function mulaiCekStatus(ref) {
    const checkTimer = setInterval(async () => {
        pollingCounter++;
        
        try {
            const check = await fetch(`${CONFIG.BASE_URL}?api=check_status&partnerReferenceNo=${ref}`, {
                headers: { "X-API-KEY": CONFIG.API_KEY }
            });
            const statusData = await check.json();

            // Logika Status Berhasil
            if (statusData.status === "PAID" || statusData.data?.status === "PAID") {
                clearInterval(checkTimer);
                tampilkanSukses();
            }
        } catch (err) {
            console.log("Mengecek pembayaran...");
        }

        // Berhenti cek jika sudah lebih dari 10 menit (opsional)
        if (pollingCounter > 120) {
            clearInterval(checkTimer);
            alert("Sesi pembayaran berakhir. Silakan refresh.");
        }
    }, 5000); // Cek setiap 5 detik
}

function tampilkanSukses() {
    document.getElementById('qris-area').classList.add('hidden');
    document.getElementById('success-area').classList.remove('hidden');
}
