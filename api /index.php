<?php
/* RABOT REACT - AUTOMATION ENGINE 
    Optimized for Vercel Deployment
*/

$status_pesan = "";
$tipe_pesan = "";

if (isset($_POST['execute'])) {
    $link_target = $_POST['link'];
    $emoji_target = $_POST['emoji'];
    $vip_key = "vip-rama817";
    
    // Lokasi cookie sementara wajib di /tmp/ untuk Vercel
    $cookie_file = '/tmp/session_' . md5(session_id()) . '.txt';

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_COOKIEJAR, $cookie_file);
    curl_setopt($ch, CURLOPT_USERAGENT, "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36");
    curl_setopt($ch, CURLOPT_TIMEOUT, 25);

    // LANGKAH 1: LOGIN KE MESIN VIP
    curl_setopt($ch, CURLOPT_URL, "https://yogaxd-react.web.id/vip-login");
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query(['key' => $vip_key])); 
    curl_exec($ch);

    // LANGKAH 2: EKSEKUSI DATA REALTIME
    $post_data = http_build_query([
        'link' => $link_target,
        'emoji' => $emoji_target,
        'execute' => 'KIRIM SEKARANG' 
    ]);

    curl_setopt($ch, CURLOPT_URL, "https://yogaxd-react.web.id/index.php"); 
    curl_setopt($ch, CURLOPT_POSTFIELDS, $post_data);
    curl_setopt($ch, CURLOPT_COOKIEFILE, $cookie_file);
    
    $result = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if(file_exists($cookie_file)) @unlink($cookie_file);

    if ($http_code == 200) {
        $status_pesan = "MESIN RABOT BERHASIL MENGEKSEKUSI REAKSI!";
        $tipe_pesan = "success";
    } else {
        $status_pesan = "KONEKSI MESIN RABOT GAGAL (CODE: $http_code)";
        $tipe_pesan = "error";
    }
}
?>

<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RaBot React 👑</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        * { font-family: 'Space Grotesk', sans-serif; }
        .neo-box { background: white; border: 3px solid #000; box-shadow: 6px 6px 0px 0px #000; border-radius: 12px; }
        .neo-input { border: 3px solid #000; border-radius: 10px; padding: 14px; font-weight: 700; width: 100%; outline: none; }
        .neo-btn { border: 3px solid #000; box-shadow: 4px 4px 0px 0px #000; border-radius: 10px; font-weight: 800; text-transform: uppercase; cursor: pointer; transition: 0.1s; }
        .neo-btn:active { box-shadow: 0px 0px 0px 0px #000; transform: translate(4px, 4px); }
        .dot-bg { background-color: #e2e2e2; background-image: radial-gradient(#000 1.5px, transparent 1.5px); background-size: 24px 24px; }
        .emoji-tag { background: #FFD700; border: 2px solid #000; border-radius: 8px; padding: 4px 8px; box-shadow: 2px 2px 0px #000; }
    </style>
</head>
<body class="dot-bg min-h-screen p-4 flex flex-col items-center">
    <div class="max-w-lg w-full space-y-6">
        <div class="text-center mt-4">
            <h1 class="text-4xl font-black uppercase text-black tracking-tighter">RaBot React <span class="text-[#FFD700]">👑</span></h1>
            <p class="text-[10px] font-bold text-gray-500 uppercase mt-1 tracking-widest">Automated Machine System</p>
        </div>

        <?php if($status_pesan != ""): ?>
        <div class="neo-box p-4 <?php echo $tipe_pesan == 'success' ? 'bg-green-400' : 'bg-red-400'; ?> font-black text-sm text-center">
            <?php echo $status_pesan; ?>
        </div>
        <?php endif; ?>

        <div class="neo-box p-4 bg-[#6366f1] text-white flex justify-between items-center relative overflow-hidden">
            <div class="relative z-10">
                <span class="text-[9px] font-black uppercase bg-black/20 px-2 py-1 rounded">Vip Member</span>
                <p class="font-black mt-1 uppercase text-lg">Rama-817 Status</p>
            </div>
            <i class="fas fa-robot text-3xl opacity-50 relative z-10"></i>
        </div>

        <div class="neo-box p-6 bg-white">
            <form method="POST" id="form-rabot" class="space-y-5">
                <div>
                    <label class="text-xs font-black uppercase text-gray-600 block mb-2">Target Channel Link</label>
                    <input type="text" name="link" placeholder="https://whatsapp.com/channel/..." class="neo-input text-sm" required>
                </div>
                <div>
                    <label class="text-xs font-black uppercase text-gray-600 block mb-2">Emoji Reaction</label>
                    <input type="text" name="emoji" id="emoji-in" placeholder="👍" class="neo-input text-lg text-center" required>
                </div>
                <button type="submit" name="execute" id="btn-submit" class="w-full bg-[#6366f1] text-white py-4 neo-btn text-lg">
                    <i class="fas fa-paper-plane mr-2"></i> Jalankan Mesin
                </button>
            </form>
        </div>

        <div class="text-center pb-6">
            <div class="inline-flex items-center gap-2 bg-white/80 px-4 py-2 rounded-full border-2 border-black/20 mb-3">
                <i class="fas fa-shield-alt text-green-500"></i>
                <span class="text-[9px] font-black uppercase text-gray-600">Secure Connection</span>
            </div>
            <p class="text-[10px] font-black text-gray-500 uppercase tracking-widest">© 2026 RaBot Automation</p>
        </div>
    </div>

    <script>
        document.getElementById('form-rabot').onsubmit = function() {
            const b = document.getElementById('btn-submit');
            b.innerHTML = '<i class="fas fa-cog fa-spin"></i> Mesin Sedang Bekerja...';
            b.style.background = "#4b5563";
            b.disabled = true;
        };
    </script>
</body>
</html>
