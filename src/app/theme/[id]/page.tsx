// page.tsx
"use client";

import React, { useState } from "react";
import { ThemeCard, Reference } from "../../data/theme";
import { useMount } from "ahooks";
import { supabase } from "@/utils/supabaseClient";
import { usePathname, useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";
import {
  HiCheck,
  HiHome,
  HiPencil,
  HiPlus,
  HiTrash,
  HiX,
} from "react-icons/hi";
import Image from "next/image";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";

interface ThemeDetailPageProps {
  theme: ThemeCard;
}

const ThemeDetailPage: React.FC<ThemeDetailPageProps> = ({ theme }) => {
  const id = usePathname().split("/").pop();
  const [isEditing, setIsEditing] = useState(false);
  const [themeData, setThemeData] = useState<ThemeCard>(theme);
  const [user, setUser] = useState<User>();
  const router = useRouter();

  useMount(async () => {
    // 获取当前用户信息
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) setUser(user);

    const { data } = await supabase
      .from("themes")
      .select("*,theme_references(*)")
      .eq("id", id)
      .single();
    try {
      setThemeData(data);
    } catch (error) {
      console.log(error);
    }
  });

  const handleRemarkChange = (dayIndex: number, remark: string) => {
    const updatedReferences = [...themeData.theme_references];
    updatedReferences[dayIndex].remark = remark;
    setThemeData({ ...themeData, theme_references: updatedReferences });
  };

  const handleReferenceChange = (
    dayIndex: number,
    linkIndex: number,
    link: string
  ) => {
    const updatedReferences = [...themeData.theme_references];
    updatedReferences[dayIndex].link[linkIndex] = link;
    setThemeData({ ...themeData, theme_references: updatedReferences });
  };

  const addReferenceToDay = (dayIndex: number) => {
    const updatedReferences = [...themeData.theme_references];
    updatedReferences[dayIndex].link.push("");
    setThemeData({ ...themeData, theme_references: updatedReferences });
  };

  const deleteReferenceToDay = (dayIndex: number) => {
    const updatedReferences = [...themeData.theme_references];
    updatedReferences.slice(dayIndex, 1);
    setThemeData({ ...themeData, theme_references: updatedReferences });
  };

  const submitTheme = async () => {
    try {
      const { data, error } = await supabase.rpc("save_theme_with_references", {
        data_param: themeData,
      });

      if (error) {
        console.error("Error updating theme:", error);
        return { success: false, error };
      }
    } catch (error) {
      console.log(error);
    }
    return { success: true };
  };

  const handleSave = async () => {
    try {
      const res = await submitTheme();
      if (res.success) {
        setIsEditing(false);
        toast.success("主题保存成功");
      } else {
        toast.error(res.error?.message as string);
      }
    } catch (error) {
      toast.error(error as string);
      console.log(error);
    }
  };
  const handleDelete = async () => {
    const { data, error } = await supabase.rpc("delete_theme", {
      theme_id_param: id,
    });
    if (error) console.error(error);
    else {
      router.push("/");
    }
  };
  const handleNewObjective = () => {
    setThemeData({
      ...themeData,
      objectives: [...(themeData?.objectives ?? []), ""],
    });
  };

  const handleNewReference = () => {
    const newReference = { is_selected: false, link: [""] } as Reference;
    setThemeData({
      ...themeData,
      theme_references: [...(themeData?.theme_references ?? []), newReference],
    });
  };

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDuration = parseInt(e.target.value);
    setThemeData({ ...themeData, duration: newDuration });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4">
      <Link href="/">
        <button className="mx-4 mb-4 p-4 bg-gray-100 text-gray-800 flex gap-x-2 items-center justify-around rounded-full hover:bg-gray-300 cursor-pointer transition duration-300">
          <HiHome className="h-6 w-6 " />
          回到主页
        </button>
      </Link>
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6 flex flex-col gap-y-6">
          {themeData ? (
            <React.Fragment>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-x-4">
                  <h1 className="text-3xl font-bold text-gray-800">
                    {themeData.title}
                  </h1>
                  {isEditing ? (
                    <label>
                      <input
                        type="number"
                        onChange={handleDurationChange}
                        value={themeData.duration}
                        className="w-16 bg-gray-100 rounded-md px-3 text-sm py-2 mx-3 focus:outline-none focus:bg-gray-200 transition-all duration-200"
                      />
                      天
                    </label>
                  ) : (
                    <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded">
                      {themeData.duration} 天
                    </span>
                  )}
                </div>
                {isEditing ? (
                  <div className="flex gap-x-2">
                    <button
                      className="group p-2 bg-gray-300 text-gray-800 rounded-full hover:bg-red-400 cursor-pointer flex items-center justify-center transition duration-300"
                      onClick={() =>
                        document?.getElementById("confirm_delete")?.showModal()
                      }
                    >
                      <HiTrash className="h-6 w-6 hover:text-white" />
                    </button>
                    <dialog id="confirm_delete" className="modal">
                      <div className="modal-box w-80">
                        <p className="py-4">确定要删除吗？</p>
                        <div className="modal-action">
                          <form
                            method="dialog"
                            className="flex items-center justify-between w-full"
                          >
                            <button className="bg-gray-300 px-6 py-2 rounded-full hover:bg-gray-400 cursor-pointer flex items-center justify-center transition duration-300">
                              取消
                            </button>
                            <button
                              onClick={handleDelete}
                              className="bg-red-500 px-6 py-2 text-white rounded-full hover:bg-red-400 cursor-pointer flex items-center justify-center transition duration-300"
                            >
                              确定
                            </button>
                          </form>
                        </div>
                      </div>
                    </dialog>
                    <button
                      className="p-2 bg-gray-300 text-gray-800 rounded-full hover:bg-gray-400 cursor-pointer flex items-center justify-center transition duration-300"
                      onClick={() => setIsEditing(false)}
                    >
                      <HiX className="h-6 w-6" />
                    </button>
                    <button
                      className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-700 cursor-pointer flex items-center justify-center transition duration-300"
                      onClick={handleSave}
                    >
                      <HiCheck className="h-6 w-6" />
                    </button>
                  </div>
                ) : (
                  user && ( // 只有登录用户才能看到编辑按钮
                    <button
                      className="p-2 rounded-full hover:bg-gray-200 cursor-pointer flex items-center justify-center"
                      onClick={() => setIsEditing(true)}
                    >
                      <HiPencil className="h-6 w-6 text-gray-600" />
                    </button>
                  )
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
                          className="flex-1 bg-gray-100 rounded-md px-3 py-2 focus:outline-none focus:bg-gray-200 transition-all duration-200"
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

                {themeData?.theme_references?.map((dayReferences, dayIndex) => (
                  <div
                    key={dayIndex}
                    className="border-b border-gray-200 py-4 last:border-b-0"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-x-2 justify-start">
                        <h3 className="text-lg font-bold text-gray-800">
                          {dayIndex + 1}
                        </h3>
                        {dayReferences.is_selected && (
                          <div className="rounded-md px-2 py-1 text-xs bg-sky-100 text-gray-500 ">
                            已使用
                          </div>
                        )}
                      </div>
                      {isEditing && !dayReferences.is_selected && (
                        <div className="flex items-center gap-x-2">
                          {themeData?.theme_references?.length > 1 && (
                            <button
                              onClick={() => deleteReferenceToDay(dayIndex)}
                              className="group cursor-pointer p-2 bg-gray-200 text-white rounded-full hover:bg-red-500 transition-colors duration-200"
                            >
                              <HiTrash className="h-5 w-5 text-gray-500 group-hover:text-white" />
                            </button>
                          )}
                          <button
                            onClick={() => addReferenceToDay(dayIndex)}
                            className="group cursor-pointer p-2 bg-gray-200 text-white rounded-full hover:bg-emerald-500 transition-colors duration-200"
                          >
                            <HiPlus className="h-5 w-5 text-gray-500 group-hover:text-white" />
                          </button>
                        </div>
                      )}
                    </div>

                    {isEditing ? (
                      <div className="flex flex-col gap-y-4">
                        <div className="space-y-3">
                          {dayReferences?.link?.map((reference, linkIndex) => (
                            <div
                              key={reference + linkIndex}
                              className="flex items-center"
                            >
                              <input
                                type="text"
                                value={reference}
                                onChange={(e) =>
                                  handleReferenceChange(
                                    dayIndex,
                                    linkIndex,
                                    e.target.value
                                  )
                                }
                                placeholder="请输入参考链接"
                                className="flex-1 bg-gray-100 rounded-md px-3 py-2 focus:outline-none  focus:bg-gray-200 transition-all duration-200"
                              />
                              {dayReferences?.link?.length > 1 && (
                                <button
                                  onClick={() => {
                                    const newReferences = [
                                      ...themeData.theme_references,
                                    ];
                                    newReferences[dayIndex].link.splice(
                                      linkIndex,
                                      1
                                    );
                                    setThemeData({
                                      ...themeData,
                                      theme_references: newReferences,
                                    });
                                  }}
                                  className="group cursor-pointer ml-2 p-2 bg-gray-200 text-white rounded-full hover:bg-red-500 transition-colors duration-200"
                                >
                                  <HiTrash className="h-5 w-5 text-gray-500 group-hover:text-white" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>

                        <textarea
                          value={dayReferences.remark || ""}
                          onChange={(e) =>
                            handleRemarkChange(dayIndex, e.target.value)
                          }
                          placeholder="记录一下你对这组参考资料的想法吧"
                          className="w-full bg-gray-100 rounded-md px-3 py-2 focus:outline-none focus:bg-gray-200 transition-all duration-200"
                          rows={3}
                        />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {dayReferences?.link?.map((reference, linkIndex) => (
                          <div
                            key={reference}
                            className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                          >
                            <div className="max-w-lg lg:max-w-xl">
                              <Image
                                src={`https://images.weserv.nl/?url=${reference}`}
                                alt={`参考资料${dayIndex + 1}-${linkIndex + 1}`}
                                width={0}
                                height={0}
                                sizes="100vw"
                                className="w-full h-auto"
                              />
                            </div>
                          </div>
                        ))}
                        <div className="text-gray-500">
                          {dayReferences.remark}
                        </div>
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
      <Toaster
        position="top-center"
        toastOptions={{
          className:
            "!bg-base-100 !text-base-content !border !border-base-300 !shadow-lg",
          success: {
            className: "!bg-success !text-success-content !text-white",
            iconTheme: {
              primary: "#fff",
              secondary: "oklch(69.6% 0.17 162.48)",
            },
          },
          error: {
            className: "!bg-error !text-error-content !text-white",
            iconTheme: {
              primary: "#fff",
              secondary: "oklch(63.7% 0.237 25.331)",
            },
          },
        }}
      />
    </div>
  );
};

export default ThemeDetailPage;
