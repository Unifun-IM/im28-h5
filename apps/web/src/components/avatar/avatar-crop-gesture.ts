/** 裁剪手势中的单个浏览器指针坐标。 */
export interface AvatarGesturePoint {
  readonly x: number;
  readonly y: number;
}

/** 手势快照记录当前触点中心和双指间距。 */
export interface AvatarGestureSnapshot {
  readonly center: AvatarGesturePoint;
  readonly distance: number;
}

/** 头像预览当前缩放与位移状态。 */
export interface AvatarCropGestureTransform {
  readonly scale: number;
  readonly translate: AvatarGesturePoint;
}

/** 手势变化计算所需的起始与当前快照。 */
interface ResolveAvatarGestureTransformInput {
  readonly startTransform: AvatarCropGestureTransform;
  readonly startSnapshot: AvatarGestureSnapshot;
  readonly currentSnapshot: AvatarGestureSnapshot;
}

/** 将一个或两个活动指针归一化为拖动/捏合共用快照。 */
export function getAvatarGestureSnapshot(
  points: readonly AvatarGesturePoint[],
): AvatarGestureSnapshot | null {
  // first 是当前手势的主指针。
  const first = points[0];
  if (!first) return null;
  // second 缺失时按单指拖动处理。
  const second = points[1];
  if (!second) return { center: first, distance: 0 };
  // deltaX 与 deltaY 用于计算双指欧氏距离。
  const deltaX = first.x - second.x;
  const deltaY = first.y - second.y;
  return {
    center: {
      x: (first.x + second.x) / 2,
      y: (first.y + second.y) / 2,
    },
    distance: Math.hypot(deltaX, deltaY),
  };
}

/** 按 RN 语义把单指中心位移和双指间距变化转换为图片变换。 */
export function resolveAvatarGestureTransform(
  input: ResolveAvatarGestureTransformInput,
): AvatarCropGestureTransform {
  // hasPinch 仅在起止快照都包含有效双指距离时成立。
  const hasPinch = input.startSnapshot.distance > 0 && input.currentSnapshot.distance > 0;
  // distanceRatio 把双指间距变化换算成相对缩放倍率。
  const distanceRatio = hasPinch
    ? input.currentSnapshot.distance / input.startSnapshot.distance
    : 1;
  // nextScale 与 RN 保持 1 至 4 倍约束。
  const nextScale = Math.min(Math.max(input.startTransform.scale * distanceRatio, 1), 4);
  return {
    scale: nextScale,
    translate: {
      x: input.startTransform.translate.x
        + input.currentSnapshot.center.x
        - input.startSnapshot.center.x,
      y: input.startTransform.translate.y
        + input.currentSnapshot.center.y
        - input.startSnapshot.center.y,
    },
  };
}
