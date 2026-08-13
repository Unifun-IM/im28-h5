/** 用户名片二维码的稳定来源标识。 */
export declare const IM28_USER_QR_SOURCE: "myCard";
/** 群名片二维码的稳定来源标识。 */
export declare const IM28_GROUP_QR_SOURCE: "groupCard";
/** 用户二维码解析结果。 */
export interface IM28UserQRCodeTarget {
    readonly kind: 'user';
    readonly source: typeof IM28_USER_QR_SOURCE;
    readonly id: string;
}
/** 群二维码解析结果。 */
export interface IM28GroupQRCodeTarget {
    readonly kind: 'group';
    readonly source: typeof IM28_GROUP_QR_SOURCE;
    readonly id: string;
}
/** 业务可消费的二维码目标联合类型。 */
export type IM28QRCodeTarget = IM28UserQRCodeTarget | IM28GroupQRCodeTarget;
/** 生成与 RN 当前协议一致的用户名片 JSON。 */
export declare function buildIM28UserQRCodePayload(userID: string): string;
/** 生成与 RN 当前协议一致的用户名片 URL。 */
export declare function buildIM28UserQRCodeURL(userID: string): string;
/** 生成与 RN 当前协议一致的群名片 JSON。 */
export declare function buildIM28GroupQRCodePayload(groupID: string): string;
/** 生成与 RN 当前协议一致的群名片 URL。 */
export declare function buildIM28GroupQRCodeURL(groupID: string): string;
/** 解析 RN/Web 共用的 IM28 用户或群二维码协议。 */
export declare function parseIM28QRCodeTarget(rawText: string): IM28QRCodeTarget | null;
//# sourceMappingURL=payload.d.ts.map