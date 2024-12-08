import * as d3 from "d3";



// Select the body element and append an SVG to it
// d3.select("body")
//     .append("svg")
//     .attr("width", 500)
//     .attr("height", 500)
//     .append("circle")
//     .attr("cx", 250)  // X coordinate of the center
//     .attr("cy", 250)  // Y coordinate of the center
//     .attr("r", 50)    // Radius
//     .style("fill", "blue");  // Circle color

maternal_mortality = [
    {question: "Overall", yes: 22.3},
    {question: "Black", yes: 49.5},
    {question: "Asian", yes: 13.2},
    {question: "Hispanic", yes: 16.9},
    {question: "White", yes: 19.0}
    
  ]

Plot.plot({
    axis: null,
    label: null,
    height: 260,
    marginTop: 20,
    marginBottom: 70,
    title: "Maternal Mortality Rates by Race",
    subtitle: "Maternal mortality rate per 100k live births",
    marks: [
      Plot.axisFx({lineWidth: 10, anchor: "bottom", dy: 20}),
      Plot.waffleY({length: 1}, {y: 1, fillOpacity: 0.4, rx: "100%"}),
      Plot.waffleY(maternal_mortality, {fx: "question", y: "yes", rx: "100%", fill: "#c51b8a"}),
      Plot.text(maternal_mortality, {fx: "question", text: (d) => (d.yes).toLocaleString("en-US"), frameAnchor: "bottom", lineAnchor: "top", dy: 6, fill: "#c51b8a", fontSize: 24, fontWeight: "bold"})
    ]
  })

console.log(d3.version);