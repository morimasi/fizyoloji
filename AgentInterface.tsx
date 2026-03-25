/**
 * AGENT INTERFACE COMPONENT
 * UI for interacting with autonomous agents
 */

import React, { useState, useEffect } from 'react';
import { queryWithAgents, queryWithSpecificAgent, streamAgentResponse, getAvailableAgents, type AgentType } from './ai-agent-service.ts';

interface AgentMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  agentType?: AgentType;
  timestamp: Date;
}

export function AgentInterface() {
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<AgentType | 'auto'>('auto');
  const [streamingResponse, setStreamingResponse] = useState('');
  const [availableAgents] = useState<AgentType[]>(getAvailableAgents());

  const agentDescriptions: Record<AgentType | 'auto', string> = {
    auto: '🤖 Otomatik - Akıllı ajan seçimi',
    physiotherapist: '🏥 Fizyoterapist Uzmanı',
    exercise_specialist: '💪 Egzersiz Uzmanı',
    sports_injury: '⚽ Spor Yaralanmaları Uzmanı',
    massage_therapist: '✋ Masaj Terapisti',
    software_coder: '💻 Yazılım Geliştirici',
    special_education: '🎓 Özel Eğitim Öğretmeni'
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: AgentMessage = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setStreamingResponse('');

    try {
      if (selectedAgent === 'auto') {
        // Autonomous agent selection
        const responses = await queryWithAgents(input, {
          history: messages.map(m => ({ role: m.role, content: m.content }))
        });

        for (const response of responses) {
          const assistantMessage: AgentMessage = {
            role: 'assistant',
            content: response.response.content,
            agentType: response.agentType,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, assistantMessage]);
        }
      } else {
        // Specific agent with streaming
        const response = await streamAgentResponse(
          input,
          selectedAgent,
          (chunk) => {
            setStreamingResponse(prev => prev + chunk);
          },
          {
            history: messages.map(m => ({ role: m.role, content: m.content }))
          }
        );

        const assistantMessage: AgentMessage = {
          role: 'assistant',
          content: response.content,
          agentType: selectedAgent,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
        setStreamingResponse('');
      }
    } catch (error) {
      console.error('Agent query failed:', error);
      const errorMessage: AgentMessage = {
        role: 'system',
        content: `Hata: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => {
    setMessages([]);
    setStreamingResponse('');
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg shadow-lg">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur border-b border-purple-200 p-4 rounded-t-lg">
        <h2 className="text-2xl font-bold text-purple-900 mb-3">
          🤖 Superpowers Ajan Sistemi
        </h2>

        {/* Agent Selector */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedAgent('auto')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedAgent === 'auto'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-white text-purple-600 hover:bg-purple-100'
            }`}
          >
            {agentDescriptions.auto}
          </button>
          {availableAgents.map(agent => (
            <button
              key={agent}
              onClick={() => setSelectedAgent(agent)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedAgent === agent
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-white text-purple-600 hover:bg-purple-100'
              }`}
            >
              {agentDescriptions[agent]}
            </button>
          ))}
        </div>

        {selectedAgent === 'auto' && (
          <div className="mt-2 text-sm text-purple-600 bg-purple-100 rounded p-2">
            💡 Otomatik modda sistem en uygun ajanları seçecek ve paralel çalıştıracak
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <p className="text-lg">Ajanlarla konuşmaya başlayın!</p>
            <p className="text-sm mt-2">
              Sorularınızı yazın, sistem en uygun uzmanları otomatik seçecek.
            </p>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-4 ${
                message.role === 'user'
                  ? 'bg-purple-600 text-white'
                  : message.role === 'system'
                  ? 'bg-red-100 text-red-800 border border-red-300'
                  : 'bg-white text-gray-800 shadow-md'
              }`}
            >
              {message.agentType && (
                <div className="text-xs font-semibold mb-2 opacity-75">
                  {agentDescriptions[message.agentType]}
                </div>
              )}
              <div className="whitespace-pre-wrap">{message.content}</div>
              <div className="text-xs mt-2 opacity-60">
                {message.timestamp.toLocaleTimeString('tr-TR')}
              </div>
            </div>
          </div>
        ))}

        {streamingResponse && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-lg p-4 bg-white text-gray-800 shadow-md">
              <div className="text-xs font-semibold mb-2 opacity-75">
                {selectedAgent !== 'auto' && agentDescriptions[selectedAgent]}
              </div>
              <div className="whitespace-pre-wrap">{streamingResponse}</div>
              <div className="text-xs mt-2 opacity-60">Yazıyor...</div>
            </div>
          </div>
        )}

        {loading && !streamingResponse && (
          <div className="flex justify-center">
            <div className="bg-white rounded-lg p-4 shadow-md">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
                <span className="text-purple-600">Ajanlar çalışıyor...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur border-t border-purple-200 p-4 rounded-b-lg">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Sorunuzu yazın..."
            className="flex-1 px-4 py-3 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Gönder
          </button>
          <button
            type="button"
            onClick={clearHistory}
            className="px-6 py-3 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors"
          >
            Temizle
          </button>
        </div>
      </form>
    </div>
  );
}

export default AgentInterface;
