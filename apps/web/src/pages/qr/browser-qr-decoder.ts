import type { IScannerControls } from '@zxing/browser';

/** 停止当前摄像头解码并释放媒体轨道。 */
export type StopBrowserQRCodeScan = () => void;

/** 启动摄像头连续解码，仅在首次识别后回调并停止。 */
export async function startBrowserQRCodeScan(
  video: HTMLVideoElement,
  onResult: (text: string) => void,
): Promise<StopBrowserQRCodeScan> {
  /** BrowserQRCodeReader 延迟进入扫码路由后加载，避免进入主列表首包。 */
  const { BrowserQRCodeReader } = await import('@zxing/browser');
  /** reader 只解析二维码，避免把条形码误当 IM28 协议。 */
  const reader = new BrowserQRCodeReader(undefined, {
    delayBetweenScanAttempts: 250,
    delayBetweenScanSuccess: 500,
  });
  /** settled 防止连续帧重复导航。 */
  let settled = false;
  /** controls 保存库返回的摄像头生命周期句柄。 */
  let controls: IScannerControls | null = null;
  controls = await reader.decodeFromConstraints(
    { video: { facingMode: { ideal: 'environment' } }, audio: false },
    video,
    (result, _error, activeControls) => {
      if (!result || settled) return;
      settled = true;
      activeControls.stop();
      onResult(result.getText());
    },
  );
  return () => {
    settled = true;
    controls?.stop();
  };
}

/** 从用户明确选择的图片中解码一个二维码。 */
export async function decodeBrowserQRCodeImage(file: File): Promise<string> {
  /** BrowserQRCodeReader 保持与摄像头相同的二维码解码实现。 */
  const { BrowserQRCodeReader } = await import('@zxing/browser');
  /** objectURL 只在本次识别期间暴露本地图片。 */
  const objectURL = URL.createObjectURL(file);
  try {
    /** result 是 ZXing 对本地图片的单次解析结果。 */
    const result = await new BrowserQRCodeReader().decodeFromImageUrl(objectURL);
    return result.getText();
  } finally {
    URL.revokeObjectURL(objectURL);
  }
}
