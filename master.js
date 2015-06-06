"use strict";

var AguasCalientes = AguasCalientes || (function() {
	var self = {};

	var margin = 0;
	var svg = null, 
		data = null,
		pack = null,
		view = null,
		diameter = null,
		focus = null,
		$slider = null,
		$sliderContainer = null;

	var node, circle;

	var translation = { x: 0, y: 0 };
	function create() {
		var size = 1;
		var format = d3.format(",d");
		diameter = $(window).height();		
				
		function evaluate(available) {
			switch(+available) {
				case 1: return "yes leaf node";
				case 0: return "no leaf node";
				default: return "uh leaf node";
			}
		}

		pack = d3.layout.pack()
		    .size([diameter, diameter])
		    .value(function(d) { return size; });

		svg = d3.select("body").append("svg")
			.attr('class', 'graph')
		    .attr("width", diameter)
		    .attr("height", diameter)
		  .append("g")
		  	.attr('class', 'wrapper')
		    .attr("transform", "translate(0,0)");

		var drag = d3.behavior.drag()
			.on('drag', function() {
				var e = d3.event;
				translation.x += e.dx;
				translation.y += e.dy;
				console.log(translation);
				d3.select('.wrapper')
					.attr('transform', 'translate(' + translation.x + ',' + translation.y +')');
			});
		svg.call(drag);		    

		d3.json("hotWaters.json", function(error, root) {
			focus = data = root;
		  var node = svg.datum(root).selectAll(".node")
		      .data(pack.nodes)
		    .enter().append("g")
		      .attr("class", function(d) { return d.children ? "node" : evaluate(d.sAvailable); })
		      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

		  node.append("title")
		      .text(function(d) { return d.name + (d.children ? "" : ": " + format(size)); });

		  node.append("circle")
		      .attr("r", function(d) { return d.r; });

		  node.filter(function(d) { return !d.children; }).append("text")
		      .attr("dy", ".3em")
		      .style("text-anchor", "middle")
		      .text(function(d) { return d.name.substring(0, d.r / 3); });

		 //  d3.select("body")
		 //      .on("click", function() { zoom(root); });		      

			// zoomTo([root.x, root.y, root.r * 2 + margin]);
			});			

		//d3.select(self.frameElement).style("height", diameter + "px");		
	}

	function render() {
		console.log("Render");
		updateSlider();
	}

	function updateSlider() {
		//render();

		var val = $slider.val();	
		var width = $(window).width(),
			height = $(window).height(),
			targetScale = $slider.val();
		var minScale = Math.min(width, height);

		//console.log(minScale*targetScale);

		//resize frame to match window edges
		d3.select('.graph')
			.attr('width', width)
			.attr('height', height);

		svg.selectAll('circle')
			.attr("r", function(d) { return d.r * targetScale; });

		svg.selectAll('.node')	
			.attr("transform", function(d) { 
				
				return "translate(" + (d.x) * targetScale + "," + (d.y) * targetScale + ")";
			});

				//return "translate(" + 
				//	(d.x * targetScale - d.r) + "," 
				//	+ (d.y * targetScale - d.r) + ")"; });

		$sliderContainer.find('span').html(targetScale + 'x');
	}

	function initControls() {
		$slider.change(function(e) {
			updateSlider(e);
		});
	}

	self.init = function() {
		console.log("Initializing");
		create();

		$sliderContainer = $('#resizer');
		$slider = $('#resizer input');
		render();

		initControls();

		$(window).resize(render);
	}

	return self;
})();

$(document).ready(function() {
	AguasCalientes.init();
});