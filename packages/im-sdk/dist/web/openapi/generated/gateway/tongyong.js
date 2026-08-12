// @ts-ignore
/* eslint-disable */
import request from "../../request.js";
/** 获取文件上传凭证 前端先获取 OSS 表单直传凭证，再把文件直接上传到 OSS/CDN。图片最大 10MB，音频和普通文件最大 100MB，视频最大 500MB，凭证默认 5 分钟有效。 POST /v1/common/upload-credential */
export async function postV1CommonUploadCredential(body, options) {
    return request("/v1/common/upload-credential", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    });
}
//# sourceMappingURL=tongyong.js.map