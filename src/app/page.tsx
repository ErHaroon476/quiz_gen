'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [isEmbedding, setIsEmbedding] = useState(false);
  const [embedDone, setEmbedDone] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  // Typing animation state
  const [displayText, setDisplayText] = useState('');
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const phrases = ["Luminai", "Summary Generator", "Quiz Generator", "Powered by AI"];

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const currentPhrase = phrases[currentPhraseIndex];
    
    if (isTyping) {
      if (displayText.length < currentPhrase.length) {
        timeout = setTimeout(() => {
          setDisplayText(currentPhrase.substring(0, displayText.length + 1));
        }, 150); // Typing speed
      } else {
        // Done typing - wait then start deleting
        timeout = setTimeout(() => setIsTyping(false), 2000); // Pause at full phrase
      }
    } else {
      if (displayText.length > 0) {
        // Deleting
        timeout = setTimeout(() => {
          setDisplayText(displayText.substring(0, displayText.length - 1));
        }, 80); // Deleting speed (faster than typing)
      } else {
        // Done deleting - move to next phrase
        setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
        setIsTyping(true); // Start typing next phrase
      }
    }

    return () => clearTimeout(timeout);
  }, [displayText, currentPhraseIndex, isTyping]);

  const handleFileUpload = async (file: File) => {
    if (file.type === 'application/pdf') {
      setUploadedFile(file);
      setIsProcessing(true);
      setIsEmbedding(false);
      setEmbedDone(false);
      const formData = new FormData();
      formData.append("file", file);

      let clientId = localStorage.getItem("clientId");
      if (!clientId) {
        clientId = crypto.randomUUID();
        localStorage.setItem("clientId", clientId);
      }
      formData.append("clientId", clientId);

      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) throw new Error("Upload failed");
        const uploadResult = await res.json();
        
        setIsEmbedding(true);
        const embedRes = await fetch("/api/embed", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fileName: uploadResult.fileName,
            clientId: clientId,
          }),
        });

        if (!embedRes.ok) throw new Error("Embedding failed");
        const embedResult = await embedRes.json();
        setEmbedDone(true);
      } catch (err) {
        console.error("Processing error:", err);
        alert("Upload or embedding failed!");
        setUploadedFile(null);
      } finally {
        setIsProcessing(false);
        setIsEmbedding(false);
      }
    } else {
      alert('Please upload a PDF file only');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce-subtle {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
          60% { transform: translateY(-5px); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        @keyframes blink-caret {
          from, to { opacity: 0; }
          50% { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.8s ease-out;
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 2s infinite;
        }
        .animate-spin-slow {
          animation: spin-slow 2s linear infinite;
        }
        .animate-progress {
          animation: progress 2s ease-in-out;
        }
        .typing-text::after {
          content: "|";
          animation: blink-caret 0.75s step-end infinite;
          color: #4f46e5;
          margin-left: 2px;
        }
      `}</style>

      <header className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-purple-100 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent" style={{ fontFamily: 'Pacifico, serif' }}>
              <span className="typing-text">{displayText}</span>
            </h1>
            <nav className="flex space-x-8">
              <Link href="/" className="text-gray-700 hover:text-indigo-600 transition-all duration-300 cursor-pointer font-medium hover:scale-105">
                Home
              </Link>
              <a
                href="https://haroon-nasim.netlify.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-700 hover:text-indigo-600 transition-all duration-300 cursor-pointer font-medium hover:scale-105"
              >
                Project Owner
              </a>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-6xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6 animate-bounce-subtle">
              Transform Your PDFs with AI
            </h2>
            <p className="text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed animate-slide-up">
              Upload any PDF document and get instant AI-powered summaries and interactive quizzes to test your understanding.
            </p>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-10 mb-12 border border-purple-100 transform transition-all duration-500 hover:scale-105 hover:shadow-3xl">
            {!uploadedFile ? (
              <div
                className={`border-3 border-dashed rounded-2xl p-16 text-center transition-all duration-500 cursor-pointer transform hover:scale-105 ${
                  isDragging
                    ? 'border-indigo-500 bg-gradient-to-r from-indigo-50 to-purple-50 scale-105'
                    : 'border-gray-300 hover:border-indigo-400 hover:bg-gradient-to-r hover:from-indigo-50/30 hover:to-purple-50/30'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => document.getElementById('fileInput')?.click()}
              >
                <div className="w-20 h-20 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                  <i className="ri-upload-cloud-2-line text-3xl text-indigo-600"></i>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3 animate-pulse">
                  Drop your PDF here or click to browse
                </h3>
                <p className="text-gray-600 mb-6 text-lg">
                  Supports PDF files up to 5MB
                </p>
                <input
                  id="fileInput"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="text-center">
                {isProcessing || isEmbedding ? (
                  <div className="py-12 animate-fade-in">
                    <div className="w-20 h-20 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-spin-slow">
                      <i className="ri-file-text-line text-3xl text-indigo-600"></i>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-3 animate-pulse">
                      {isEmbedding ? "Embedding your PDF..." : "Processing your PDF..."}
                    </h3>
                    <p className="text-gray-600 mb-6 text-lg">
                      AI is working on "{uploadedFile.name}"
                    </p>
                    <div className="w-80 h-3 bg-gray-200 rounded-full mx-auto overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-progress"></div>
                    </div>
                  </div>
                ) : embedDone ? (
                  <div className="py-12 animate-fade-in">
                    <div className="w-20 h-20 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                      <i className="ri-check-line text-3xl text-green-600"></i>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">
                      All done!
                    </h3>
                    <p className="text-gray-600 mb-6 text-lg">
                      Your PDF "{uploadedFile.name}" is processed and embedded.
                    </p>
                    <button
                      onClick={() => {
                        router.push('/results'); 
                      }}
                      className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 cursor-pointer whitespace-nowrap transform hover:scale-105 font-medium"
                    >
                      View Results
                    </button>
                  </div>
                ) : null}
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-8 animate-slide-up">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-indigo-100 transform transition-all duration-500 hover:scale-105 hover:shadow-2xl">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center mb-6 animate-bounce-subtle">
                <i className="ri-brain-line text-2xl text-indigo-600"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">AI Summary</h3>
              <p className="text-gray-600 leading-relaxed">
                Get concise, intelligent summaries of your PDF content in seconds
              </p>
            </div>
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-purple-100 transform transition-all duration-500 hover:scale-105 hover:shadow-2xl">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl flex items-center justify-center mb-6 animate-bounce-subtle">
                <i className="ri-question-line text-2xl text-purple-600"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Smart Quizzes</h3>
              <p className="text-gray-600 leading-relaxed">
                Test your understanding with auto-generated multiple-choice questions
              </p>
            </div>
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-pink-100 transform transition-all duration-500 hover:scale-105 hover:shadow-2xl">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-100 to-rose-100 rounded-xl flex items-center justify-center mb-6 animate-bounce-subtle">
                <i className="ri-shield-check-line text-2xl text-pink-600"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Secure & Fast</h3>
              <p className="text-gray-600 leading-relaxed">
                Your documents are processed securely with lightning-fast results
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white/80 backdrop-blur-sm border-t border-purple-100 mt-20">
        <div className="container mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <p className="text-gray-600 text-lg">
                2024 Quiz_gen. Transform your learning experience with AI.
              </p>
            </div>
            <div className="flex space-x-8">
              <a href="#" className="text-gray-600 hover:text-indigo-600 transition-all duration-300 cursor-pointer font-medium hover:scale-105">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-600 hover:text-indigo-600 transition-all duration-300 cursor-pointer font-medium hover:scale-105">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}