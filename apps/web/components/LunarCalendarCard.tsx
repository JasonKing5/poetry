'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Calendar, Info, MapPin, Zap } from 'lucide-react' // 假设你使用 lucide-react 图标库

export interface LunarInfo {
  gregoriandate: string
  lunardate: string
  lunar_festival: string
  festival: string
  fitness: string // 宜
  taboo: string   // 忌
  shenwei: string
  taishen: string
  chongsha: string
  suisha: string
  wuxingjiazi: string
  wuxingnayear: string
  wuxingnamonth: string
  xingsu: string
  pengzu: string
  jianshen: string
  tiangandizhiyear: string // 修正拼写
  tiangandizhimonth: string
  tiangandizhiday: string
  lmonthname: string
  shengxiao: string
  lubarmonth: string
  lunarday: string
  jieqi: string
}

export interface LunarCalendarCardProps {
  data?: LunarInfo
  isLoading?: boolean
  error?: any
  className?: string
}

// 辅助函数：解析公历日期
const parseDate = (dateStr: string) => {
  const date = new Date(dateStr)
  const day = date.getDate()
  const month = date.getMonth() + 1
  const year = date.getFullYear()
  const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  const weekday = weekdays[date.getDay()]
  return { year, month, day, weekday }
}

export default function LunarCalendarCard({
  data,
  isLoading,
  error,
  className
}: LunarCalendarCardProps) {
  if (isLoading) return <LoadingPlaceholder className={className} />
  if (error || !data) return <ErrorPlaceholder error={error} className={className} />

  const { year, month, day, weekday } = parseDate(data.gregoriandate)
  const festival = data.festival || data.lunar_festival || data.jieqi

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <div className="p-3 sm:p-4">
        {/* 第一行：日期与生肖 */}
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1 pr-2 sm:pr-4">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <Calendar className="h-4 w-4" />
              <span className="text-xs sm:text-sm font-medium tracking-wider">
                <span className="sm:hidden">{year}/{month}</span>
                <span className="hidden sm:inline">{year}年{month}月</span>
              </span>
            </div>
            <h1 className="mt-1 text-4xl font-black tracking-tighter text-gray-500 dark:text-white sm:text-5xl md:text-6xl">
              {day < 10 ? `0${day}` : day}
            </h1>
            <p className="mt-1 text-base sm:text-lg font-bold text-[#64768f]">{weekday}</p>
          </div>
          
          <div className="flex flex-col items-end flex-shrink-0">
            <div className="flex h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 lg:h-16 lg:w-16 items-center justify-center rounded-2xl bg-amber-50/10 text-lg sm:text-xl md:text-2xl lg:text-3xl dark:bg-destructive/20">
              <span className="font-serif font-bold text-[#64768f]">{data.shengxiao}</span>
            </div>
            {festival && (
              <span className="mt-1 sm:mt-2 rounded-full bg-accent/10 px-2 py-0.5 sm:px-3 sm:py-1 text-xs font-bold text-accent-foreground dark:bg-accent/20">
                {festival}
              </span>
            )}
          </div>
        </div>

        {/* 农历核心信息区 */}
        <div className="mt-6 rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/50">
          {/* <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
            <div className="text-center">
              <p className="text-xs text-slate-400">农历</p>
              <p className="font-bold text-slate-700 dark:text-slate-200">{data.lubarmonth}{data.lunarday}</p>
            </div>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
            <div className="text-center">
              <p className="text-xs text-slate-400">干支</p>
              <p className="font-bold text-slate-700 dark:text-slate-200">{data.tiangandizhiyear}年</p>
            </div>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
            <div className="text-center">
              <p className="text-xs text-slate-400">五行</p>
              <p className="font-bold text-slate-700 dark:text-slate-200">{data.wuxingnayear}</p>
            </div>
          </div> */}

          {/* 宜忌区 */}
          {/* <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-700 dark:bg-green-900/30 dark:text-green-400">宜</div>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{data.fitness || '诸事不宜'}</p>
            </div>
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 text-sm font-bold text-red-700 dark:bg-red-900/30 dark:text-red-400">忌</div>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{data.taboo || '诸事回避'}</p>
            </div>
          </div> */}
        </div>

        {/* 底部详细网格 */}
        {/* <div className="mt-6 grid grid-cols-2 gap-y-4 text-xs">
          <DetailItem icon={<Zap className="h-3 w-3" />} label="冲煞" value={data.chongsha} />
          <DetailItem icon={<MapPin className="h-3 w-3" />} label="岁煞" value={data.suisha} />
          <DetailItem icon={<Info className="h-3 w-3" />} label="星宿" value={data.xingsu} />
          <DetailItem icon={<Info className="h-3 w-3" />} label="彭祖" value={data.pengzu} />
        </div> */}

        {/* 神位提示 */}
        {/* <div className="mt-6 border-t border-dashed border-slate-200 pt-4 dark:border-slate-800">
           <p className="text-center text-[10px] uppercase tracking-widest text-slate-400">—— 喜神财神方位 ——</p>
           <p className="mt-2 text-center text-xs font-medium text-slate-500 dark:text-slate-400">
             {data.shenwei.replace(/ /g, ' · ')}
           </p>
        </div> */}
      </div>
    </div>
  )
}

function DetailItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 text-slate-400">{icon}</span>
      <div>
        <span className="text-slate-400">{label}：</span>
        <span className="font-medium text-slate-600 dark:text-slate-300">{value || '-'}</span>
      </div>
    </div>
  )
}

// 骨架屏
function LoadingPlaceholder({ className }: { className?: string }) {
  return (
    <div className={cn("h-96 w-full animate-pulse rounded-3xl dark:bg-slate-900", className)} />
  )
}

// 错误处理
function ErrorPlaceholder({ error, className }: { error?: any, className?: string }) {
  return (
    <div className={cn("flex h-48 flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 p-6 text-center", className)}>
      <div className="rounded-full p-3 text-red-500">
        <Info className="h-6 w-6" />
      </div>
      <p className="mt-2 text-sm font-medium text-slate-600">获取农历数据失败</p>
      <button 
        onClick={() => window.location.reload()}
        className="mt-4 text-xs font-bold text-red-600 underline"
      >
        重试
      </button>
    </div>
  )
}