/**
 * Payment System for @maramadhona
 * Powered by Hokto API & node-qrcode
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
        // 1. Request QRIS ke API Hokto
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

        // Cek apakah data QRIS teks mentah (raw) tersedia
        if (result.qrString) {
            
            // PERBAIKAN: Gunakan library QRCode untuk menggambar teks raw ke Canvas
            const canvas = document.getElementById('qris-canvas');
            
            // Konfigurasi visual QR Code
            QRCode.toCanvas(canvas, result.qrString, { 
                width: 256, // Ukuran gambar
                margin: 1,  // Border putih di sekitar QR
                color: {
                    dark: '#000000',  // Warna QR
                    light: '#FFFFFF'  // Warna Background
                },
                errorCorrectionLevel: 'M' // Tingkat koreksi kesalahan (Medium)
            }, function (error) {
                if (error) {
                    console.error(error);
                    alert("Gagal menggambar QR Code.");
                } else {
                    console.log('QR Code success generated!');
                    
                    // Tampilkan area QRIS dan sembunyikan form
                    document.getElementById('display-amount').innerText = `Rp ${amount.toLocaleString('id-ID')}`;
                    document.getElementById('setup-area').classList.add('hidden');
                    document.getElementById('qris-area').classList.remove('hidden');

                    // 2. Jalankan pengecekan otomatis
                    mulaiCekStatus(partnerRef);
                }
            });

        } else {
            throw new Error("Gagal mendapatkan data QRIS dari API.");
        }

    } catch (error) {
        console.error("Error:", error);
        alert("Waduh, ada gangguan koneksi ke API atau API Key salah.");
        btn.disabled = false;
        btn.innerText = "GAS DONASI!";
    }
}

function mulaiCekStatus(ref) {
    // Reset counter
    pollingCounter = 0;
    
    // Hapus interval lama jika ada
    if (window.checkTimer) clearInterval(window.checkTimer);

    window.checkTimer = setInterval(async () => {
        pollingCounter++;
        
        try {
            const check = await fetch(`${CONFIG.BASE_URL}?api=check_status&partnerReferenceNo=${ref}`, {
                headers: { "X-API-KEY": CONFIG.API_KEY }
            });
            const statusData = await check.json();

            // Logika Status Berhasil (Sesuaikan dengan respon asli Hokto)
            // Asumsi: statusData.status === "PAID"
            if (statusData.status === "PAID" || statusData.data?.status === "PAID") {
                clearInterval(window.checkTimer);
                tampilkanSukses();
            }
        } catch (err) {
            console.log("Mengecek pembayaran...");
        }

        // Berhenti cek jika sudah lebih dari 10 menit (120 * 5 detik)
        if (pollingCounter > 120) {
            clearInterval(window.checkTimer);
            alert("Sesi pembayaran berakhir. Silakan generate ulang.");
            location.reload();
        }
    }, 5000); // Cek setiap 5 detik
}

function tampilkanSukses() {
    document.getElementById('qris-area').classList.add('hidden');
    document.getElementById('success-area').classList.remove('hidden');
}
