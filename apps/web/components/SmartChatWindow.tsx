'use client'

import { CircleUserRound, User, X } from 'lucide-react'
import { Button } from './ui/button'
import { useRef, useEffect, useState } from 'react'
import { useSearch } from '@/services/search.service';
import { Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { constants } from '@repo/common';

const { DYNASTY_MAP } = constants;

export default function SmartChatWindow({ onClose }: { onClose: () => void }) {

  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<
    { role: 'user' | 'assistant'; text: string }[]
  >([
    {
      role: 'assistant',
      text: '您好，我是AI智能搜索助手。您可以输入想要查找的内容，我将为您匹配相关的诗词。',
    },
  ])
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    // focus input
    inputRef.current?.focus()
  }, [messages])

  const { mutate: searchMutate } = useSearch();
  const handleSearch = async () => {
    if (!query.trim()) return
    setLoading(true)
    setMessages((prev) => [
      ...prev,
      {
        role: 'user',
        text: query,
      },
    ])
    searchMutate({
      input: query,
    }, {
      onSuccess: (data) => {
        console.log('data:', data);
        setQuery('')
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            text: data,
          },
        ])
        setLoading(false)
      },
      onError: () => {
        setLoading(false)
      }
    });
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-[500px] h-full max-h-[800px] bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-100 bg-gray-50">
        <div className="font-semibold text-gray-800 text-sm">AI 智能搜索助手</div>
        <div className="flex space-x-2">
          <Button variant="ghost" size="icon" className="hover:bg-gray-100 cursor-pointer transition" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 text-sm text-gray-600">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-2 ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.role === 'assistant' && (
              <div className="flex-shrink-0 h-9 w-9 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-blue-500" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-xl px-3 py-2 ${
                msg.role === 'assistant'
                  ? 'bg-gray-100 text-left'
                  : 'bg-blue-500 text-white text-right'
              }`}
            >
              {msg.role === 'user' ? msg.text : Array.isArray(msg.text) ? 
              (
                <>
                <span>找到以下诗词：</span>
                {msg.text.map((item: any, idx: number) => (
                  <div key={idx} className='flex flex-col items-start gap-1 mt-4'>
                    <div className='flex items-center gap-1 flex-wrap'>
                      <span>《{item.title}》</span>
                      <span>【{DYNASTY_MAP[item.dynasty as keyof typeof DYNASTY_MAP]}】</span>
                      <span>{item.author}</span>
                    </div>
                    <div className='flex items-center gap-1 flex-wrap'>
                      <span>{item.content}</span>
                    </div>
                  </div>
                ))}
                </>
              ) : msg.text}
            </div>
            {msg.role === 'user' && (
              <div className="flex-shrink-0 h-9 w-9 flex items-center justify-center">
                <CircleUserRound className="w-6 h-6 text-blue-500" />
              </div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input Box */}
      <div className="p-3 border-t border-gray-100 bg-white">
        <div className="flex gap-2">
          <Input
            placeholder="快来和我聊天吧~"
            disabled={loading}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            ref={inputRef}
          />
          <Button
            disabled={loading}
            onClick={handleSearch}
            className="w-24 hover:bg-primary/90 hover:text-white"
          >
            <span className="flex items-center gap-2">
              搜索 <Sparkles className={loading ? 'animate-pulse' : ''} />
            </span>
          </Button>
        </div>
      </div>
    </div>
  )
}