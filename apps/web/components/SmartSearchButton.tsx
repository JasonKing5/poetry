'use client'

import { useState, useEffect, useRef } from 'react'
import { Sparkles, Info } from 'lucide-react'
import { Button } from './ui/button'
import SmartChatWindow from './SmartChatWindow'
import './SmartSearchButton.css'

export default function SmartSearchButton() {
  const [showChat, setShowChat] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)
  const [isPulsing, setIsPulsing] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout>(null)
  const intervalRef = useRef<NodeJS.Timeout>(null)

  // Setup pulse effect
  useEffect(() => {
    if (showChat) {
      // Clear any pending timeouts/intervals when chat is open
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (intervalRef.current) clearInterval(intervalRef.current)
      setIsPulsing(false)
      setShowTooltip(false)
      return
    }

    const triggerPulse = () => {
      setIsPulsing(true)
      setShowTooltip(true)
      
      // Hide tooltip after 3 seconds, stop pulsing after animation completes
      timeoutRef.current = setTimeout(() => {
        setShowTooltip(false)
        setTimeout(() => setIsPulsing(false), 1000) // Wait for animation to complete
      }, 5000)
    }

    // Initial random delay (5 seconds)
    const initialDelay = 5000
    
    timeoutRef.current = setTimeout(() => {
      if (!showChat) {
        triggerPulse()
        // Set up recurring interval
        intervalRef.current = setInterval(() => {
          if (!showChat) {
            triggerPulse()
          }
        }, 30000) // 30 seconds between pulses
      }
    }, initialDelay)

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [showChat])

  return (
    <>
      <div className="fixed bottom-16 right-6 z-50 group">
        <div className="relative">
          {/* Tooltip */}
          {showTooltip && (
            <div className="absolute right-16 bottom-1/2 translate-y-1/2 bg-white shadow-lg rounded-lg p-3 w-48 z-50">
              <div className="flex items-start">
                <Info className="w-4 h-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                <p className="text-xs text-gray-600">点击 AI智能搜索，可快速找到您需要的内容～</p>
              </div>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 w-2 h-4 bg-white -mr-1 rotate-45"></div>
            </div>
          )}
          
          {/* Button with pulse effect */}
          <div className={`relative ${isPulsing ? 'animate-pulse-scale' : ''}`}>
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
        </div>
      </div>


      {showChat && <SmartChatWindow onClose={() => setShowChat(false)} />}
    </>
  )
}