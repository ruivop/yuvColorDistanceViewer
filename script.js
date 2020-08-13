var numColors = 100;

var yVal = 127.5;

var yColorVal = 127.5;
var uColorVal = 127.5;
var vColorVal = 127.5;
var maxColorDistance = 1.5;
var isAnimating = false;


document.addEventListener("DOMContentLoaded", function () {

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const yValParam = urlParams.get('yVal');
    const yColorValParam = urlParams.get('yColorVal');
    const uColorValParam = urlParams.get('uColorVal');
    const vColorValParam = urlParams.get('vColorVal');
    const maxColorDistanceParam = urlParams.get('maxColorDistance');

    if (yValParam)
        yVal = parseFloat(yValParam);
    if (yColorValParam)
        yColorVal = parseFloat(yColorValParam);
    if (uColorValParam)
        uColorVal = parseFloat(uColorValParam);
    if (vColorValParam)
        vColorVal = parseFloat(vColorValParam);
    if (maxColorDistanceParam)
        maxColorDistance = parseFloat(maxColorDistanceParam);


    recalculateTable();

    document.getElementById("yvaluenumber").valueAsNumber = yVal;
    document.getElementById("yvaluerange").valueAsNumber = yVal;
    document.getElementById("yColorVal").valueAsNumber = yColorVal;
    document.getElementById("uColorVal").valueAsNumber = uColorVal;
    document.getElementById("vColorVal").valueAsNumber = vColorVal;
    document.getElementById("maxColorDistance").valueAsNumber = maxColorDistance;


    document.getElementById("yColorVal").addEventListener('change', (event) => {
        yColorVal = event.target.valueAsNumber;
        recalculateTable();
    });

    document.getElementById("uColorVal").addEventListener('change', (event) => {
        uColorVal = event.target.valueAsNumber;
        recalculateTable();
    });

    document.getElementById("vColorVal").addEventListener('change', (event) => {
        vColorVal = event.target.valueAsNumber;
        recalculateTable();
    });

    document.getElementById("maxColorDistance").addEventListener('change', (event) => {
        maxColorDistance = event.target.valueAsNumber;
        recalculateTable();
    });

    document.getElementById("yvaluerange").addEventListener('change', (event) => {
        document.getElementById("yvaluenumber").valueAsNumber = event.target.valueAsNumber;
        yVal = event.target.valueAsNumber;
        recalculateTable();
    });

    document.getElementById("yvaluenumber").addEventListener('change', (event) => {
        if (event.target.valueAsNumber >= 256) {
            alert("Out of range [0,256[");
            document.getElementById("yvaluenumber").valueAsNumber = 255;
            document.getElementById("yvaluerange").valueAsNumber = 255;
            yVal = 255;
            return;
        }

        if (event.target.valueAsNumber < 0) {
            alert("Out of range [0,256[");
            document.getElementById("yvaluenumber").valueAsNumber = 0;
            document.getElementById("yvaluerange").valueAsNumber = 0;
            yVal = 0;
            return;
        }
        document.getElementById("yvaluerange").valueAsNumber = event.target.valueAsNumber;
        yVal = event.target.valueAsNumber;
        recalculateTable();
    });

    document.getElementById("share-text-area").style.visibility = "hidden";
    document.getElementById("share-button").addEventListener('click', (event) => {
        var inputShareUrl = document.getElementById("share-text-area");
        inputShareUrl.value = window.location.href.split('?')[0] + "?" +
            "yVal=" + yVal +
            "&yColorVal=" + yColorVal +
            "&uColorVal=" + uColorVal +
            "&vColorVal=" + vColorVal +
            "&maxColorDistance=" + maxColorDistance;
        inputShareUrl.style.visibility = "visible";
        inputShareUrl.select();
        inputShareUrl.setSelectionRange(0, 99999);
        document.execCommand("copy");
        inputShareUrl.style.visibility = "visible";
    });

    document.getElementById("animate-button").addEventListener('click', (event) => {
        if (isAnimating)
            return;
        isAnimating = true;
        var id = setInterval(frame, 5);
        yVal = Math.max(0, yColorVal - maxColorDistance);
        var maxDistance = Math.min(254, yColorVal + maxColorDistance);
        console.log(yColorVal + maxColorDistance);
        function frame() {
            if (yVal >= maxDistance) {
                clearInterval(id);
                isAnimating = false;
                yVal--;
                document.getElementById("yvaluenumber").valueAsNumber = yVal;
                document.getElementById("yvaluerange").valueAsNumber = yVal;
            } else {
                recalculateTable();
                yVal++;
                document.getElementById("yvaluenumber").valueAsNumber = yVal;
                document.getElementById("yvaluerange").valueAsNumber = yVal;
            }
        }
    });

});

var tableDimensions = 600; //px
function recalculateTable() {
    var table = document.getElementById("yuv-color-table");
    var newCellDim = tableDimensions / numColors;

    var colorPointPlace = document.getElementById("color-point");
    var pointctx = colorPointPlace.getContext("2d");
    var rgbPointColor = RGBfromYUV(yColorVal, uColorVal, vColorVal);
    pointctx.fillStyle = "rgb(" + rgbPointColor['R'] + ", " + rgbPointColor['G'] + ", " + rgbPointColor['B'] + ")";
    pointctx.fillRect(0, 0, 120, 120);

    var ctx = table.getContext("2d");
    for (var i = 0; i < numColors; i++) {
        for (var j = 0; j < numColors; j++) {
            var rgbColor = RGBfromYUV(yVal, ((i + 0.5) * 256) / numColors, 255 - ((j + 0.5) * 256) / numColors);
            var color = "rgb(" + rgbColor['R'] + ", " + rgbColor['G'] + ", " + rgbColor['B'] + ")";
            ctx.fillStyle = color;
            ctx.fillRect(i * newCellDim, j * newCellDim, newCellDim, newCellDim);
        }
    }

    for (var i = 0; i < numColors; i++) {
        for (var j = 0; j < numColors; j++) {
            if (!isPointOnDistance(i, j))
                continue;
            if (!isPointOnDistance(i, j - 1)) {
                if (yVal > 127.5)
                    ctx.strokeStyle = "rgb(0,0,0)";
                else
                    ctx.strokeStyle = "rgb(255,255,255)";

                ctx.beginPath();
                ctx.moveTo(i * newCellDim, j * newCellDim);
                ctx.lineTo(i * newCellDim + newCellDim, j * newCellDim);
                ctx.stroke();
                //ctx.strokeRect(x * newCellDim - 1, y * newCellDim - 1, newCellDim, newCellDim);
            }
            if (!isPointOnDistance(i + 1, j)) {
                if (yVal > 127.5)
                    ctx.strokeStyle = "rgb(0,0,0)";
                else
                    ctx.strokeStyle = "rgb(255,255,255)";

                ctx.beginPath();
                ctx.lineTo(i * newCellDim + newCellDim, j * newCellDim);
                ctx.lineTo(i * newCellDim + newCellDim, j * newCellDim + newCellDim);
                ctx.stroke();
                //ctx.strokeRect(x * newCellDim - 1, y * newCellDim - 1, newCellDim, newCellDim);
            }
            if (!isPointOnDistance(i, j + 1)) {
                if (yVal > 127.5)
                    ctx.strokeStyle = "rgb(0,0,0)";
                else
                    ctx.strokeStyle = "rgb(255,255,255)";

                ctx.beginPath();
                ctx.lineTo(i * newCellDim + newCellDim, j * newCellDim + newCellDim);
                ctx.lineTo(i * newCellDim, j * newCellDim + newCellDim);
                ctx.stroke();
                //ctx.strokeRect(x * newCellDim - 1, y * newCellDim - 1, newCellDim, newCellDim);
            }
            if (!isPointOnDistance(i - 1, j)) {
                if (yVal > 127.5)
                    ctx.strokeStyle = "rgb(0,0,0)";
                else
                    ctx.strokeStyle = "rgb(255,255,255)";

                ctx.beginPath();
                ctx.lineTo(i * newCellDim, j * newCellDim + newCellDim);
                ctx.lineTo(i * newCellDim, j * newCellDim);
                ctx.stroke();
            }
        }
    }
}

function isPointOnDistance(x, y) {
    var YDistance = yVal - yColorVal;
    var UDistance = uColorVal - ((x + 0.5) * 256) / numColors;
    var VDistance = 255 - vColorVal - ((y + 0.5) * 256) / numColors;

    var colorDistance = Math.sqrt(YDistance * YDistance + UDistance * UDistance + VDistance * VDistance);

    if (colorDistance <= maxColorDistance) {
        return true;
    }
    return false;
}

function RGBfromYUV(Y, U, V) {
    Y -= 16;
    U -= 128;
    V -= 128;
    var ret = [];
    ret['R'] = 1.164 * Y + 1.596 * V;
    ret['G'] = 1.164 * Y - 0.392 * U - 0.813 * V;
    ret['B'] = 1.164 * Y + 2.017 * U;
    return ret;
}