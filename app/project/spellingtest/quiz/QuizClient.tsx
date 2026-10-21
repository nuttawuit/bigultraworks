'use client';

import { useState, useRef, useEffect } from 'react';
import { createWorker } from 'tesseract.js';

interface Vocab {
  id: string;
  word: string;
  translation: string;
  category_name?: string;
  image_url?: string;
}

export default function QuizClient({ vocabs }: { vocabs: Vocab[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputMode, setInputMode] = useState<'keyboard' | 'handwriting'>('keyboard');
  const [typedAnswer, setTypedAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  const [feedback, setFeedback] = useState<{ isCorrect: boolean; text: string } | null>(null);
  const [isOcrLoading, setIsOcrLoading] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const currentVocab = vocabs[currentIndex];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && !isFinished) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, isFinished]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const playAudio = () => {
    if (!currentVocab) return;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(currentVocab.word);
      utterance.lang = 'en-US';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  useEffect(() => {
    if (inputMode === 'handwriting') {
      clearCanvas();
    }
  }, [inputMode, currentIndex]);

  const handleOcrRecognize = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsOcrLoading(true);
    try {
      const worker = await createWorker('eng');
      const ret = await worker.recognize(canvas);
      await worker.terminate();

      const recognizedText = ret.data.text.trim();
      setTypedAnswer(recognizedText);
      setInputMode('keyboard');
      setIsOcrLoading(false);
      setFeedback({ 
        isCorrect: false, 
        text: `✨ OCR แปลงข้อความได้: "${recognizedText}" (สามารถแก้ไขคำสะกดในช่องพิมพ์ด้านล่างก่อนกดส่งได้ครับ)` 
      });
    } catch (err) {
      console.error('OCR Error:', err);
      setIsOcrLoading(false);
      setFeedback({ isCorrect: false, text: 'ไม่สามารถอ่านลายมือได้ ลองเขียนใหม่อีกครั้งครับ' });
    }
  };

  const handleCheckAnswer = () => {
    const isCorrect = typedAnswer.toLowerCase().trim() === currentVocab.word.toLowerCase().trim();

    if (isCorrect) {
      setScore((prev) => prev + 1);
      setFeedback({ isCorrect: true, text: `🎉 ถูกต้อง! คำตอบคือ "${currentVocab.word}"` });
      
      setTimeout(() => {
        setFeedback(null);
        setTypedAnswer('');
        clearCanvas();

        if (currentIndex + 1 < vocabs.length) {
          setCurrentIndex((prev) => prev + 1);
        } else {
          setIsFinished(true);
          setIsTimerRunning(false);
        }
      }, 1500);
    } else {
      setFeedback({
        isCorrect: false,
        text: `❌ ยังไม่ถูกต้อง (คุณตอบ: "${typedAnswer || 'ว่าง'}") ลองตรวจสอบคำสะกดแล้วลองใหม่อีกครั้งครับ!`,
      });
    }
  };

  if (!vocabs || vocabs.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        ยังไม่มีคำศัพท์สำหรับทำแบบทดสอบ กรุณาเพิ่มคำศัพท์ก่อนนะครับ
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-sm border text-center space-y-6">
        <div className="text-5xl">🏆</div>
        <h2 className="text-2xl font-bold text-gray-800">ทำแบบทดสอบเสร็จสิ้น!</h2>
        
        <div className="bg-gray-50 p-4 rounded-xl space-y-2">
          <p className="text-gray-600">คะแนนที่ได้: <span className="text-2xl font-bold text-blue-600">{score} / {vocabs.length}</span></p>
          <p className="text-gray-600">เวลาที่ใช้ทั้งหมด: <span className="font-semibold text-gray-800">{formatTime(timer)}</span></p>
        </div>

        <button
          onClick={() => {
            setCurrentIndex(0);
            setScore(0);
            setTimer(0);
            setIsFinished(false);
            setIsTimerRunning(true);
            setFeedback(null);
            setTypedAnswer('');
          }}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition"
        >
          🔄 ทำแบบทดสอบอีกครั้ง
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border shadow-sm">
        <span className="font-semibold text-gray-600">
          ข้อที่ {currentIndex + 1} / {vocabs.length}
        </span>
        <span className="bg-blue-50 text-blue-700 font-mono font-bold px-3 py-1 rounded-lg">
          ⏱️ {formatTime(timer)}
        </span>
      </div>

      <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-6 text-center">
        <div>
          <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
            {currentVocab.category_name || 'ทั่วไป'}
          </span>

          {/* แสดงรูปภาพประกอบคำศัพท์ (ถ้ามี) */}
          {currentVocab.image_url && (
            <div className="mt-4 flex justify-center">
              <img
                src={currentVocab.image_url}
                alt="Vocab illustration"
                className="w-70 h-70 object-cover rounded-2xl border-2 border-gray-100 shadow-md"
              />
            </div>
          )}

          <h3 className="text-3xl font-bold text-gray-800 mt-3">{currentVocab.translation}</h3>
        </div>

        <button
          type="button"
          onClick={playAudio}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-full text-lg shadow-md transition transform active:scale-95"
        >
          🔊 กดฟังเสียงออกเสียง
        </button>

        <div className="flex justify-center gap-2 border-b pb-3">
          <button
            type="button"
            onClick={() => setInputMode('keyboard')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              inputMode === 'keyboard'
                ? 'bg-blue-50 text-blue-600 font-bold'
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            ⌨️ โหมดพิมพ์
          </button>
          <button
            type="button"
            onClick={() => setInputMode('handwriting')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              inputMode === 'handwriting'
                ? 'bg-blue-50 text-blue-600 font-bold'
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            ✍️ โหมดเขียนปากกา (OCR)
          </button>
        </div>

        {inputMode === 'keyboard' ? (
          <div className="space-y-3">
            <input
              type="text"
              value={typedAnswer}
              onChange={(e) => setTypedAnswer(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCheckAnswer()}
              placeholder="พิมพ์คำศัพท์ภาษาอังกฤษที่ได้ยิน..."
              className="w-full text-center text-xl font-semibold px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
              autoFocus
            />
            <button
              type="button"
              onClick={handleCheckAnswer}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition"
            >
              ส่งคำตอบ
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-1 bg-white relative">
              <canvas
                ref={canvasRef}
                width={500}
                height={160}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full h-40 touch-none rounded-lg bg-white border border-gray-100 shadow-inner"
                style={{
                  cursor: 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%231e293b\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'><path d=\'M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z\'/></svg>") 0 24, auto'
                }}
              />
              <button
                type="button"
                onClick={clearCanvas}
                className="absolute top-2 right-2 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs px-2.5 py-1 rounded-md"
              >
                🗑️ ล้างหน้าจอ
              </button>
            </div>

            <button
              type="button"
              disabled={isOcrLoading}
              onClick={handleOcrRecognize}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition flex justify-center items-center gap-2"
            >
              {isOcrLoading ? (
                <span>🔍 กำลังแปลงลายมือด้วย OCR...</span>
              ) : (
                <span>🔍 แปลงลายมือเป็นข้อความ (OCR)</span>
              )}
            </button>
          </div>
        )}

        {feedback && (
          <div
            className={`p-4 rounded-xl text-sm font-semibold ${
              feedback.isCorrect ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
            }`}
          >
            {feedback.text}
          </div>
        )}
      </div>
    </div>
  );
}