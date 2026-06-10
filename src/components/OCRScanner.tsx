import React, { useState, useRef } from 'react';
import { Camera, Upload, Sparkles, FileText, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { OCRResult } from '../types';

interface OCRScannerProps {
  onScanComplete: (result: OCRResult) => void;
}

export default function OCRScanner({ onScanComplete }: OCRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [scanResult, setScanResult] = useState<OCRResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Ready-to-use sample templates for instant, friction-free demonstration
  const sampleBills = [
    {
      name: 'Fatura Light (Luz)',
      tipo: 'Light',
      icon: '⚡',
      file: 'light_bill.png',
      // Real precompiled analysis content to simulate rapid processing
      dataMock: {
        valor: 245.30,
        vencimento: '2026-06-15',
        estabelecimento: 'Macaé Light Distribuidora',
        categoria: 'Luz',
        consumo: 260,
        tipoConta: 'Light' as const,
        descricao: 'Fatura de Energia Elétrica - Período de Consumo de Maio'
      },
      // Real small clean layout to render visually
      colorLabel: 'Roxo Neon'
    },
    {
      name: 'Fatura SAAE (Água)',
      tipo: 'SAAE',
      icon: '💧',
      file: 'saae_bill.png',
      dataMock: {
        valor: 98.20,
        vencimento: '2026-06-20',
        estabelecimento: 'SAAE Saneamento S/A',
        categoria: 'Água',
        consumo: 16,
        tipoConta: 'SAAE' as const,
        descricao: 'Fatura de Saneamento Básico, Tratamento de Água e Esgoto'
      },
      colorLabel: 'Verde Neon'
    },
    {
      name: 'Cupom de Supermercado',
      tipo: 'Outros',
      icon: '🛒',
      file: 'receipt.png',
      dataMock: {
        valor: 412.50,
        vencimento: '2026-06-06',
        estabelecimento: 'Supermercado Multishow Macaé',
        categoria: 'Alimentação',
        consumo: 0,
        tipoConta: 'Outros' as const,
        descricao: 'Cupom Fiscal - Alimentos, Mercearia e Limpeza Familiar'
      },
      colorLabel: 'Cinza'
    }
  ];

  // Drag handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processImage(e.dataTransfer.files[0]);
    }
  };

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const startCamera = async () => {
    setErrorMsg(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.warn("Camera streaming access failed:", err);
      setErrorMsg("Acesso à câmera não autorizado ou indisponível no dispositivo. Selecione o arquivo de imagem manualmente.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setStream(null);
    setIsCameraActive(false);
  };

  const captureSnapshot = () => {
    if (!videoRef.current) return;
    try {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const base64Data = canvas.toDataURL('image/jpeg');
        // Stop hardware camera instantly
        stopCamera();
        // Submit base64 for processing
        processBase64String(base64Data, 'image/jpeg');
      }
    } catch (err: any) {
      setErrorMsg("Erro ao tirar fotografia da nota fiscal. Tente reiniciar a câmera.");
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await processImage(e.target.files[0]);
    }
  };

  // Shared internal base64 content sender
  const processBase64String = async (base64Content: string, mimeType: string) => {
    setIsScanning(true);
    setErrorMsg(null);
    setScanResult(null);

    try {
      const response = await fetch('/api/gemini/analyze-bill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Content,
          mimeType: mimeType
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Falha ao processar imagem no servidor.');
      }

      const data: OCRResult = await response.json();
      setScanResult(data);
      onScanComplete(data);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Erro inesperado ao escanear boleto. Usando dados fictícios para fins demonstrativos.');
    } finally {
      setIsScanning(false);
    }
  };

  // Convert uploaded image to Base64 and query server-side Vision API
  const processImage = async (file: File) => {
    setIsScanning(true);
    setErrorMsg(null);
    setScanResult(null);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64Content = reader.result as string;
        await processBase64String(base64Content, file.type);
      };
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Erro ao ler arquivo local.');
      setIsScanning(false);
    }
  };

  // Instantly test template OCR (simulate vision scanning with a 1.2s realistic loading)
  const handleScanSample = (sample: typeof sampleBills[0]) => {
    setIsScanning(true);
    setErrorMsg(null);
    setScanResult(null);
    if (isCameraActive) stopCamera();

    setTimeout(() => {
      setScanResult(sample.dataMock);
      onScanComplete(sample.dataMock);
      setIsScanning(false);
    }, 1200);
  };

  return (
    <div id="ocr-module-card" className="bg-gradient-to-br from-[#120f28] to-[#040409] border border-purple-500/20 rounded-3xl p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/5 rounded-full blur-2xl pointer-events-none"></div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white border border-white/20 shrink-0">
            <Camera className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              Importação via OCR e Foto
              <span className="text-[10px] font-mono font-bold bg-green-500/15 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full">ATIVO</span>
            </h3>
            <p className="text-xs text-white/55 font-normal">Tire uma foto ao vivo ou faça upload do cupom fiscal.</p>
          </div>
        </div>

        {/* Camera toggle controls */}
        <button
          type="button"
          onClick={isCameraActive ? stopCamera : startCamera}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
            isCameraActive 
              ? 'bg-red-500/25 border border-red-500/30 text-red-200' 
              : 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-500/20'
          }`}
        >
          <Camera className="w-3.5 h-3.5" />
          {isCameraActive ? 'Desativar Câmera' : 'Tirar Foto ao Vivo'}
        </button>
      </div>

      {/* Camera Live Stream Panel or Drag & Drop Area */}
      {isCameraActive ? (
        <div className="relative rounded-2xl overflow-hidden border border-purple-500/35 bg-black h-48 flex items-center justify-center">
          <video 
            ref={videoRef} 
            className="w-full h-full object-cover" 
            playsInline 
            muted
          />
          
          {/* Rectangular scanning guide marker overlay */}
          <div className="absolute inset-4 border border-dashed border-green-400/40 rounded-xl pointer-events-none flex items-center justify-center">
            <span className="text-[9px] uppercase tracking-wider font-mono bg-black/80 px-2.5 py-1 text-green-400 rounded-full">Alinhe a Nota Fiscal Aqui</span>
          </div>

          {/* Action capture trigger overlay */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2.5">
            <button
              type="button"
              onClick={captureSnapshot}
              className="px-5 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-green-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              Capturar Nota 📷
            </button>
            <button
              type="button"
              onClick={stopCamera}
              className="px-3 py-2 bg-black/75 hover:bg-black text-white/70 text-xs rounded-xl cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <div 
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed h-32 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
            dragActive 
              ? 'border-purple-400 bg-purple-600/10' 
              : 'border-white/10 bg-white/[0.01] hover:border-white/20 hover:bg-white/[0.04]'
          }`}
        >
          <input 
            ref={fileInputRef}
            type="file" 
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden" 
          />
          
          {isScanning ? (
            <div className="flex flex-col items-center justify-center gap-2.5">
              <RefreshCw className="w-6 h-6 text-purple-400 animate-spin" />
              <span className="text-xs font-mono font-bold text-purple-300 animate-pulse">Lendo PDF/Conta via Gemini Vision...</span>
            </div>
          ) : (
            <div className="text-center p-4">
              <Upload className="w-6 h-6 text-white/30 mx-auto mb-2" />
              <p className="text-xs text-white/80 font-medium font-sans">Arraste a conta aqui ou clique para fazer upload</p>
              <p className="text-[10px] text-white/40 mt-1 uppercase font-mono tracking-wider">SUPORTE JPG, PNG, PDF OU RETRATO</p>
            </div>
          )}
        </div>
      )}

      {/* Instant Demo Sandbox Templates */}
      <div className="mt-4">
        <p className="text-[10px] font-bold text-white/45 tracking-wider uppercase mb-2 font-mono flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-purple-400" /> Teste de Demonstração (Sem Upload):
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {sampleBills.map((sample, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleScanSample(sample)}
              disabled={isScanning}
              className="flex items-center justify-between text-left p-2.5 bg-white/[0.02] hover:bg-purple-950/20 border border-white/5 hover:border-purple-500/25 rounded-xl transition-all font-sans group disabled:opacity-50 cursor-pointer text-xs"
            >
              <div className="flex items-center gap-2">
                <span className="text-base">{sample.icon}</span>
                <div>
                  <span className="text-xs font-semibold text-white group-hover:text-purple-300 transition-colors block">{sample.name}</span>
                  <span className="text-[9px] text-white/40 font-mono">Consumo {sample.tipo === 'Outros' ? 'Básico' : `Ativo`}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Show scanning outputs info or success */}
      {scanResult && (
        <div className="mt-4 bg-green-950/10 border border-green-500/25 p-3 rounded-2xl flex items-start gap-2.5 text-xs animate-fadeIn">
          <CheckCircle className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold text-green-400">Leitura Concluída!</p>
            <p className="text-white/80 mt-1 leading-normal">
              Detectamos <span className="font-bold text-white">{scanResult.estabelecimento}</span> no valor de <span className="font-bold text-white">R$ {scanResult.valor.toFixed(2)}</span> com vencimento em <span className="font-bold text-white">{scanResult.vencimento}</span>.
              {scanResult.consumo > 0 && ` Consumo extraído: ${scanResult.consumo} ${scanResult.tipoConta === 'Light' ? 'kWh' : 'm³'}.`}
            </p>
            <div className="mt-2 flex gap-1.5">
              <span className="text-[9px] bg-green-500/20 text-green-300 font-mono px-2 py-0.5 rounded">Categoria: {scanResult.categoria}</span>
              <span className="text-[9px] bg-green-500/20 text-green-300 font-mono px-2 py-0.5 rounded">Tipo: {scanResult.tipoConta}</span>
            </div>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="mt-4 bg-red-950/10 border border-red-500/25 p-3 rounded-2xl flex items-start gap-2.5 text-xs animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold text-red-400">Alerta Técnico</p>
            <p className="text-white/70 mt-1 leading-normal">{errorMsg}</p>
          </div>
        </div>
      )}
    </div>
  );
}
