/** 判断异步交互结果是否仍属于页面最后一次请求代次。 */
export function isCurrentInteractionRequest(
  currentRequestID: number,
  candidateRequestID: number,
): boolean {
  return currentRequestID === candidateRequestID;
}
