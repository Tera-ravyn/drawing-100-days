// page.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { useMediaQuery } from "react-responsive";
import Image from "next/image";
import { format } from "date-fns";
import { usePathname } from "next/navigation";

const DetailPage = () => {
  const date = usePathname().split("/").pop() ?? "";

  const [activeView, setActiveView] = useState<"theme_references" | "works">(
    "theme_references"
  );
  const refsRef = useRef<HTMLDivElement>(null);
  const worksRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery({ maxWidth: 768 });

  // 模拟图片数据
  const refsImages = Array.from(
    { length: 10 },
    (_, i) =>
      `https://images.weserv.nl/?url=https://picsum.photos/400/300?random=${i}`
  );
  const worksImages = Array.from(
    { length: 8 },
    (_, i) =>
      `https://images.weserv.nl/?url=https://picsum.photos/500/400?random=${
        100 + i
      }`
  );

  const scrollToSection = (section: "theme_references" | "works") => {
    setActiveView(section);
    const ref = section === "theme_references" ? refsRef : worksRef;
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // 自定义滚动条样式
  const scrollbarStyle = `
    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background-color: rgba(156, 163, 175, 0.5);
      border-radius: 3px;
      transition: background-color 0.2s ease-in-out;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background-color: rgba(156, 163, 175, 0.8);
    }
  `;

  return (
    <div className="min-h-screen bg-base-200">
      <style>{scrollbarStyle}</style>

      {/* 顶部切换控件 */}
      <div className="sticky top-0 z-10 bg-base-100 p-4 shadow-md">
        <div className="flex justify-between items-center">
          <label className="swap swap-rotate bg-gray-100 rounded-md py-2 px-3 hover:bg-gray-200 transition duration-300">
            <input type="checkbox" />
            <div className="swap-on">参考资料</div>
            <div className="swap-off">作品详情</div>
          </label>
          <h1 className="text-xl font-bold">{format(date, "yyyy-mm-dd")}</h1>
          <div></div> {/* 占位元素保持居中 */}
        </div>
      </div>

      {/* 响应式布局 */}
      {isMobile ? (
        // 移动端垂直布局
        <div className="container mx-auto p-4">
          <div ref={refsRef} className="mb-8">
            <h2 className="text-2xl font-bold mb-4 pb-2 border-b">参考资料</h2>
            <div className="grid grid-cols-2 gap-4">
              {refsImages.map((src, index) => (
                <div
                  key={index}
                  className="bg-base-100 rounded-box overflow-hidden shadow"
                >
                  <div className="relative w-full h-48">
                    <Image
                      src={src}
                      alt={`参考图 ${index + 1}`}
                      fill
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                      className="object-cover"
                      priority={index < 2}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div ref={worksRef}>
            <h2 className="text-2xl font-bold mb-4 pb-2 border-b">作品展示</h2>
            <div className="grid grid-cols-1 gap-6">
              {worksImages.map((src, index) => (
                <div
                  key={index}
                  className="bg-base-100 rounded-box overflow-hidden shadow"
                >
                  <div className="relative w-full h-96">
                    <Image
                      src={src}
                      alt={`作品 ${index + 1}`}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                      priority={index < 2}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        // 桌面端左右分屏
        <div className="flex h-[calc(100vh-80px)]">
          {/* 左侧参考资料面板 */}
          <div
            className="w-1/2 p-4 custom-scrollbar overflow-y-auto"
            onMouseEnter={(e) =>
              e.currentTarget.classList.add("overflow-y-scroll")
            }
            onMouseLeave={(e) =>
              e.currentTarget.classList.remove("overflow-y-scroll")
            }
          >
            <h2 className="text-2xl font-bold mb-4 pb-2 border-b">参考资料</h2>
            <div className="grid grid-cols-2 gap-4">
              {refsImages.map((src, index) => (
                <div
                  key={index}
                  className="bg-base-100 rounded-box overflow-hidden shadow"
                >
                  <div className="relative w-full h-48">
                    <Image
                      src={src}
                      alt={`参考图 ${index + 1}`}
                      fill
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                      className="object-cover"
                      priority={index < 2}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 右侧作品面板 */}
          <div
            className="w-1/2 p-4 custom-scrollbar overflow-y-auto"
            onMouseEnter={(e) =>
              e.currentTarget.classList.add("overflow-y-scroll")
            }
            onMouseLeave={(e) =>
              e.currentTarget.classList.remove("overflow-y-scroll")
            }
          >
            <h2 className="text-2xl font-bold mb-4 pb-2 border-b">作品展示</h2>
            <div className="grid grid-cols-1 gap-6">
              {worksImages.map((src, index) => (
                <div
                  key={index}
                  className="bg-base-100 rounded-box overflow-hidden shadow"
                >
                  <div className="relative w-full h-96">
                    <Image
                      src={src}
                      alt={`作品 ${index + 1}`}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                      priority={index < 2}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetailPage;
