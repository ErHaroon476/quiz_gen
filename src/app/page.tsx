
'use client';

import Link from 'next/link';
import { useState } from 'react';
import Button from '../components/Button';

 export default function HomePage() {


  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-all duration-500">
      
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-300/10 dark:bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-purple-300/10 dark:bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute -bottom-40 right-1/2 w-96 h-96 bg-indigo-300/10 dark:bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative">
        {/* Hero Section */}
        <div className="min-h-screen flex items-center justify-center px-6">
          <div className="text-center max-w-4xl mx-auto">
            {/* Logo */}
            <div className="mt-4 w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl transform hover:scale-110 transition-all duration-500">
              <span className="font-['Pacifico'] text-white text-3xl">L</span>
            </div>

            {/* Main Title */}
            <h1 className="font-['Pacifico'] text-6xl md:text-7xl lg:text-8xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-6 animate-pulse">
              LuminAI
            </h1>

            {/* Subtitle */}
            <p className="text-2xl md:text-3xl text-gray-800 dark:text-gray-200 mb-4 font-light">
              Transform Documents & Images into Intelligent Quizzes
            </p>

            {/* Description */}
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
              Upload PDFs or images and let our AI generate personalized quizzes instantly. 
              Perfect for education, training, and interactive learning experiences.
            </p>

            {/* Upload Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-8">
              <Link href="/pdfpage">
                <Button 
                  size="lg" 
                  className="transform hover:scale-105 shadow-xl bg-gradient-to-r from-purple-900 to-red-500 hover:from-red-600 hover:to-red-600"
                >
                  <span className="flex items-center space-x-3">
                    <i className="ri-file-pdf-line text-xl w-6 h-6 flex items-center justify-center"></i>
                    <span className="text-lg">PDF Upload</span>
                  </span>
                </Button>
              </Link>
              
              <Link href="/imagepage">
                <Button 
                  size="lg" 
                  className="transform hover:scale-105 shadow-xl bg-gradient-to-r from-purple-600 to-green-400 hover:from-blue-900 hover:to-blue-900"
                 >
                  <span className="flex items-center space-x-3">
                    <i className="ri-image-line text-xl w-6 h-6 flex items-center justify-center"></i>
                    <span className="text-lg">Image Upload</span>
                  </span>
                </Button>
              </Link>
            </div>
              
           

            {/* Features Preview */}
            <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: 'ri-file-pdf-line',
                  title: 'PDF Processing',
                  description: 'Extract content from PDF documents'
                },
                {
                  icon: 'ri-image-line',
                  title: 'Image Analysis',
                  description: 'Analyze images and visual content'
                },
                {
                  icon: 'ri-brain-line',
                  title: 'AI Generation',
                  description: 'Smart AI creates relevant questions'
                }
              ].map((feature, index) => (
                <div 
                  key={index}
                  className="bg-gray-50 dark:bg-gray-800 backdrop-blur-xl rounded-2xl p-6 border border-gray-200 dark:border-gray-700 transform hover:scale-105 transition-all duration-500 hover:shadow-xl"
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <i className={`${feature.icon} text-white text-xl w-6 h-6 flex items-center justify-center`}></i>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
  
      <footer className="dark:bg-gray-800 backdrop-blur-sm  mt-19">
        <div className="container mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <p className="text-gray-600 text-lg">
                2025 LuminAi. Transform your learning experience with AI.
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
  
      </div>
  );
}
