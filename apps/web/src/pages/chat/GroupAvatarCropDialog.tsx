import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';

import backIconURL from '../../assets/rn/assets/icons/imm28/nav-arrow-left.regular.svg';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import { cropGroupAvatarFile } from './group-avatar-crop.js';

/** 群头像裁剪层仅接收本地文件，不持有 runtime 或远端 mutation。 */
interface GroupAvatarCropDialogProps {
  readonly file: File;
  readonly uploading: boolean;
  readonly onCancel: () => void;
  readonly onConfirm: (blob: Blob) => Promise<void>;
  readonly onError: (message: string) => void;
}

/** 拖动开始时冻结当前指针和图片位移。 */
interface GroupAvatarDragState {
  readonly pointerID: number;
  readonly pointerX: number;
  readonly pointerY: number;
  readonly translateX: number;
  readonly translateY: number;
}

/** RN AvatarCropPreview 的浏览器平台实现。 */
export function GroupAvatarCropDialog({
  file,
  uploading,
  onCancel,
  onConfirm,
  onError,
}: GroupAvatarCropDialogProps) {
  // objectURL 由 effect 每次 setup 创建，兼容 React StrictMode 重放生命周期。
  const [objectURL, setObjectURL] = useState('');
  // imageSize 保存浏览器解码后的原始像素尺寸。
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  // scale 与 RN 预览保持 1 至 4 倍范围。
  const [scale, setScale] = useState(1);
  // translate 保存当前拖动位移。
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  // confirming 防止 Canvas 编码阶段重复提交。
  const [confirming, setConfirming] = useState(false);
  // stageRef 提供真实裁剪视口边长。
  const stageRef = useRef<HTMLDivElement | null>(null);
  // dragRef 只保存活动指针手势，不触发渲染。
  const dragRef = useRef<GroupAvatarDragState | null>(null);

  useEffect(() => {
    // nextObjectURL 与本次 effect cleanup 一一对应，防止 StrictMode 提前释放重用 URL。
    const nextObjectURL = URL.createObjectURL(file);
    setObjectURL(nextObjectURL);
    return () => URL.revokeObjectURL(nextObjectURL);
  }, [file]);

  /** 返回当前图片在裁剪视口允许的最大拖动范围。 */
  function readTranslationBounds(nextScale: number): { readonly x: number; readonly y: number } {
    // stageSize 来自实际 CSS 布局，未布局时禁止移动。
    const stageSize = stageRef.current?.getBoundingClientRect().width ?? 0;
    if (!stageSize || !imageSize.width || !imageSize.height) return { x: 0, y: 0 };
    // baseScale 复用 RN cover 规则。
    const baseScale = Math.max(stageSize / imageSize.width, stageSize / imageSize.height);
    return {
      x: Math.max(0, (imageSize.width * baseScale * nextScale - stageSize) / 2),
      y: Math.max(0, (imageSize.height * baseScale * nextScale - stageSize) / 2),
    };
  }

  /** 将任何位移限制到图片仍完整覆盖裁剪圆的范围。 */
  function clampTranslation(x: number, y: number, nextScale = scale): { readonly x: number; readonly y: number } {
    // bounds 对应当前缩放后的横纵最大可拖动距离。
    const bounds = readTranslationBounds(nextScale);
    return {
      x: Math.min(Math.max(x, -bounds.x), bounds.x),
      y: Math.min(Math.max(y, -bounds.y), bounds.y),
    };
  }

  /** 开始单指拖动并捕获指针，避免移出圆形区域后丢失事件。 */
  function startDrag(event: ReactPointerEvent<HTMLDivElement>): void {
    if (uploading || confirming) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerID: event.pointerId,
      pointerX: event.clientX,
      pointerY: event.clientY,
      translateX: translate.x,
      translateY: translate.y,
    };
  }

  /** 根据捕获指针移动图片并保持 cover 边界。 */
  function moveDrag(event: ReactPointerEvent<HTMLDivElement>): void {
    // drag 只响应本次捕获的活动指针。
    const drag = dragRef.current;
    if (!drag || drag.pointerID !== event.pointerId) return;
    setTranslate(clampTranslation(
      drag.translateX + event.clientX - drag.pointerX,
      drag.translateY + event.clientY - drag.pointerY,
    ));
  }

  /** 结束当前拖动手势。 */
  function endDrag(event: ReactPointerEvent<HTMLDivElement>): void {
    if (dragRef.current?.pointerID === event.pointerId) dragRef.current = null;
  }

  /** 缩放滑杆变化时同步收紧旧位移边界。 */
  function changeScale(event: ChangeEvent<HTMLInputElement>): void {
    // nextScale 已由 input min/max 约束，仍显式转为有限数值。
    const nextScale = Math.min(Math.max(Number(event.target.value) || 1, 1), 4);
    setScale(nextScale);
    setTranslate(current => clampTranslation(current.x, current.y, nextScale));
  }

  /** 将当前预览编码成 JPEG，再交给页面执行唯一上传 mutation。 */
  async function confirm(): Promise<void> {
    if (uploading || confirming || !imageSize.width || !imageSize.height) return;
    // stageSize 必须取确认瞬间的真实布局值。
    const stageSize = stageRef.current?.getBoundingClientRect().width ?? 0;
    setConfirming(true);
    try {
      // blob 与 RN cropAvatarAsset 同为 512x512 JPEG 输出。
      const blob = await cropGroupAvatarFile(file, {
        sourceWidth: imageSize.width,
        sourceHeight: imageSize.height,
        stageSize,
        scale,
        translateX: translate.x,
        translateY: translate.y,
      });
      await onConfirm(blob);
    } catch (cause) {
      onError(cause instanceof Error && cause.message ? cause.message : '群头像裁剪失败');
    } finally {
      setConfirming(false);
    }
  }

  // busy 同时覆盖本地编码和远端上传阶段。
  const busy = confirming || uploading;
  return (
    <section className="rn-group-avatar-crop" role="dialog" aria-modal="true" aria-labelledby="group-avatar-crop-title">
      <header className="rn-group-avatar-crop-header">
        <button type="button" aria-label="取消头像裁剪" disabled={busy} onClick={onCancel}><RNAssetIcon assetURL={backIconURL} /></button>
        <h2 id="group-avatar-crop-title">头像预览</h2><span />
      </header>
      <div className="rn-group-avatar-crop-body">
        <div ref={stageRef} className="rn-group-avatar-crop-stage" onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag}>
          {objectURL ? <img
              src={objectURL}
              alt="待裁剪群头像"
              draggable={false}
              style={{
                width: imageSize.width >= imageSize.height ? 'auto' : '100%',
                height: imageSize.width >= imageSize.height ? '100%' : 'auto',
                transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
              }}
              onLoad={event => setImageSize({ width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight })}
            /> : null}
          <span className="rn-group-avatar-crop-mask" aria-hidden="true" />
        </div>
        <label className="rn-group-avatar-crop-zoom"><span>缩放</span><input aria-label="头像缩放" type="range" min="1" max="4" step="0.01" value={scale} disabled={busy} onChange={changeScale} /></label>
      </div>
      <footer className="rn-group-avatar-crop-footer"><button type="button" disabled={busy} onClick={onCancel}>取消</button><button type="button" disabled={busy || !imageSize.width} onClick={() => { void confirm(); }}>{busy ? '处理中' : '确定'}</button></footer>
    </section>
  );
}
