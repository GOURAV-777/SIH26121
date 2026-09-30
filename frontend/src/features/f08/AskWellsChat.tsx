import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { api } from '../../lib/api';
import { Badge, Button } from '../../components/ui';
import { Search, Send, Sparkles, BookOpen, FileText, Bot, User, RefreshCw, ArrowRight } from 'lucide-react';

interface Citation {
  well_id: string;
  doc: string;
  page: number;
  excerpt: string;
}

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  citations?: Citation[];
  timestamp: string;
  isLiveGemini?: boolean;
}

export const AskWellsChat: React.FC = () => {
  const { geminiApiKey, setSelectedWellId } = useStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-0',
      sender: 'assistant',
      text: 'Nearby Wells Intelligence System (NWIS) RAG Engine ready. You can query offset well records, historical mud losses, formation tops, stuck pipe incidents, and proven mitigation playbooks across 14 Duliajan block wells.',
      timestamp: '08:00 AM',
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const suggestionChips = [
    'Mud losses in Formation X within 5 km',
    'What LCM recipe worked best on DEMO-A-01?',
    'Tight hole and overpull in Barail Shale',
    'Differential sticking risks in Tipam sandstone',
  ];

  const handleSend = async (queryText?: string) => {
    const q = (queryText || inputQuery).trim();
    if (!q || isLoading) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    const result = await api.askRAG(q);
    let finalAnswer = result.answer;
    let isLive = false;

    if (geminiApiKey) {
      try {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: `You are the Nearby Wells Intelligence System (NWIS) for Oil India Limited (eRTMAC). Respond with domain expertise in drilling engineering and subsurface geology for Upper Assam basin.\nQuestion: ${q}\n\nRetrieved Offset Data:\n${result.answer}\n\nSynthesize a structured answer with clear mitigation recommendations and cite offset well names.`
                }]
              }]
            })
          }
        );
        if (geminiRes.ok) {
          const gData = await geminiRes.json();
          const textCandidate = gData?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (textCandidate) {
            finalAnswer = textCandidate;
            isLive = true;
          }
        }
      } catch (err) {
        console.warn('Gemini API fallback to local RAG engine:', err);
      }
    }

    setTimeout(() => {
      const botMsg: Message = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        text: finalAnswer,
        citations: result.citations,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isLiveGemini: isLive
      };
      setMessages(prev => [...prev, botMsg]);
      setIsLoading(false);
    }, 250);
  };

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col space-y-4" data-testid="f08-ask-wells">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
        <div>
          <h1 className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
            <Search className="w-4 h-4 text-zinc-700" /> Ask the Wells — Offset Intelligence
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Query across 190 offset well events, formation tops, and Daily Drilling Reports with source citations.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {geminiApiKey ? (
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-800 border border-zinc-200 font-medium">
              Gemini 1.5 Flash Connected
            </span>
          ) : (
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-50 text-zinc-600 border border-zinc-200 font-medium">
              Deterministic RAG Engine
            </span>
          )}
        </div>
      </div>

      {/* Suggestion Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs text-zinc-400 flex-shrink-0">Suggestions:</span>
        {suggestionChips.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(chip)}
            className="text-xs px-3 py-1 rounded-md bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-600 hover:text-zinc-900 transition-colors whitespace-nowrap"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.sender === 'assistant' && (
              <div className="w-7 h-7 rounded bg-zinc-100 text-zinc-700 border border-zinc-200 flex items-center justify-center flex-shrink-0 text-xs">
                <Bot className="w-3.5 h-3.5" />
              </div>
            )}

            <div className={`max-w-2xl space-y-2.5 ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
              <div
                data-testid={m.sender === 'assistant' ? 'f08-answer' : undefined}
                className={`p-4 rounded-lg text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-zinc-900 text-white font-normal'
                    : 'bg-white border border-zinc-200 text-zinc-900 shadow-xs'
                }`}
              >
                {m.isLiveGemini && (
                  <div className="flex items-center gap-1 text-[11px] text-zinc-500 font-medium mb-2 pb-1 border-b border-zinc-100">
                    <Sparkles className="w-3 h-3 text-zinc-600" /> Live Gemini LLM Reasoning
                  </div>
                )}
                <div dangerouslySetInnerHTML={{
                  __html: m.text
                    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-zinc-900">$1</strong>')
                    .replace(/\n/g, '<br/>')
                }} />
              </div>

              {/* Citations (F08) */}
              {m.citations && m.citations.length > 0 && (
                <div className="space-y-1.5" data-testid="f08-citations">
                  <div className="text-[11px] uppercase text-zinc-400 font-medium flex items-center gap-1">
                    <FileText className="w-3 h-3" /> Sources & Citations ({m.citations.length})
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {m.citations.map((c, i) => (
                      <div
                        key={i}
                        className="p-3 bg-white border border-zinc-200 rounded-md text-xs space-y-1 hover:border-zinc-300 transition-colors group cursor-pointer"
                        onClick={() => setSelectedWellId(c.well_id)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-zinc-900 group-hover:underline flex items-center gap-1">
                            {c.well_id} <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </span>
                          <span className="text-[11px] text-zinc-400">Page {c.page}</span>
                        </div>
                        <div className="text-[11px] text-zinc-500 truncate">{c.doc}</div>
                        <div className="text-[11px] text-zinc-600 italic border-l-2 border-zinc-300 pl-2">
                          "{c.excerpt}"
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-[10px] text-zinc-400 text-right">
                {m.timestamp}
              </div>
            </div>

            {m.sender === 'user' && (
              <div className="w-7 h-7 rounded bg-zinc-900 text-white flex items-center justify-center flex-shrink-0 text-xs">
                <User className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 items-center text-xs text-zinc-500">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-zinc-700" />
            <span>Searching 190 offset events & Daily Drilling Reports...</span>
          </div>
        )}
      </div>

      {/* Query Input Box */}
      <div className="flex gap-2.5 pt-2">
        <input
          data-testid="f08-query-input"
          type="text"
          placeholder="Ask about mud losses, formation tops, stuck pipe, LCM recipes, or offset well records..."
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1 bg-white border border-zinc-200 rounded-md px-4 py-2.5 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400 shadow-xs"
        />
        <Button
          data-testid="f08-send-btn"
          variant="primary"
          onClick={() => handleSend()}
          disabled={!inputQuery.trim() || isLoading}
          className="px-4 gap-2 text-xs font-medium"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Ask</span>
        </Button>
      </div>
    </div>
  );
};
