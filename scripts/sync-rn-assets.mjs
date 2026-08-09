import { createHash } from 'node:crypto';
import { cp, mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** 脚本目录用于稳定推导 H5 与 RN 仓库位置。 */
const SCRIPT_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
/** H5 根目录是同步命令的路径基准。 */
const H5_ROOT = path.resolve(SCRIPT_DIRECTORY, '..');
/** RN 根目录是资产的唯一上游。 */
const PHONE_ROOT = path.resolve(H5_ROOT, '../im28-phone');
/** H5 目标目录保留 RN src 下的相对结构。 */
const TARGET_ROOT = path.resolve(H5_ROOT, 'apps/web/src/assets/rn');
/** 清单名称不参与资产自身的哈希比较。 */
const MANIFEST_NAME = 'asset-manifest.json';
/** 只读模式决定校验现状还是重建目标目录。 */
const IS_CHECK_MODE = process.argv.includes('--check');
/** 资产入口覆盖 RN 当前全部业务静态资源。 */
const SOURCE_MAPPINGS = [
  { source: 'src/assets', target: 'assets' },
  { source: 'src/screens/auth/assets', target: 'screens/auth/assets' },
  {
    source: 'src/components/navbar/nav-arrow-left.svg',
    target: 'components/navbar/nav-arrow-left.svg',
  },
];

/** 递归列出目录中的业务文件并忽略系统元数据。 */
async function listFiles(current) {
  /** entries 是当前目录的稳定排序内容。 */
  const entries = (await readdir(current, { withFileTypes: true })).sort((left, right) =>
    left.name.localeCompare(right.name),
  );
  /** files 收集当前分支下的绝对文件路径。 */
  const files = [];
  for (const entry of entries) {
    if (entry.name === '.DS_Store' || entry.name === MANIFEST_NAME) {
      continue;
    }
    /** entryPath 是当前目录项的绝对路径。 */
    const entryPath = path.join(current, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listFiles(entryPath)));
    } else if (entry.isFile()) {
      files.push(entryPath);
    }
  }
  return files;
}

/** 计算文件内容的 SHA-256，确保目标资产未被二次绘制或压缩。 */
function hashContent(content) {
  return createHash('sha256').update(content).digest('hex');
}

/** 构建以目标相对路径为键的可追踪资产清单。 */
async function buildSourceManifest() {
  /** records 保存所有上游文件的目标路径、大小与哈希。 */
  const records = [];
  for (const mapping of SOURCE_MAPPINGS) {
    /** sourcePath 是当前资产入口的绝对路径。 */
    const sourcePath = path.resolve(PHONE_ROOT, mapping.source);
    /** sourceStats 区分单文件入口和目录入口。 */
    const sourceStats = await stat(sourcePath);
    /** sourceFiles 统一为待处理文件列表。 */
    const sourceFiles = sourceStats.isDirectory()
      ? await listFiles(sourcePath)
      : [sourcePath];
    for (const sourceFile of sourceFiles) {
      /** targetPath 是写入 H5 后的 POSIX 相对路径。 */
      const targetPath = sourceStats.isDirectory()
        ? path.posix.join(
            mapping.target,
            path.relative(sourcePath, sourceFile).split(path.sep).join('/'),
          )
        : mapping.target;
      /** content 是哈希和大小的唯一输入。 */
      const content = await readFile(sourceFile);
      records.push({
        path: targetPath,
        bytes: content.byteLength,
        sha256: hashContent(content),
      });
    }
  }
  return records.sort((left, right) => left.path.localeCompare(right.path));
}

/** 构建 H5 已同步目录的实际文件清单。 */
async function buildTargetManifest() {
  /** targetFiles 是目标目录中的全部业务资产。 */
  const targetFiles = await listFiles(TARGET_ROOT);
  /** records 保存目标文件的相对路径、大小与哈希。 */
  const records = [];
  for (const targetFile of targetFiles) {
    /** content 是目标文件校验输入。 */
    const content = await readFile(targetFile);
    records.push({
      path: path.relative(TARGET_ROOT, targetFile).split(path.sep).join('/'),
      bytes: content.byteLength,
      sha256: hashContent(content),
    });
  }
  return records.sort((left, right) => left.path.localeCompare(right.path));
}

/** 比较源与目标清单，任一缺失或字节变化都使命令失败。 */
function assertMatchingAssets(sourceRecords, targetRecords) {
  /** sourceJSON 用稳定 JSON 表达上游事实。 */
  const sourceJSON = JSON.stringify(sourceRecords);
  /** targetJSON 用稳定 JSON 表达 H5 复制结果。 */
  const targetJSON = JSON.stringify(targetRecords);
  if (sourceJSON !== targetJSON) {
    throw new Error('RN assets 与 H5 同步目录不一致，请运行 npm run assets:sync');
  }
}

/** 校验生成清单本身，避免文件正确但追踪证据被篡改或过期。 */
async function assertRecordedManifest(sourceRecords) {
  /** manifestPath 是同步证据的固定绝对路径。 */
  const manifestPath = path.join(TARGET_ROOT, MANIFEST_NAME);
  /** manifest 是当前入库的资产来源与哈希记录。 */
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  /** hasExpectedMetadata 保证清单来源和文件计数未漂移。 */
  const hasExpectedMetadata =
    manifest.version === 1 &&
    manifest.source === '../im28-phone/src' &&
    manifest.generatedBy === 'npm run assets:sync' &&
    manifest.fileCount === sourceRecords.length;
  if (!hasExpectedMetadata || JSON.stringify(manifest.files) !== JSON.stringify(sourceRecords)) {
    throw new Error('RN asset-manifest.json 已过期，请运行 npm run assets:sync');
  }
}

/** 重建 H5 资产镜像并写入可审计哈希清单。 */
async function syncAssets(sourceRecords) {
  await rm(TARGET_ROOT, { recursive: true, force: true });
  await mkdir(TARGET_ROOT, { recursive: true });
  for (const mapping of SOURCE_MAPPINGS) {
    /** sourcePath 是复制入口的上游绝对路径。 */
    const sourcePath = path.resolve(PHONE_ROOT, mapping.source);
    /** targetPath 是复制入口的 H5 绝对路径。 */
    const targetPath = path.resolve(TARGET_ROOT, mapping.target);
    await mkdir(path.dirname(targetPath), { recursive: true });
    await cp(sourcePath, targetPath, {
      recursive: true,
      filter: copiedPath => path.basename(copiedPath) !== '.DS_Store',
    });
  }
  /** manifest 固化资产来源、数量和逐文件哈希。 */
  const manifest = {
    version: 1,
    source: '../im28-phone/src',
    generatedBy: 'npm run assets:sync',
    fileCount: sourceRecords.length,
    files: sourceRecords,
  };
  await writeFile(
    path.join(TARGET_ROOT, MANIFEST_NAME),
    `${JSON.stringify(manifest, null, 2)}\n`,
    'utf8',
  );
}

/** main 执行同步或只读一致性校验。 */
async function main() {
  /** sourceRecords 是 RN 当前资产真相。 */
  const sourceRecords = await buildSourceManifest();
  if (!IS_CHECK_MODE) {
    await syncAssets(sourceRecords);
  }
  /** targetRecords 是同步后或待校验的 H5 资产状态。 */
  const targetRecords = await buildTargetManifest();
  assertMatchingAssets(sourceRecords, targetRecords);
  await assertRecordedManifest(sourceRecords);
  process.stdout.write(`RN assets verified: ${sourceRecords.length} files\n`);
}

await main();
