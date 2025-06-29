import React from "react";

export default function PrivacyPolicy() {
  return (
    <section className="max-w-3xl mx-auto px-4 py-12 text-gray-800">
      <h1 className="text-3xl font-bold mb-6">隐私政策</h1>
      <p className="mb-4 text-sm text-gray-600">最近更新：2025年6月28日</p>

      <div className="space-y-6 text-base leading-relaxed">
        <p>
          本平台非常重视用户隐私，并承诺在合理范围内保护您的个人信息安全。请您在使用前仔细阅读本隐私政策。
        </p>

        <h2 className="text-xl font-semibold mt-4">1. 收集信息</h2>
        <p>
          我们可能会收集以下信息：用户账号信息（如昵称、邮箱）、访问日志（IP、浏览器信息）、用户上传的诗词内容等。
        </p>

        <h2 className="text-xl font-semibold mt-4">2. 使用信息</h2>
        <p>
          收集的信息将用于改善服务体验、确保服务安全、统计分析及合法合规用途。我们不会未经授权将用户信息出售给任何第三方。
        </p>

        <h2 className="text-xl font-semibold mt-4">3. 信息共享</h2>
        <p>
          在以下情况下我们可能披露您的信息：依法配合调查、保护平台合法权益、征得您明确同意时。
        </p>

        <h2 className="text-xl font-semibold mt-4">4. 信息安全</h2>
        <p>
          我们采用行业通用的安全手段保护用户信息，如加密存储、访问控制、日志审计等，尽力防止信息被未经授权访问或泄露。
        </p>

        <h2 className="text-xl font-semibold mt-4">5. 用户权利</h2>
        <p>
          用户有权访问、更正或删除自己的个人信息。如需操作，请通过平台提供的联系方式与我们联系。
        </p>

        <h2 className="text-xl font-semibold mt-4">6. 政策更新</h2>
        <p>
          本隐私政策可能根据法律法规或服务调整而更新，更新后将及时发布在本页面，并以显著方式通知您。
        </p>

        <h2 className="text-xl font-semibold mt-4">7. 联系我们</h2>
        <p>
          如您对本隐私政策有任何疑问、建议或投诉，请通过以下方式与我们联系：
          <br />
          📧 邮箱：
          <a
            href="mailto:passerbyking@gmail.com"
            className="text-blue-600 underline ml-1"
          >
            passerbyking@gmail.com
          </a>
        </p>
      </div>
    </section>
  );
}