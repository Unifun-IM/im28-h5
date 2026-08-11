/** Gateway 允许的会话自动删除时长，单位为秒。 */
export const CONVERSATION_AUTO_DELETE_SECONDS = [
    0,
    21_600,
    43_200,
    86_400,
    259_200,
    604_800,
    1_296_000,
    2_592_000,
    5_184_000,
    7_776_000,
    15_552_000,
];
/** 将未知输入收窄为服务端允许的自动删除秒数。 */
export function normalizeConversationAutoDeleteSeconds(value) {
    if (typeof value !== 'number' || !Number.isSafeInteger(value)) {
        return undefined;
    }
    /** allowedValues 以只读 number 视图执行运行时成员校验。 */
    const allowedValues = CONVERSATION_AUTO_DELETE_SECONDS;
    return allowedValues.includes(value)
        ? value
        : undefined;
}
//# sourceMappingURL=conversation-auto-delete.js.map