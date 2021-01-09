$(() => {
    // Assign initial values.
    height = init_height; // Height.

    pVal = 0; // PID.
    integral = 0;
    iVal = 0;
    derivative = 0;
    dVal = 0;

    kp = 1; // Factors.
    ki = 0.5;
    kd = 0.1;

    error = 0; // Errors.
    prev_error = 0;

    control_val = 0; // Total control.

    // Get calculations.
    const calculations = calculate(num_points, setpoint, kp, ki, kd);

    // Reformat (for chart values).
    const reformattedCalculations = reformatCalculations(calculations);

    // Lines.
    const setpointLine = drawLine('Setpoint', reformattedCalculations.setpoints, '#f9690e');
    const heightLine = drawLine('Height', reformattedCalculations.heights, '#19b5fe');
    const errorLine = drawLine('Error', reformattedCalculations.errors, '#f03434');
    const pLine = drawLine('P', reformattedCalculations.ps, '#00e640');
    const iLine = drawLine('I', reformattedCalculations.is, '#eeee00');
    const dLine = drawLine('D', reformattedCalculations.ds, '#2e3131');
    const totalLine = drawLine('Total control', reformattedCalculations.totalcontrols, '#9a12b3');

    // Draw charts.
    drawChart($('#control-chart'), reformattedCalculations.nums, [setpointLine, heightLine, pLine, iLine, dLine, totalLine,]);
    drawChart($('#heights-chart'), reformattedCalculations.nums, [setpointLine, heightLine, errorLine,]);
    drawChart($('#pid-chart'), reformattedCalculations.nums, [pLine, iLine, dLine, totalLine,]); // With default responsive options.

    // Fill up table.
    fillTable(calculations, $('#tbody-pid'));
})

// Constant values.
const num_points = 31; // Number of points.
const setpoint = 50; // Wanted value (setpoint).
const init_height = 0; // Initial height.
const proc_time = 0.6; // Processing time.

// Variables.

var height; // Height.

var error; // Errors.
var prev_error;

var pVal; // PID.
var integral;
var iVal;
var derivative;
var dVal;

var kp; // Factors.
var ki;
var kd;

var control_val; // Total control.

function calculate(numPs, setP, kpn, kin, kdn) {
    const calcs = [];
    for (let i = 0; i < numPs; i++) {
        // Error.
        error = setP - height;

        // P value.
        pVal = kpn * error;

        // I value (anti-windup).
        if (!(iVal < -20 && error < 0) || (iVal > 20 && error > 0)) {
            integral = error * proc_time;
            iVal += kin * integral;
        }

        // D value.
        derivative = (error - prev_error) / proc_time;
        dVal = kdn * derivative;

        // Control value.
        control_val = pVal + iVal + dVal;

        // Set min and max for control value.
        if (control_val > 100) {
            control_val = 100;
        } else if (control_val < -100) {
            control_val = -100;
        }

        // Push values.
        calcs.push({
            setpoint: setP,
            num: i,
            height: height.toFixed(3),
            error: error.toFixed(3),
            preverror: prev_error.toFixed(3),
            pVal: pVal.toFixed(3),
            iVal: iVal.toFixed(3),
            dVal: dVal.toFixed(3),
            totalcontrol: control_val.toFixed(3),
        });

        // Set previous error.
        prev_error = error;

        // Adjust height.
        height += control_val;
    }

    return calcs;
}

// Function for remormatting calculations.
function reformatCalculations(calculations) {
    // Format needed for displaying in chart.
    const calcFormat = {
        setpoints: [],
        nums: [],
        heights: [],
        errors: [],
        ps: [],
        is: [],
        ds: [],
        totalcontrols: [],
    }

    // Push values in new array.
    for (let calculation of calculations) {
        calcFormat.setpoints.push(calculation.setpoint)
        calcFormat.nums.push(calculation.num);
        calcFormat.heights.push(calculation.height);
        calcFormat.errors.push(calculation.error);
        calcFormat.ps.push(calculation.pVal);
        calcFormat.is.push(calculation.iVal);
        calcFormat.ds.push(calculation.dVal);
        calcFormat.totalcontrols.push(calculation.totalcontrol);
    }

    return calcFormat;
}

// Functions for drawing chart.
function drawChart(chartlocation, xs, lines, chartoptions = {}) {
    const ch = new Chart(chartlocation, {
        type: 'line',
        data: {
            labels: xs,
            datasets: lines,
        },
        // Set options if needed.
        options: chartoptions,
    });
}

// Function to draw line for chart.
function drawLine(label, yvals, bordercol) {
    return {
        label: label, // Set label.
        data: yvals, // Values for y axis.
        borderColor: [
            bordercol, // Set color.
        ],
        borderWidth: 1
    }
}

// Function for specifying chart options.
function setChartOptions(minval, maxval) {
    return {
        scales: {
            yAxes: [{
                ticks: {
                    display: true,
                    beginAtZero: true,
                    min: minval, // Set min value.
                    max: maxval, // Set max value.
                }
            }]
        }
    }
}

// Function for filling table.
function fillTable(data, table) {
    // Create td and tr elements.
    const td = (x) => `<td>${x}</td>`;
    const tr = (n, height, error, p, i, d, tot) => `<tr>${td(n) + td(height) + td(error) + td(p) + td(i) + td(d) + td(tot)}</tr>`;
    for (let point of data) {
        // Append to specified table (using jQuery).
        table.append(tr(point.num, point.height, point.error, point.pVal, point.iVal, point.dVal, point.totalcontrol));
    }
}