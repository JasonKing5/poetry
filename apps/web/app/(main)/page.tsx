'use client'

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card";
import { useLunar } from "@/services/poetry-prop.service"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation"
import Image from "next/image"

const carouselItems = [
  {
    src: "/97854999-9a48-4c4b-ad2e-d65340bae59f.jpg",
    title: "处暑无三日，新凉直万金 | 处暑",
  },
  {
    src: "/8822a76b-1e99-47aa-a933-f50cef3e3e03.jpg",
    title: "七夕 | 在古诗词中读懂中国式浪漫",
  },
  {
    src: "/77847fc9-ac8f-4ade-9914-ce7e3b089912.jpg",
    title: "四面垂杨十里荷，问云何处最花多",
  },
  {
    src: "/2a10254d-0fc1-4f6b-b077-642d178afa2a.jpg",
    title: "秋夜长，风急雨急，雨急风急，秋夜长 | 秋夜",
  },
  {
    src: "/9fa3ea33-43a1-4e6d-9da9-4f441a0f8361.jpg",
    title: "关于立秋的古诗词，你知道几首？",
  }
]

const poetrySelections = [
  {
    title: "诗 经",
    desc: "关关雎鸠，在河之洲。窈窕淑女，君子好逑。",
    bg: "#4b5c6b",
    filter: { type: "shiJing" }
  },
  {
    title: "楚 辞",
    desc: "帝高阳之苗裔兮，朕皇考曰伯庸。",
    bg: "#3e6b4b",
    filter: { type: "chuCi" }
  },
  {
    title: "论 语",
    desc: "学而时习之，不亦说乎？",
    bg: "#4b6b7d",
    filter: { type: "lunYu" }
  },
  {
    title: "唐诗三百首",
    desc: "錦瑟無端五十絃，一絃一柱思華年。",
    bg: "#6b4b3e",
    filter: { type: "tangShi" }
  },
  {
    title: "宋词三百首",
    desc: "回首向来萧瑟处, 归去, 也无风雨也无晴。",
    bg: "#7d7c4b",
    filter: { type: "songCi" }
  },
  {
    title: "元曲三百首",
    desc: "无男儿只一身，担寂寞受孤闷；",
    bg: "#5c4b6b",
    filter: { type: "yuanQu" }
  },
];

const poetryContentList = [
  {
    content: "遂古之初，谁传道之？",
    author: "屈原",
    title: "天问"
  },
  {
    content: "学而时习之，不亦说乎？有朋自远方来，不亦乐乎？",
    author: "孔子",
    title: "学而篇"
  },
  {
    content: "关关雎鸠，在河之洲。窈窕淑女，君子好逑。",
    author: "无名氏",
    title: "关雎"
  },
  {
    content: "君不見黃河之水天上來，奔流到海不復回。",
    author: "李白",
    title: "鼓吹曲辭 將進酒"
  },
  {
    content: "錦瑟無端五十絃，一絃一柱思華年。",
    author: "李商隐",
    title: "錦瑟"
  },
  {
    content: "閑坐悲君亦自悲，百年都是幾多時。",
    author: "元稹",
    title: "遣悲懷三首 三"
  },
  {
    content: "无意苦争春，一任群芳妒。",
    author: "陆游",
    title: "卜算子"
  },
  {
    content: "六朝旧事随流水，但寒烟、芳草凝绿。",
    author: "王安石",
    title: "桂枝香"
  },
  {
    content: "梦後楼台高锁，酒醒帘幕低垂。",
    author: "晏几道",
    title: "临江仙"
  },
  {
    content: "见我这般微微喘息，语言恍惚，脚步儿查梨。",
    author: "关汉卿",
    title: "诈妮子调风月・满庭芳"
  }
]

export default function Home() {
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  const { data: lunarInfo, isLoading, error }: any = useLunar();
  useEffect(() => {
    if (!carouselApi) return;

    const updateCarouselState = () => {
      setCurrentIndex(carouselApi.selectedScrollSnap());
      setTotalItems(carouselApi.scrollSnapList().length);
    };

    updateCarouselState();

    carouselApi.on("select", updateCarouselState);

    // 自动轮播
    const interval = setInterval(() => {
      if (carouselApi && totalItems > 0) {
        carouselApi.scrollTo((carouselApi.selectedScrollSnap() + 1) % totalItems);
      }
    }, 4000); // 4秒切换一次

    return () => {
      carouselApi.off("select", updateCarouselState);
      clearInterval(interval);
    };
  }, [carouselApi, totalItems]);

  const scrollToIndex = (index: number) => {
    carouselApi?.scrollTo(index);
  };

  const router = useRouter();

  const handleSelect = (filter: Record<string, string>) => {
    const params = new URLSearchParams(filter).toString();
    router.push(`/poetry?${params}`);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className='w-full flex flex-col justify-center'>
      <div className="w-full flex justify-center">
        <div
          className="relative flex w-full max-w-6xl h-28 md:h-36 bg-[#b6b08a]/90 border-[3px] border-white rounded-xl shadow-lg overflow-hidden"
        >
          <div className="flex-1 flex flex-col justify-center items-center px-4 md:px-8 py-2 md:py-4">
            <div className="text-white text-base md:text-[1.35rem] lg:text-2xl font-semibold tracking-wide text-left leading-relaxed drop-shadow-lg mb-1 md:mb-2">
              雪沫乳花浮午盏，蓼茸蒿笋试春盘。<br className="hidden md:block" />人间有味是清欢。
            </div>
            <div className="text-white text-sm md:text-base lg:text-lg text-left opacity-90 tracking-wide">
              —— 苏轼 · 宋 《浣溪沙·细雨斜风作晓寒》
            </div>
          </div>
          <div className="flex flex-col items-center justify-center w-1/3 md:w-1/4 min-w-[90px] md:min-w-[120px] bg-[#a6a07a]/80 border-l border-white px-2 md:px-4">
            <div className="text-white text-base md:text-lg font-bold mb-0.5 md:mb-1">{lunarInfo?.gregoriandate}</div>
            <div className="text-white text-xs md:text-base mb-0.5 md:mb-1">{`${lunarInfo?.lubarmonth} ${lunarInfo?.lunarday}`}</div>
            <div className="text-white text-xs md:text-base">{lunarInfo?.festival}</div>
            <div className="text-white text-xs md:text-base">{lunarInfo?.shengxiao}</div>
          </div>
        </div>
      </div>
      <div className="w-full relative h-56 sm:h-72 md:h-96 max-h-[500px] mx-auto mt-4 md:mt-5 max-w-6xl lg:mt-6">
        <Carousel
          setApi={setCarouselApi}
          opts={{ loop: true }}
          className="w-full max-w-6xl h-56 sm:h-72 md:h-96 max-h-[500px] z-10"
        >
          <CarouselContent>
            {carouselItems.map((item) => (
              <CarouselItem key={item.src}>
                <Card className="bg-gray-400 px-0 py-0 rounded-xl shadow-md">
                  <CardContent className="flex items-center justify-center h-56 sm:h-72 md:h-96 max-h-[500px] px-0 py-0">
                    <Image
                      src={item.src}
                      alt={item.title}
                      width={1000}
                      height={1000}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        {/* Navigation Arrows */}
        <div className="absolute inset-0 z-20 flex items-center justify-between pointer-events-none">
          <Button
            onClick={() => scrollToIndex(currentIndex - 1)}
            className="pointer-events-auto rounded-full w-10 h-10 md:w-16 md:h-16 lg:w-32 lg:h-32 p-0 bg-transparent shadow-none hover:bg-gray-500/40 cursor-pointer transition"
          >
            <ChevronLeft className="w-6 h-6 md:w-12 md:h-12 lg:size-32" strokeWidth={0.5} />
          </Button>
          <Button
            onClick={() => scrollToIndex(currentIndex + 1)}
            className="pointer-events-auto rounded-full w-10 h-10 md:w-16 md:h-16 lg:w-32 lg:h-32 p-0 bg-transparent shadow-none hover:bg-gray-500/40 cursor-pointer transition"
          >
            <ChevronRight className="w-6 h-6 md:w-12 md:h-12 lg:size-32" strokeWidth={0.5} />
          </Button>
        </div>

        {/* Navigation Dots */}
        <div className="absolute bottom-2 md:bottom-4 left-0 right-0 flex justify-center space-x-1 md:space-x-2 z-20">
          {Array.from({ length: totalItems }).map((_, index) => (
            <button
              key={index}
              onClick={() => scrollToIndex(index)}
              className={`w-2 h-2 md:w-3 md:h-3 rounded-full cursor-pointer hover:bg-gray-50 transition ${
                currentIndex === index ? "bg-black w-4 md:w-6" : "bg-gray-300"
              }`}
            />
          ))}
        </div>

        {/* Title text */}
        <div className="absolute bottom-1 md:bottom-2 left-2 md:left-4 flex justify-start z-20 bg-gray-500/40 px-1 md:px-2 rounded">
          <div className="text-white text-base md:text-2xl font-bold truncate max-w-[80vw] md:max-w-[60vw]">{carouselItems[currentIndex]?.title}</div>
        </div>
      </div>

      <div className="w-full max-w-6xl mx-auto mt-6 md:mt-10">
        <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">诗单精选</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-4 md:mb-6">
          {poetrySelections.map((item) => (
            <div
              key={item.title}
              className="rounded-xl text-white p-4 md:p-6 flex flex-col justify-between min-h-[90px] md:min-h-[120px] cursor-pointer transition-all duration-200 hover:scale-[1.035] hover:brightness-110 hover:shadow-2xl"
              style={{ background: item.bg }}
              onClick={() => handleSelect(item.filter)}
            >
              <div className="text-lg md:text-xl font-semibold text-center mb-1 md:mb-2">{item.title}</div>
              <div className="text-center text-sm md:text-base opacity-90">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full max-w-6xl mx-auto mt-10">
        <h2 className="text-xl md:text-2xl font-bold mb-4 pb-2">诗句精选</h2>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
          {poetryContentList.map((item) => (
            <li
              key={item.title}
              className="flex flex-col md:flex-row md:justify-between md:items-center px-3 md:px-5 py-3 rounded-xl bg-white/80 hover:bg-gray-100 shadow-sm hover:shadow-md cursor-pointer transition-all duration-200"
              onClick={() => {
                const params = new URLSearchParams({ title: item.title }).toString();
                window.location.href = `/poetry?${params}`;
              }}
            >
              <span className="text-base md:text-lg text-gray-900">{item.content}</span>
              <span className="text-gray-500 text-sm md:text-base mt-1 md:mt-0 md:ml-4 whitespace-nowrap">
                —— {item.author}《{item.title}》
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
