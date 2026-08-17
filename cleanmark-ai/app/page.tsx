'use client';

import React, { useState, useRef } from 'react';
import { Upload, Eraser, Download, Wand2, RefreshCw, CheckCircle2 } from 'lucide-react';
import { VideoProcessor } from '../lib/videoProcessor';

export default function CleanMarkApp() {
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  
  const [appState, setAppState] = useState<'upload' | 'edit' | 'processing' | 'result'>('upload');
  const [progressMsg, setProgressMsg] = useState('');
  const [progressVal, setProgressVal] = useState(0);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(25);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setVideoUrl(URL.createObjectURL(selectedFile));
      setAppState('edit');
      // સ્મૂથ સ્ક્રોલ કરીને ટૂલ પર લઈ જશે
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    draw(e);
  };
  
  const endDrawing = () => setIsDrawing(false);
  
  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !canvasRef.current || !videoRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    ctx.fillStyle = 'rgba(37, 99, 235, 0.6)'; // Blue visual mask for white theme
    ctx.beginPath();
    ctx.arc(x, y, brushSize * scaleX, 0, Math.PI * 2);
    ctx.fill();
  };

  const clearMask = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const getMaskBoundingBox = () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;

    let minX = canvas.width, minY = canvas.height, maxX = 0, maxY = 0;
    let hasPixels = false;

    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const alpha = data[(y * canvas.width + x) * 4 + 3];
        if (alpha > 0) {
          hasPixels = true;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    if (!hasPixels) return null;
    const padding = 15; 
    return {
      x: Math.max(0, minX - padding),
      y: Math.max(0, minY - padding),
      w: Math.min(canvas.width - minX, (maxX - minX) + (padding * 2)),
      h: Math.min(canvas.height - minY, (maxY - minY) + (padding * 2))
    };
  };

  const processRealVideo = async () => {
    if (!file) return;
    const coords = getMaskBoundingBox();
    if (!coords) {
      alert("Please paint over the watermark first using the brush tool.");
      return;
    }
    
    setAppState('processing');
    setProgressMsg('Initializing Engine');
    setProgressVal(0);
    
    try {
      const processor = new VideoProcessor((stage, val) => {
        setProgressMsg(stage);
        setProgressVal(val);
      });
      await processor.load();
      const outputBlob = await processor.processVideo(file, coords);
      setProcessedUrl(URL.createObjectURL(outputBlob));
      setAppState('result');
    } catch (err: any) {
      alert(err.message || "An error occurred during processing.");
      setAppState('edit');
    }
  };

  return (
    <div className="w-full">
      {/* APP CONTAINER */}
      <div className="max-w-6xl mx-auto px-6 pt-12 pb-24 flex flex-col items-center">
        
        {/* --- STATE: UPLOAD & HERO --- */}
        {appState === 'upload' && (
          <div className="w-full max-w-3xl text-center space-y-12">
            
            {/* SEO HERO SECTION */}
            <div className="space-y-6">
              <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-zinc-900">
                Remove watermarks from your videos with <span className="text-blue-600">AI</span>
              </h1>
              <p className="text-lg md:text-xl text-zinc-600 max-w-2xl mx-auto leading-relaxed">
                CleanMark AI is a free online tool. Select the watermark, let our AI reconstruct the hidden area, and download a clean result instantly.
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm font-medium text-zinc-500 pt-2">
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-blue-500" /> Free</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-blue-500" /> No Signup</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-blue-500" /> On-Device Privacy</span>
              </div>
            </div>

            {/* UPLOAD CARD (White Design) */}
            <label className="relative flex flex-col items-center justify-center w-full h-72 border-2 border-dashed border-zinc-300 rounded-3xl bg-zinc-50 hover:bg-zinc-100 transition-colors cursor-pointer group shadow-sm">
              <input type="file" accept="video/mp4,video/webm,video/quicktime" className="hidden" onChange={handleFileUpload} />
              <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Upload className="w-8 h-8 text-blue-600" />
              </div>
              <span className="text-2xl font-bold text-zinc-800">Upload Video</span>
              <span className="text-sm text-zinc-500 mt-2">MP4 • MOV • WEBM</span>
              <span className="text-xs text-zinc-400 mt-6 bg-zinc-200/50 px-3 py-1 rounded-full">
                Your video stays securely on your device.
              </span>
            </label>
          </div>
        )}

        {/* --- STATE: EDIT --- */}
        {appState === 'edit' && videoUrl && (
          <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in zoom-in-95 duration-300">
            
            {/* Editor Canvas */}
            <div className="lg:col-span-2 bg-zinc-100 rounded-3xl overflow-hidden border border-zinc-200 relative shadow-inner">
              <div className="relative w-full aspect-video bg-black rounded-3xl overflow-hidden">
                <video 
                  ref={videoRef} 
                  src={videoUrl} 
                  className="absolute inset-0 w-full h-full object-contain"
                  controls={false}
                  autoPlay={true}
                  loop={true}
                  muted={true}
                  onLoadedMetadata={() => {
                    if (canvasRef.current && videoRef.current) {
                      canvasRef.current.width = videoRef.current.videoWidth;
                      canvasRef.current.height = videoRef.current.videoHeight;
                    }
                  }}
                />
                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 w-full h-full object-contain cursor-crosshair z-10 touch-none"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={endDrawing}
                  onMouseLeave={endDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={endDrawing}
                />
              </div>
            </div>

            {/* Clean White Tools Panel */}
            <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-lg shadow-zinc-100 flex flex-col gap-8">
              <div>
                <h3 className="text-xl font-bold text-zinc-900 mb-1">Select Watermark</h3>
                <p className="text-sm text-zinc-500">Paint precisely over the area you want to remove.</p>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-zinc-700">Brush Size</label>
                  <span className="text-xs text-zinc-400 font-mono">{brushSize}px</span>
                </div>
                <input 
                  type="range" 
                  min="5" max="80" 
                  value={brushSize} 
                  onChange={(e) => setBrushSize(Number(e.target.value))}
                  className="w-full accent-blue-600 h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <button onClick={clearMask} className="w-full flex items-center justify-center gap-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 py-3 rounded-2xl text-sm font-bold transition-colors">
                <Eraser className="w-4 h-4" /> Clear Brush
              </button>

              <div className="h-px w-full bg-zinc-100 my-1"></div>
              
              <div className="space-y-3">
                 <h3 className="text-sm font-semibold text-zinc-700">Processing Mode</h3>
                 <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                    <p className="font-bold text-blue-900 text-sm">Smart Area Inpainting</p>
                    <p className="text-xs text-blue-700/70 mt-1 leading-relaxed">Reconstructs the painted area seamlessly while preserving original audio and resolution.</p>
                 </div>
              </div>

              <button 
                onClick={processRealVideo}
                className="mt-auto w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98]"
              >
                <Wand2 className="w-5 h-5" /> Remove Watermark
              </button>
            </div>
          </div>
        )}

        {/* --- STATE: PROCESSING --- */}
        {appState === 'processing' && (
          <div className="w-full max-w-md mt-12 bg-white p-10 rounded-3xl border border-zinc-200 text-center shadow-xl shadow-zinc-100 animate-in fade-in slide-in-from-bottom-4">
            <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-zinc-900 mb-2">Processing Video...</h3>
            <p className="text-zinc-500 text-sm mb-8">This happens entirely in your browser.</p>
            
            <div className="w-full bg-zinc-100 rounded-full h-3 mb-4 overflow-hidden relative">
              <div 
                className="bg-blue-600 h-3 rounded-full transition-all duration-300 ease-out" 
                style={{ width: `${progressVal}%` }}
              ></div>
            </div>
            <p className="text-sm font-bold text-blue-600">{progressMsg} ({progressVal}%)</p>
          </div>
        )}

        {/* --- STATE: RESULT --- */}
        {appState === 'result' && processedUrl && (
          <div className="w-full max-w-5xl space-y-10 animate-in fade-in zoom-in-95">
            <div className="text-center">
              <h2 className="text-4xl font-extrabold text-zinc-900">Export Ready</h2>
              <p className="text-zinc-500 mt-3 text-lg">Preview and download your clean video.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <span className="inline-block bg-zinc-100 text-zinc-600 text-xs font-bold px-3 py-1.5 rounded-lg uppercase tracking-wider">Original</span>
                <video src={videoUrl!} controls className="w-full rounded-2xl border border-zinc-200 shadow-sm aspect-video object-cover bg-black" />
              </div>
              <div className="space-y-4">
                <span className="inline-block bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold px-3 py-1.5 rounded-lg uppercase tracking-wider">CleanMark Result</span>
                <video src={processedUrl} controls autoPlay loop className="w-full rounded-2xl border border-blue-200 shadow-lg shadow-blue-900/5 aspect-video object-cover bg-black" />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-8">
              <a 
                href={processedUrl} 
                download={`CleanMark_${file?.name || 'video.mp4'}`}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98]"
              >
                <Download className="w-5 h-5" /> Download Clean Video
              </a>
              <button 
                onClick={() => {
                  setAppState('upload');
                  setFile(null);
                  setVideoUrl(null);
                  setProcessedUrl(null);
                }}
                className="bg-white hover:bg-zinc-50 text-zinc-700 border border-zinc-200 font-bold py-4 px-8 rounded-2xl transition-all active:scale-[0.98]"
              >
                Try Another Video
              </button>
            </div>
          </div>
        )}

      </div>

      {/* SEO / AEO CONTENT SECTION (Below the fold) */}
      {appState === 'upload' && (
        <div className="w-full border-t border-zinc-100 bg-white pt-24 pb-20">
          <div className="max-w-4xl mx-auto px-6 space-y-20">
            
            {/* How it works */}
            <section id="how-it-works">
              <h2 className="text-3xl font-bold text-zinc-900 mb-8 text-center">How to remove a watermark from a video?</h2>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="bg-zinc-50 p-6 rounded-3xl border border-zinc-100">
                  <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center font-bold text-blue-600 text-xl mb-4">1</div>
                  <h3 className="font-bold text-lg mb-2">Upload</h3>
                  <p className="text-zinc-500 text-sm leading-relaxed">Select your MP4, MOV, or WEBM video. Your file stays secure on your device and is never uploaded to our servers.</p>
                </div>
                <div className="bg-zinc-50 p-6 rounded-3xl border border-zinc-100">
                  <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center font-bold text-blue-600 text-xl mb-4">2</div>
                  <h3 className="font-bold text-lg mb-2">Select Area</h3>
                  <p className="text-zinc-500 text-sm leading-relaxed">Use the brush tool to paint over the text, logo, or watermark you want to remove. Be as precise as possible.</p>
                </div>
                <div className="bg-zinc-50 p-6 rounded-3xl border border-zinc-100">
                  <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center font-bold text-blue-600 text-xl mb-4">3</div>
                  <h3 className="font-bold text-lg mb-2">Export</h3>
                  <p className="text-zinc-500 text-sm leading-relaxed">Our AI reconstructs the area instantly. Preview the side-by-side result and download your clean video in full quality.</p>
                </div>
              </div>
            </section>

            {/* FAQ for AI Search / GEO */}
            <section id="faq" className="space-y-8">
              <h2 className="text-3xl font-bold text-zinc-900 text-center mb-10">Frequently Asked Questions</h2>
              
              <div className="space-y-6">
                <div className="bg-white border border-zinc-200 p-6 rounded-2xl shadow-sm">
                  <h3 className="font-bold text-lg text-zinc-900 mb-2">Is CleanMark AI completely free?</h3>
                  <p className="text-zinc-600">Yes. CleanMark AI is designed as a free video watermark removal tool without any mandatory signup, subscriptions, or hidden fees.</p>
                </div>
                
                <div className="bg-white border border-zinc-200 p-6 rounded-2xl shadow-sm">
                  <h3 className="font-bold text-lg text-zinc-900 mb-2">Are my videos uploaded to a server?</h3>
                  <p className="text-zinc-600">No. CleanMark AI uses WebAssembly technology to process your videos directly inside your browser. Your files never leave your device, ensuring complete privacy.</p>
                </div>

                <div className="bg-white border border-zinc-200 p-6 rounded-2xl shadow-sm">
                  <h3 className="font-bold text-lg text-zinc-900 mb-2">Will the video quality be reduced?</h3>
                  <p className="text-zinc-600">CleanMark AI strives to preserve the source properties of your video, including resolution, aspect ratio, frame rate, and audio track, whenever technically possible.</p>
                </div>
              </div>
            </section>

          </div>
        </div>
      )}

    </div>
  );
}