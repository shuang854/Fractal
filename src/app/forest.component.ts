import { Component, Input, ElementRef, AfterViewInit, ViewChild } from '@angular/core';

@Component({
    selector: 'forest-canvas',
    template: '<canvas #forest></canvas>',
    styles: ['canvas { border: 1px solid #000; position: absolute; left: 0; top: 0; z-index: 0; }']
})
export class ForestComponent implements AfterViewInit {
    @ViewChild('forest', { static: true }) public canvas: ElementRef;

    @Input() public width = window.innerWidth - 10;
    @Input() public height = window.innerHeight - 10;

    private cx: CanvasRenderingContext2D; // forest canvas
    private animTime: number; // how long it takes to finish tree drawing animation, calculated during animation
    private drawSpeed: number; // pixel length per line stroke during animation, (+) to speed up
    private drawInterval: number; // time between each line stroke, (-) to speed up

    public ngAfterViewInit() {
        // adjust variables here
        this.drawSpeed = 5;
        this.drawInterval = 20;

        const canvasEl2: HTMLCanvasElement = this.canvas.nativeElement;
        this.cx = canvasEl2.getContext('2d');
        this.animTime = 0;

        canvasEl2.width = this.width;
        canvasEl2.height = this.height;

        this.cx.lineCap = 'round';
        this.cx.strokeStyle = '#000';
    }

    // draw tree in forest canvas
    public fillForest(start: { x: number, y: number }, end: {x: number, y: number}, 
        h: number, w: number, currRot: number, rot: number) {

        if (!this.cx) { return; }
        if (w <= 2) { return; }
        
        this.animate(start, end, w);
        
        var branchH = h/1.5;
        var branchW = w - 2;
        var leftLoc = { 
            x: start.x - Math.sin((currRot+rot)*Math.PI/180) * branchH, 
            y: start.y - Math.cos((currRot+rot)*Math.PI/180) * branchH
        }
        var rightLoc = {
            x: start.x - Math.sin((currRot-rot)*Math.PI/180) * branchH,
            y: start.y - Math.cos((currRot-rot)*Math.PI/180) * branchH
        }

        this.fillForest(leftLoc, start, branchH, branchW, currRot + rot, rot);
        this.fillForest(rightLoc, start, branchH, branchW, currRot - rot, rot);
    }

    // update trees fading into background (grayness)
    public grayTrees() {
        var img = this.cx.getImageData(0, 0, this.width, this.height);
        for (var t = 0; t < img.data.length; t += 4) {
            if (img.data[t] == img.data[t+1] && img.data[t] == img.data[t+2] && img.data[t+1] == img.data[t+2]) {
                if (img.data[t] < 255 && img.data[t+1] < 255 && img.data[t] < 255) {
                    img.data[t] = Math.min(img.data[t]+20, 255);
                    img.data[t+1] = Math.min(img.data[t+1]+20, 255);
                    img.data[t+2] = Math.min(img.data[t+2]+20, 255);
                }
            }
        }
        this.cx.putImageData(img, 0, 0);
    }

    // animation for drawing tree
    public animate(start: {x: number, y: number}, end: {x: number, y: number}, w: number) {
        var amount = 0;
        var dist = Math.sqrt((start.x - end.x)*(start.x - end.x) + (start.y - end.y)*(start.y - end.y));
        var increment = dist / 20 > this.drawSpeed ? 0.05 : this.drawSpeed / dist;
        setTimeout(() => {
            amount += increment;
            this.draw(end, start, w, amount);
            var timer = setInterval(() => {
                if (amount >= 1.0) {
                    clearInterval(timer);
                } else {
                    amount += increment;
                    this.draw(end, start, w, amount);
                }
            }, this.drawInterval);
        }, this.animTime);
        this.animTime += this.drawInterval * (Math.min(20, Math.floor(dist / this.drawSpeed)));
    }

    // line stroke
    public draw(start: {x: number, y: number}, end: {x: number, y: number}, w: number, a: number) {
        this.cx.lineWidth = w;
        this.cx.beginPath();
        this.cx.moveTo(start.x, start.y);
        this.cx.lineTo(start.x + (end.x - start.x) * Math.min(a, 1), start.y + (end.y - start.y) * Math.min(a, 1));
        this.cx.stroke();
    }

    // reset animation time counter
    public resetAnim() {
        var time = this.animTime;
        this.animTime = 0;
        console.log(time);
        return time;
    }
}