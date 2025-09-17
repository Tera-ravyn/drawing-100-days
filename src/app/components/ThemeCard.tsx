import React, { useState } from "react";
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
  showIndex?: boolean; // 是否显示序号
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
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: isEditing && card.status === 1, // 只有在编辑模式下且状态为待开始才能拖拽
  });

  const [, drop] = useDrop({
    accept: ItemTypes.CARD,
    hover: (item: { index: number }) => {
      if (moveCard && item.index !== index && card.status === 1) {
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
    return isDragging ? "opacity-50" : "opacity-100";
  };

  return (
    <div
      ref={(node) => {
        if (isEditing && card.status === 1) {
          drag(drop(node));
        }
      }}
      className={`bg-white rounded-xl shadow-md overflow-hidden cursor-move transition-all duration-200 ${getStatusClass()}`}
      onClick={onCardClick}
    >
      <div className="p-5 relative">
        <div className="absolute -top-[36px] md:-top-[24px] right-4 text-gray-300 text-[68px] md:text-[54px] font-semibold italic ">
          {card.order + 1}
        </div>

        <h3 className="text-xl font-bold text-gray-800 mb-2">{card.title}</h3>
        <p className="text-gray-600 text-sm mb-4">
          {card.objectives[0]} {/* 仅显示第一个目标作为预览 */}
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
            showIndex={title === "待开始"}
          />
        ))}
      </div>
    </div>
  );
};

// 总览组件
const Overview: React.FC = () => {
  const initialCards: ThemeCard[] = [
    {
      id: "1",
      title: "纯黑白人物插图",
      objectives: ["掌握线条与灰度", "练习二分法", "提升勾线熟练度"],
      references: [[], []], // 简化
      duration: 10,
      status: 0, // 进行中
      order: 1,
    },
    {
      id: "2",
      title: "纯色彩练习",
      objectives: ["学习色彩搭配", "理解光影与色彩关系", "主观色彩处理"],
      references: [[], []], // 简化
      duration: 7,
      status: 1, // 待开始
      order: 3,
    },
    {
      id: "3",
      title: "人物构图练习",
      objectives: ["探索有趣构图", "模仿杂志风格", "融合多种思路"],
      references: [[], []], // 简化
      duration: 10,
      status: 1, // 待开始
      order: 4,
    },
    {
      id: "4",
      title: "风景速写",
      objectives: ["掌握透视原理", "练习构图技巧", "提升观察力"],
      references: [[], []],
      duration: 5,
      status: 2, // 已完成
      order: 0,
    },
    {
      id: "5",
      title: "动态人物练习",
      objectives: ["捕捉动态姿势", "理解人体结构", "提升速写能力"],
      references: [[], []],
      duration: 8,
      status: 1, // 待开始
      order: 2,
    },
    // ... 可以添加更多卡片
  ];

  const [cards, setCards] = useState<ThemeCard[]>(initialCards);
  const [isEditing, setIsEditing] = useState(false);

  // 分类卡片并按顺序排序
  const inProgressCards = cards
    .filter((card) => card.status === 0)
    .sort((a, b) => a.order - b.order);
  const pendingCards = cards
    .filter((card) => card.status === 1)
    .sort((a, b) => a.order - b.order);
  const completedCards = cards
    .filter((card) => card.status === 2)
    .sort((a, b) => a.order - b.order);

  const moveCard = (fromIndex: number, toIndex: number) => {
    // 只允许移动待开始列表中的卡片
    const pendingCardIds = pendingCards.map((card) => card.id);
    const actualFromIndex = cards.findIndex(
      (card) => card.id === pendingCardIds[fromIndex]
    );
    const actualToIndex = cards.findIndex(
      (card) => card.id === pendingCardIds[toIndex]
    );

    const updatedCards = [...cards];
    const [movedCard] = updatedCards.splice(actualFromIndex, 1);
    updatedCards.splice(actualToIndex, 0, movedCard);
    setCards(updatedCards);
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
                  <HiX className="h-5 w-5" />
                </button>
                <button
                  className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 cursor-pointer flex items-center justify-center"
                  onClick={handleSave}
                >
                  <HiCheck className="h-5 w-5" />
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

          <CardListWithTitle
            title="进行中"
            cards={inProgressCards}
            isEditing={isEditing}
            onCardClick={handleCardClick}
          />

          <CardListWithTitle
            title="待开始"
            cards={pendingCards}
            moveCard={isEditing ? moveCard : undefined}
            isEditing={isEditing}
            onCardClick={handleCardClick}
          />

          <CardListWithTitle
            title="已完成"
            cards={completedCards}
            isEditing={isEditing}
            onCardClick={handleCardClick}
          />
        </div>
      </div>
    </DndProvider>
  );
};

export default Overview;
