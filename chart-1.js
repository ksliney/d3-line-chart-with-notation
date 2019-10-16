(function() {
const margin = { top: 30, left: 30, right: 30, bottom: 30 }
const height = 300 - margin.top - margin.bottom
const width = 700 - margin.left - margin.right

const svg = d3
  .select('#chart-1')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

// Normal scales
const xPositionScale = d3
  .scaleLinear()
  .domain([1, 25])
  .range([0, width])

const yPositionScale = d3
  .scaleLinear()
  .domain([10, 50])
  .range([height, 0])

const line = d3
  .line()
  .x(d => {
    return xPositionScale(d.day)
  })
  .y(d => {
    return yPositionScale(d.temperature)
  })

// We are interested in the value to the right
const bisectDay = d3.bisector(d => d.day).right

d3.csv('data-singleline-cimmeria.csv')
  .then(ready)
  .catch(err => {
    console.log('Failed with', err)
  })

function ready(datapoints) {
  /* Add in your temperature circles */

  // .append('path') because we only want ONE path
  // .datum because we only have ONE path
  svg
    .append('path')
    .datum(datapoints)
    .attr('stroke', 'blue')
    .attr('stroke-width', 2)
    .attr('d', line)
    .attr('fill', 'none')

  svg
    .selectAll('circle')
    .data(datapoints)
    .enter()
    .append('circle')
    .attr('fill', 'red')
    .attr('r', 3)
    .attr('cx', d => {
      return xPositionScale(d.day)
    })
    .attr('cy', d => {
      return yPositionScale(d.temperature)
    })

  console.log('Day 7 is at', xPositionScale(7))
  // .invert on a scale goes backwards
  console.log('160 pixels is..', xPositionScale.invert(160))

  var mouseLine = svg.append('line')
    .attr('y1', 0)
    .attr('y2', height)
    .attr('x1', 0)
    .attr('x2', 0)
    .attr('stroke-width', 0.5)
    .attr('stroke', '#666')

  var textNote = svg.append('text')
    .attr('font-family', 'Helvetica')
    .attr('font-size', '10')
    .text('Nothing')
    .attr('dx', 5)
    .attr('dy', 10)

  var marker = svg.append('circle')
    .attr('r', 5)
    .attr('stroke', 'red')
    .attr('fill', 'none')
    .style('display', 'none')

  svg.on('mouseenter', function() {
    // display: inherit - 'auto'
    marker.style('display', 'inherit')
  }).on('mouseleave', function() {
    // display: none - hide it
    marker.style('display', 'none')
  })


  // We need a big rectangle to capture the
  // mousemove event, svg can't do it unless
  // something is drawn there
  svg.append('rect')
    .attr('width', width)
    .attr('height', height)
    .attr('fill', 'grey')
    .attr('opacity', 0.1)
    .on('mousemove', function() {
      console.log("the mouse is moving")
      var [mouseX, mouseY] = d3.mouse(this)

      console.log('The mouse is at', mouseX)
      var day = xPositionScale.invert(mouseX)
      console.log('The day is', day)

      // here's all our data
      // and the day we're looking for
      // can you find the datapoint we should highlight?
      var i = bisectDay(datapoints, day)

      // pluck out the datapoint we want
      var datapoint = datapoints[i]
      marker
        .attr('cx', xPositionScale(datapoint.day))
        .attr('cy', yPositionScale(datapoint.temperature))

      // Draw a line straight down from our datapoint
      // the x positions are the same as the day
      // the top (y1) is the same as our data point
      mouseLine
        .attr('x1', xPositionScale(datapoint.day))
        .attr('x2', xPositionScale(datapoint.day))
        .attr('y1', yPositionScale(datapoint.temperature))

      textNote
        .attr('x', xPositionScale(datapoint.day))
        .attr('y', yPositionScale(datapoint.temperature))
        .text(`${datapoint.temperature} degrees`)
    })

  /* Add in your axes */

  const xAxis = d3.axisBottom(xPositionScale)
  svg
    .append('g')
    .attr('class', 'axis x-axis')
    .attr('transform', 'translate(0,' + height + ')')
    .call(xAxis)

  const yAxis = d3.axisLeft(yPositionScale)
  svg
    .append('g')
    .attr('class', 'axis y-axis')
    .call(yAxis)
}
})()