'use client'

import { useState, useEffect } from "react";
import Image, { type ImageProps } from "next/image";
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation"

type Props = Omit<ImageProps, "src"> & {
  srcLight: string;
  srcDark: string;
};

const carouselItems = [
  {
    src: "https://img2.utuku.imgcdc.com/uploadimg/gushici/20230823/97854999-9a48-4c4b-ad2e-d65340bae59f.jpg",
    title: "处暑无三日，新凉直万金 | 处暑",
  },
  {
    src: "https://img2.utuku.imgcdc.com/uploadimg/gushici/20230822/8822a76b-1e99-47aa-a933-f50cef3e3e03.jpg",
    title: "七夕 | 在古诗词中读懂中国式浪漫",
  },
  {
    src: "https://img2.utuku.imgcdc.com/uploadimg/gushici/20230816/77847fc9-ac8f-4ade-9914-ce7e3b089912.jpg",
    title: "四面垂杨十里荷，问云何处最花多",
  },
  {
    src: "https://img1.utuku.imgcdc.com/uploadimg/gushici/20230811/2a10254d-0fc1-4f6b-b077-642d178afa2a.jpg",
    title: "秋夜长，风急雨急，雨急风急，秋夜长 | 秋夜",
  },
  {
    src: "https://img2.utuku.imgcdc.com/uploadimg/gushici/20230808/9fa3ea33-43a1-4e6d-9da9-4f441a0f8361.jpg",
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
    author: "李商隱",
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
  
  useEffect(() => {
    if (!carouselApi) return;

    const updateCarouselState = () => {
      setCurrentIndex(carouselApi.selectedScrollSnap());
      setTotalItems(carouselApi.scrollSnapList().length);
    };

    updateCarouselState();

    carouselApi.on("select", updateCarouselState);

    return () => {
      carouselApi.off("select", updateCarouselState); // Clean up on unmount
    };
  }, [carouselApi]);

  const scrollToIndex = (index: number) => {
    carouselApi?.scrollTo(index);
  };

  const router = useRouter();

  const handleSelect = (filter: any) => {
    const params = new URLSearchParams(filter).toString();
    router.push(`/poetry?${params}`);
  };

  return (
    <div className='w-full flex flex-col justify-center'>
      <div className="w-full relative h-96 max-h-[500px] mx-auto mt-5 max-w-6xl lg:mt-6">
        <Carousel
          setApi={setCarouselApi}
          opts={{ loop: true }}
          className="w-full max-w-6xl h-96 max-h-[500px] z-10"
        >
          <CarouselContent>
            {carouselItems.map((item) => (
              <CarouselItem key={item.src}>
                <Card className="bg-gray-400 px-0 py-0">
                  <CardContent className="flex items-center justify-center h-96 max-h-[500px] px-0 py-0">
                    <img
                      src={item.src}
                      alt={item.title}
                      object-cover
                      className="w-full h-full rounded-xl"
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
            className="pointer-events-auto rounded-full w-32 h-32 p-0 bg-transparent shadow-none hover:bg-gray-500/40 cursor-pointer"
          >
            <ChevronLeft className="size-32" strokeWidth={0.5} />
          </Button>
          <Button
            onClick={() => scrollToIndex(currentIndex + 1)}
            className="pointer-events-auto rounded-full w-32 h-32 p-0 bg-transparent shadow-none hover:bg-gray-500/40 cursor-pointer"
          >
            <ChevronRight className="size-32" strokeWidth={0.5} />
          </Button>
        </div>

        {/* Navigation Dots */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2 z-20">
          {Array.from({ length: totalItems }).map((_, index) => (
            <button
              key={index}
              onClick={() => scrollToIndex(index)}
              className={`w-3 h-3 rounded-full cursor-pointer hover:bg-gray-50 ${
                currentIndex === index ? "bg-black w-6" : "bg-gray-300"
              }`}
            />
          ))}
        </div>

        {/* Title text */}
        <div className="absolute bottom-2 left-4 flex justify-start z-20 bg-gray-500/40 px-2">
          <div className="text-white text-2xl font-bold">{carouselItems[currentIndex]?.title}</div>
        </div>
      </div>

      <div className="w-full max-w-6xl mx-auto mt-10">
        <h2 className="text-2xl font-bold mb-6">诗单精选</h2>
        <div className="grid grid-cols-3 gap-6 mb-6">
          {poetrySelections.slice(0, 3).map((item, idx) => (
            <div
              key={item.title}
              className="rounded text-white p-6 flex flex-col justify-between min-h-[120px] cursor-pointer transition-shadow hover:shadow-lg"
              style={{ background: item.bg }}
              onClick={() => handleSelect(item.filter)}
            >
              <div className="text-xl font-semibold text-center mb-2">{item.title}</div>
              <div className="text-center text-base opacity-90">{item.desc}</div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-6 mb-6">
          {poetrySelections.slice(3).map((item, idx) => (
            <div
              key={item.title}
              className="rounded text-white p-6 flex flex-col justify-between min-h-[120px] cursor-pointer transition-shadow hover:shadow-lg"
              style={{ background: item.bg }}
              onClick={() => handleSelect(item.filter)}
            >
              <div className="text-xl font-semibold text-center mb-2">{item.title}</div>
              <div className="text-center text-base opacity-90">{item.desc}</div>
            </div>
          ))}
        </div>
        
      </div>

      <div className="w-full max-w-6xl mx-auto mt-10">
        <h2 className="text-2xl font-bold mb-4 pb-2">诗句精选</h2>
        <ul className="grid grid-cols-1 gap-2">
          {poetryContentList.map((item, idx) => (
            <li
              key={idx}
              className="flex justify-between items-center px-2 py-2 rounded hover:bg-gray-50 cursor-pointer transition"
              onClick={() => {
                const params = new URLSearchParams({ title: item.title }).toString();
                window.location.href = `/poetry?${params}`;
              }}
            >
              <span className="text-base">{item.content}</span>
              <span className="text-gray-500 text-sm ml-4 whitespace-nowrap">
                —— {item.author}《{item.title}》
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
