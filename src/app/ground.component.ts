import { Component, Input, ElementRef, AfterViewInit, ViewChild } from '@angular/core';

@Component({
    selector: 'ground-canvas',
    template: '<canvas #ground></canvas>',
    styles: ['canvas { border: 1px solid #000; position: absolute; left: 0; top: 0; z-index: 2; }']
})
export class GroundComponent implements AfterViewInit {
    @ViewChild('ground', { static: true }) public canvas: ElementRef;

    @Input() public width = window.innerWidth - 2;
    @Input() public height = window.innerHeight - 2;

    private cx: CanvasRenderingContext2D;
    private origColors: number[];
    private currAmbience: number;

    public ngAfterViewInit() {
        const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
        this.cx = canvasEl.getContext('2d');
        canvasEl.width = this.width;
        canvasEl.height = this.height;

        this.cx.fillStyle = '#006400';
        this.cx.fillRect(0, this.height-50, this.width, this.height);
        var len = this.width * this.height * 4;
        this.origColors = [];
        for (var i = 0; i < len; i++) {
            this.origColors.push(255);
        }
        this.currAmbience = 1;
        this.setColors();
    }

    public setColors() {
        var img = this.cx.getImageData(0, 0, this.width, this.height);
        for (var t = 0; t < img.data.length; t++) {
            this.origColors[t] = img.data[t] / this.currAmbience;
        }
    }

    public setAmbience(amb: number) {
        this.currAmbience = amb;
    }

    public getCanvas() {
        return this.cx;
    }

    public getColors() {
        return this.origColors;
    }
}