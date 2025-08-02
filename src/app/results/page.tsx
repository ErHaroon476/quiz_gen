'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ResultsPage() {
  const router = useRouter();
  const [summary, setSummary] = useState('');
  const [quiz, setQuiz] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isQuizLoading, setIsQuizLoading] = useState(false); // Changed initial state to false
  const [showGenerateQuiz, setShowGenerateQuiz] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const clientId = localStorage.getItem('clientId');
      if (!clientId) {
        console.error('❌ No clientId found in localStorage');
        setIsLoading(false);
        return;
      }

      try {
        const metaRes = await fetch('/api/get-filename', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clientId }),
        });
        const metaData = await metaRes.json();
        if (!metaRes.ok) throw new Error(metaData.error);

        const fileName = metaData.fileName;

        const sumRes = await fetch('/api/summarize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clientId, fileName }),
        });

        const sumData = await sumRes.json();
        if (!sumRes.ok) throw new Error(sumData.error);

        const summaryText = sumData.data?.summary || '';
        setSummary(summaryText);
        setShowGenerateQuiz(true); // Show generate quiz button after summary is ready
      } catch (err: any) {
        console.error('❌ Error:', err.message || err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleGenerateQuiz = async () => {
    if (!summary) return;
    
    setIsQuizLoading(true);
    setShowGenerateQuiz(false); // Hide the button while loading

    try {
      const quizRes = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ summary }),
      });

      const quizData = await quizRes.json();
      if (!quizRes.ok) throw new Error(quizData.error);

      let raw = typeof quizData.quiz === 'string' ? quizData.quiz : '';
      let cleaned = raw.replace(/```(?:json)?/g, '').trim();
      let parsedQuiz: any[] = [];

      try {
        parsedQuiz = JSON.parse(cleaned);
      } catch (e) {
        console.error('❌ Failed to parse quiz JSON:', e, '\nRaw content:', raw);
      }

      setQuiz(parsedQuiz);
    } catch (err: any) {
      console.error('❌ Quiz generation error:', err.message || err);
      setShowGenerateQuiz(true); // Show button again if error occurs
    } finally {
      setIsQuizLoading(false);
    }
  };

  const handleNewUpload = () => {
    localStorage.removeItem('summary');
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <main className="container mx-auto px-6 py-12 relative">
        {/* Back Button */}
        <button
          onClick={() => router.push('/')}
          className="absolute top-0 left-0 mt-6 ml-6 px-4 py-2 text-sm rounded-lg bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 hover:from-indigo-200 hover:to-purple-200 transition shadow-sm"
        >
          ← Back
        </button>
        
        <div className="max-w-5xl mx-auto animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Analysis Results
            </h2>
            <button
              onClick={handleNewUpload}
              className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 cursor-pointer whitespace-nowrap transform hover:scale-105 shadow-lg font-medium"
            >
              Upload New PDF
            </button>
          </div>

          {/* Summary Section */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-10 mb-12 border border-indigo-100 transition-all duration-500 hover:scale-105">
            <div className="flex items-center mb-8">
              <div className="w-14 h-14 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mr-6 animate-pulse">
                <i className="ri-file-text-line text-2xl text-indigo-600"></i>
              </div>
              <h3 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">AI Summary</h3>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : summary ? (
              <div>
                <div className="prose max-w-none mb-6">
                  {summary.split('\n').map((para, i) => (
                    <p key={i} className="text-gray-700 leading-relaxed mb-6 text-lg">
                      {para}
                    </p>
                  ))}
                </div>
                {showGenerateQuiz && (
                  <button
                    onClick={handleGenerateQuiz}
                    className="mt-4 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition font-medium"
                  >
                    Generate Quiz
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No summary available. Please upload and try again.</p>
              </div>
            )}
          </div>

          {/* Quiz Section */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-10 border border-purple-100 transition-all duration-500 hover:scale-105">
            <div className="flex items-center mb-8">
              <div className="w-14 h-14 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mr-6 animate-pulse">
                <i className="ri-question-line text-2xl text-purple-600"></i>
              </div>
              <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Knowledge Quiz</h3>
            </div>

            {isQuizLoading ? (
              <div className="flex justify-center items-center py-10">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
              </div>
            ) : quiz.length > 0 ? (
              <QuizComponent quiz={quiz} />
            ) : (
              <p className="text-center text-gray-500 py-12 text-lg">
                {!showGenerateQuiz && !isQuizLoading ? "No quiz generated yet." : ""}
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// QuizComponent remains the same as in your original code
// 👇 QuizComponent
function QuizComponent({ quiz }: { quiz: any[] }) {
  const [answers, setAnswers] = useState<(string | null)[]>(Array(quiz.length).fill(null));
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = (questionIndex: number, option: string) => {
    if (submitted) return;
    const updated = [...answers];
    updated[questionIndex] = option;
    setAnswers(updated);
  };

  const getScore = () => {
    return answers.reduce((score, answer, i) => {
      return answer === quiz[i].answer ? score + 1 : score;
    }, 0);
  };

  return (
    <div className="space-y-8">
      {quiz.map((q, i) => (
        <div key={i} className="border-b pb-6">
          <h4 className="text-xl font-semibold text-purple-700 mb-4">
            {i + 1}. {q.question}
          </h4>
          <ul className="grid gap-3">
            {q.options.map((opt: string, j: number) => {
              const selected = answers[i] === opt;
              const isCorrect = q.answer === opt;
              const isWrong = selected && opt !== q.answer;

              let bgColor = 'bg-purple-50';
              if (submitted && selected && isCorrect) bgColor = 'bg-green-200';
              else if (submitted && isWrong) bgColor = 'bg-red-200';
              else if (selected) bgColor = 'bg-purple-200';

              return (
                <li
                  key={j}
                  className={`px-4 py-2 rounded-lg text-gray-800 cursor-pointer transition ${bgColor}`}
                  onClick={() => handleSelect(i, opt)}
                >
                  {opt}
                </li>
              );
            })}
          </ul>
        </div>
      ))}

      {!submitted ? (
        <button
          onClick={() => setSubmitted(true)}
          className="mt-8 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition font-medium"
        >
          Submit Quiz
        </button>
      ) : (
        <div className="mt-8 text-xl font-semibold text-purple-700">
          🎉 You scored {getScore()} out of {quiz.length}
        </div>
      )}
    </div>
  );
}
