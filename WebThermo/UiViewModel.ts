// this kicks off the whole shebang
$(document).ready(function () {
    new UiViewModel();
});

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