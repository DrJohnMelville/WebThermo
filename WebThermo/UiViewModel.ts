// this kicks off the whole shebang
$(document).ready(function () {
    initializeServiceWorker();
    new UiViewModel();
});

function initializeServiceWorker(){
    // Service worker for Progressive Web App
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/WebThermo/ServiceWorker.js', {
            scope: '.' // THIS IS REQUIRED FOR RUNNING A PROGRESSIVE WEB APP FROM A NON_ROOT PATH
        }).then(function(registration) {
            // Registration was successful
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
        }, function(err) {
            // registration failed :(
            console.log('ServiceWorker registration failed: ', err);
        });
    }
}

class UiViewModel
{
    blueTooth: BluetoothConnection;
    graph: GraphDriver;
    constructor() {
        this.blueTooth = new BluetoothConnection(this);
        $("#bluetoothConnect").click(i=>this.blueTooth.connect());
        this.thermoButtonPressed();
    }

    thermoButtonPressed() {
        this.graph = new GraphDriver(new Tracing(".greenSide", 0,3), new Tracing(".redSide", 2,7));
    }

    connected() {
        $("#bluetoothConnect").hide();
    }

    tempArrived(redTemp: number, greenTemp: number, timeStamp: Date) {
        this.graph.addTemp(timeStamp, greenTemp, redTemp);
    }
}