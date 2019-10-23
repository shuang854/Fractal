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

    private cx: CanvasRenderingContext2D;

    public ngAfterViewInit() {
        const canvasEl2: HTMLCanvasElement = this.canvas.nativeElement;
        this.cx = canvasEl2.getContext('2d');

        canvasEl2.width = this.width;
        canvasEl2.height = this.height;

        this.cx.lineWidth = 3;
        this.cx.lineCap = 'round';
        this.cx.strokeStyle = '#000';
    }

    public fillForest(start: { x: number, y: number }, end: {x: number, y: number}, 
        h: number, w: number, currRot: number, rot: number) {

        if (!this.cx) { return; }
        if (w <= 2) { return; }
        this.cx.beginPath();
        this.cx.moveTo(start.x, start.y);
        
        this.cx.lineWidth = w;
        this.cx.lineTo(end.x, end.y);
        this.cx.stroke();
        //this.cx.moveTo(-start.x, -start.y);

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
}