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

  return (
    <div className='w-full flex justify-center'>
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
                      w-full
                      h-full
                      object-cover
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
    </div>
  );
}
