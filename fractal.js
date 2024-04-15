const canvas = document.getElementById('fractalCanvas');
const ctx = canvas.getContext('2d');
const CANVAS_WIDTH = canvas.width;
const CANVAS_HEIGHT = canvas.height;
const MAX_ITERATIONS = 500;
const C_REAL = -0.7;
let C_IMAGINARY = 0.27015; 
let zoomLevel = 1;

function hslToRgb(h, s, l) {
    s /= 100;
    l /= 100;

    let c = (1 - Math.abs(2 * l - 1)) * s;
    let x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    let m = l - c / 2;
    let r, g, b;

    if (h >= 0 && h < 60) {
        [r, g, b] = [c, x, 0];
    } else if (h >= 60 && h < 120) {
        [r, g, b] = [x, c, 0];
    } else if (h >= 120 && h < 180) {
        [r, g, b] = [0, c, x];
    } else if (h >= 180 && h < 240) {
        [r, g, b] = [0, x, c];
    } else if (h >= 240 && h < 300) {
        [r, g, b] = [x, 0, c];
    } else {
        [r, g, b] = [c, 0, x];
    }

    return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
}

function getColor(iterations, hue) {
    const saturation = 90; 
    const lightnessFactor = iterations / MAX_ITERATIONS * 200;
    const lightness = lightnessFactor + 30;
    return hslToRgb(hue, saturation, lightness);
}

function isInJuliaSet(x, y) {
    let real = (x - CANVAS_WIDTH / 2) * 4 / CANVAS_WIDTH / zoomLevel;
    let imag = (y - CANVAS_HEIGHT / 2) * 4 / CANVAS_HEIGHT / zoomLevel;
    for (let i = 0; i < MAX_ITERATIONS; i++) {
        const tempReal = real * real - imag * imag + C_REAL;
        const tempImag = 2 * real * imag + C_IMAGINARY;
        real = tempReal;
        imag = tempImag;
        if (real * real + imag * imag > 4) {
            return i;
        }
    }
    return MAX_ITERATIONS;
}

function mergeSort(arr) {
    if (arr.length <= 1) {
        return arr;
    }

    const mid = Math.floor(arr.length / 2);
    const left = mergeSort(arr.slice(0, mid));
    const right = mergeSort(arr.slice(mid));

    return merge(left, right);
}

function merge(left, right) {
    let result = [];
    let leftIndex = 0;
    let rightIndex = 0;

    while (leftIndex < left.length && rightIndex < right.length) {
        if (left[leftIndex].depth < right[rightIndex].depth) {
            result.push(left[leftIndex]);
            leftIndex++;
        } else {
            result.push(right[rightIndex]);
            rightIndex++;
        }
    }

    return result.concat(left.slice(leftIndex)).concat(right.slice(rightIndex));
}

function drawJulia() {
    const hue = document.getElementById('hue').value;
    const imageData = ctx.createImageData(CANVAS_WIDTH, CANVAS_HEIGHT);
    const data = imageData.data;
    const pixels = [];

    for (let x = 0; x < CANVAS_WIDTH; x++) {
        for (let y = 0; y < CANVAS_HEIGHT; y++) {
            const iterations = isInJuliaSet(x, y);
            pixels.push({ x, y, iterations });
        }
    }

    const sortedPixels = mergeSort(pixels);

    for (const pixel of sortedPixels) {
        const index = (pixel.y * CANVAS_WIDTH + pixel.x) * 4;
        const color = getColor(pixel.iterations, hue);
        data[index] = color[0];
        data[index + 1] = color[1];
        data[index + 2] = color[2];
        data[index + 3] = 255;
    }

    ctx.putImageData(imageData, 0, 0);
}

document.getElementById('imaginaryValue').addEventListener('input', (event) => {
    C_IMAGINARY = parseFloat(event.target.value);
    drawJulia();
});

document.getElementById('hue').addEventListener('input', () => {
    drawJulia();
});

document.getElementById('zoomInButton').addEventListener('click', () => {
    zoomLevel *= 2;
    drawJulia();
});

document.getElementById('zoomOutButton').addEventListener('click', () => {
    zoomLevel /= 2;
    drawJulia();
});

drawJulia();
