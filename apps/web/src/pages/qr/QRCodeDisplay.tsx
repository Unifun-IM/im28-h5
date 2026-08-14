import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';

import backIconURL from '../../assets/rn/assets/icons/imm28/nav-arrow-left.regular.svg';
import downloadIconURL from '../../assets/rn/assets/icons/imm28/share-ios.svg';
import { InteractionModal, useAppToast } from '../../components/interaction/index.js';
import { getRNAvatarGradient, getRNAvatarInitial } from '../../components/rn-avatar-view.js';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import { PageNavbar } from '../../components/navigation/PageNavbar.js';
import {
  createBrowserQRCodeFile,
  downloadBrowserQRCode,
  renderBrowserQRCode,
  type BrowserQRCodeKind,
} from './browser-qr-image.js';
import './qr-code-display.css';

/** 用户与群二维码共用的 Web 展示和平台导出参数。 */
export interface QRCodeDisplayProps {
  readonly kind: BrowserQRCodeKind;
  readonly identity: string;
  readonly displayName: string;
  readonly avatarURL?: string;
  readonly payload: string;
  readonly idLabel: string;
  readonly hint: string;
  readonly closeLabel: string;
  readonly sourceError?: string | null;
  readonly onClose: () => void;
  readonly onScan: () => void;
  readonly onShare: () => void;
}

/** 以统一全局弹窗渲染个人/群二维码，避免两套 Canvas、下载与分享逻辑。 */
export function QRCodeDisplay(props: QRCodeDisplayProps) {
  /** toast 承载下载动作结果，Canvas 生成错误仍留在弹窗。 */
  const { toast } = useAppToast();
  /** canvasRef 指向页面唯一二维码图像 owner。 */
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  /** rendering 标记当前 payload 的 Canvas 绘制过程。 */
  const [rendering, setRendering] = useState(true);
  /** ready 只在 Canvas 完成真实二维码渲染后开放导出。 */
  const [ready, setReady] = useState(false);
  /** error 显示 Canvas、下载或分享的真实失败。 */
  const [error, setError] = useState<string | null>(null);
  /** avatarStyle 复用 RN 稳定头像渐变。 */
  const avatarStyle = useMemo(() => ({
    '--qr-display-avatar-gradient': getRNAvatarGradient(props.identity),
  }) as CSSProperties, [props.identity]);

  useEffect(() => {
    /** canvas 是本轮 payload 的唯一可导出 surface。 */
    const canvas = canvasRef.current;
    if (!canvas) return;
    /** active 阻止切页或 payload 更新后旧渲染回写状态。 */
    let active = true;
    setRendering(true);
    setReady(false);
    setError(null);
    void renderBrowserQRCode(canvas, props.payload, {
      initial: getRNAvatarInitial(props.displayName, props.kind === 'group' ? '群' : '?'),
      backgroundColor: readAvatarCanvasColor(getRNAvatarGradient(props.identity)),
    }).then(() => {
      if (active) setReady(true);
    }).catch(cause => {
      if (active) setError(readQRCodeDisplayError(cause, '二维码加载失败'));
    }).finally(() => {
      if (active) setRendering(false);
    });
    return () => { active = false; };
  }, [props.displayName, props.identity, props.kind, props.payload]);

  /** 下载只导出当前 Canvas，不写应用缓存。 */
  async function downloadQRCode(): Promise<void> {
    if (!canvasRef.current || !ready) return;
    setError(null);
    try {
      /** file 与系统分享共用同一无损 PNG 路径。 */
      const file = await createBrowserQRCodeFile(canvasRef.current, props.kind, props.identity);
      downloadBrowserQRCode(file);
      toast.success('二维码已下载');
    } catch (cause) {
      toast.error(readQRCodeDisplayError(cause, '二维码下载失败'));
    }
  }

  return (
    <InteractionModal
      open
      ariaLabel={props.kind === 'group' ? '群二维码' : '我的二维码'}
      className="rn-qr-display-modal"
      onRequestClose={props.onClose}
    >
      <section className="rn-qr-display-surface im-modal-sheet" aria-busy={rendering}>
        <PageNavbar className="rn-qr-display-header">
          <button type="button" aria-label={props.closeLabel} onClick={props.onClose}><RNAssetIcon assetURL={backIconURL} /></button>
          <h1>二维码</h1>
          <button type="button" aria-label="下载二维码" disabled={!ready} onClick={() => void downloadQRCode()}><RNAssetIcon assetURL={downloadIconURL} /></button>
        </PageNavbar>
        <section className="rn-qr-display-content">
          <div className="rn-qr-display-card">
            <div className="rn-qr-display-identity">
              <span className="rn-qr-display-avatar" style={avatarStyle}><span>{getRNAvatarInitial(props.displayName, props.kind === 'group' ? '群' : '?')}</span>{props.avatarURL?.trim() ? <img src={props.avatarURL} alt="" onError={event => { event.currentTarget.hidden = true; }} /> : null}</span>
              <span className="rn-qr-display-copy"><strong>{props.displayName}</strong><small>{props.idLabel}: {props.identity}</small></span>
            </div>
            <div className="rn-qr-display-box"><canvas ref={canvasRef} aria-label={props.kind === 'group' ? '群二维码' : '我的二维码'} />{rendering ? <span className="rn-qr-display-spinner" aria-label="正在生成二维码" /> : null}</div>
          </div>
          <p className="rn-qr-display-hint">{props.hint}</p>
          {props.sourceError ? <p className="rn-qr-display-error" role="status">{props.sourceError}</p> : null}
          {error ? <p className="rn-qr-display-error" role="status">{error}</p> : null}
          <button className="rn-qr-display-share" type="button" disabled={!ready} onClick={props.onShare}>分享二维码</button>
          <button className="rn-qr-display-scan" type="button" onClick={props.onScan}>扫一扫</button>
        </section>
      </section>
    </InteractionModal>
  );
}

/** 将未知异常收敛为不包含身份凭据的页面消息。 */
function readQRCodeDisplayError(cause: unknown, fallback: string): string {
  return cause instanceof Error && cause.message ? cause.message : fallback;
}

/** 从 RN 渐变 token 读取 Canvas 可用的首个稳定颜色。 */
function readAvatarCanvasColor(gradient: string): string {
  /** colorMatch 只接受本地 helper 生成的六位十六进制颜色。 */
  const colorMatch = gradient.match(/#[0-9A-Fa-f]{6}/);
  return colorMatch?.[0] ?? '#596EEB';
}
