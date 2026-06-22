const BUILD_COMMENT_RE = /<!--\s*build:\s*(.+?)\s*-->/;
const ASSET_HASH_RE = /assets\/index-([A-Za-z0-9_-]+)\.js/;

export const BUILD_ID = __BUILD_ID__;

export function parseBuildIdFromHtml(html: string): string | null {
    const commentMatch = html.match(BUILD_COMMENT_RE);
    if (commentMatch?.[1]) return commentMatch[1].trim();

    const assetMatch = html.match(ASSET_HASH_RE);
    if (assetMatch?.[1]) return assetMatch[1];

    return null;
}

export function getIndexHtmlUrl(): string {
    return new URL(`${import.meta.env.BASE_URL}index.html`, window.location.href).href;
}

export async function fetchRemoteBuildId(): Promise<string | null> {
    try {
        const response = await fetch(getIndexHtmlUrl(), {
            cache: "no-store",
            headers: { "Cache-Control": "no-cache" },
        });
        if (!response.ok) return null;
        return parseBuildIdFromHtml(await response.text());
    } catch {
        return null;
    }
}
