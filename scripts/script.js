$(() => {
    // Get measurements and calculations.
    const sensorMeasurements = getSensorMeasurements(num_points, min_hdiff, max_hdiff, init_sval);
    const calculations = calculate();

    console.log(calculations);
    // Reformat (for chart values).
    const reformattedCalculations = reformatCalculations(calculations);

    // Lines.
    const heightLine = drawLine('Height', reformattedCalculations.heights, '#19b5fe');
    const errorLine = drawLine('Error', reformattedCalculations.errors, '#f03434');
    const pLine = drawLine('P', reformattedCalculations.ps, '#00e640');
    const iLine = drawLine('I', reformattedCalculations.is, '#eeee00');
    const dLine = drawLine('D', reformattedCalculations.ds, '#f9690e');
    const totalLine = drawLine('total', reformattedCalculations.totals, '#9a12b3');
    const outvalLine = drawLine('out', reformattedCalculations.outvals, '#f03434');

    // Options for heights chart.
    const heightsChartOptions = setChartOptions(min_hchartval, max_hchartval);

    // Draw charts.
    //drawChart($('#heights-chart'), reformattedCalculations.nums, [heightLine, errorLine,], heightsChartOptions);
    drawChart($('#heights-chart'), reformattedCalculations.nums, [heightLine, errorLine,]);
    drawChart($('#pid-chart'), reformattedCalculations.nums, [pLine, iLine, dLine, totalLine, outvalLine]); // With default responsive options.

    // Fill up table.
    fillTable(calculations, $('#tbody-pid'));
})

// Number of points.
const num_points = 100;

// Sensor.
const init_sval = 50; // Initial sensorval.
const min_sval = 0; // Min and max sensorval.
const max_sval = 100;
const min_hdiff = -4; // Min and max height difference for next measurement.
const max_hdiff = 4;

// Chart.
const min_hchartval = -20;
const max_hchartval = max_sval;

// PID.
let pVal = 0;
let iVal = 0;
let dVal = 0;

let integral = 0;
let derivative = 0;

// Factors.
const kp = 1;
const ki = 0.02;
const kd = 0.2;

// Total.
let tot_pid = 0;
let out_val = 0;
let nlast = 0;

// Errors.
let error = 0;
let prev_error = 0;

// Processing time.
const proc_time = 0.6;

// Wanted value (setpoint).
const setpoint = 60;


// Get sensor measurements with number of points, min height difference & max height difference.
function getSensorMeasurements(npoints, minhdiff, maxhdiff, inithval) {
    const heightdifference = (min, max) => Math.random() * (max - min) + min;
    const heights = [];
    let sensorval = inithval;
    for (let i = 0; i < npoints; i++) {
        sensorval += heightdifference(minhdiff, maxhdiff);
        if (sensorval < min_sval) {
            sensorval = min_sval;
        } else if (sensorval > max_sval) {
            sensorval = max_sval;
        }
        heights.push(sensorval);
    }
    return heights;
}

function calculate() {
    const calcs = [];
    let height = 20;

    for (let j = 0; j < 50; j++) {
        error = setpoint - height;

        pVal = kp * error;

        if (!(iVal < -100) || (iVal > 100)) {
            integral = error * proc_time;
            iVal += ki * integral;
            console.log('helo')
        }

        derivative = (error - prev_error) / proc_time;
        dVal = kd * derivative;

        tot_pid = pVal + iVal + dVal;

        if(tot_pid > 100){
            tot_pid = 100;
        }
        if(tot_pid < -100){
            tot_pid = 100;
        }

        // Push values.
        calcs.push({
            num: j,
            height: height.toFixed(5),
            error: error.toFixed(5),
            preverror: prev_error.toFixed(5),
            pVal: pVal.toFixed(5),
            iVal: iVal.toFixed(5),
            dVal: dVal.toFixed(5),
            total: tot_pid.toFixed(5),
            outval: out_val.toFixed(5),
        });

        prev_error = error;
        height += tot_pid;
    }
    return calcs;
}

/*function calculate(heights) {
    const calcs = [];
    for (let j = 0; j < heights.length; j++) {
        error = setpoint - heights[j];

        p = kp * error;

        integral = error * proc_time;
        i += ki * integral;

        derivative = (error - prev_error) / proc_time;
        d = kd * derivative;

        tot_pid = p + i + d;

        // Push values.
        calcs.push({
            num: j,
            height: heights[j].toFixed(5),
            error: error.toFixed(5),
            preverror: prev_error.toFixed(5),
            p: p.toFixed(5),
            i: i.toFixed(5),
            d: d.toFixed(5),
            total: tot_pid.toFixed(5),
            outval: out_val.toFixed(5),
        });

        prev_error = error;
    }
    return calcs;
}*/

function reformatCalculations(calculations) {
    const calcFormat = {
        nums: [],
        heights: [],
        errors: [],
        ps: [],
        is: [],
        ds: [],
        totals: [],
        outvals: [],
    }

    for (let calculation of calculations) {
        calcFormat.nums.push(calculation.num);
        calcFormat.heights.push(calculation.height);
        calcFormat.errors.push(calculation.error);
        calcFormat.ps.push(calculation.pVal);
        calcFormat.is.push(calculation.iVal);
        calcFormat.ds.push(calculation.dVal);
        calcFormat.totals.push(calculation.total);
        calcFormat.outvals.push(calculation.outval);
    }

    return calcFormat;
}

function drawChart(chartlocation, xs, lines, chartoptions = {}) {
    const ch = new Chart(chartlocation, {
        type: 'line',
        data: {
            labels: xs,
            datasets: lines,
        },
        options: chartoptions,
    });
}

function drawLine(label, yvals, bordercol) {
    return {
        label: label,
        data: yvals,
        borderColor: [
            bordercol,
        ],
        borderWidth: 1
    }
}

function setChartOptions(minval, maxval) {
    return {
        scales: {
            yAxes: [{
                ticks: {
                    display: true,
                    beginAtZero: true,
                    min: minval,
                    max: maxval,
                }
            }]
        }
    }
}

function fillTable(data, table) {
    const td = (x) => `<td>${x}</td>`;
    const tr = (n, height, error, p, i, d, tot) => `<tr>${td(n) + td(height) + td(error) + td(p) + td(i) + td(d) + td(tot)}</tr>`;
    for (let point of data) {
        table.append(tr(point.num, point.height, point.error, point.pVal, point.iVal, point.dVal, point.total));
    }
}