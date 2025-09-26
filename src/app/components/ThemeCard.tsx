import { supabase } from "@/utils/supabaseClient";
import { useMount } from "ahooks";
import React, { useEffect, useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { HiPencil, HiX, HiCheck, HiPlus } from "react-icons/hi";
import { ThemeCard } from "../data/theme";
import { useRouter } from "next/navigation";
import NewThemeForm from "./NewTheme";
import toast from "react-hot-toast";

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
    canDrag: isEditing && card.status === 0, // 只有在编辑模式下且状态为待开始才能拖拽
  });

  const [, drop] = useDrop({
    accept: ItemTypes.CARD,
    hover: (item: { index: number; id: string }) => {
      // 只有在编辑模式下且当前卡片状态为待开始时才允许排序
      if (isEditing && moveCard && item.index !== index && card.status === 0) {
        moveCard(item.index, index);
        item.index = index;
      }
    },
    canDrop: () => isEditing && card.status === 0,
  });

  // 根据卡片状态设置样式
  const getStatusClass = () => {
    if (isEditing && card.status !== 0) {
      return "opacity-60 cursor-not-allowed";
    }
    // 只在编辑模式下且状态为待开始时才显示移动光标
    const cursorClass =
      isEditing && card.status === 0 ? "cursor-move" : "cursor-pointer";
    return `${cursorClass} ${isDragging ? "opacity-50" : "opacity-100"}`;
  };

  return (
    <div
      ref={(node) => {
        if (isEditing && card.status === 0) {
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
  const [pendingBackup, setPendingBackup] = useState<ThemeCard[]>([]);
  const [inProgressCards, setInProgressCards] = useState<ThemeCard[]>([]);
  const [pendingCards, setPendingCards] = useState<ThemeCard[]>([]);
  const [completedCards, setCompletedCards] = useState<ThemeCard[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  useMount(async () => {
    await refresh();
  });

  const moveCard = (fromIndex: number, toIndex: number) => {
    const newPendingCards = [...pendingCards];

    // 取出要移动的卡片
    const [movedCard] = newPendingCards.splice(fromIndex, 1);

    // 将卡片插入到新位置
    newPendingCards.splice(toIndex, 0, movedCard);

    // 重新计算所有待开始卡片的order值，确保连续性
    const updatedPendingCards = newPendingCards.map((card, index) => ({
      ...card,
      order: index + inProgressCards.length + 1, // 确保order值正确连续
    }));

    // 更新状态
    setPendingCards(updatedPendingCards);
  };

  const refresh = async () => {
    const { data } = (await supabase
      .from("themes")
      .select("*")
      .order("order", { ascending: true })) as { data: ThemeCard[] };
    try {
      const index = data.findIndex((card) => card.status === 1);
      const pending = data.splice(index + 1);
      const inProgress = data.splice(index, 1);
      const completed = data.splice(0, index);
      setInProgressCards(inProgress);
      setPendingCards(pending);
      setCompletedCards(completed);
      setPendingBackup(pending);
    } catch (error) {
      console.log(error);
    }
  };

  const handleSave = async () => {
    const updateCards = pendingCards.map((card) => ({
      id: card.id,
      order: card.order,
    }));
    // 发送到后端
    const { error } = await supabase.rpc("save_theme_with_references", {
      data_param: updateCards,
    });

    if (error) {
      console.error("保存失败:", error);
    } else {
      toast.success("保存成功");
      console.log("保存成功:", updateCards);
    }
    setIsEditing(false);
  };

  const handleCardClick = (card: ThemeCard) => {
    if (!isEditing) {
      router.push(`/theme/${card.id}`);
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">百日画画计划</h1>
            {isEditing ? (
              <div className="flex space-x-4">
                <button
                  className="p-2 text-gray-800 rounded-full bg-gray-200 hover:bg-gray-300 cursor-pointer flex items-center justify-center transition duration-300"
                  onClick={() => {
                    setIsEditing(false);
                    setPendingCards(pendingBackup);
                  }}
                >
                  <HiX className="h-6 w-6" />
                </button>
                <button
                  className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 cursor-pointer flex items-center justify-center transition duration-300"
                  onClick={handleSave}
                >
                  <HiCheck className="h-6 w-6" />
                </button>
              </div>
            ) : (
              <div className="flex gap-x-4">
                <button
                  className="p-2 text-lg rounded-full bg-gray-200 hover:bg-gray-300 cursor-pointer flex items-center justify-center transition duration-300"
                  onClick={() => setIsEditing(true)}
                >
                  <HiPencil className="h-6 w-6" />
                </button>
                <button
                  onClick={() =>
                    document?.getElementById("new_theme")?.showModal()
                  }
                  className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 cursor-pointer flex items-center justify-center transition duration-300"
                >
                  <HiPlus className="h-6 w-6 text-white" />
                </button>
                <dialog id="new_theme" className="modal">
                  <div className="modal-box w-11/12 max-w-5xl">
                    <div className="py-4">
                      <NewThemeForm
                        onSubmit={refresh}
                        onCancel={() =>
                          document?.getElementById("new_theme")?.close()
                        }
                      />
                    </div>
                  </div>
                </dialog>
              </div>
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
