import { DEFAULT_THEME, THEME_KEY } from "@/types/theme";

export function ThemeScript() {
  const script = `
    (function () {
      try {
        var theme = localStorage.getItem("${THEME_KEY}");
        document.documentElement.setAttribute(
          "data-theme",
          theme === "light" ? "light" : "${DEFAULT_THEME}"
        );
      } catch (e) {
        document.documentElement.setAttribute("data-theme", "${DEFAULT_THEME}");
      }
    })();
  `;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
