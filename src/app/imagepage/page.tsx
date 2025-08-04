
'use client';

import Link from 'next/link';
import { useState, useRef } from 'react';
import Button from '../../components/Button';

export default function DashboardPage() {
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

  const handleFileUpload = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateQuiz = () => {
    if (uploadedImage) {
      // Navigate to result page or handle quiz generation
      window.location.href = '/results';
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-all duration-500">
 
      {/* Header */}
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

      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-300/5 dark:bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 -left-40 w-96 h-96 bg-purple-300/5 dark:bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Main Content */}
      <main className="relative max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Create Your Summary And Quiz
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Upload an image and our AI will generate intelligent Summary and Quiz questions based on the content
          </p>
        </div>

        {/* Upload Area */}
        <div className="max-w-2xl mx-auto mb-8">
          <div
            className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
              dragActive
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-105'
                : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 hover:border-blue-400 dark:hover:border-blue-500'
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
                  <i className="ri-upload-cloud-line text-white text-2xl w-8 h-8 flex items-center justify-center"></i>
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
                  <i className="ri-check-line text-green-500 text-xl w-6 h-6 flex items-center justify-center"></i>
                  <p className="text-green-600 dark:text-green-400 font-medium">
                    Image uploaded successfully!
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-4"
                >
                  <i className="ri-image-line text-lg w-5 h-5 flex items-center justify-center"></i>
                  <span className="ml-2">Change Image</span>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto">
                  <i className="ri-upload-cloud-line text-white text-2xl w-8 h-8 flex items-center justify-center"></i>
                </div>
                <div>
                  <p className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Drop your image here
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    or click to browse files
                  </p>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    className="transform hover:scale-105"
                  >
                    <i className="ri-folder-open-line text-lg w-5 h-5 flex items-center justify-center"></i>
                    <span className="ml-2">Choose File</span>
                  </Button>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                  Supports: JPG, PNG, GIF (Max 10MB)
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Generate Quiz Button */}
        {uploadedImage && (
          <div className="text-center">
            <Button
              onClick={generateQuiz}
              size="lg"
              className="transform hover:scale-105 shadow-xl animate-bounce"
            >
              <span className="flex items-center space-x-3">
                <i className="ri-brain-line text-xl w-6 h-6 flex items-center justify-center"></i>
                <span className="text-lg">Generate Quiz</span>
                <i className="ri-arrow-right-line text-xl w-6 h-6 flex items-center justify-center"></i>
              </span>
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
