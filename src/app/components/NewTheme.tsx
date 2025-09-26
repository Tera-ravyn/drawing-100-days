import React, { useState } from "react";
import { Reference, ThemeCard } from "../data/theme";
import { HiPlus, HiTrash } from "react-icons/hi";
import { supabase } from "@/utils/supabaseClient";
import toast from "react-hot-toast";

interface NewThemeFormProps {
  onSubmit: () => void;
  onCancel: () => void;
}

const NewThemeForm: React.FC<NewThemeFormProps> = ({ onSubmit, onCancel }) => {
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState(7);
  const [objectives, setObjectives] = useState<string[]>([""]);
  const [references, setReferences] = useState<Reference[]>([
    { is_selected: false, link: [""] } as Reference,
  ]);

  const addObjective = () => {
    setObjectives([...objectives, ""]);
  };

  const removeObjective = (index: number) => {
    if (objectives.length <= 1) return;
    const newObjectives = [...objectives];
    newObjectives.splice(index, 1);
    setObjectives(newObjectives);
  };

  const updateObjective = (index: number, value: string) => {
    const newObjectives = [...objectives];
    newObjectives[index] = value;
    setObjectives(newObjectives);
  };

  const addReferenceToDay = () => {
    setReferences([
      ...references,
      { is_selected: false, link: [""] } as Reference,
    ]);
  };

  const removeReferenceToDay = (index: number) => {
    if (references.length <= 1) return;
    const newReferences = [...references];
    newReferences.splice(index, 1);
    setReferences(newReferences);
  };

  const updateReferenceLink = (
    refIndex: number,
    linkIndex: number,
    value: string
  ) => {
    const newReferences = [...references];
    newReferences[refIndex].link[linkIndex] = value;
    setReferences(newReferences);
  };

  const addLinkToReference = (refIndex: number) => {
    const newReferences = [...references];
    newReferences[refIndex].link.push("");
    setReferences(newReferences);
  };

  const removeLinkFromReference = (refIndex: number, linkIndex: number) => {
    const newReferences = [...references];
    if (newReferences[refIndex].link.length <= 1) return;
    newReferences[refIndex].link.splice(linkIndex, 1);
    setReferences(newReferences);
  };

  const submitTheme = async () => {
    const themeData = {
      title,
      duration,
      objectives,
      theme_references: references,
    };
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

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const res = await submitTheme();
      if (res.success) {
        toast.success("主题保存成功");
        console.log("! 保存成功!");
        onSubmit();
        onCancel();
      } else {
        toast.error(res.error?.message as string);
      }
    } catch (error) {
      toast.error(error as string);
      console.log(error);
    }
  };

  const handleRemarkChange = (index: number, value: string) => {
    const newReferences = [...references];
    newReferences[index].remark = value;
    setReferences(newReferences);
  };

  return (
    <div className="bg-white rounded-lg p-6 w-full max-w-4xl ">
      <div className="text-2xl font-bold text-gray-800 mb-6">创建新主题</div>
      <form onSubmit={handleSave}>
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            主题名称
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-gray-100 rounded-md px-3 py-2 focus:outline-none focus:bg-gray-200 transition-all duration-200"
            placeholder="请输入主题名称"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            持续天数
          </label>
          <div className="flex items-center">
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value) || 1)}
              className="w-24 bg-gray-100 rounded-md px-3 py-2 focus:outline-none focus:bg-gray-200 transition-all duration-200"
              min="1"
            />
            <span className="ml-2">天</span>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-gray-700 text-sm font-bold">
              学习目标
            </label>
            <button
              type="button"
              onClick={addObjective}
              className="cursor-pointer px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition duration-300 flex items-center gap-x-1"
            >
              <HiPlus className="flex-shrink-0" />
              <span>添加</span>
            </button>
          </div>
          <div className="flex flex-col gap-y-3">
            {objectives.map((objective, index) => (
              <div key={index} className="flex items-center gap-x-2">
                <input
                  type="text"
                  value={objective}
                  onChange={(e) => updateObjective(index, e.target.value)}
                  className="flex-1 bg-gray-100 rounded-md px-3 py-2 focus:outline-none focus:bg-gray-200 transition-all duration-200"
                  placeholder="请输入学习目标"
                />
                {objectives.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeObjective(index)}
                    className="group cursor-pointer p-2 bg-gray-200 text-white rounded-full hover:bg-red-500 transition-colors duration-200"
                  >
                    <HiTrash className="h-5 w-5 text-gray-500 group-hover:text-white" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-gray-700 text-sm font-bold">
              参考资料
            </label>
            <button
              type="button"
              onClick={addReferenceToDay}
              className="cursor-pointer px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition duration-300 flex items-center gap-x-1"
            >
              <HiPlus className="flex-shrink-0" />
              <span>添加</span>
            </button>
          </div>
          <div className="space-y-4">
            {references.map((reference, dayIndex) => (
              <div
                key={dayIndex}
                className="border border-gray-200 rounded-md p-4"
              >
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-medium">参考资料组 {dayIndex + 1}</h3>
                  {references.length > 1 && (
                    <div className="flex items-center gap-x-2">
                      <button
                        onClick={() => removeReferenceToDay(dayIndex)}
                        className="group cursor-pointer p-2 bg-gray-200 text-white rounded-full hover:bg-red-500 transition-colors duration-200"
                      >
                        <HiTrash className="h-5 w-5 text-gray-500 group-hover:text-white" />
                      </button>
                      <button
                        onClick={() => addLinkToReference(dayIndex)}
                        className="group cursor-pointer p-2 bg-gray-200 text-white rounded-full hover:bg-emerald-500 transition-colors duration-200"
                      >
                        <HiPlus className="h-5 w-5 text-gray-500 group-hover:text-white" />
                      </button>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  {reference.link.map((link, linkIndex) => (
                    <div key={linkIndex} className="flex items-center gap-x-2">
                      <input
                        type="text"
                        value={link}
                        onChange={(e) =>
                          updateReferenceLink(
                            dayIndex,
                            linkIndex,
                            e.target.value
                          )
                        }
                        placeholder="请输入参考链接"
                        className="flex-1 bg-gray-100 rounded-md px-3 py-2 focus:outline-none focus:bg-gray-200 transition-all duration-200"
                      />
                      {reference.link.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            removeLinkFromReference(dayIndex, linkIndex)
                          }
                          className="group cursor-pointer p-2 bg-gray-200 text-white rounded-full hover:bg-red-500 transition-colors duration-200"
                        >
                          <HiTrash className="h-4 w-4 text-gray-500 group-hover:text-white" />
                        </button>
                      )}
                    </div>
                  ))}
                  <textarea
                    value={reference.remark || ""}
                    onChange={(e) =>
                      handleRemarkChange(dayIndex, e.target.value)
                    }
                    placeholder="记录一下你对这组参考资料的想法吧"
                    className="w-full bg-gray-100 rounded-md px-3 py-2 focus:outline-none focus:bg-gray-200 transition-all duration-200"
                    rows={3}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 rounded-full bg-gray-300 hover:bg-gray-400 cursor-pointer flex items-center justify-center transition duration-300"
          >
            取消
          </button>
          <button
            type="submit"
            className="px-6 py-2 text-white rounded-full bg-blue-500 hover:bg-blue-600 cursor-pointer flex items-center justify-center transition duration-300"
          >
            创建主题
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewThemeForm;
