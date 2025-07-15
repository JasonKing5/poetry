'use client'
import { useState } from 'react'
import { useSearch } from '@/services/search.service';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import PoemCard from '@/components/PoemCard';
import { Loading } from '@/components/withLoadingError';
// import { ChatRequest, ChatResponse } from '@repo/types';
// import { v4 as uuid } from 'uuid';

export default function SemanticSearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const { mutate: searchMutate } = useSearch();
  const handleSearch = async () => {
    if (!query.trim()) return
    setResults([])
    setLoading(true)
    searchMutate({
      input: query,
    }, {
      onSuccess: (data) => {
        console.log('data:', data);
        setResults(data)
        setLoading(false)
      },
      onError: () => {
        setLoading(false)
      }
    });
  }

  return (
    <div className="w-full flex justify-center">
      <div className="max-w-5xl w-full">
        <h1 className="text-2xl font-bold mb-4">智能古诗词搜索</h1>
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="请输入内容，如“关于描述思乡的夜晚相关的古诗词”"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button disabled={loading} onClick={handleSearch} className="w-24 hover:bg-primary/90 hover:text-white cursor-pointer transition">
            <span className="flex items-center gap-2">搜索<Sparkles className={loading ? "animate-pulse" : ""} /></span>
          </Button>
        </div>
        {loading && <Loading />}
        <ul className="space-y-4">
        {/* <span className="text-sm text-white bg-blue-500 px-2 py-0.5 rounded-full whitespace-nowrap">
                相似度：{((1 - item.distance) * 100).toFixed(2)}%
              </span> */}
          {results.map((item) => (
            <PoemCard 
              key={item.id}
              id={item.id}
              mode = 'search'
              title={item.title} 
              author={item.author} 
              dynasty={item.dynasty} 
              content={item.content} 
              likesCount={item.likesCount}
              isLiked={item.isLiked}
              distance={item.distance}
            />
          ))}
        </ul>
      </div>
    </div>
  )
}