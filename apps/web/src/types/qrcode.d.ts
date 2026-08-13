/** 浏览器二维码渲染所需的最小依赖契约，避免 Node 类型污染 Web 全局。 */
declare module 'qrcode' {
  /** 当前页面使用的 Canvas 渲染选项。 */
  interface QRCodeCanvasOptions {
    readonly errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
    readonly margin?: number;
    readonly width?: number;
    readonly color?: {
      readonly dark?: string;
      readonly light?: string;
    };
  }

  /** qrcode 浏览器入口只公开当前使用的 Canvas 方法。 */
  const QRCode: {
    toCanvas(
      canvas: HTMLCanvasElement,
      text: string,
      options?: QRCodeCanvasOptions,
    ): Promise<void>;
  };

  export default QRCode;
}
