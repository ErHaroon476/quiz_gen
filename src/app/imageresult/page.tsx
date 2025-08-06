'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export default function ImgResultsPage() {
  const router = useRouter();
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasFetched = useRef(false); // ✅ Use ref instead of state
useEffect(() => {
  const fileName = localStorage.getItem('lastUploadedImage');
  if (!fileName || hasFetched.current) return;

  const fetchSummary = async () => {
    hasFetched.current = true; // ✅ Set ref before the async call
    setIsLoading(true);
    try {
      console.log('🚀 Making request to /api/imgsummary');
      const res = await fetch('/api/imgsummary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName }),
      });

      const data = await res.json();
      console.log('🔁 API Response:', data);

      if (!res.ok || !data.success || !data.caption) {
        throw new Error('Summary failed or caption is missing');
      }

      setSummary(data.caption);
      setError(null);
    } catch (err: any) {
      console.error('❌ Summary fetch failed:', err.message || err);
      setError('Summary could not be generated.');
    } finally {
      setIsLoading(false);
    }
  };

  fetchSummary();
}, []);

  const handleNewUpload = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <main className="container mx-auto px-6 py-12 relative">
        <div className="max-w-5xl mx-auto animate-fade-in">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Analysis Results
            </h2>
            <button
              onClick={handleNewUpload}
              className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 cursor-pointer whitespace-nowrap transform hover:scale-105 shadow-lg font-medium"
            >
              Go to HomePage
            </button>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-10 mb-12 border border-indigo-100 transition-all duration-500 hover:scale-105">
            <div className="flex items-center mb-8">
              <div className="w-14 h-14 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mr-6 animate-pulse">
                <i className="ri-file-text-line text-2xl text-indigo-600"></i>
              </div>
              <h3 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                AI Summary
              </h3>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : error ? (
              <div className="text-center py-12 text-red-500 text-lg">{error}</div>
            ) : (
              <p className="text-lg text-gray-700 leading-relaxed whitespace-pre-wrap">{summary}</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
