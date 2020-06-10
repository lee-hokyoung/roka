const toolbarConfig = [
  // "heading",
  // "|",
  "bold",
  "italic",
  "fontBackgroundColor",
  "fontColor",
  "fontSize",
  "fontFamily",
  "highlight",
  "link",
  "|",
  "bulletedList",
  "numberedList",
  "todoList",
  "|",
  "indent",
  "outdent",
  // "pageBreak",
  "alignment",
  "|",
  "imageUpload",
  "blockQuote",
  "insertTable",
  "mediaEmbed",
  "horizontalLine",
  "|",
  "undo",
  "redo",
];

let editor;
ClassicEditor.create(document.querySelector("#editor"), {
  // title: {
  //   placeholder: "제목을 입력해 주세요",
  //   isEnable: false,
  // },
  removePlugins: ["Heading", "Title"],
  placeholder: "내용을 입력해 주세요.",
  toolbar: toolbarConfig,
  extraPlugins: [BoardUploadAdapterPlugin],
})
  .then(function (newEditor) {
    editor = newEditor;
  })
  .catch(function (error) {
    console.error(error);
  });

// 등록하기
const fnRegister = function (board_type) {
  let title = document.querySelector('input[name="title"]');
  let writer = document.querySelector('input[name="writer"]');
  let content = editor.getData();
  if (title.value === "") {
    alert("제목을 입력해 주세요");
    title.focus();
    return false;
  }
  if (writer.value === "") {
    alert("제목을 입력해 주세요");
    writer.focus();
    return false;
  }
  if (content === "") {
    alert("내용을 입력해 주세요");
    return false;
  }
  let imgs = content
    .split("><")
    .filter(function (v) {
      if (v.indexOf("img ") > -1) return v;
    })
    .map(function (v) {
      return v.replace(/"/g, "").replace("src=\\", "").replace("img", "").trim();
    });
  let formData = {};
  formData["title"] = title.value;
  formData["writer"] = writer.value;
  formData["content"] = content.replace(/\\temps\\/g, "/uploads/");
  formData["imgs"] = imgs;

  let xhr = new XMLHttpRequest();
  xhr.open("POST", "/board/write/" + board_type, true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.onreadystatechange = function () {
    if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
      let res = JSON.parse(this.response);
      alert(res.message);
      if (res.code === 1) location.reload();
    }
  };
  xhr.send(JSON.stringify(formData));
};
