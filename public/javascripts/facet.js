// left facet 클릭 이벤트
document.querySelectorAll('button[data-role="left-facet"]').forEach(function (v) {
  v.addEventListener("click", function () {
    let group = this.dataset.group;
    let left_facet = this.dataset.name;
    let col_name;
    switch (group) {
      case "결재권자":
        col_name = "ceo_name";
        break;
      case "업무기능":
        col_name = "task_function";
        break;
      case "생산기관":
        col_name = "create_org";
        break;
    }
    //  left facet, 관련 컬럼명 post 로 넘겨주기
    fnPostLeftFacet(col_name, left_facet);
  });
});

//  filter 삭제 클릭 이벤트
let filtered_list = document.querySelectorAll(".filter-wrap i");
filtered_list.forEach(function (i) {
  i.addEventListener("click", function () {
    let form = document.createElement("form");
    let input = document.createElement("input");
    input.type = "hidden";
    input.name = "filter";
    let remove_filter = this.dataset.value;
    filtered_list.forEach(function (v) {
      if (v.dataset.value !== remove_filter) {
        input.value = input.value + v.dataset.value + ";";
      }
    });
    form.appendChild(input);
    form.method = "POST";
    //  필터를 삭제할 때도 페이지를 항상 1로 설정해준다.
    form.action = "/facet/" + document.querySelector('input[name="title"]').value + "/1";
    document.body.appendChild(form);
    form.submit();
  });
});
function searchText() {
  return false;
}
//  제목 클릭시 상세페이지 표시
document.querySelectorAll("#list-part a[data-id]").forEach(function (a) {
  a.addEventListener("click", function () {
    let id = this.dataset.id;
    let title = document.querySelector('input[name="title"]').value;
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "/detail/" + title + "/" + id, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = function () {
      if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
        let res = JSON.parse(this.response);
        fnCreateDetail(res.result.rows[0]);
      }
    };
    xhr.send();
  });
});
//  상세페이지 생성
const fnCreateDetail = function (row) {
  //  각 속성의 제목들의 data-view 속성을 true 로 변경 -> 한 마디로 보이게 함.
  document.querySelector('p[data-attr="title"]').dataset.view = "true";
  //  메인 이미지
  document.querySelector(".mainImg-wrap").classList.remove("d-none");
  let img = document.querySelector('img[name="mainImg"]');
  img.src = "/images/" + row[rowIdx["그림"]].split(",")[0];
  img.alt = row[rowIdx["그림"]].split(",")[0];
  //  제목
  let title = document.querySelector('h5[name="title"]');
  title.innerHTML = row[rowIdx["기록물(건)명"]];
  //  설명
  let desc = document.querySelector('p[name="description"]');
  desc.innerHTML = row[rowIdx["설명"]];
  desc.dataset.view = true;
  //  속성정보
  let span = document.createElement("span");
  let attrWrap = document.querySelector(".attr-wrap");
  attrWrap.innerHTML = "";
  [
    "생산기관",
    "업무기능",
    "교육회의",
    "결재권자",
    "보고유형",
    "공간",
    "관련지역",
    "관련장소",
    "부대",
    "핵심키워드",
    "이벤트",
    "기안자_보고자",
    "사람",
    "소속",
  ].forEach(function (v) {
    if (row[rowIdx[v]]) {
      let rowWrap = document.createElement("div");
      rowWrap.className = "row-wrap-between";
      span = document.createElement("span");
      span.innerText = v;
      rowWrap.appendChild(span);

      span = document.createElement("span");
      span.innerText = row[rowIdx[v]];
      rowWrap.appendChild(span);
      attrWrap.appendChild(rowWrap);
    }
  });
  //  상세 이미지 리스트
  let imgWrap = $(".img-wrap");
  let fullScreen = $(".slick-fullScreen");
  let img_list = row[rowIdx["그림"]].split(",");
  if (imgWrap.attr("class").indexOf("slick") > -1) {
    imgWrap.slick("unslick");
    imgWrap.html("");
  }
  if (fullScreen.attr("class").indexOf("slick-slide ") > -1) {
    fullScreen.slick("unslick");
    fullScreen.html("");
  }
  img_list.forEach(function (v, idx) {
    let div = document.createElement("div");
    let img = document.createElement("img");
    img.src = "/images/" + v;
    img.alt = v + "_" + idx;
    img.addEventListener("click", function () {
      document.querySelector("#fullScreen").dataset.view = "true";
      if (fullScreen.attr("class").indexOf("slick-slider") === -1) {
        fullScreen.slick({
          dots: true,
          slidesPerRow: 1,
          initialSlide: idx,
          prevArrow: '<i class="nc-icon nc-minimal-left"></i>',
          nextArrow: '<i class="nc-icon nc-minimal-right"></i>',
        });
      } else {
        fullScreen.slick("slickGoTo", idx);
      }
    });
    div.appendChild(img);
    imgWrap.append(div);
  });
  imgWrap.contents().clone().appendTo(".slick-fullScreen");
  imgWrap.slick({
    dots: true,
    slidesPerRow: 5,
    rows: 2,
    prevArrow: '<i class="nc-icon nc-minimal-left"></i>',
    nextArrow: '<i class="nc-icon nc-minimal-right"></i>',
  });
};
//  페이지 클릭 이벤트
document.querySelectorAll("button[data-page]").forEach(function (btn) {
  btn.addEventListener("click", function () {
    let title = document.querySelector('input[name="title"]').value;
    let form = document.createElement("form");
    form.method = "POST";
    form.action = "/facet/" + title + "/" + this.dataset.page;
    let input = document.createElement("input");
    input.type = "hidden";
    input.name = "filter";
    //  기존에 필터링 되어 있는 부분 확인 및 적용하기
    let filterList = [];
    document.querySelectorAll(".filter-wrap i").forEach(function (v) {
      filterList.push(v.dataset.value);
    });
    input.value = filterList.join(";");
    form.appendChild(input);
    document.body.appendChild(form);
    form.submit();
  });
});
// fullScreen 닫기
document.querySelector("#fullScreen i.nc-icon").addEventListener("click", function () {
  document.querySelector("#fullScreen").dataset.view = "false";
});
// left facet POST 로 넘기는 함수
const fnPostLeftFacet = function (col_name, left_facet) {
  let isFiltered = false;
  let form = document.createElement("form");
  let input = document.createElement("input");
  input.type = "hidden";
  input.name = "filter";
  input.value = col_name + ":" + left_facet + ";";
  //  기존에 필터링 된 부분 적용
  let filtered_list = [];
  document.querySelectorAll(".filter-wrap i").forEach(function (v) {
    filtered_list.push(v.dataset.value + ";");
  });
  if (filtered_list.indexOf(input.value) > -1) return false;
  filtered_list.forEach(function (v) {
    input.value = input.value + v;
  });
  if (isFiltered) return false;
  form.appendChild(input);
  form.method = "POST";
  //  필터를 적용할 떄는 항상 페이지를 1로 설정해준다.
  form.action = "/facet/" + document.querySelector('input[name="title"]').value + "/1";
  document.body.appendChild(form);
  form.submit();
};
// left facet 검색
const fnSearch = function (item) {
  let filter = item.querySelector('input[name="filter"]');
  if (filter.value === "") {
    alert("내용을 입력해 주세요.");
    return false;
  }
  fnPostLeftFacet(filter.dataset.key, filter.value);
  return false;
};
