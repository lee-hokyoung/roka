//  eNum
const eNum = [
  "연번",
  "건식별번호",
  "기록물(건)명",
  "생산일자",
  "생산기관",
  "업무기능",
  "교육회의",
  "결재권자",
  "보고유형",
  "공간",
  "관련지역",
  "관련장소",
  "부대",
  "용어",
  "용어설명",
  "설명",
  "핵심키워드",
  "이벤트",
  "기안자_보고자",
  "사람",
  "소속",
  "그림",
];
//  컬럼명 설정
const rowCol = {
  연번: "no",
  건식별번호: "id",
  "기록물(건)명": "item_name",
  생산일자: "created_date",
  생산기관: "create_org",
  업무기능: "task_function",
  교육회의: "education_meeting",
  결재권자: "ceo_name",
  보고유형: "report_type",
  공간: "region_space",
  관련지역: "region",
  관련장소: "place",
  부대: "army",
  용어: "term",
  용어설명: "term_desc",
  설명: "description",
  핵심키워드: "keyword",
  이벤트: "event",
  기안자_보고자: "reporter",
  사람: "person",
  소속: "person_group",
  그림: "image",
};

//  업로드 파일 선택시 이벤트
document
  .querySelector('input[name="excelFile"]')
  .addEventListener("change", function () {
    let formData = new FormData();
    formData.append("excelFile", this.files[0]);
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "/admin/upload", true);
    xhr.onreadystatechange = function () {
      if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
      }
    };
    xhr.send(formData);
  });
//  파일 읽어오기
document
  .querySelector('button[name="btnRead"]')
  .addEventListener("click", function () {
    let filename = document.querySelector('input[name="excelFile"]').files[0]
      .name;
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "/admin/readFile", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = function () {
      if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
        let res = JSON.parse(this.response);
        if (res.code === 1) {
          //  데이터 입력 버튼 보이기
          document.querySelector('button[name="btnUpload"]').dataset.view =
            "true";
          let table = document.querySelector("table");
          table.className = "table table-bordered";
          table.innerHTML = "";
          let thead = document.createElement("thead");
          thead.className = "thead-dark";
          let tbody = document.createElement("tbody");
          res.worksheet.forEach(function (row, rowNum) {
            if (rowNum === 0) {
              let th = document.createElement("th");
              let checkbox = document.querySelector("input");
              checkbox.type = "checkbox";
              checkbox.dataset.toggle = "false";
              checkbox.addEventListener("click", function () {
                let toggle = this.dataset.toggle;
                this.dataset.toggle = toggle === "false";
                document
                  .querySelectorAll("table tbody input")
                  .forEach(function (inp) {
                    inp.checked = toggle === "false";
                  });
              });
              th.appendChild(checkbox);
              thead.appendChild(th);
              row.forEach(function (cell) {
                th = document.createElement("th");
                th.innerText = cell;
                thead.appendChild(th);
              });
            } else {
              let tr = document.createElement("tr");
              tr.dataset.rowNum = rowNum;
              let td = document.createElement("td");
              let checkbox = document.createElement("input");
              checkbox.type = "checkbox";
              td.appendChild(checkbox);
              tr.appendChild(td);
              row.forEach(function (cell, idx) {
                td = document.createElement("td");
                td.innerText = idx === 3 ? cell.slice(0, 10) : cell;
                td.dataset.col = rowCol[eNum[idx]];
                tr.appendChild(td);
              });
              tbody.appendChild(tr);
            }
          });
          table.appendChild(thead);
          table.appendChild(tbody);
        }
      }
    };
    xhr.send(JSON.stringify({ filename: filename }));
  });
//  파일 업로드(한번에 데이터를 받아서 각각 insert 하는 방식임.)
document
  .querySelector('button[name="btnUpload"]')
  .addEventListener("click", function () {
    let checked_row = document.querySelectorAll("tbody input:checked");
    let list = [];
    if (checked_row.length > 0) {
      checked_row.forEach(function (v, idx) {
        let row = v.parentElement.parentElement;
        let obj = {};
        let cols = row.querySelectorAll("td[data-col]");
        cols.forEach(function (col, col_idx) {
          obj[rowCol[eNum[col_idx]]] = col.innerText;
        });
        list.push(obj);
      });
      console.log("list : ", list);
      let xhr = new XMLHttpRequest();
      xhr.open("POST", "/admin/insertEach", true);
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.onreadystatechange = function () {
        if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
          let res = JSON.parse(this.response);
          alert(res.message);
          if (res.code === 1) location.reload();
        }
      };
      xhr.send(JSON.stringify({ list: list }));
      //   for (var i = 0; i < checked_row.length; i++) {
      //     let sql = "INSERT INTO CEO_ARCHIVE ";
      //     sql += "(no, id, item_name, created_date, create_org, ";
      //     sql += "task_function, education_meeting, ceo_name, ";
      //     sql += "report_type, space, region, place, army, ";
      //     sql += "term, term_desc, description, keyword, ";
      //     sql += "event, reporter, person, group, image) ";
      //     sql += "VALUES('')";
      //     let row = checked_row[i].parentElement.parentElement;
      //     if (i === 0) console.log("row : ", row);
      //     sql += "";
      //   }
    } else {
      alert("입력할 데이터를 체크해주세요");
    }
  });
