
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
