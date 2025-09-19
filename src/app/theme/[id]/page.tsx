"use client";

import React, { use, useState } from "react";
import { ThemeCard, Reference } from "../../data/theme";
import { useMount } from "ahooks";
import { supabase } from "@/utils/supabaseClient";
import { usePathname } from "next/navigation";
import { HiCheck, HiPencil, HiPlus, HiTrash, HiX } from "react-icons/hi";
import Image from "next/image";

interface ThemeDetailPageProps {
  theme: ThemeCard;
}

const ThemeDetailPage: React.FC<ThemeDetailPageProps> = ({ theme }) => {
  const id = usePathname().split("/").pop();
  const [isEditing, setIsEditing] = useState(false);
  const [themeData, setThemeData] = useState<ThemeCard>(theme);
  const [galleryMode, setGalleryMode] = useState<boolean[]>(
    Array(themeData?.references?.length ?? 1).fill(false)
  );

  useMount(async () => {
    const { data } = await supabase
      .from("themes")
      .select("*")
      .eq("id", id)
      .single();
    try {
      setThemeData(data);
    } catch (error) {
      console.log(error);
    }
  });

  const handleReferenceChange = (
    dayIndex: number,
    refIndex: number,
    link: string
  ) => {
    const updatedReferences = [...themeData.references];
    updatedReferences[dayIndex][refIndex].link = link;
    setThemeData({ ...themeData, references: updatedReferences });
  };

  const toggleGalleryMode = (dayIndex: number) => {
    const newGalleryMode = [...galleryMode];
    newGalleryMode[dayIndex] = !newGalleryMode[dayIndex];
    setGalleryMode(newGalleryMode);

    // 如果关闭图集模式，只保留第一个参考链接
    if (
      !newGalleryMode[dayIndex] &&
      themeData.references[dayIndex].length > 1
    ) {
      const updatedReferences = [...themeData.references];
      updatedReferences[dayIndex] = [updatedReferences[dayIndex][0]];
      setThemeData({ ...themeData, references: updatedReferences });
    }
  };

  const addReferenceToDay = (dayIndex: number) => {
    const updatedReferences = [...themeData.references];
    updatedReferences[dayIndex].push({
      id: Date.now().toString(),
      link: "",
      isSelected: false,
    });
    setThemeData({ ...themeData, references: updatedReferences });
  };

  const submitTheme = async () => {
    try {
      const { success } = await submitReferences();
      if (success) {
        const { error } = await supabase
          .from("themes")
          .update(themeData)
          .eq("id", id);

        if (error) {
          console.error("Error updating theme:", error);
          return { success: false, error };
        }
      }
    } catch (error) {
      console.log(error);
    }
    return { success: true };
  };

  const submitReferences = async () => {
    const finalReferences = themeData.references.flat();

    try {
      // 步骤 1: 获取当前状态
      const { data: currentRefs, error: fetchError } = await supabase
        .from("theme_references")
        .select("id")
        .eq("theme_id", id);

      if (fetchError) throw fetchError;

      const currentIds = new Set(currentRefs.map((ref) => ref.id));

      // 步骤 2: Upsert 新的/修改的 references
      const referencesToUpsert = finalReferences.map((ref) => ({
        link: ref.link,
        is_selected: ref.isSelected,
        theme_id: id,
      }));

      const { error: upsertError } = await supabase
        .from("theme_references")
        .upsert(referencesToUpsert, { onConflict: "id" });

      if (upsertError) throw upsertError; // 如果 upsert 失败，抛出错误

      // 步骤 3: 删除被移除的 references
      const submittedIdsWithId = new Set(
        finalReferences.filter((ref) => ref.id).map((ref) => ref.id)
      );

      const idsToDelete = [...currentIds].filter(
        (id) => !submittedIdsWithId.has(id)
      );

      if (idsToDelete.length > 0) {
        const { error: deleteError } = await supabase
          .from("theme_references")
          .delete()
          .in("id", idsToDelete);

        if (deleteError) throw deleteError; // 如果删除失败，抛出错误
      }

      // 如果所有步骤都成功，返回成功
      return { success: true };
    } catch (error) {
      console.error("Error in submitReferences:", error);
      return { success: false, error };
    }
  };

  const handleSave = async () => {
    try {
      await submitTheme();
      setIsEditing(false);
      console.log("保存更改:");
    } catch (error) {
      console.log(error);
    }
  };
  const handleNewObjective = () => {
    setThemeData({
      ...themeData,
      objectives: [...(themeData?.objectives ?? []), ""],
    });
  };

  const handleNewReference = () => {
    const newReference = { id: "", isSelected: false, link: "" } as Reference;
    setThemeData({
      ...themeData,
      references: [...(themeData?.references ?? []), [newReference]],
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6 flex flex-col gap-y-6">
          {themeData ? (
            <React.Fragment>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-x-4">
                  <h1 className="text-3xl font-bold text-gray-800">
                    {themeData.title}
                  </h1>
                  <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded">
                    {themeData.duration} 天
                  </span>
                </div>
                {isEditing ? (
                  <div className="flex gap-x-2">
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
              <h2 className="text-xl font-semibold text-gray-700">学习目标</h2>
              {isEditing ? (
                <React.Fragment>
                  <div className="flex flex-col gap-y-4">
                    {themeData?.objectives?.map((objective, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-x-4 transition-opacity duration-300"
                      >
                        <input
                          type="text"
                          value={objective}
                          onChange={(e) => {
                            const newObjectives = [...themeData.objectives];
                            newObjectives[index] = e.target.value;
                            setThemeData({
                              ...themeData,
                              objectives: newObjectives,
                            });
                          }}
                          className="flex-1 bg-gray-100 rounded-md px-3 py-2 focus:outline-none  focus:bg-gray-200 transition-all duration-200"
                          placeholder="请输入学习目标"
                        />
                        <button
                          onClick={() => {
                            const newObjectives = [...themeData.objectives];
                            newObjectives.splice(index, 1);
                            setThemeData({
                              ...themeData,
                              objectives: newObjectives,
                            });
                          }}
                          className="group cursor-pointer ml-2 p-2 bg-gray-200 text-white rounded-full hover:bg-red-500 transition-colors duration-200"
                        >
                          <HiTrash className="h-5 w-5 text-gray-500 group-hover:text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                  {isEditing && (
                    <button
                      onClick={handleNewObjective}
                      className="cursor-pointer  px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition duration-300 flex items-center gap-x-2 w-fit"
                    >
                      <HiPlus className="flex-shrink-0" />
                      <span>添加新的学习目标</span>
                    </button>
                  )}
                </React.Fragment>
              ) : (
                <ul className="list-disc pl-5 space-y-2">
                  {themeData?.objectives?.map((objective, index) => (
                    <li key={index} className="text-gray-600">
                      {objective}
                    </li>
                  ))}
                </ul>
              )}
              <div>
                <h2 className="text-xl font-semibold text-gray-700">
                  参考资料
                </h2>

                {themeData?.references?.map((dayReferences, dayIndex) => (
                  <div
                    key={dayIndex}
                    className="border-b border-gray-200 py-6 last:border-b-0"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-gray-800">
                        第 {dayIndex + 1} 天
                      </h3>
                      {isEditing && (
                        <button
                          onClick={() => toggleGalleryMode(dayIndex)}
                          className={`cursor-pointer px-3 py-1 rounded text-sm transition duration-200 ${
                            galleryMode[dayIndex]
                              ? "bg-red-100 text-red-700 hover:bg-red-200"
                              : "bg-green-100 text-green-700 hover:bg-green-200"
                          }`}
                        >
                          {galleryMode[dayIndex]
                            ? "关闭图集模式"
                            : "开启图集模式"}
                        </button>
                      )}
                    </div>

                    {isEditing ? (
                      <div className="space-y-3">
                        {dayReferences.link.map((reference, refIndex) => (
                          <div key={reference} className="flex items-center">
                            <input
                              type="text"
                              value={reference}
                              onChange={(e) =>
                                handleReferenceChange(
                                  dayIndex,
                                  refIndex,
                                  e.target.value
                                )
                              }
                              placeholder="请输入参考链接"
                              className="flex-1 bg-gray-100 rounded-md px-3 py-2 focus:outline-none  focus:bg-gray-200 transition-all duration-200"
                            />
                            {galleryMode[dayIndex] &&
                              dayReferences.length > 1 && (
                                <button
                                  onClick={() => {
                                    const newReferences = [
                                      ...themeData.references,
                                    ];
                                    newReferences[dayIndex].splice(refIndex, 1);
                                    setThemeData({
                                      ...themeData,
                                      references: newReferences,
                                    });
                                  }}
                                  className="group cursor-pointer ml-2 p-2 bg-gray-200 text-white rounded-full hover:bg-red-500 transition-colors duration-200"
                                >
                                  <HiTrash className="h-5 w-5 text-gray-500 group-hover:text-white" />
                                </button>
                              )}
                          </div>
                        ))}
                        {galleryMode[dayIndex] && (
                          <button
                            onClick={() => addReferenceToDay(dayIndex)}
                            className="cursor-pointer mt-2 px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition duration-00"
                          >
                            添加参考链接
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {dayReferences.map((reference, refIndex) => (
                          <div
                            key={reference.id}
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                          >
                            <Image
                              src={`https://images.weserv.nl/?url=${reference.link}`}
                              layout="fill"
                              alt={`参考资料${refIndex + 1}`}
                            />
                          </div>
                          // <div key={reference.id}>
                          //   <a
                          //     href={reference.link}
                          //     target="_blank"
                          //     rel="noopener noreferrer"
                          //     className="text-blue-500 hover:text-blue-700 hover:underline"
                          //   >
                          //     参考资料 {refIndex + 1}
                          //   </a>
                          // </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {isEditing && (
                <button
                  onClick={handleNewReference}
                  className="cursor-pointer px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition duration-300 flex items-center gap-x-2 w-fit"
                >
                  <HiPlus className="flex-shrink-0" />
                  <span>添加新的参考资料</span>
                </button>
              )}
            </React.Fragment>
          ) : (
            <div className="flex  flex-col gap-4">
              <div className="skeleton h-32 w-full"></div>
              <div className="skeleton h-4 w-28"></div>
              <div className="skeleton h-4 w-full"></div>
              <div className="skeleton h-4 w-full"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ThemeDetailPage;
