// left facet 클릭 이벤트
document.querySelectorAll('a[data-role="left-facet"]').forEach(function(v) {
  v.addEventListener("click", function() {
    let group = this.dataset.group;
    let left_name = this.dataset.name;
    console.log("group : ", group, ", left name : ", left_name);
  });
});

function searchText() {
  return false;
}
