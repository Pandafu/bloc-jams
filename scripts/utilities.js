function forEACH(array){
   
    var revealPoint = function(index){
        points[index].style.opacity = 1;
        points[index].style.transform = "scaleX(1) translateY(0)";
        points[index].style.msTransform = "scaleX(1) translateY(0)";
        points[index].style.WebkitTransform = "scaleX(1) translateY(0)";
        };
    
        points.forEach(revealPoint);
};



/* Replace the for loop in the animatePoints function with a forEach block and confirm that the selling points still animate properly. */