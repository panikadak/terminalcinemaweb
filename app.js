const catalogEndpoint = new URL(
  "/rest/v1/terminalcinema_films",
  "https://zwhtqovkafggjlhcwaiz.supabase.co"
);

catalogEndpoint.searchParams.set("select", "slug,name,url,position");
catalogEndpoint.searchParams.set("enabled", "eq.true");
catalogEndpoint.searchParams.set("order", "position.asc,name.asc");

const publicKey = "sb_publishable_1aVNT_wKZlB4v8Xk96Dclg_Q67mewF2";
const fallbackFilms = [
  { slug: "ethereum", name: "Vitalik: An Ethereum Story" },
  { slug: "metropolis", name: "Metropolis (1927)" }
];

const filmList = document.querySelector("#film-list");

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderFilms(films) {
  if (!filmList) {
    return;
  }

  filmList.innerHTML = films
    .map((film, index) => {
      const name = escapeHtml(film.name);
      const slug = escapeHtml(film.slug);
      const command = `npx terminalcinema ${film.slug}`;
      const safeCommand = escapeHtml(command);

      return `
        <article class="film-row">
          <span class="film-index">${String(index + 1).padStart(2, "0")}</span>
          <span class="film-title">${name}</span>
          <span class="film-command">
            <code>${safeCommand}</code>
            <button class="row-copy" type="button" data-copy-text="${safeCommand}">Copy</button>
          </span>
        </article>
      `;
    })
    .join("");
}

async function loadFilms() {
  try {
    const response = await fetch(catalogEndpoint, {
      headers: {
        apikey: publicKey,
        Authorization: `Bearer ${publicKey}`
      }
    });

    if (!response.ok) {
      throw new Error(`Catalog request failed with ${response.status}`);
    }

    const films = await response.json();
    renderFilms(Array.isArray(films) && films.length > 0 ? films : fallbackFilms);
  } catch {
    renderFilms(fallbackFilms);
  }
}

document.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-copy-text]");

  if (!button) {
    return;
  }

  const text = button.dataset.copyText;
  const initialLabel = button.dataset.copyLabel || button.textContent;
  button.dataset.copyLabel = initialLabel;

  try {
    await navigator.clipboard.writeText(text);
    button.textContent = initialLabel === initialLabel.toUpperCase() ? "COPIED" : "Copied";
    window.setTimeout(() => {
      button.textContent = button.dataset.copyLabel || "Copy";
    }, 1400);
  } catch {
    button.textContent = text;
  }
});

loadFilms();
