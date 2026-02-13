console.log("loadComponents.js ejecutándose...");

document.addEventListener("DOMContentLoaded", () => {
  const includes = document.querySelectorAll("include[src]");

  includes.forEach(async (include) => {
    const src = include.getAttribute("src");
    try {
      const response = await fetch(src);
      if (!response.ok) {
        throw new Error(`Error loading ${src}: ${response.statusText}`);
      }
      const html = await response.text();
      include.outerHTML = html;
    } catch (error) {
      console.error(error);
      include.outerHTML = `<p>Error loading component: ${src}</p>`;
    }
  });
});
