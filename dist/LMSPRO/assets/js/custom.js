$(function () {
  $(document).ready(function () {
    $('[data-toggle="tooltip"]').tooltip();
    $('[data-toggle="popover"]').popover({
      placement: 'top',
      trigger: 'hover'
    });


    // $("#myNavbar a").click(function(){
    //   let bodyClasses = document.body.classList;
    //   bodyClasses.contains('sidebar-opened') ? document.body.classList.remove('sidebar-opened') : null;
    // });


  });
});
