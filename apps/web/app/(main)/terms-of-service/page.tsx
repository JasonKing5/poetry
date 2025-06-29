import React from "react";

export default function TermsOfService() {
  return (
    <section className="max-w-3xl mx-auto px-4 py-12 text-gray-800">
      <h1 className="text-3xl font-bold mb-6">服务条款</h1>
      <p className="mb-4 text-sm text-gray-600">最近更新：2025年6月28日</p>

      <div className="space-y-6 text-base leading-relaxed">
        <p>
          欢迎使用我们的古诗词平台。访问和使用本网站即表示您同意以下服务条款。如果您不同意这些条款，请不要使用本服务。
        </p>

        <h2 className="text-xl font-semibold mt-4">1. 用户行为</h2>
        <p>
          用户在使用本站服务时，须遵守中华人民共和国的相关法律法规，禁止发布违法、虚假、侵权、暴力、色情等不当内容。
        </p>

        <h2 className="text-xl font-semibold mt-4">2. 知识产权</h2>
        <p>
          网站内的所有内容（包括但不限于文字、图片、音频、视频等）均归本平台或原作者所有，受法律保护。未经授权，不得转载或用于商业用途。
        </p>

        <h2 className="text-xl font-semibold mt-4">3. 服务变更与终止</h2>
        <p>
          我们保留在任何时候修改、暂停或终止网站部分或全部服务的权利，恕不另行通知。
        </p>

        <h2 className="text-xl font-semibold mt-4">4. 免责声明</h2>
        <p>
          本平台致力于提供准确的信息，但不对内容的完整性、准确性或及时性做任何保证。使用本平台信息产生的后果由用户自行承担。
        </p>

        <h2 className="text-xl font-semibold mt-4">5. 法律适用</h2>
        <p>
          本条款适用中华人民共和国法律。如发生争议，双方应友好协商解决；协商不成的，提交平台所在地人民法院解决。
        </p>

        <h2 className="text-xl font-semibold mt-4">6. 联系我们</h2>
        <p>
          如您对本条款有任何疑问、建议或投诉，请通过以下方式与我们联系：
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