$(() => {
    const sensorMeasurements = getSensorMeasurements();
    drawChart(sensorMeasurements.xs, sensorMeasurements.ys);
})

const num_points = 50;
const initialsensorval = 50;
const minsensorval = 0;
const maxsensorval = 100;

function getSensorMeasurements() {
    const measurement = () => Math.floor(Math.random() * 4);
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

function calculate() {
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
                        beginAtZero: true
                    }
                }]
            }
        }
    });
}

