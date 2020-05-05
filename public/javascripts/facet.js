// left facet 클릭 이벤트
document
  .querySelectorAll('button[data-role="left-facet"]')
  .forEach(function (v) {
    v.addEventListener("click", function () {
      let group = this.dataset.group;
      let left_facet = this.dataset.name;
      let posted_value = document.querySelector('input[name="posted_value"]')
        .value;
      let col_name;
      switch (group) {
        case "결재권자":
          col_name = "ceo_name";
          break;
        case "업무기능":
          col_name = "task_function";
          break;
        case "생산기관":
          col_name = "product_org";
          break;
      }
      //  left facet, 관련 컬럼명 post 로 넘겨주기
      let form = document.createElement("form");
      let input = document.createElement("input");
      input.type = "hidden";
      input.name = "filter";
      input.value = col_name + ":" + left_facet + ";";
      if (posted_value !== "") input.value = input.value + posted_value;
      form.appendChild(input);

      form.method = "POST";
      form.action = location.pathname;
      console.log("form : ", form);
    });
  });

function searchText() {
  return false;
}
