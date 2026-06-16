import { DEFAULT_THEME, THEME_KEY } from "@/types/theme";

export function ThemeScript() {
  const script = `
    (function () {
      try {
        var stored = localStorage.getItem("${THEME_KEY}");
        var theme = stored;
        if (theme !== "light" && theme !== "dark") {
          theme = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "${DEFAULT_THEME}";
        }
        document.documentElement.setAttribute("data-theme", theme);
      } catch (e) {
        document.documentElement.setAttribute("data-theme", "${DEFAULT_THEME}");
      }
    })();
  `;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
