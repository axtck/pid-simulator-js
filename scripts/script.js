$(() => {
    const sensorMeasurements = getSensorMeasurements();
    drawChart(sensorMeasurements.xs, sensorMeasurements.ys);

    calculate(sensorMeasurements.ys);
})

const num_points = 50;
const initialsensorval = 50;
const minsensorval = 0;
const maxsensorval = 100;

let p = 0;
let i = 0;
let d = 0;

let integral = 0;
let derivative = 0;

const kp = 0.009;
const ki = 0.003;
const kd = 0.029;

let totalcontrol = 0;

let error = 0;
let preverror = 0;
let prevtime = 0.6;

const setpoint = 60;

function getSensorMeasurements() {
    const measurement = () => Math.random() * 4;
    const higherlower = (num) => Math.random() < 0.5 ? +num : -num; // Return value from -4 to -4.
    const xs = [];
    const ys = [];
    let sensorval = initialsensorval;
    for (let i = 0; i < num_points; i++) {
        sensorval += higherlower(measurement());
        if (sensorval < minsensorval) {
            sensorval = minsensorval;
        } else if (sensorval > maxsensorval) {
            sensorval = maxsensorval;
        }
        xs.push(i);
        ys.push(sensorval);
    }
    return { xs, ys };
}


function calculate(height) {
    const calcs = [];
    for (let j = 0; j < height.length; j++) {
        error = setpoint - height[j];

        p = kp * error;

        integral = (prevtime * preverror) + (prevtime * ((error - preverror) / 2));
        i = ki * integral;

        derivative = (error - preverror) / prevtime;
        d = kd * derivative;

        totalcontrol = p + i + d;
        calcs.push({
            height: height[j].toFixed(5),
            error: error.toFixed(5) ,
            preverror: preverror.toFixed(5),
            p: p.toFixed(5),
            i: i.toFixed(5),
            d: d.toFixed(5),
            totalcontrol: totalcontrol.toFixed(5),
        });

        preverror = error;
    }

    console.log(calcs);
}

function drawChart(xs, ys) {
    var ctx = document.getElementById('pid-chart').getContext('2d');
    var myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: xs,
            datasets: [{
                label: 'Signal',
                data: ys,
                backgroundColor: [
                    'rgba(41, 241, 195, 1)',
                ],
                borderColor: [
                    'rgba(30, 130, 76, 1)',
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        display: true,
                        beginAtZero: true,
                        min: minsensorval,
                        max: maxsensorval
                    }
                }]
            }
        }
    });
}

