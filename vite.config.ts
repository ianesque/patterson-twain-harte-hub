import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig, type Plugin } from "vite";

const buildId = process.env.BUILD_ID ?? new Date().toISOString();

function buildVersionPlugin(id: string): Plugin {
    return {
        name: "build-version",
        config() {
            return {
                define: {
                    __BUILD_ID__: JSON.stringify(id),
                },
            };
        },
        transformIndexHtml(html) {
            if (html.includes("<!-- build:")) {
                return html.replace(/<!--\s*build:\s*.+?\s*-->/, `<!-- build: ${id} -->`);
            }
            return html.replace("<head>", `<head>\n        <!-- build: ${id} -->`);
        },
    };
}

export default defineConfig({
    base: "./",
    plugins: [buildVersionPlugin(buildId), react(), tailwindcss()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
});
