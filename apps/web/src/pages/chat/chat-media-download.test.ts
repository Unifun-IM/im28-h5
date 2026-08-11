import { describe, expect, it, vi } from 'vitest';

import {
  downloadChatMedia,
  getChatMediaDownloadName,
  openChatMedia,
  sanitizeChatDownloadName,
  type ChatMediaDownloadEnvironment,
} from './chat-media-download.js';

/** 构造无 DOM、无真实网络的浏览器媒体环境。 */
function createEnvironment(response = new Response('file-body')) {
  // triggerDownload 记录最终 object URL 与文件名。
  const triggerDownload = vi.fn();
  // releaseObjectURL 记录短期 URL 已安排释放。
  const releaseObjectURL = vi.fn();
  // openExternal 默认模拟浏览器成功创建新标签页。
  const openExternal = vi.fn(() => true);
  // environment 注入所有外部副作用。
  const environment: ChatMediaDownloadEnvironment = {
    fetchResource: vi.fn(async () => response),
    createObjectURL: vi.fn(() => 'blob:download-1'),
    releaseObjectURL,
    triggerDownload,
    openExternal,
  };
  return { environment, triggerDownload, releaseObjectURL, openExternal };
}

// 浏览器媒体下载测试锁定真实响应、文件名、安全协议和失败语义。
describe('chat media download', () => {
  it('取得成功 Blob 后触发一次下载并释放 object URL', async () => {
    // harness 持有本例可观察的下载依赖。
    const harness = createEnvironment();
    await downloadChatMedia(
      { url: 'https://media.example.com/report.pdf', fileName: 'report.pdf' },
      harness.environment,
    );
    expect(harness.environment.fetchResource).toHaveBeenCalledWith(
      'https://media.example.com/report.pdf',
    );
    expect(harness.triggerDownload).toHaveBeenCalledWith(
      'blob:download-1',
      'report.pdf',
    );
    expect(harness.releaseObjectURL).toHaveBeenCalledWith('blob:download-1');
  });

  it('HTTP 失败不会触发下载或制造成功', async () => {
    // harness 使用明确 403 响应模拟真实下载拒绝。
    const harness = createEnvironment(new Response('', { status: 403 }));
    await expect(
      downloadChatMedia(
        { url: 'https://media.example.com/private.zip', fileName: 'private.zip' },
        harness.environment,
      ),
    ).rejects.toThrow('下载失败（HTTP 403）。');
    expect(harness.triggerDownload).not.toHaveBeenCalled();
    expect(harness.releaseObjectURL).not.toHaveBeenCalled();
  });

  it('拒绝不安全协议并清理服务端文件名', async () => {
    // harness 证明协议校验发生在网络 I/O 前。
    const harness = createEnvironment();
    await expect(
      downloadChatMedia(
        { url: 'javascript:alert(1)', fileName: '../x?.txt' },
        harness.environment,
      ),
    ).rejects.toThrow('文件地址不可用。');
    expect(harness.environment.fetchResource).not.toHaveBeenCalled();
    expect(sanitizeChatDownloadName('../x?.txt')).toBe('x_.txt');
  });

  it('优先服务端名称并可从编码 URL 推导图片名', () => {
    expect(
      getChatMediaDownloadName(
        'https://media.example.com/images/%E7%85%A7%E7%89%87.png?x=1',
        '',
        '图片',
      ),
    ).toBe('照片.png');
    expect(
      getChatMediaDownloadName(
        'https://media.example.com/ignored.bin',
        '服务端.pdf',
        '文件',
      ),
    ).toBe('服务端.pdf');
  });

  it('打开动作对弹窗拦截显式失败', () => {
    // harness 将新窗口结果固定为被浏览器拦截。
    const harness = createEnvironment();
    harness.openExternal.mockReturnValue(false);
    expect(() =>
      openChatMedia('https://media.example.com/report.pdf', harness.environment),
    ).toThrow('浏览器阻止了文件预览窗口。');
  });
});
