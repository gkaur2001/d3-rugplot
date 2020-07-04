import {scaleOrdinal, scaleLinear} from 'd3-scale';
import {schemePaired} from 'd3-scale-chromatic';
import {select} from 'd3-selection';
import {format} from 'd3-format';
import {nest} from 'd3-collection';
import {sum} from 'd3-array';

export default function Chart2Waffle() {
  fetch('./data/movies.json')
    .then(d => d.json())
    .then(d => waffle(d));
}

// do your work here
const NUM_VERTICAL_BOXES = 8;
// this is just an estimate
const NUM_HORIZONTAL_BOXES = 60;
const height = 400;
const width = 600;
const margin = {left: 10, top: 10, right: 10, bottom: 10};
const plotWidth = width - margin.left - margin.right;

function waffle(data) {
  // 1. group by genre and aggregate by sum, e.g. {Horror: 12930238901, ....}
  // YOUR WORK HERE - approx 7 lines
  const agg = nest()
    .key(function genre(d){return d.Major_Genre; })
    .rollup(function budget(val) {return sum(val, function budgetVals(d){
        return d.Production_Budget;
    }); })
	.entries(data)
    .map(function arr(d){
      return{genre: d.key, budget: d.value};
    })
    .splice(1,12)
	.sort(function sorting(a, b) {
      return a.budget - b.budget;
    });
  // 2. convert to box counts, e.g. [{genre: "XXXX", boxes: 123}, ....]
  // Don't forget to sort them!
  // YOUR WORK HERE - approx 8 lines
  const total = sum(agg, function budgetTotal(val) {
	  return val.budget;
  });
  const boxed = agg.map(function array(d) {
    return {genre: d.genre, 
	  boxes: Math.ceil((d.budget / total) * (NUM_HORIZONTAL_BOXES * NUM_VERTICAL_BOXES))};
  });
  // 3. Create a color scale mapping genre to color
  // YOUR WORK HERE - approx 3 lines
  const color = scaleOrdinal()
  .domain(boxed)  
  .range(schemePaired); 
  // 4. convert boxes to layout boxes
  // YOUR WORK HERE - approx 3 lines
  const boxes = boxed.reduce((acc, cur) => {
  for(let i = 0; i < cur.boxes; i += 1) {
	  acc.push({genre: cur.genre});
  }
  return acc;
  }, []);
  // 5. apply layout positions (i.e. specify the x and y positions)
  // YOUR WORK HERE - approx 5 lines
  const pos = boxes.map(function arr2(d, i) {
    return {genre: d.genre, col: Math.floor(i / 8), row: (i % 8)};
  });
  // 6. set up a single scale (should it be based off of x or y?)
  // YOUR WORK HERE - approx 3 lines
  const scale = scaleLinear()
    .domain([0, 60])
	.range([0, plotWidth]);
  // 7. get an svg container for
  // YOUR WORK HERE - approx 6 lines
  const svg = select('#chart-container') 
    .append('svg')
	.attr('height', height)
	.attr('width', width)
	.append('g');
  // 8. now actually render the waffle rects
  // hint: our x and y and position use the same scale,
  // and we compute the boxSize ahead of time (what should the be? maybe the differene between two positions?)
  // YOUR WORK HERE - approx 13 lines
  const boxSize = '10px';
  svg.selectAll('rect')
	.data(pos)
	.join('rect')
	.attr('x', d => scale(d.col))
	.attr('y', d => scale(d.row))
	.attr('height', boxSize)
	.attr('width', boxSize)
	.attr('fill', d => color(d.genre))
	.attr('stroke', 'black')
	.attr('transform', 'translate(10, 20)');
  // 9. draw the legend
  // yours doesn't have to look like ours, it just has to have the same information
  // hint: our legend uses d3 but doesn't use any svg, just html elements
  // YOUR WORK HERE - approx 14 lines
  svg.selectAll('legend')
	.data(agg)
	.join('rect')
	.attr('y', (d, i) => i * 15)
	.attr('height', boxSize)
	.attr('width', boxSize)
	.attr('fill', d => color(d.genre))
	.attr('transform', 'translate(10, 110)');
	
  svg.selectAll('legendText')
    .data(agg)
	.enter()
	.append('text')
    .text(d => `${d.genre} (${(format('.2s')(d.budget)).replace(/G/,"B")}$) `)
	.attr('y', (d, i) => i * 15)
    .style('font-size', '8px')
	.attr('transform', 'translate(25, 118)');
}
