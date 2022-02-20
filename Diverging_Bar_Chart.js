var years = [1924, 1928, 1932, 1936, 1948, 1952, 1956, 1960, 1964, 1968, 1972, 1976, 1980, 1984, 1988, 1992, 1994, 1998, 2002, 2006, 2010, 2014];

var slider = document.getElementById("myRange");
var output = document.getElementById("demo");
output.innerHTML = years[slider.value];

window.onload = bargraph
slider.oninput = bargraph

function bargraph() {
      output.innerHTML = years[slider.value]
      yearChoice = output.innerText

      let svg = d3.select("#bar");
      svg.selectAll('*').remove()
      

      let width = 800,
          height = 600;
      let margin = {top:50, right:50, left:50, bottom:50}
      var x = d3.scaleLinear();
      var y = d3.scaleBand();
      
      let innersvg = svg.append('g').attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')')

      //load in csv data
      d3.csv("olympics.csv").then(function(data){
            //filter data for the selected year
            var data_year = data.filter(function(d){return d.Year == yearChoice;})
            var data_gold = data_year.filter(function(d){return d.Medal == "Gold"})
            var data_silver = data_year.filter(function(d){return d.Medal == "Silver"})
            var data_bronze = data_year.filter(function(d){return d.Medal == "Bronze"})

            //Get number of medals per gender for each country for the given year
            data_gold = d3.rollups(data_gold, v => v.length, d=> d["Country Code"], d => d["Gender"])
            data_silver = d3.rollups(data_silver, v => v.length, d=> d["Country Code"], d => d["Gender"])
            data_bronze = d3.rollups(data_bronze, v => v.length, d=> d["Country Code"], d => d["Gender"])

            let out_medals = []
            for (const i of Array(data_bronze.length).keys()){
                  let w_bronze = 0
                  let m_bronze = 0
                  if(typeof data_bronze[i] !== 'undefined'){
                        console.log(data_bronze[i])
                        if (data_bronze[i][1][0] !== undefined) m_bronze = data_bronze[i][1][0][1]
                        if (data_bronze[i][1][1] !== undefined) w_bronze = data_bronze[i][1][1][1]
                        out_medals.push({country: data_bronze[i][0], men_b: m_bronze, men_s: m_bronze, men_g: m_bronze, women_b: w_bronze, women_s: w_bronze, women_g: w_bronze})
                  }
                  
            }

            for (const i of Array(data_silver.length).keys()){
                  let w_silv = 0
                  let m_silv = 0
                  if(typeof data_silver[i] !== 'undefined'){
                        if (data_silver[i][1][0] !== undefined) m_silv = data_silver[i][1][0][1]
                        if (data_silver[i][1][1] !== undefined) w_silv = data_silver[i][1][1][1]
                        let check_match = 0
                        for (const j of Array(out_medals.length).keys()){
                              if (out_medals[j].country === data_silver[i][0]){
                                    out_medals[j].men_s = out_medals[j].men_b + m_silv
                                    out_medals[j].women_s = out_medals[j].women_b + w_silv
                                    out_medals[j].men_g = out_medals[j].men_b + m_silv
                                    out_medals[j].women_g = out_medals[j].women_b + w_silv
                                    check_match = 1
                                    break
                              }
                        }
                        if (check_match === 0){
                              out_medals.push({country: data_silver[i][0], men_b: 0, men_s: m_silv, men_g: m_silv, women_b: 0, women_s: w_silv, women_g: w_silv})
                        }
                  }
            }

            for (const i of Array(data_gold.length).keys()){
                  let w_gold = 0
                  let m_gold = 0
                  if(typeof data_gold[i] !== 'undefined'){
                        if (data_gold[i][1][0] !== undefined) m_gold = data_gold[i][1][0][1]
                        if (data_gold[i][1][1] !== undefined) w_gold = data_gold[i][1][1][1]
                        let check_match = 0
                        for (const j of Array(out_medals.length).keys()){
                              if (out_medals[j].country === data_gold[i][0]){
                                    out_medals[j].men_g = out_medals[j].men_s + m_gold
                                    out_medals[j].women_g = out_medals[j].women_s + w_gold
                                    check_match = 1
                                    break
                              }
                        }
                        if (check_match === 0){
                              out_medals.push({country: data_gold[i][0], men_b: 0, men_s: 0, men_g: w_gold, women_b: 0, women_s: 0, women_g: w_gold})
                        }
                  }
            }

            //Sort the countries by total number of medals won
            out_medals.sort(function(x,y){
                  return d3.descending((x.men_g + x.women_g)/2, (y.men_g + y.women_g)/2)
            })


            //Set scale for x and y domain
            x.domain([0, d3.max([d3.max(out_medals, function(d) {return d.women_g;}),
                                    d3.max(out_medals, function(d) {return d.men_g;})
                        ])])
                        .rangeRound([0, width / 2])
                        
            y.domain(out_medals.map(function(d) {return d.country;}))
                  .rangeRound([0,height])

            var country = innersvg.selectAll('g')
                        .data(out_medals)
                        .enter()
                        .append('g')
                        .attr('transform', function(d, i){
                              return 'translate(0, ' + (i * y.bandwidth()) + ')';
                        })
                       
            //Set bar parameters for women
            country.append('rect')
                        .attr('class', 'bar bar--women_b')
                        .attr('x', function(d) {return (width /2) + margin.left; })
                        .attr('height', y.bandwidth())
                        .style("fill", '#ff9ce4')
                        //.transition()
                        //.duration(1000)
                        .attr('x', function(d) {return (width /2) - x(d.women_b) + margin.left; })
                        .attr('width', function(d) {return x(d.women_b); })
            country.append('rect')
                        .attr('class', 'bar bar--women_s')
                        //.attr('x', function(d) {return (width /2) + margin.left; })
                        
                        .attr('height', y.bandwidth())
                        .style("fill", '#ff6bd7')
                        .attr('x', function(d) {return (width /2) - x(d.women_s) + margin.left; })
                        .attr('width', function(d) {return x(d.women_s - d.women_b); })
            country.append('rect')
                        .attr('class', 'bar bar--women_g')
                        .attr('height', y.bandwidth())
                        .style("fill", '#ff45cd')
                        .attr('x', function(d) {return (width /2) - x(d.women_g) + margin.left; })
                        .attr('width', function(d) {return x(d.women_g - d.women_s);})

                
            //medal count label for women medals
            country.append('text')
                        .attr('class', 'label')
                        .attr('alignment-baseline', 'middle')
                        .attr('x', function(d) { return (width / 2) - x(d.women_g) + margin.left - 20; })
                        .attr('y', (y.bandwidth() / 2) + 2)
                        //.transition()
                        //.delay(500)
                        .text(function(d) {
                              return d.women_g;
                        })
                        
            //Bar parameters for men medals
            country.append('rect')
                        .attr('class', 'bar bar--men_b')
                        .style("fill", '#96b0ff')
                        .attr('x', function(d) {return (width /2) + margin.left; })
                        .attr('height', y.bandwidth())
                        //.transition()
                        //.duration(1000)
                        .attr('width', function(d) {return x(d.men_b) })
            country.append('rect')
                        .attr('class', 'bar bar--men_s')
                        .style("fill", '#6e92ff')
                        .attr('height', y.bandwidth())
                        .attr('x', function(d) {return (width /2) + x(d.men_b) + margin.left; })
                        .attr('width', function(d) {return x(d.men_s - d.men_b)})
            country.append('rect')
                        .attr('class', 'bar bar--men_g')
                        .style("fill", '#3b6bff')
                        .attr('height', y.bandwidth())
                        .attr('x', function(d) {return (width /2) + x(d.men_s) + margin.left; })
                        .attr('width', function(d) {return x(d.men_g - d.men_s)})

            //number of medals won label for men
            country.append('text')
                        .attr('class', 'label')
                        .attr('alignment-baseline', 'middle')
                        .attr('x', function(d) { return (width / 2) + x(d.men_g) + margin.left + 4; })
                        .attr('y', (y.bandwidth() / 2) + 2)
                        //.transition()
                        //.delay(500)
                        .text(function(d) {
                              return d.men_g;
                        })


            //set-label x and y axes
            innersvg.append('g')
                        .attr('class', 'axis axis--y')
                        .call(d3.axisLeft(y))

            svg.append('text')
                        .attr('class', 'axis axis--x')
                        .attr('x', width * .2 + (margin.left * 2))
                        .attr('y', height + margin.top + margin.bottom)
                        .attr('text-anchor', 'middle')
                        .text('Women')

            svg.append('text')
                        .attr('class', 'axis axis--x')
                        .attr('x', width * .8 + (margin.left * 2))
                        .attr('y', height + margin.top + margin.bottom)
                        .attr('text-anchor', 'middle')
                        .text('Men')
            
      });
}