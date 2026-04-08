"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sleep = sleep;
exports.fetchAndRetry = fetchAndRetry;
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
/**
 * This function extends fetch to allow retrying
 * If the request returns a 429 error code, it will wait and retry after "retry_after" seconds
 */
function fetchAndRetry(input_1, init_1) {
    return __awaiter(this, arguments, void 0, function* (input, init, nRetries = 3) {
        try {
            // Make the request
            const response = yield fetch(input, init);
            // If there's a 429 error code, retry after retry_after seconds
            // https://discord.com/developers/docs/topics/rate-limits#rate-limits
            if (response.status === 429 && nRetries > 0) {
                const retryAfter = Number(response.headers.get('retry_after'));
                if (Number.isNaN(retryAfter)) {
                    return response;
                }
                yield sleep(retryAfter * 1000);
                return yield fetchAndRetry(input, init, nRetries - 1);
            }
            return response;
        }
        catch (ex) {
            if (nRetries <= 0) {
                throw ex;
            }
            // If the request failed, wait one second before trying again
            // This could probably be fancier with exponential backoff
            yield sleep(1000);
            return yield fetchAndRetry(input, init, nRetries - 1);
        }
    });
}
