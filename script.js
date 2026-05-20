document.addEventListener("DOMContentLoaded", () => {
  buildPage();
  initSearch();
  highlightActiveSection();
  window.addEventListener("scroll", highlightActiveSection);
});

function buildPage() {
  const data = window.docsContent;
  document.title = data.siteTitle;
  document.getElementById("site-brand").textContent = data.siteTitle;

  buildSidebar(data.sections);
  buildSections(data.sections);
}

function buildSidebar(sections) {
  const nav = document.getElementById("sidebar-nav");
  sections.forEach(section => {
    const a = document.createElement("a");
    a.href = "#" + section.id;
    a.className = "sidebar-link";
    a.dataset.target = section.id;

    a.textContent = section.category;

    a.addEventListener("click", e => {
      e.preventDefault();
      const el = document.getElementById(section.id);
      if (!el) return;
      const offset = 54 + 50 + 16;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    });

    nav.appendChild(a);
  });
}

function buildSections(sections) {
  const container = document.getElementById("sections-container");

  sections.forEach(section => {
    const card = document.createElement("div");
    card.className = "doc-section";
    card.id = section.id;

    section.blocks.forEach(block => {
      const el = renderBlock(block);
      if (el) card.appendChild(el);
    });

    container.appendChild(card);
  });
}

function renderBlock(block) {
  switch (block.type) {
    case "title": {
      const wrap = document.createElement("div");
      wrap.className = "block-title-wrap";
      const h2 = document.createElement("h2");
      h2.className = "block-title";
      h2.textContent = block.content;
      const anchor = document.createElement("a");
      anchor.className = "block-anchor";
      anchor.textContent = "#";
      wrap.appendChild(h2);
      wrap.appendChild(anchor);
      return wrap;
    }
    case "subtitle": {
      const p = document.createElement("p");
      p.className = "block-subtitle";
      p.textContent = block.content;
      return p;
    }
    case "text": {
      const p = document.createElement("p");
      p.className = "block-text";
      p.textContent = block.content;
      return p;
    }
    case "snippet": {
      const wrap = document.createElement("div");
      wrap.className = "block-snippet";

      const header = document.createElement("div");
      header.className = "snippet-header";

      const label = document.createElement("span");
      label.className = "snippet-label";
      label.textContent = block.label || "code";

      const copyBtn = document.createElement("button");
      copyBtn.className = "copy-btn";
      copyBtn.textContent = "copy";
      copyBtn.addEventListener("click", () => {
        navigator.clipboard.writeText(block.content).then(() => {
          copyBtn.textContent = "copied";
          copyBtn.classList.add("copied");
          setTimeout(() => {
            copyBtn.textContent = "copy";
            copyBtn.classList.remove("copied");
          }, 1600);
        });
      });

      header.appendChild(label);
      header.appendChild(copyBtn);

      const pre = document.createElement("pre");
      const code = document.createElement("code");
      code.textContent = block.content;
      pre.appendChild(code);

      wrap.appendChild(header);
      wrap.appendChild(pre);
      return wrap;
    }
    default:
      return null;
  }
}

function initSearch() {
  const input = document.getElementById("search-input");
  const results = document.getElementById("search-results");
  const sections = window.docsContent.sections;

  input.addEventListener("input", () => {
    const q = input.value.trim().toLowerCase();
    results.innerHTML = "";

    if (!q) {
      results.classList.remove("visible");
      return;
    }

    const matches = sections.filter(s => {
      const text = s.blocks.map(b => b.content).join(" ").toLowerCase();
      return s.category.toLowerCase().includes(q) || text.includes(q);
    });

    if (!matches.length) {
      results.classList.remove("visible");
      return;
    }

    matches.forEach(m => {
      const item = document.createElement("div");
      item.className = "search-result-item";

      const name = document.createElement("span");
      name.className = "result-name";
      name.textContent = m.category;

      const preview = document.createElement("span");
      preview.className = "result-preview";
      const textBlock = m.blocks.find(b => b.type === "text");
      preview.textContent = textBlock ? textBlock.content.slice(0, 60) + "…" : "";

      item.appendChild(name);
      item.appendChild(preview);

      item.addEventListener("click", () => {
        const el = document.getElementById(m.id);
        if (el) {
          const offset = 54 + 50 + 16;
          const top = el.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top, behavior: "smooth" });
        }
        results.classList.remove("visible");
        input.value = "";
      });

      results.appendChild(item);
    });

    results.classList.add("visible");
  });

  document.addEventListener("click", e => {
    if (!e.target.closest("#search-bar")) {
      results.classList.remove("visible");
    }
  });
}

function highlightActiveSection() {
  const links = document.querySelectorAll(".sidebar-link");
  const sections = document.querySelectorAll(".doc-section");
  let current = "";

  sections.forEach(s => {
    if (s.getBoundingClientRect().top <= 130) current = s.id;
  });

  links.forEach(link => {
    link.classList.toggle("active", link.dataset.target === current);
  });
}

