import { useRef, type KeyboardEvent } from 'react';

import searchIconURL from '../../assets/rn/assets/icons/imm28/search.regular.svg';
import clearIconURL from '../../assets/rn/assets/icons/imm28/xmark-circle.solid.svg';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';

/** 首页搜索输入只翻译浏览器事件，不持有搜索业务状态。 */
export interface ConversationSearchInputProps {
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly onSubmit: () => void;
}

/** 复刻 RN AppSearchBox 的搜索、提交和默认可清除交互。 */
export function ConversationSearchInput({ value, onChange, onSubmit }: ConversationSearchInputProps) {
  /** inputRef 让清除操作后继续保持 RN TextInput 编辑态。 */
  const inputRef = useRef<HTMLInputElement>(null);
  /** submitOnEnter 将浏览器 Enter 翻译为 RN search return key。 */
  function submitOnEnter(event: KeyboardEvent<HTMLInputElement>): void {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    onSubmit();
  }

  /** clearInput 清空查询并恢复输入焦点，避免移动端键盘收起。 */
  function clearInput(): void {
    onChange('');
    inputRef.current?.focus();
  }

  return (
    <label className="rn-conversation-search-input">
      <span className="sr-only">搜索</span>
      <RNAssetIcon assetURL={searchIconURL} />
      <input
        ref={inputRef}
        type="search"
        autoFocus
        autoCapitalize="none"
        autoComplete="off"
        value={value}
        placeholder="搜索"
        onChange={event => onChange(event.target.value)}
        onKeyDown={submitOnEnter}
      />
      {value ? (
        <button type="button" aria-label="清除" onClick={clearInput}>
          <RNAssetIcon assetURL={clearIconURL} />
        </button>
      ) : null}
    </label>
  );
}
