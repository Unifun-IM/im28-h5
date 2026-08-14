import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import addFriendIconURL from '../../assets/rn/assets/icons/imm28/group-action-add-friend.svg';
import broadcastIconURL from '../../assets/rn/assets/icons/imm28/group-messaging.svg';
import startGroupIconURL from '../../assets/rn/assets/icons/imm28/group-action-start-group.svg';
import scanIconURL from '../../assets/rn/assets/icons/imm28/group-action-scan.svg';
import { RNAssetIcon } from '../RNAssetIcon.js';
import './home-action-menu.css';

/** 首页更多操作只承载已具备真实路由的动作。 */
export function HomeActionMenu() {
  /** navigate 负责进入 React Router 全屏能力页。 */
  const navigate = useNavigate();
  /** location 提供创建页返回当前主 tab 的稳定来源。 */
  const location = useLocation();
  /** open 控制短生命周期气泡，不承载业务状态。 */
  const [open, setOpen] = useState(false);
  /** rootRef 用于识别气泡外点击。 */
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return undefined;
    /** closeFromOutside 仅关闭当前气泡，不拦截目标点击。 */
    const closeFromOutside = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', closeFromOutside);
    return () => document.removeEventListener('pointerdown', closeFromOutside);
  }, [open]);

  /** openRoute 先关闭气泡再执行稳定 SPA 导航。 */
  function openRoute(route: string): void {
    setOpen(false);
    if (route === '/contacts/search') {
      navigate(route, { state: { searchBackHref: location.pathname } });
      return;
    }
    navigate(route, route === '/groups/create' || route === '/broadcast/select' || route === '/scan' ? {
      state: { backHref: location.pathname === '/contacts' ? '/contacts' : '/conversations' },
    } : undefined);
  }

  return (
    <div className="rn-home-action" ref={rootRef}>
      <button
        type="button"
        className="rn-home-action-trigger"
        aria-label="更多操作"
        aria-expanded={open}
        onClick={() => setOpen(value => !value)}
      >
        <span aria-hidden="true" />
      </button>
      {open ? (
        <div className="rn-home-action-menu" role="menu" aria-label="首页更多操作">
          <button type="button" role="menuitem" onClick={() => openRoute('/scan')}>
            <RNAssetIcon assetURL={scanIconURL} />
            <span>扫一扫</span>
          </button>
          <button type="button" role="menuitem" onClick={() => openRoute('/groups/create')}>
            <RNAssetIcon assetURL={startGroupIconURL} />
            <span>开始群聊</span>
          </button>
          <button type="button" role="menuitem" onClick={() => openRoute('/contacts/search')}>
            <RNAssetIcon assetURL={addFriendIconURL} />
            <span>添加朋友</span>
          </button>
          <button type="button" role="menuitem" onClick={() => openRoute('/broadcast/select')}>
            <RNAssetIcon assetURL={broadcastIconURL} />
            <span>群发消息</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}
