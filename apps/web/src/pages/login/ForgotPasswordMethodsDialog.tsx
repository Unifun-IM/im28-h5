import { useState } from 'react';

import { InteractionModal } from '../../components/interaction/index.js';

/** 忘记密码方式 sheet 只负责 RN 已提供的替代登录与客服说明。 */
interface ForgotPasswordMethodsDialogProps {
  readonly visible: boolean;
  readonly onClose: () => void;
  readonly onPhone: () => void;
  readonly onEmail: () => void;
}

/** 对齐 RN：Gateway 忘记密码端点下线后，通过已绑定手机号或邮箱登录。 */
export function ForgotPasswordMethodsDialog({
  visible,
  onClose,
  onPhone,
  onEmail,
}: ForgotPasswordMethodsDialogProps) {
  /** supportVisible 仅控制客服找回说明，不制造客服请求或成功态。 */
  const [supportVisible, setSupportVisible] = useState(false);

  /** closeAll 同时收起客服说明和方式 sheet。 */
  function closeAll(): void {
    setSupportVisible(false);
    onClose();
  }

  return (
    <>
      <InteractionModal open={visible && !supportVisible} ariaLabel="忘记密码方式" className="auth-forgot-methods-modal" onRequestClose={onClose}>
        <section className="im-modal-sheet auth-forgot-methods-sheet">
          <div className="auth-forgot-methods-group">
            <p>使用已绑定的手机，邮箱可直接登录后自行修改密码</p>
            <button type="button" onClick={onPhone}>手机号登录</button>
            <button type="button" onClick={onEmail}>邮箱登录</button>
            <button type="button" onClick={() => setSupportVisible(true)}>没有绑定过手机邮箱，联系客服找回</button>
          </div>
          <button className="auth-forgot-methods-cancel" type="button" onClick={onClose}>取消</button>
        </section>
      </InteractionModal>
      <InteractionModal open={visible && supportVisible} ariaLabel="联系客服找回" className="auth-support-modal" closeOnBackdrop={false} onRequestClose={closeAll}>
        <section className="auth-support-dialog">
          <h2>联系客服找回</h2>
          <p>请联系 IMM-28 客服协助找回账号密码。</p>
          <button type="button" onClick={closeAll}>我知道了</button>
        </section>
      </InteractionModal>
    </>
  );
}
