'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useRef } from 'react';
import Button from '../../components/Button';

export default function DashboardPage() {
  const router = useRouter();
  const [dragActive, setDragActive] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file || !file.type.startsWith('image/')) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('clientId', 'user123');

      const res = await fetch('/api/img_upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.filename) {
        const filename = data.filename;
        setUploadedImage(`/uploads_img/${filename}`);
        localStorage.setItem('lastUploadedImage', filename);
      } else {
        alert('Upload failed: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleShowResults = () => {
    router.push('/imageresult');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-all duration-500">
      <header className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <div className="flex items-center space-x-3 cursor-pointer">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="font-['Pacifico'] text-white text-lg">L</span>
                </div>
                <span className="font-['Pacifico'] text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  LuminAi
                </span>
              </div>
            </Link>

            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="outline" size="sm">
                  <span className="ml-2">Home</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="relative max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Create Your Summary And Quiz
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Upload an image to generate AI-powered summary and quiz
          </p>
        </div>

        <div className="max-w-2xl mx-auto mb-8">
          <div
            className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
              dragActive
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800'
            } ${uploadedImage ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {isUploading ? (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto animate-pulse">
                  <i className="ri-upload-cloud-line text-white text-2xl"></i>
                </div>
                <p className="text-gray-600 dark:text-gray-400">Uploading...</p>
              </div>
            ) : uploadedImage ? (
              <div className="space-y-4">
                <div className="max-w-md mx-auto">
                  <img
                    src={uploadedImage}
                    alt="Uploaded"
                    className="w-full h-64 object-cover rounded-xl shadow-lg"
                  />
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <i className="ri-check-line text-green-500 text-xl"></i>
                  <p className="text-green-600 dark:text-green-400 font-medium">
                    Image uploaded successfully!
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-4"
                >
                  <i className="ri-image-line text-lg"></i>
                  <span className="ml-2">Change Image</span>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto">
                  <i className="ri-upload-cloud-line text-white text-2xl"></i>
                </div>
                <div>
                  <p className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Drop your image here
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    or click to browse files
                  </p>
                  <Button onClick={() => fileInputRef.current?.click()}>
                    <i className="ri-folder-open-line text-lg"></i>
                    <span className="ml-2">Choose File</span>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {uploadedImage && (
          <div className="text-center mt-8">
            <Button
              onClick={handleShowResults}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
            >
              <i className="ri-eye-line text-xl mr-2"></i>
              Show Results
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
