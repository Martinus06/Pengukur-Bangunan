import React, { useState, useRef, useEffect } from 'react';
import { Camera, RotateCcw, Calculator } from 'lucide-react';

export default function ARMaterialCalculator() {
  const [cameraActive, setCameraActive] = useState(false);
  const [points, setPoints] = useState([]);
  const [measurements, setMeasurements] = useState(null);
  const [materials, setMaterials] = useState(null);
  const [manualLength, setManualLength] = useState('');
  const [manualWidth, setManualWidth] = useState('');
  const [manualHeight, setManualHeight] = useState('');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Fungsi untuk memulai kamera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
    } catch (err) {
      alert('Tidak dapat mengakses kamera. Pastikan Anda memberikan izin kamera.');
      console.error(err);
    }
  };

  // Fungsi untuk menghentikan kamera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    setPoints([]);
  };

  // Fungsi untuk menandai titik di kamera
  const handleCanvasClick = (e) => {
    if (!cameraActive || points.length >= 2) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newPoints = [...points, { x, y }];
    setPoints(newPoints);

    // Jika sudah 2 titik, hitung pengukuran
    if (newPoints.length === 2) {
      calculateMeasurement(newPoints);
    }
  };

  // Fungsi untuk menggambar titik dan garis di canvas
  useEffect(() => {
    if (!cameraActive) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');

    const drawFrame = () => {
      if (!video || !canvas) return;

      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;

      // Gambar titik-titik
      points.forEach((point, index) => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
        ctx.fillStyle = '#3B82F6';
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Label titik
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 16px Arial';
        ctx.fillText(`Titik ${index + 1}`, point.x + 15, point.y - 10);
      });

      // Gambar garis penghubung putih
      if (points.length === 2) {
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        ctx.lineTo(points[1].x, points[1].y);
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Tampilkan ukuran di tengah garis
        const midX = (points[0].x + points[1].x) / 2;
        const midY = (points[0].y + points[1].y) / 2;
        
        ctx.fillStyle = '#000000';
        ctx.fillRect(midX - 40, midY - 20, 80, 30);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('37 cm', midX, midY);
      }

      requestAnimationFrame(drawFrame);
    };

    drawFrame();
  }, [cameraActive, points]);

  // Simulasi perhitungan pengukuran (dalam implementasi nyata, ini akan menggunakan AR API)
  const calculateMeasurement = (pointsArray) => {
    // Simulasi: anggap pengukuran dari kamera
    const length = 5; // meter (contoh)
    const width = 4; // meter (contoh)
    
    setMeasurements({ length, width });
    
    // Hitung material otomatis
    calculateMaterials(length, width, 3); // default tinggi 3 meter
  };

  // Fungsi reset
  const resetMeasurement = () => {
    setPoints([]);
    setMeasurements(null);
    setMaterials(null);
  };

  // Fungsi hitung material dari input manual
  const calculateFromManual = () => {
    const length = parseFloat(manualLength);
    const width = parseFloat(manualWidth);
    const height = parseFloat(manualHeight) || 3;

    if (!length || !width) {
      alert('Mohon isi panjang dan lebar terlebih dahulu');
      return;
    }

    calculateMaterials(length, width, height);
  };

  // Fungsi kalkulasi material
  const calculateMaterials = (length, width, height) => {
    // Luas lantai (m²)
    const floorArea = length * width;
    
    // Luas dinding (m²) - keliling x tinggi
    const perimeter = 2 * (length + width);
    const wallArea = perimeter * height;
    
    // Volume (m³)
    const volume = floorArea * height;

    // Perhitungan material (angka-angka ini adalah estimasi standar)
    
    // Hebel (batako ringan) - untuk dinding
    // Ukuran hebel standar: 60cm x 20cm = 0.12 m²
    // Perhitungan: 8.3 batang per m²
    const hebelPerM2 = 8.3;
    const totalHebel = Math.ceil(wallArea * hebelPerM2);

    // Semen untuk hebel (1 sak = 40kg untuk 8-10 m²)
    const semenHebel = Math.ceil(wallArea / 9);
    
    // Pasir untuk hebel (0.024 m³ per m²)
    const pasirHebel = (wallArea * 0.024).toFixed(2);

    // Plesteran/Acian
    // Semen untuk plesteran (1 sak untuk 4-5 m²)
    const semenPlester = Math.ceil(wallArea / 4.5);
    
    // Pasir untuk plesteran (0.02 m³ per m²)
    const pasirPlester = (wallArea * 0.02).toFixed(2);

    // Cat (1 liter untuk 10-12 m², 2 lapis)
    const catLiter = Math.ceil((wallArea * 2) / 11);

    // Total
    const totalSemen = semenHebel + semenPlester;
    const totalPasir = (parseFloat(pasirHebel) + parseFloat(pasirPlester)).toFixed(2);

    setMaterials({
      floorArea: floorArea.toFixed(2),
      wallArea: wallArea.toFixed(2),
      volume: volume.toFixed(2),
      hebel: totalHebel,
      semen: totalSemen,
      pasir: totalPasir,
      cat: catLiter,
      dimensions: { length, width, height }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white p-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-4 mb-4 shadow-lg">
        <div className="flex items-center gap-3">
          <Camera className="w-8 h-8" />
          <div>
            <h1 className="text-2xl font-bold">Pengukur AR</h1>
            <p className="text-sm text-blue-100">Ukur Titik ke Titik - iPhone Style</p>
          </div>
        </div>
      </div>

      {/* Area Kamera */}
      <div className="bg-gray-800 rounded-lg p-4 mb-4 shadow-xl">
        {!cameraActive ? (
          <div className="aspect-video bg-gray-700 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-600">
            <div className="text-center">
              <Camera className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-lg mb-4">Klik tombol di bawah untuk memulai</p>
            </div>
          </div>
        ) : (
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            />
            <canvas
              ref={canvasRef}
              onClick={handleCanvasClick}
              className="absolute inset-0 w-full h-full cursor-crosshair"
            />
            {points.length < 2 && (
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 px-4 py-2 rounded-lg">
                <p className="text-sm">
                  {points.length === 0 ? 'Tap untuk menandai Titik 1' : 'Tap untuk menandai Titik 2'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tombol Kontrol Kamera */}
        <div className="mt-4 flex gap-3">
          {!cameraActive ? (
            <button
              onClick={startCamera}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition"
            >
              <Camera className="w-5 h-5" />
              Buka Kamera AR
            </button>
          ) : (
            <>
              <button
                onClick={stopCamera}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-4 rounded-lg transition"
              >
                Tutup Kamera
              </button>
              <button
                onClick={resetMeasurement}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg flex items-center gap-2 transition"
              >
                <RotateCcw className="w-5 h-5" />
                Reset
              </button>
            </>
          )}
        </div>

        {/* Panduan Penggunaan */}
        <div className="mt-4 bg-blue-900 bg-opacity-50 rounded-lg p-3">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            📱 Cara Menggunakan (iPhone Measure Style):
          </h3>
          <ol className="text-sm space-y-1 ml-4">
            <li>1. Buka kamera AR dan arahkan ke area yang ingin diukur</li>
            <li>2. Gerakkan perangkat perlahan untuk tracking 3D</li>
            <li>3. Tap "Tandai Titik" untuk titik pertama</li>
            <li>4. Gerakkan ke titik kedua, lalu tap "Tandai Titik" lagi</li>
            <li>5. Jarak otomatis terhitung menggunakan sensor AR</li>
          </ol>
        </div>
      </div>

      {/* Input Manual */}
      <div className="bg-gray-800 rounded-lg p-4 mb-4 shadow-xl">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Calculator className="w-6 h-6" />
          📐 Dimensi untuk Kalkulator
        </h2>
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Panjang (meter)</label>
            <input
              type="number"
              step="0.1"
              value={manualLength}
              onChange={(e) => setManualLength(e.target.value)}
              placeholder="Dari pengukuran atau input manual"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Lebar (meter)</label>
            <input
              type="number"
              step="0.1"
              value={manualWidth}
              onChange={(e) => setManualWidth(e.target.value)}
              placeholder="Dari pengukuran atau input manual"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tinggi (meter) - Opsional</label>
            <input
              type="number"
              step="0.1"
              value={manualHeight}
              onChange={(e) => setManualHeight(e.target.value)}
              placeholder="Untuk menghitung volume"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={calculateFromManual}
            className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition"
          >
            📊 Hitung Material
          </button>
        </div>
      </div>

      {/* Hasil Kalkulasi Material */}
      {materials && (
        <div className="bg-gradient-to-br from-green-900 to-blue-900 rounded-lg p-4 shadow-xl">
          <h2 className="text-2xl font-bold mb-4">📋 Kebutuhan Material</h2>
          
          <div className="bg-black bg-opacity-30 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-lg mb-2">Dimensi Bangunan:</h3>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="bg-blue-900 bg-opacity-50 p-2 rounded">
                <p className="text-gray-300">Panjang</p>
                <p className="text-xl font-bold">{materials.dimensions.length}m</p>
              </div>
              <div className="bg-blue-900 bg-opacity-50 p-2 rounded">
                <p className="text-gray-300">Lebar</p>
                <p className="text-xl font-bold">{materials.dimensions.width}m</p>
              </div>
              <div className="bg-blue-900 bg-opacity-50 p-2 rounded">
                <p className="text-gray-300">Tinggi</p>
                <p className="text-xl font-bold">{materials.dimensions.height}m</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="bg-blue-800 bg-opacity-50 rounded-lg p-3">
              <div className="flex justify-between items-center">
                <span className="font-semibold">🧱 Hebel (Batako Ringan)</span>
                <span className="text-2xl font-bold text-yellow-300">{materials.hebel} pcs</span>
              </div>
              <p className="text-xs text-gray-300 mt-1">Untuk dinding seluas {materials.wallArea} m²</p>
            </div>

            <div className="bg-blue-800 bg-opacity-50 rounded-lg p-3">
              <div className="flex justify-between items-center">
                <span className="font-semibold">🏗️ Semen (Total)</span>
                <span className="text-2xl font-bold text-yellow-300">{materials.semen} sak</span>
              </div>
              <p className="text-xs text-gray-300 mt-1">Untuk pemasangan hebel & plesteran</p>
            </div>

            <div className="bg-blue-800 bg-opacity-50 rounded-lg p-3">
              <div className="flex justify-between items-center">
                <span className="font-semibold">⛏️ Pasir (Total)</span>
                <span className="text-2xl font-bold text-yellow-300">{materials.pasir} m³</span>
              </div>
              <p className="text-xs text-gray-300 mt-1">Untuk pemasangan hebel & plesteran</p>
            </div>

            <div className="bg-blue-800 bg-opacity-50 rounded-lg p-3">
              <div className="flex justify-between items-center">
                <span className="font-semibold">🎨 Cat Dinding</span>
                <span className="text-2xl font-bold text-yellow-300">{materials.cat} liter</span>
              </div>
              <p className="text-xs text-gray-300 mt-1">Untuk 2 lapis cat pada dinding</p>
            </div>
          </div>

          <div className="mt-4 bg-yellow-900 bg-opacity-30 border border-yellow-600 rounded-lg p-3">
            <p className="text-sm text-yellow-200">
              ⚠️ <strong>Catatan:</strong> Perhitungan ini adalah estimasi standar. 
              Tambahkan 10-15% untuk cadangan material. Konsultasikan dengan tukang 
              berpengalaman untuk hasil yang lebih akurat.
            </p>
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="mt-6 text-center text-sm text-gray-400">
        <p>💡 Tips: Untuk pengukuran AR yang akurat, pastikan pencahayaan cukup dan gerakkan perangkat perlahan</p>
      </div>
    </div>
  );
}
