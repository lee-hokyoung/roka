$(document).ready(function() {
  document.querySelector("video").addEventListener("ended", function() {
    this.play();
    facetCount();
  });
  facetCount();
  function facetCount() {
    $(".count").css("display", "none");
    setTimeout(() => {
      $(".count")
        .each(function() {
          $(this)
            .prop("Counter", 0)
            .animate(
              {
                Counter: $(this).text()
              },
              {
                duration: 5000,
                easing: "swing",
                step: function(now) {
                  $(this).text(Math.ceil(now));
                }
              }
            );
        })
        .css("display", "block");
    }, 3000);
  }
});
