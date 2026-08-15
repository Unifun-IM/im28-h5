import { useCallback, useEffect, useRef, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { parseIM28QRCodeTarget } from '@im28/im-sdk/web';

import albumIconURL from '../../assets/rn/assets/icons/imm28/album.svg';
import backIconURL from '../../assets/rn/assets/icons/imm28/nav-arrow-left.regular.svg';
import scanIconURL from '../../assets/rn/assets/icons/imm28/group-action-scan.svg';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import { PageNavbar } from '../../components/navigation/PageNavbar.js';
import { useWebIMRuntime } from '../../runtime/index.js';
import { decodeBrowserQRCodeImage, startBrowserQRCodeScan, type StopBrowserQRCodeScan } from './browser-qr-decoder.js';
import { readQRCodeBackHref } from './qr-route.js';
import { useQRCodeModal } from './QRCodeModalProvider.js';
import './qr-code-page.css';

/** RN 扫一扫在 Web 的摄像头与相册实现，业务协议来自 shared SDK。 */
export default function QRCodeScanPage() {
  /** runtime context 只用于认证门禁，扫码不直接访问 Gateway。 */
  const { runtime, snapshot, restoring, startupError } = useWebIMRuntime();
  /** location 提供首页入口的受控返回地址。 */
  const location = useLocation();
  /** navigate 分发已解析的用户或群业务目标。 */
  const navigate = useNavigate();
  /** openUserQRCode 允许扫一扫页在原地打开全局个人二维码弹窗。 */
  const { openUserQRCode } = useQRCodeModal();
  /** backHref 保证返回只落到已迁移主 tab。 */
  const backHref = readQRCodeBackHref(location.state);
  /** videoRef 绑定 ZXing 的摄像头预览元素。 */
  const videoRef = useRef<HTMLVideoElement>(null);
  /** fileRef 触发浏览器原生图片选择。 */
  const fileRef = useRef<HTMLInputElement>(null);
  /** stopRef 持有当前摄像头解码生命周期。 */
  const stopRef = useRef<StopBrowserQRCodeScan | null>(null);
  /** scanRequestRef 让迟到的权限/媒体结果在停止或离页后立即自清理。 */
  const scanRequestRef = useRef(0);
  /** scanning 只在用户明确启动摄像头后为真。 */
  const [scanning, setScanning] = useState(false);
  /** recognizing 阻止相册图片重复解析。 */
  const [recognizing, setRecognizing] = useState(false);
  /** error 显示权限、解码和协议失败，不伪造成功。 */
  const [error, setError] = useState<string | null>(null);

  /** 停止摄像头并清理页面状态。 */
  const stopScanning = useCallback((): void => {
    scanRequestRef.current += 1;
    stopRef.current?.();
    stopRef.current = null;
    setScanning(false);
  }, []);

  useEffect(() => stopScanning, [stopScanning]);

  /** 将 shared parser 结果分发到现有用户页或真实群申请页。 */
  const dispatchResult = useCallback((rawText: string): void => {
    /** target 拒绝任何非 IM28 或类型错配二维码。 */
    const target = parseIM28QRCodeTarget(rawText);
    if (!target) {
      setError('暂不支持该二维码');
      return;
    }
    stopScanning();
    if (target.kind === 'user') {
      navigate(`/contacts/users/${encodeURIComponent(target.id)}`, {
        state: { backHref: '/scan', sourceType: 'qrcode' },
      });
      return;
    }
    navigate(`/groups/${encodeURIComponent(target.id)}/apply`, {
      state: { backHref: '/scan', sourceType: 'qrcode' },
    });
  }, [navigate, stopScanning]);

  /** 用户点击后才请求浏览器摄像头权限并启动扫码。 */
  const beginScanning = useCallback(async (): Promise<void> => {
    if (!videoRef.current || scanning) return;
    setError(null);
    /** requestID 标识本次用户明确发起的摄像头请求。 */
    const requestID = scanRequestRef.current + 1;
    scanRequestRef.current = requestID;
    try {
      setScanning(true);
      /** stop 保存 ZXing 返回的媒体轨道释放函数。 */
      const stop = await startBrowserQRCodeScan(videoRef.current, dispatchResult);
      if (scanRequestRef.current !== requestID) {
        stop();
        return;
      }
      stopRef.current = stop;
    } catch (cause) {
      if (scanRequestRef.current !== requestID) return;
      setScanning(false);
      setError(readQRCodeScanError(cause));
    }
  }, [dispatchResult, scanning]);

  /** 用户选择图片后执行单次本地识别。 */
  const recognizeImage = useCallback(async (file: File): Promise<void> => {
    setRecognizing(true);
    setError(null);
    try {
      dispatchResult(await decodeBrowserQRCodeImage(file));
    } catch {
      setError('未识别到有效二维码，请重新选择');
    } finally {
      setRecognizing(false);
    }
  }, [dispatchResult]);

  if (restoring) return <QRCodePageState label="正在恢复扫码能力" />;
  if (!runtime) return <QRCodePageState label="运行配置不可用" detail={startupError} />;
  if (!snapshot.userID) return <Navigate to="/login" replace />;

  return (
    <main className="rn-qr-page" aria-busy={recognizing}>
      <section className="rn-qr-surface">
        <PageNavbar className="rn-qr-header">
          <button type="button" aria-label="返回" onClick={() => navigate(backHref)}><RNAssetIcon assetURL={backIconURL} /></button>
          <h1>扫一扫</h1><span aria-hidden="true" />
        </PageNavbar>
        <section className="rn-qr-camera" aria-label="二维码摄像头预览">
          <video ref={videoRef} muted playsInline />
          {!scanning ? <RNAssetIcon assetURL={scanIconURL} /> : null}
          <span className="rn-qr-frame" aria-hidden="true" />
          <p>{scanning ? '将二维码放入框内，即可自动扫描' : '点击下方按钮开启摄像头'}</p>
        </section>
        {error ? <p className="rn-qr-error" role="alert">{error}</p> : null}
        <div className="rn-qr-actions">
          <button type="button" className="rn-qr-primary" onClick={() => { scanning ? stopScanning() : void beginScanning(); }}>
            {scanning ? '停止扫码' : '开始扫码'}
          </button>
          <button type="button" className="rn-qr-album" disabled={recognizing} onClick={() => fileRef.current?.click()}>
            <RNAssetIcon assetURL={albumIconURL} /><span>{recognizing ? '正在识别' : '从相册选择'}</span>
          </button>
          <button
            className="rn-qr-my-code"
            type="button"
            onClick={openUserQRCode}
          >
            我的二维码
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={event => {
              /** file 是用户本次明确选择的第一张图片。 */
              const file = event.target.files?.[0];
              event.target.value = '';
              if (file) void recognizeImage(file);
            }}
          />
        </div>
      </section>
    </main>
  );
}

/** 扫码页启动状态参数。 */
interface QRCodePageStateProps {
  readonly label: string;
  readonly detail?: string | null;
}

/** 展示扫码页启动或配置失败状态。 */
function QRCodePageState({ label, detail }: QRCodePageStateProps) {
  return <main className="rn-qr-state"><strong>{label}</strong>{detail ? <span>{detail}</span> : null}</main>;
}

/** 将浏览器媒体异常转换为可操作文案。 */
function readQRCodeScanError(cause: unknown): string {
  if (cause instanceof DOMException && cause.name === 'NotAllowedError') return '未获得相机权限，请在浏览器设置中允许后重试';
  if (cause instanceof DOMException && cause.name === 'NotFoundError') return '未检测到可用摄像头';
  return cause instanceof Error && cause.message ? cause.message : '摄像头启动失败，请重试';
}
