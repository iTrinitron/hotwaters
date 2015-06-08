"use strict";

var AguasCalientes = AguasCalientes || (function() {
	var self = {};

	var margin = 0,
			scale = 1;
	var offset = {x: 0, y: 0},
		center = {x: 0, y: 0};
	var svg = null, 
		data = null,
		pack = null,
		view = null,
		diameter = null,
		focus = null,
		$slider = null,
		$sliderContainer = null;

	var node, circle;

	function calculateCenter() {
		offset.x = Math.max(0, ($(window).width() - $(window).height()) / 2);
		offset.y = Math.max(0, ($(window).height() - $(window).width()) / 2 );
		center = {
			x: $(window).width()/2,
			y: $(window).height()/2
		}; 
	}

	function create() {
		var size = 1;
		var format = d3.format(",d");
		diameter = $(window).height();
				
		function evaluate(d) {
			var available;
			if(isFederal) {
				$("#currentState").html("Federal Data");
				available = d.fAvailable
			}
			else {
				available = d.sAvailable
				$("#currentState").html("State Data");
			}
			
			switch(+available) {
				case 1: return "yes leaf node";
				case 0: return "no leaf node";
				default: return "uh leaf node";
			}
		}

		pack = d3.layout.pack()
		    .size([diameter, diameter])
		    .value(function(d) { return size; });

		calculateCenter();
		svg = d3.select("body").append("svg")
			.attr('class', 'graph')
		    .attr("width", diameter)
		    .attr("height", diameter)
		  .append("g")
		  	.attr('class', 'wrapper')
		  	.attr("transform", "translate(" + offset.x + "," + offset.y + ")");

		// var center = calculateCenter();

		var drag = d3.behavior.drag()
			.on('drag', function() {
				var e = d3.event;
				offset.x += e.dx;
				offset.y += e.dy;
				//console.log(center);
				d3.select('.wrapper')
					.attr('transform', 'translate(' + (offset.x) + ',' + (offset.y) +')');
			});
		svg.call(drag);		    

		d3.json("hotWaters.json", function(error, root) {
			focus = data = root;
		  var node = svg.datum(root).selectAll(".node")
		      .data(pack.nodes)
		    .enter().append("g")
		      .attr("class", function(d) { return d.children ? "node" : evaluate(d); })
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

	function onResize() {
		calculateCenter();
		render();
	}

	function updateCenter() {

	}

	function updateSlider() {
		//render();

		var oldScale = scale;
		var width = $(window).width(),
			height = $(window).height();

		scale = $slider.val();
		var ratio = scale / oldScale;
		var minScale = Math.min(width, height);

		//console.log(minScale*targetScale);

		//resize frame to match window edges
		d3.select('.graph')
			.attr('width', width)
			.attr('height', height);

		svg.selectAll('circle')
			.attr("r", function(d) { return d.r * scale; });

		svg.selectAll('.node')	
			.attr("transform", function(d) { 
				return "translate(" + (d.x) * scale + "," + (d.y) * scale + ")";
			});

		// TODO: when scaling a circle, the new center should be (-difference, +difference). 
		// but how to account for offset?? idk
		var difference = ((diameter/2*scale) - (diameter/2*oldScale)) / 2;
		offset.x -= difference;
		offset.y -= difference;
		d3.select('.wrapper')
			.attr('transform', function(d) {
				return 'translate(' + offset.x + ',' + offset.y +')';
			})

				//return "translate(" + 
				//	(d.x * targetScale - d.r) + "," 
				//	+ (d.y * targetScale - d.r) + ")"; });

		$sliderContainer.find('span').html(scale + 'x');
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

		initControls();
		render();		

		$(window).resize(onResize);
	}

	return self;
})();

var isFederal = false;

function changeData() {
	isFederal = !isFederal;
	$('.graph').remove();
	AguasCalientes.init();
}

$(document).ready(function() {
	AguasCalientes.init();
});