
const hotspots = document.querySelectorAll(".hotspot");
const selectedSpace = document.querySelector("#selectedSpace");

hotspots.forEach((button) => {
  button.addEventListener("click", () => {

    // 기존 선택 해제
    hotspots.forEach((item) => {
      item.classList.remove("active");
    });

    // 클릭한 항목 선택
    button.classList.add("active");

    // 항목 이름과 설명 가져오기
    const name = button.dataset.name;
    const description = button.dataset.description;

    // 선택한 시공 정보 표시
    selectedSpace.innerHTML = `
      <p>SELECTED SPACE</p>
      <h3>${name}</h3>
      <span>${description}</span>
    `;

  });
});

// ======================================
// GALLERY 페이지 기능
// ======================================

const galleryList = document.querySelector("#galleryList");
const galleryPagination = document.querySelector("#galleryPagination");

if (galleryList && galleryPagination) {

  const GALLERY_SUPABASE_URL =
    "https://dbrjtwzutsdixssvolae.supabase.co";

  const GALLERY_SUPABASE_KEY =
    "sb_publishable_ixVf_P6QdVK5u6bpxQEKPA_v_4zVNAb";

  const galleryClient = window.supabase.createClient(
    GALLERY_SUPABASE_URL,
    GALLERY_SUPABASE_KEY
  );

  let galleryWorks = [];
  let galleryCategory = "all";
  let galleryPage = 1;

  let galleryPageSize = window.matchMedia("(max-width: 768px)").matches
    ? 10
    : 9;

  const categoryNames = {
    entrance: "ENTRANCE",
    kitchen: "KITCHEN",
    door: "DOOR",
    finish: "FINISH",
    window: "WINDOW",
    furniture: "FURNITURE"
  };

  function escapeGalleryHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    })[char]);
  }

  async function loadGalleryWorks() {

    galleryList.innerHTML = "<p>시공 사례를 불러오는 중입니다.</p>";

    const { data, error } = await galleryClient
      .from("works")
      .select("id, title, description, category, after_image, gallery_pairs, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("GALLERY 불러오기 오류:", error);
      galleryList.innerHTML =
        "<p>시공 사례를 불러오지 못했습니다.</p>";
      return;
    }

    galleryWorks = data || [];

    renderGallery();
  }

  function renderGallery() {

    const filteredWorks = galleryCategory === "all"
      ? galleryWorks
      : galleryWorks.filter(work =>
          work.category === galleryCategory
        );

    const totalPages = Math.ceil(
      filteredWorks.length / galleryPageSize
    );

    if (galleryPage > totalPages) {
      galleryPage = Math.max(1, totalPages);
    }

    const startIndex = (galleryPage - 1) * galleryPageSize;

    const pageWorks = filteredWorks.slice(
      startIndex,
      startIndex + galleryPageSize
    );

    if (filteredWorks.length === 0) {
      galleryList.innerHTML =
        "<p>등록된 시공 사례가 없습니다.</p>";
      galleryPagination.innerHTML = "";
      return;
    }

    galleryList.innerHTML = pageWorks.map(work => {

      const firstPair = Array.isArray(work.gallery_pairs)
        ? work.gallery_pairs.find(pair => pair.after)
        : null;

      const afterImage = work.after_image || firstPair?.after;

      return `
        <a class="gallery-card"
           href="work.html?id=${encodeURIComponent(work.id)}">

          <div class="gallery-card-image">
            ${afterImage
              ? `<img src="${escapeGalleryHTML(afterImage)}" alt="${escapeGalleryHTML(work.title)}" loading="lazy">`
              : "<span>PHOTO PREPARING</span>"
            }
          </div>

          <div class="gallery-card-info">
            <span class="gallery-category">
              ${escapeGalleryHTML(categoryNames[work.category] || work.category || "")}
            </span>

            <h3>${escapeGalleryHTML(work.title)}</h3>
          </div>

        </a>
      `;
    }).join("");

    renderGalleryPagination(totalPages);
  }

  function renderGalleryPagination(totalPages) {

    if (totalPages <= 1) {
      galleryPagination.innerHTML = "";
      return;
    }

    let buttons = `
      <button data-page="${galleryPage - 1}"
        ${galleryPage === 1 ? "disabled" : ""}>
        PREV
      </button>
    `;

    for (let i = 1; i <= totalPages; i++) {
      buttons += `
        <button data-page="${i}"
          class="${i === galleryPage ? "active" : ""}">
          ${i}
        </button>
      `;
    }

    buttons += `
      <button data-page="${galleryPage + 1}"
        ${galleryPage === totalPages ? "disabled" : ""}>
        NEXT
      </button>
    `;

    galleryPagination.innerHTML = buttons;
  }

  // 페이지 번호 클릭
  galleryPagination.addEventListener("click", event => {

    const button = event.target.closest("button[data-page]");

    if (!button || button.disabled) return;

    galleryPage = Number(button.dataset.page);

    renderGallery();

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });

  // 카테고리 필터
  document.querySelectorAll(".gallery-filters button")
    .forEach(button => {

      button.addEventListener("click", () => {

        document.querySelectorAll(".gallery-filters button")
          .forEach(item => item.classList.remove("active"));

        button.classList.add("active");

        galleryCategory = button.dataset.category;
        galleryPage = 1;

        renderGallery();
      });
    });

  // PC와 모바일 페이지당 표시 개수 변경
  window.addEventListener("resize", () => {

    const newPageSize =
      window.matchMedia("(max-width: 768px)").matches ? 10 : 9;

    if (newPageSize !== galleryPageSize) {
      galleryPageSize = newPageSize;
      galleryPage = 1;
      renderGallery();
    }
  });

  loadGalleryWorks();
}
