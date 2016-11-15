/**
 * Created by 오주영 on 2016-11-16.
 */
d3.csv("../dream.csv", function(error,dataSet){
    //read data : frequency,memory,action,lucid,dejavu
    dataSet.forEach(function (d) {
        d.frequency = +d.frequency;
        d.memory = d.memory;
        d.action = d.action;
        d.lucid = +d.lucid;
        d.dejavu = +d.dejavu;
    });

    const maxVal = [4,3,3,4,3];
    var barColor = 'steelblue';
    var c10 = d3.scale.category10();

    function getNum(col){
        result = [];
        for(var j=0; j<maxVal[col]; j++){
            result[j] = 0;
        }
        for(var i=0; i<dataSet.length; i++){
            result[dataSet[i].frequency-1]++;
        }
        return result;
    }

    function histogram(prop){
        var hg = {}, hgDim = {t:60, r:0, b:30, l:0};
        hgDim.w = 500 - hgDim.l - hgDim.r;
        hgDim.h = 300 - hgDim.t - hgDim.b;

        var HGsvg = d3.select("#graph").append("svg")
            .attr("width", hgDim.w + hgDim.l + hgDim.r)
            .attr("height", hgDim.h + hgDim.t + hgDim.b)
            .append("g")
            .attr("transform", "translate(" + hgDim.l + "," + hgDim.t + ")");

        var x = d3.scale.ordinal()
            .domain([0, 1, 2, 3])
            .rangeRoundBands([0, hgDim.w], 0.1);

        HGsvg.append("g").attr("class", "x axis")
            .attr("transform", "translate(0," + hgDim.h + ")")
            .call(d3.svg.axis().scale(x).orient("bottom"));

        col = 0;
        yData = getNum(col);

        var y = d3.scale.linear().range([hgDim.h, 0])
            .domain([0, d3.max(yData)]);

        var bars = HGsvg.selectAll(".bar")
            .data(yData)
            .enter()
            .append("g")
            .attr("class", "bar");

        bars.append("rect")
            .attr("x", function(d,i){ return x(i);})
            .attr("y", function(d,i){ return y(yData[i])})
            .attr("width", Math.round(x.rangeBand()))
            .attr("height", function(d,i){ return hgDim.h-y(yData[i])})
            .attr("fill", barColor)
            .on("mouseover", mouseover)
            .on("mouseout", mouseout);

        bars.append("text")
            .text(function(d,i){ return d3.format(",")(yData[i])})
            .attr("x", function(d,i){ return Math.round(x(i) + x.rangeBand()/2);})
            .attr("y", function(d,i){ return y(yData[i])-10;})
            .attr("text-anchor", "middle");

        function mouseover(d){}

        function mouseout(d){}

        hg.update = function(nD, color){

        }
        return hg;
    };


    function piechart(prop){
        var pc = {}, pieDim = {w:250, h:250};
        pieDim.r = Math.min(pieDim.w, pieDim.h)/2;

        var PIEsvg = d3.select("#graph").append("svg")
            .attr("width", pieDim.w)
            .attr("height", pieDim.h)
            .append("g")
            .attr("transform", "translate("+pieDim.w/2+","+pieDim.h/2+")");

        // create function to draw the arcs of the pie slices.
        var arc = d3.svg.arc().outerRadius(pieDim.r - 10).innerRadius(0);

        var freq = getNum(0);
        console.log(freq[0]);
        // create a function to compute the pie slice angles.
        var pie = d3.layout.pie().sort(null).value(function(d) { return d; });

        PIEsvg.selectAll("path").data(pie(freq))
            .enter().append("path")
            .attr("d", arc)
            .each(function(d){ this._current = d;})
            .style("fill", function(d,i) {return c10(i);})
            .on("mouseover", mouseover)
            .on("mouseout", mouseout);

        function mouseover(d){
        }

        function mouseout(d){
        }

        pc.undate = function(nd){

        }

        function arcTween(a){
            var i = d3.interpolate(this._current, a);
            this._current = i(0);
            return function(t) {return arc(i(t));};
        }
        return pc;
    }

    function legend(id){
        var leg = {};
/*
        // create table for legend.
        var legend = d3.select(id).append("table").attr('class','legend');

        // create one row per segment.
        var tr = legend.append("tbody").selectAll("tr").data(lD).enter().append("tr");

        // create the first column for each segment.
        tr.append("td").append("svg").attr("width", '16').attr("height", '16').append("rect")
            .attr("width", '16').attr("height", '16')
            .attr("fill",function(d){ return segColor(d.type); });

        // create the second column for each segment.
        tr.append("td").text(function(d){ return d.type;});

        // create the third column for each segment.
        tr.append("td").attr("class",'legendFreq')
            .text(function(d){ return d3.format(",")(d.freq);});

        // create the fourth column for each segment.
        tr.append("td").attr("class",'legendPerc')
            .text(function(d){ return getLegend(d,lD);});

        // Utility function to be used to update the legend.
        leg.update = function(nD){
            // update the data attached to the row elements.
            var l = legend.select("tbody").selectAll("tr").data(nD);

            // update the frequencies.
            l.select(".legendFreq").text(function(d){ return d3.format(",")(d.freq);});

            // update the percentage column.
            l.select(".legendPerc").text(function(d){ return getLegend(d,nD);});
        }

        function getLegend(d,aD){ // Utility function to compute percentage.
            return d3.format("%")(d.freq/d3.sum(aD.map(function(v){ return v.freq; })));
        }

        return leg;
*/
    }

    var h = histogram("frequency");
    var p = piechart("frequency");
});