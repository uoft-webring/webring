import { describe, expect, it } from "vitest";
import { classifySendError, escapeHtml } from "@/lib/email";

function awsError(name: string, httpStatusCode?: number): Error {
    return Object.assign(new Error(name), { name, $metadata: { httpStatusCode } });
}

describe("classifySendError", () => {
    it("retries refusals that say nothing about the message", () => {
        for (const name of ["TooManyRequestsException", "SendingPausedException", "MessageRejected", "AccessDeniedException"]) {
            expect(classifySendError(awsError(name, 400)), name).toBe("retryable");
        }
    });

    it("never retries a message SES refused for good", () => {
        expect(classifySendError(awsError("BadRequestException", 400))).toBe("permanent");
        expect(classifySendError(awsError("NotFoundException", 404))).toBe("permanent");
    });

    it("treats timeouts, network errors and 5xx as maybe delivered", () => {
        expect(classifySendError(awsError("InternalFailure", 500))).toBe("unknown");
        expect(classifySendError(Object.assign(new Error("aborted"), { name: "AbortError" }))).toBe("unknown");
        expect(classifySendError(new Error("socket hang up"))).toBe("unknown");
        expect(classifySendError(null)).toBe("unknown");
    });
});

describe("escapeHtml", () => {
    it("escapes everything that matters in HTML", () => {
        expect(escapeHtml(`<a href="x" title='y'>&</a>`)).toBe("&lt;a href=&quot;x&quot; title=&#39;y&#39;&gt;&amp;&lt;/a&gt;");
    });
});
