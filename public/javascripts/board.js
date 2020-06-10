const toolbarConfig = [
  "heading",
  "|",
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

ClassicEditor.create(document.querySelector("#editor"), {
  toolbar: toolbarConfig,
  extraPlugins: [BoardUploadAdapterPlugin],
}).catch((error) => {
  console.error(error);
});
