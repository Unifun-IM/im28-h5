import './chat-message-shatter.css';

/** 碎裂层使用固定粒子数，避免每次渲染生成随机布局。 */
const CHAT_MESSAGE_SHATTER_PARTICLE_COUNT = 18;

/** 呈现 RN 删除退场的纯视觉碎片，不持有删除结果或计时状态。 */
export function ChatMessageShatterParticles() {
  return (
    <span className="rn-chat-shatter-particles" aria-hidden="true">
      {Array.from({ length: CHAT_MESSAGE_SHATTER_PARTICLE_COUNT }, (_, index) => (
        <i key={index} />
      ))}
    </span>
  );
}
