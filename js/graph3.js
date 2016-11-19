/**
 * Created by 오주영 on 2016-11-20.
 */
d3.csv("../dream.csv", function(error,dataSet) {
    //read data : frequency,memory,action,lucid,dejavu
    dataSet.forEach(function (d) {
        d.frequency = +d.frequency;
        d.memory = d.memory;
        d.action = d.action;
        d.lucid = +d.lucid;
        d.dejavu = +d.dejavu;
    });

    const maxVal = [4, 3, 3, 4, 3];
    var colNum = ["frequency", "memory", "action", "lucid", "dejavu"];
    var row = 3;
    var col = 1;

    function getNum(col, Data) {
        result = [];
        for (var j = 0; j < maxVal[col]; j++) {
            result[j] = 0;
        }

        var val;
        for (var i = 0; i < Data.length; i++) {
            if (col == 0) val = Data[i].frequency;
            else if (col == 1) val = Data[i].memory;
            else if (col == 2) val = Data[i].action;
            else if (col == 3) val = Data[i].lucid;
            else if (col == 4) val = Data[i].dejavu;

            result[val - 1]++;
        }
        return result;
    }

    function getText(col, d) {
        if (col == 0) {//freq
            if (d == 0) return "Almost Everyday";
            else if (d == 1) return "3~4 times / week";
            else if (d == 2) return "3~4 times / month";
            else if (d == 3) return "few times / year";
        }
        else if (col == 1) {//memory
            if (d == 0) return "Memorize vividly";
            else if (d == 1) return "Remember dimly";
            else if (d == 2) return "Forget all";
        }
        else if (col == 2) {//action
            if (d == 0) return "Memo it";
            else if (d == 1) return "Tell somebody";
            else if (d == 2) return "Nothing";
        }
        else if (col == 3) {//lucid
            if (d == 0) return "Control freely";
            else if (d == 1) return "Frequently";
            else if (d == 2) return "few times";
            else if (d == 3) return "Never";
        }
        else if (col == 4) {//dejavu
            if (d == 0) return "Frequently";
            else if (d == 1) return "several times";
            else if (d == 2) return "Never";
        }

    }

    function filtering(col, data, i) {
        if (col == 0)
            var st = data.filter(function (s) {
                return s.frequency - 1 == i;
            });
        else if (col == 1)
            var st = data.filter(function (s) {
                return s.memory - 1 == i;
            });
        else if (col == 2)
            var st = data.filter(function (s) {
                return s.action - 1 == i;
            });
        else if (col == 3)
            var st = data.filter(function (s) {
                return s.lucid - 1 == i;
            });
        else if (col == 4)
            var st = data.filter(function (s) {
                return s.dejavu - 1 == i;
            });

        return st;
    }

    function stacks(row, col, div) {
        var stk = {}, sDim = {t: 30, r: 40, b: 40, l: 10};
        sDim.w = 1000 - sDim.l - sDim.r;
        sDim.h = 600 - sDim.t - sDim.b;

        var n = maxVal[row], // number of samples per layer
            m = maxVal[col]; // number of layers

        var nData = [];
        for(var i=0; i<m; i++) {
            nData[i] = stackList(n, i);
        }

        var stack = d3.layout.stack(),
            layers = stack(nData),
            yGroupMax = d3.max(layers, function(layer) { return d3.max(layer, function(d) { return d.y; }); }),
            yStackMax = d3.max(layers, function(layer) { return d3.max(layer, function(d) { return d.y0 + d.y; }); });

        var x = d3.scale.ordinal()
            .domain(d3.range(n))
            .rangeRoundBands([0, sDim.w], .08);

        var y = d3.scale.linear()
            .domain([0, yStackMax])
            .range([sDim.h, 0]);

        var color = d3.scale.linear()
            .domain([0, n - 1])
            .range(["#aad", "#556"]);


        var xAxis = d3.svg.axis()
            .scale(x)
            .tickSize(0)
            .tickPadding(6)
            .orient("bottom");

        var STsvg = d3.select(div).append("svg")
            .attr("id", "stack")
            .attr("width", sDim.w + sDim.l + sDim.r)
            .attr("height", sDim.h + sDim.t + sDim.b)
            .append("g")
            .attr("transform", "translate(" + sDim.l + "," + sDim.t + ")");

        //x-axis
        STsvg.append("g")
            .selectAll("text")
            .data(d3.range(n)).enter()
            .append("text")
            .text(function (d, i) {
                return getText(row, i);
            })
            .attr("x", function (d, i) {
                return x(i) + sDim.l;
            })
            .attr("y", function (d, i) {
                return sDim.h + sDim.b;
            })
           // .attr("transform", "translate(0," + sDim.h + ")")
            //.attr("text-anchor", "middle")
            .style("fill", "black")
            .style("font-size", "13pt");

        var layer = STsvg.selectAll(".layer")
            .data(layers)
            .enter().append("g")
            .attr("class", "layer")
            .style("fill", function(d, i) { return color(i); });

        var rect = layer.selectAll("rect")
            .data(function(d) { return d; })
            .enter().append("rect")
            .attr("x", function(d) { return x(d.x); })
            .attr("y", sDim.h)
            .attr("width", x.rangeBand())
            .attr("height", 0);

        rect.transition()
            .delay(function(d, i) { return i * 10; })
            .attr("y", function(d) { return y(d.y0 + d.y); })
            .attr("height", function(d) { return y(d.y0) - y(d.y0 + d.y); });

        d3.selectAll("input").on("change", change);

        var timeout = setTimeout(function() {
            d3.select("input[value=\"grouped\"]").property("checked", true).each(change);
        }, 2000);

        function change() {
            clearTimeout(timeout);
            if (this.value === "grouped") transitionGrouped();
            else transitionStacked();
        }

        function transitionGrouped() {
            y.domain([0, yGroupMax]);

            rect.transition()
                .duration(500)
                .delay(function(d, i) { return i * 10; })
                .attr("x", function(d, i, j) { return x(d.x) + x.rangeBand() / n * j; })
                .attr("width", x.rangeBand() / n)
                .transition()
                .attr("y", function(d) { return y(d.y); })
                .attr("height", function(d) { return sDim.h - y(d.y); });
        }

        function transitionStacked() {
            y.domain([0, yStackMax]);

            rect.transition()
                .duration(500)
                .delay(function(d, i) { return i * 10; })
                .attr("y", function(d) { return y(d.y0 + d.y); })
                .attr("height", function(d) { return y(d.y0) - y(d.y0 + d.y); })
                .transition()
                .attr("x", function(d) { return x(d.x); })
                .attr("width", x.rangeBand());
        }

        function stackList(n, i){
            var nData = [];
            var st = filtering(col, dataSet, i);
            for(var j=0; j<n; j++){
                nData[j] = filtering(row, st, j).length;
                console.log(nData[j]);
            }
            return nData.map(function(d, i) { return {x: i, y: d}; });
        }

        var legend = STsvg.selectAll(".legend")
            .data(nData)
            .enter().append("g")
            .attr("class", "legend")
            .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; })
            .style("font", "15px sans-serif");

        legend.append("rect")
            .attr("x", sDim.w - 20)
            .attr("width", 20)
            .attr("height", 20)
            .attr("fill", function(d, i) { return color(i)});

        legend.append("text")
            .attr("x", sDim.w -20)
            .attr("y", 9)
            .attr("dy", ".35em")
            .attr("text-anchor", "end")
            .text(function(d, i) { return getText(col, i); });

        window.rowFilter = function (type) {
            for (var i = 0; i < 5; i++) {
                if (type == colNum[i]){
                    console.log("row change");
                    row = i;
                }
            }
            d3.select("#stack").remove();
            stk = stacks(row, col, "#graph");
        };

        window.colFilter = function (type) {
            for (var i = 0; i < 5; i++) {
                if (type == colNum[i]){
                    console.log("col change");
                    col = i;
                }
            }
            d3.select("#stack").remove();
            stk = stacks(row, col, "#graph");
        };

        return stk;
    }



    var stk = stacks(row, col, "#graph");

});
