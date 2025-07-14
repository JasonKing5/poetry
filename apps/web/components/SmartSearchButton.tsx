'use client'

import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { Button } from './ui/button'
import SmartChatWindow from './SmartChatWindow'

export default function SmartSearchButton() {
  const [showChat, setShowChat] = useState(false)

  return (
    <>
      <div className="fixed bottom-16 right-6 z-50 group">
        <Button
          onClick={() => setShowChat(true)}
          className="flex items-center space-x-0 gap-0 bg-white hover:bg-gray-100 rounded-full shadow-lg transition-all duration-300 px-0 py-0 group-hover:shadow-xl cursor-pointer"
        >
          <Sparkles className="w-12 h-12 text-blue-500 transition-colors duration-300 animate-pulse" />
          <span className="max-w-0 overflow-hidden opacity-0 group-hover:max-w-[200px] group-hover:opacity-100 group-hover:ml-2 text-gray-700 text-sm transition-all duration-300">
            AI 智能搜索
          </span>
        </Button>
      </div>

      {showChat && <SmartChatWindow onClose={() => setShowChat(false)} />}
    </>
  )
}