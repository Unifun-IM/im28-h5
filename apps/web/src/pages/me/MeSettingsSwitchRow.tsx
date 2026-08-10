/** 设置开关行参数。 */
interface MeSettingsSwitchRowProps {
  readonly label: string;
  readonly checked: boolean;
  readonly disabled?: boolean;
  readonly onChange: () => void;
}

/** 渲染稳定尺寸的 RN 设置开关。 */
export function MeSettingsSwitchRow({
  label,
  checked,
  disabled = false,
  onChange,
}: MeSettingsSwitchRowProps) {
  return (
    <div className="rn-me-settings-switch-row">
      <span>{label}</span>
      <button
        className="rn-me-settings-switch"
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={onChange}
      ><span /></button>
    </div>
  );
}
