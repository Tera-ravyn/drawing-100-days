"use client";
const Page = () => {
  const handleLogin = async () => {};
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-md rounded-lg p-8 space-y-6">
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
            登录
          </h1>

          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                账户
              </label>
              <input
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="请输入账户"
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                密码
              </label>
              <input
                type="password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="请输入密码"
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={handleLogin}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition duration-300"
            >
              登录
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
