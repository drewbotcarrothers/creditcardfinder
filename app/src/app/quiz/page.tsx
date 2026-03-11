'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CreditCard } from '@/lib/types';
import { getCards } from '@/lib/data';
import CardItem from '@/components/CardItem';

interface Question {
  id: number;
  question: string;
  options: {
    label: string;
    value: string;
    icon: string;
  }[];
}

const questions: Question[] = [
  {
    id: 1,
    question: "What's your top priority?",
    options: [
      { label: "Cash back on everyday purchases", value: "cashback", icon: "💵" },
      { label: "Travel rewards & points", value: "travel", icon: "✈️" },
      { label: "Low interest rates", value: "lowinterest", icon: "📉" },
      { label: "No annual fee", value: "nofee", icon: "🆓" },
    ],
  },
  {
    id: 2,
    question: "How much do you spend monthly on groceries?",
    options: [
      { label: "Under $300", value: "low", icon: "🛒" },
      { label: "$300 - $600", value: "medium", icon: "🛒🛒" },
      { label: "$600 - $1,000", value: "high", icon: "🛒🛒🛒" },
      { label: "Over $1,000", value: "veryhigh", icon: "🛒🛒🛒🛒" },
    ],
  },
  {
    id: 3,
    question: "Do you travel frequently?",
    options: [
      { label: "Multiple times per year", value: "frequent", icon: "🌍" },
      { label: "Once or twice a year", value: "occasional", icon: "✈️" },
      { label: "Rarely", value: "rarely", icon: "🏠" },
      { label: "Never", value: "never", icon: "🚫" },
    ],
  },
  {
    id: 4,
    question: "What's your credit score range?",
    options: [
      { label: "Excellent (760+)", value: "excellent", icon: "⭐⭐⭐" },
      { label: "Good (660-759)", value: "good", icon: "⭐⭐" },
      { label: "Fair (560-659)", value: "fair", icon: "⭐" },
      { label: "Not sure / Building credit", value: "building", icon: "📈" },
    ],
  },
  {
    id: 5,
    question: "Are you willing to pay an annual fee?",
    options: [
      { label: "Yes, if the rewards justify it", value: "yes", icon: "💰" },
      { label: "Only if it's under $100", value: "moderate", icon: "💵" },
      { label: "No annual fee only", value: "no", icon: "🆓" },
    ],
  },
];

export default function QuizPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [results, setResults] = useState<CreditCard[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAnswer = async (value: string) => {
    const newAnswers = { ...answers, [questions[currentQuestion].id]: value };
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Calculate results
      setLoading(true);
      const cards = await getCards();
      const recommended = calculateRecommendations(cards, newAnswers);
      setResults(recommended);
      setShowResults(true);
      setLoading(false);
    }
  };

  const calculateRecommendations = (cards: CreditCard[], userAnswers: Record<number, string>): CreditCard[] => {
    let scoredCards = cards.map(card => {
      let score = 0;

      // Priority scoring
      const priority = userAnswers[1];
      if (priority === 'cashback' && card.rewardsProgram.toLowerCase().includes('cash')) {
        score += 10;
      } else if (priority === 'travel' && (card.category === 'Travel' || card.rewardsProgram.includes('Aeroplan') || card.rewardsProgram.includes('Avion') || card.rewardsProgram.includes('Aventura'))) {
        score += 10;
      } else if (priority === 'lowinterest' && card.purchaseAPR && parseFloat(card.purchaseAPR) < 15) {
        score += 10;
      } else if (priority === 'nofee' && card.annualFee === '$0') {
        score += 10;
      }

      // Grocery spending bonus
      const grocerySpend = userAnswers[2];
      if ((grocerySpend === 'high' || grocerySpend === 'veryhigh') && card.category === 'Cash Back') {
        score += 5;
      }

      // Travel frequency
      const travelFreq = userAnswers[3];
      if (travelFreq === 'frequent' && (card.category === 'Travel' || card.rewardsProgram.includes('Aeroplan') || card.rewardsProgram.includes('Avion'))) {
        score += 8;
      } else if (travelFreq === 'never' && card.category === 'Cash Back') {
        score += 5;
      }

      // Credit score consideration
      const creditScore = userAnswers[4];
      if (creditScore === 'excellent') {
        score += 3; // Premium cards more accessible
      } else if ((creditScore === 'fair' || creditScore === 'building') && card.annualFee === '$0') {
        score += 5; // Recommend no-fee cards for building credit
      }

      // Annual fee willingness
      const feeWilling = userAnswers[5];
      if (feeWilling === 'no' && card.annualFee === '$0') {
        score += 8;
      } else if (feeWilling === 'moderate') {
        const fee = parseFloat(card.annualFee.replace(/[$,]/g, ''));
        if (fee < 100) score += 3;
      }

      // Welcome bonus boost
      if (card.welcomeBonus && card.welcomeBonus.length > 10) {
        score += 2;
      }

      return { card, score };
    });

    // Sort by score and return top 6
    scoredCards.sort((a, b) => b.score - a.score);
    return scoredCards.slice(0, 6).map(sc => sc.card);
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setResults([]);
    setShowResults(false);
  };

  // Progress percentage
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-br from-red-600 to-red-800 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">Find Your Perfect Credit Card</h1>
          <p className="text-red-100 text-lg">
            Answer 5 quick questions and we'll recommend the best cards for you
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {!showResults ? (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Question {currentQuestion + 1} of {questions.length}</span>
                <span>{Math.round(progress)}% complete</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-red-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Question */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {questions[currentQuestion].question}
              </h2>
              <p className="text-gray-500">
                Select the option that best describes you
              </p>
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {questions[currentQuestion].options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleAnswer(option.value)}
                  disabled={loading}
                  className="group p-6 border-2 border-gray-200 rounded-xl hover:border-red-500 hover:bg-red-50 transition-all duration-200 text-left"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-3xl group-hover:scale-110 transition-transform">
                      {option.icon}
                    </span>
                    <div>
                      <span className="font-semibold text-gray-900 block">
                        {option.label}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Back Button */}
            {currentQuestion > 0 && (
              <button
                onClick={() => setCurrentQuestion(currentQuestion - 1)}
                className="mt-8 text-gray-500 hover:text-red-600 font-medium flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous Question
              </button>
            )}
          </div>
        ) : (
          <div>
            {/* Results Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Personalized Recommendations</h2>
              <p className="text-gray-600 mb-6">
                Based on your answers, here are the top {results.length} cards for you
              </p>
              
              {/* Summary based on answers */}
              <div className="inline-flex flex-wrap gap-2 justify-center">
                {Object.entries(answers).map(([qId, answer]) => {
                  const q = questions.find(q => q.id === parseInt(qId));
                  const opt = q?.options.find(o => o.value === answer);
                  return (
                    <span key={qId} className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                      {opt?.label}
                    </span>
                  );
                })}
              </div>

              <button
                onClick={restartQuiz}
                className="mt-6 text-red-600 hover:text-red-700 font-medium flex items-center gap-2 mx-auto"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Start Over
              </button>
            </div>

            {/* Results Grid */}
            {results.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map((card, index) => (
                  <div key={card.slug} className="relative">
                    {index === 0 && (
                      <div className="absolute -top-3 left-4 z-10">
                        <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                          Best Match
                        </span>
                      </div>
                    )}
                    <CardItem card={card} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No cards match your criteria. Try adjusting your answers.</p>
                <button
                  onClick={restartQuiz}
                  className="mt-4 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
                >
                  Retake Quiz
                </button>
              </div>
            )}

            {/* Call to Action */}
            <div className="mt-12 text-center bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Want to see all cards?</h3>
              <p className="text-gray-600 mb-4">
                Browse our complete database and filter by your preferences
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 font-semibold"
              >
                View All Cards
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
