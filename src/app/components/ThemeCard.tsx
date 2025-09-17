import { supabase } from "@/utils/supabaseClient";
import { useMount } from "ahooks";
import React, { useEffect, useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { HiPencil, HiX, HiCheck } from "react-icons/hi";

// 类型定义
export interface Reference {
  id: string;
  link: string;
  isSelected: boolean;
}

export interface ThemeCard {
  id: string;
  title: string;
  objectives: string[];
  references: Reference[][];
  duration: number;
  status: 0 | 1 | 2; // 0: 进行中, 1: 待开始, 2: 已完成
  order: number; // 添加顺序属性
}

// 拖拽类型
const ItemTypes = {
  CARD: "card",
};

// 单个卡片组件
interface CardProps {
  card: ThemeCard;
  index: number;
  moveCard?: (fromIndex: number, toIndex: number) => void;
  isEditing?: boolean;
  onCardClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  card,
  index,
  moveCard,
  isEditing = false,
  onCardClick,
}) => {
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.CARD,
    item: { index, id: card.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: isEditing && card.status === 1, // 只有在编辑模式下且状态为待开始才能拖拽
  });

  const [, drop] = useDrop({
    accept: ItemTypes.CARD,
    hover: (item: { index: number; id: string }) => {
      // 只有在编辑模式下且当前卡片状态为待开始时才允许排序
      if (isEditing && moveCard && item.index !== index && card.status === 1) {
        moveCard(item.index, index);
        item.index = index;
      }
    },
    canDrop: () => isEditing && card.status === 1,
  });

  // 根据卡片状态设置样式
  const getStatusClass = () => {
    if (isEditing && card.status !== 1) {
      return "opacity-60 cursor-not-allowed";
    }
    // 只在编辑模式下且状态为待开始时才显示移动光标
    const cursorClass =
      isEditing && card.status === 1 ? "cursor-move" : "cursor-pointer";
    return `${cursorClass} ${isDragging ? "opacity-50" : "opacity-100"}`;
  };

  return (
    <div
      ref={(node) => {
        if (isEditing && card.status === 1) {
          drag(drop(node));
        }
      }}
      className={`bg-white rounded-xl shadow-md overflow-hidden transition-all duration-200 ${getStatusClass()}`}
      onClick={onCardClick}
    >
      <div className="p-5 relative">
        <div className="absolute -top-[36px] md:-top-[24px] right-4 text-gray-300 text-[68px] md:text-[54px] font-semibold italic ">
          {card.order}
        </div>

        <h3 className="text-xl font-bold text-gray-800 mb-2">{card.title}</h3>
        <p className="text-gray-600 text-sm mb-4">
          {card?.objectives?.[0]} {/* 仅显示第一个目标作为预览 */}
        </p>
        <div className="flex justify-between items-center">
          <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
            {card.duration} 天
          </span>
          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            查看详情 &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};

interface CardListWithTitleProps {
  title: string;
  cards: ThemeCard[];
  moveCard?: (fromIndex: number, toIndex: number) => void;
  isEditing?: boolean;
  onCardClick?: (card: ThemeCard) => void;
}

const CardListWithTitle: React.FC<CardListWithTitleProps> = ({
  title,
  cards,
  moveCard,
  isEditing = false,
  onCardClick,
}) => {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-gray-800 mb-4">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <Card
            key={card.id}
            card={card}
            index={index}
            moveCard={moveCard}
            isEditing={isEditing}
            onCardClick={() => onCardClick?.(card)}
          />
        ))}
      </div>
    </div>
  );
};

// 总览组件
const Overview = () => {
  //   const initialCards: ThemeCard[] = [
  //     {
  //       id: "1",
  //       title: "纯黑白人物插图",
  //       objectives: ["掌握线条与灰度", "练习二分法", "提升勾线熟练度"],
  //       references: [[], []], // 简化
  //       duration: 10,
  //       status: 0, // 进行中
  //       order: 1,
  //     },
  //     {
  //       id: "2",
  //       title: "纯色彩练习",
  //       objectives: ["学习色彩搭配", "理解光影与色彩关系", "主观色彩处理"],
  //       references: [[], []], // 简化
  //       duration: 7,
  //       status: 1, // 待开始
  //       order: 3,
  //     },
  //     {
  //       id: "3",
  //       title: "人物构图练习",
  //       objectives: ["探索有趣构图", "模仿杂志风格", "融合多种思路"],
  //       references: [[], []], // 简化
  //       duration: 10,
  //       status: 1, // 待开始
  //       order: 4,
  //     },
  //     {
  //       id: "4",
  //       title: "风景速写",
  //       objectives: ["掌握透视原理", "练习构图技巧", "提升观察力"],
  //       references: [[], []],
  //       duration: 5,
  //       status: 2, // 已完成
  //       order: 0,
  //     },
  //     {
  //       id: "5",
  //       title: "动态人物练习",
  //       objectives: ["捕捉动态姿势", "理解人体结构", "提升速写能力"],
  //       references: [[], []],
  //       duration: 8,
  //       status: 1, // 待开始
  //       order: 2,
  //     },
  //     // ... 可以添加更多卡片
  //   ];

  const [cards, setCards] = useState<ThemeCard[]>([]);
  const [inProgressCards, setInProgressCards] = useState<ThemeCard[]>([]);
  const [pendingCards, setPendingCards] = useState<ThemeCard[]>([]);
  const [completedCards, setCompletedCards] = useState<ThemeCard[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  useMount(async () => {
    const { data, error } = (await supabase
      .from("theme")
      .select("*")
      .order("order", { ascending: true })) as { data: ThemeCard[] };
    try {
      // 分类卡片并按顺序排序
      const inProgress = data
        .filter((card) => card.status === 0)
        .sort((a, b) => a.order - b.order);
      const pending = data
        .filter((card) => card.status === 1)
        .sort((a, b) => a.order - b.order);
      const completed = data
        .filter((card) => card.status === 2)
        .sort((a, b) => a.order - b.order);
      setInProgressCards(inProgress);
      setPendingCards(pending);
      setCompletedCards(completed);
      setCards(data);
      console.log(data, inProgress, pending, completed);
    } catch (error) {
      console.log(error);
    }
  });

  const moveCard = (fromIndex: number, toIndex: number) => {
    // 创建新的卡片数组
    const newCards = [...cards];

    // 找到待开始状态的卡片
    const pendingCardsFiltered = newCards.filter((card) => card.status === 1);

    // 获取实际要移动的卡片
    const fromCard = pendingCardsFiltered[fromIndex];
    const toCard = pendingCardsFiltered[toIndex];

    // 交换它们的order值
    if (fromCard && toCard) {
      const fromOrder = fromCard.order;
      fromCard.order = toCard.order;
      toCard.order = fromOrder;

      // 按order重新排序
      newCards.sort((a, b) => a.order - b.order);
      setCards(newCards);
    }
  };

  const handleSave = () => {
    setIsEditing(false);
    // 这里可以添加保存逻辑
    console.log("保存更改:", cards);
  };

  const handleCardClick = (card: ThemeCard) => {
    if (!isEditing) {
      // 浏览模式下点击卡片跳转到详情页
      console.log("跳转到主题详情:", card.id);
      // 实际项目中可以使用 router.push(`/theme/${card.id}`)
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">百日画画计划</h1>
            {isEditing ? (
              <div className="flex space-x-2">
                <button
                  className="p-2 bg-gray-300 text-gray-800 rounded-full hover:bg-gray-400 cursor-pointer flex items-center justify-center"
                  onClick={() => setIsEditing(false)}
                >
                  <HiX className="h-6 w-6" />
                </button>
                <button
                  className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 cursor-pointer flex items-center justify-center"
                  onClick={handleSave}
                >
                  <HiCheck className="h-6 w-6" />
                </button>
              </div>
            ) : (
              <button
                className="p-2 rounded-full hover:bg-gray-200 cursor-pointer flex items-center justify-center"
                onClick={() => setIsEditing(true)}
              >
                <HiPencil className="h-6 w-6 text-gray-600" />
              </button>
            )}
          </div>

          {inProgressCards.length > 0 && (
            <CardListWithTitle
              title="进行中"
              cards={inProgressCards}
              isEditing={isEditing}
              onCardClick={handleCardClick}
            />
          )}

          {pendingCards.length > 0 && (
            <CardListWithTitle
              title="待开始"
              cards={pendingCards}
              moveCard={isEditing ? moveCard : undefined}
              isEditing={isEditing}
              onCardClick={handleCardClick}
            />
          )}

          {completedCards.length > 0 && (
            <CardListWithTitle
              title="已完成"
              cards={completedCards}
              isEditing={isEditing}
              onCardClick={handleCardClick}
            />
          )}
        </div>
      </div>
    </DndProvider>
  );
};

export default Overview;
