import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react';

import backIconURL from '../../assets/rn/assets/icons/imm28/nav-arrow-left.regular.svg';
import { RNAssetIcon } from '../RNAssetIcon.js';
import { cropAvatarFile } from './avatar-crop.js';
import {
  getAvatarGestureSnapshot,
  resolveAvatarGestureTransform,
  type AvatarCropGestureTransform,
  type AvatarGesturePoint,
  type AvatarGestureSnapshot,
} from './avatar-crop-gesture.js';
import './avatar-crop.css';

/** 头像裁剪层仅接收本地文件，不持有 runtime 或远端 mutation。 */
interface AvatarCropDialogProps {
  readonly file: File;
  readonly uploading: boolean;
  readonly imageAlt: string;
  readonly errorMessage: string;
  readonly onCancel: () => void;
  readonly onConfirm: (blob: Blob) => Promise<void>;
  readonly onError: (message: string) => void;
}

/** 浏览器 Pointer 手势在触点数量变化时保存新的计算基线。 */
interface AvatarPointerGestureState {
  readonly pointers: Map<number, AvatarGesturePoint>;
  startSnapshot: AvatarGestureSnapshot | null;
  startTransform: AvatarCropGestureTransform;
}

/** RN AvatarCropPreview 的浏览器平台实现。 */
export function AvatarCropDialog({
  file,
  uploading,
  imageAlt,
  errorMessage,
  onCancel,
  onConfirm,
  onError,
}: AvatarCropDialogProps) {
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
  // transformRef 让连续 Pointer 事件始终读取最新图片变换。
  const transformRef = useRef<AvatarCropGestureTransform>({
    scale: 1,
    translate: { x: 0, y: 0 },
  });
  // gestureRef 保存最多两个活动指针及本轮手势基线。
  const gestureRef = useRef<AvatarPointerGestureState>({
    pointers: new Map(),
    startSnapshot: null,
    startTransform: transformRef.current,
  });

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

  /** 同步图片变换并把位移限制在裁剪圆的 cover 边界内。 */
  function applyTransform(nextTransform: AvatarCropGestureTransform): void {
    // nextScale 对所有输入再次执行 RN 的倍率边界约束。
    const nextScale = Math.min(Math.max(nextTransform.scale, 1), 4);
    // nextTranslate 保证缩放和拖动后不会露出图片边缘。
    const nextTranslate = clampTranslation(
      nextTransform.translate.x,
      nextTransform.translate.y,
      nextScale,
    );
    // normalizedTransform 是状态与引用共同使用的唯一变换值。
    const normalizedTransform = { scale: nextScale, translate: nextTranslate };
    transformRef.current = normalizedTransform;
    setScale(nextScale);
    setTranslate(nextTranslate);
  }

  /** 按当前活动触点和图片变换重新建立手势计算基线。 */
  function rebaseGesture(): void {
    // points 只取插入顺序稳定的前两个活动指针。
    const points = [...gestureRef.current.pointers.values()].slice(0, 2);
    gestureRef.current.startSnapshot = getAvatarGestureSnapshot(points);
    gestureRef.current.startTransform = transformRef.current;
  }

  /** 捕获新的活动指针并进入单指拖动或双指捏合状态。 */
  function startGesture(event: ReactPointerEvent<HTMLDivElement>): void {
    if (uploading || confirming) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    gestureRef.current.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    rebaseGesture();
  }

  /** 根据当前活动指针移动图片，双指时同时更新缩放倍率。 */
  function moveGesture(event: ReactPointerEvent<HTMLDivElement>): void {
    if (!gestureRef.current.pointers.has(event.pointerId)) return;
    gestureRef.current.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    // currentSnapshot 表示本帧单指中心或双指中心与距离。
    const currentSnapshot = getAvatarGestureSnapshot(
      [...gestureRef.current.pointers.values()].slice(0, 2),
    );
    // startSnapshot 在触点数量变化时已经重建，避免模式切换跳动。
    const startSnapshot = gestureRef.current.startSnapshot;
    if (!currentSnapshot || !startSnapshot) return;
    applyTransform(resolveAvatarGestureTransform({
      startTransform: gestureRef.current.startTransform,
      startSnapshot,
      currentSnapshot,
    }));
  }

  /** 移除结束的指针并为剩余指针重建手势基线。 */
  function endGesture(event: ReactPointerEvent<HTMLDivElement>): void {
    if (!gestureRef.current.pointers.delete(event.pointerId)) return;
    rebaseGesture();
  }

  /** 将当前预览编码成 JPEG，再交给页面执行唯一上传 mutation。 */
  async function confirm(): Promise<void> {
    if (uploading || confirming || !imageSize.width || !imageSize.height) return;
    // stageSize 必须取确认瞬间的真实布局值。
    const stageSize = stageRef.current?.getBoundingClientRect().width ?? 0;
    setConfirming(true);
    try {
      // blob 与 RN cropAvatarAsset 同为 512x512 JPEG 输出。
      const blob = await cropAvatarFile(file, {
        sourceWidth: imageSize.width,
        sourceHeight: imageSize.height,
        stageSize,
        scale,
        translateX: translate.x,
        translateY: translate.y,
      });
      await onConfirm(blob);
    } catch (cause) {
      onError(cause instanceof Error && cause.message ? cause.message : errorMessage);
    } finally {
      setConfirming(false);
    }
  }

  // busy 同时覆盖本地编码和远端上传阶段。
  const busy = confirming || uploading;
  return (
    <section className="rn-avatar-crop" role="dialog" aria-modal="true" aria-labelledby="avatar-crop-title">
      <header className="rn-avatar-crop-header">
        <button type="button" aria-label="取消头像裁剪" disabled={busy} onClick={onCancel}><RNAssetIcon assetURL={backIconURL} /></button>
        <h2 id="avatar-crop-title">头像预览</h2><span />
      </header>
      <div className="rn-avatar-crop-body">
        <div
          ref={stageRef}
          className="rn-avatar-crop-stage"
          aria-label="头像裁剪手势区域"
          onPointerDown={startGesture}
          onPointerMove={moveGesture}
          onPointerUp={endGesture}
          onPointerCancel={endGesture}
          onLostPointerCapture={endGesture}
        >
          {objectURL ? <img
              src={objectURL}
              alt={imageAlt}
              draggable={false}
              style={{
                width: imageSize.width >= imageSize.height ? 'auto' : '100%',
                height: imageSize.width >= imageSize.height ? '100%' : 'auto',
                transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
              }}
              onLoad={event => setImageSize({ width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight })}
            /> : null}
          <span className="rn-avatar-crop-mask" aria-hidden="true" />
        </div>
      </div>
      <footer className="rn-avatar-crop-footer"><button type="button" disabled={busy} onClick={onCancel}>取消</button><button type="button" disabled={busy || !imageSize.width} onClick={() => { void confirm(); }}>{busy ? '处理中' : '确定'}</button></footer>
    </section>
  );
}
