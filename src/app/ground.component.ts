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

        var len = this.width * this.height * 4;
        this.currAmbience = 1;
        this.origColors = [];
        for (var i = 0; i < len; i++) {
            this.origColors.push(255);
        }
        this.generateTerrain();
        this.setColors();
    }

    public generateTerrain() {
        for (let i = 0; i < 12; i++) {
            if (i % 4 == 0)
                this.darken();
            this.makeGrass(i % 4);
        }
    }

    public darken() {
        for (var i = 0; i < this.origColors.length; i += 4) {
            this.origColors[i] = Math.max(this.origColors[i]-10, 0);
            this.origColors[i+1] = Math.max(this.origColors[i+1]-10, 0);
            this.origColors[i+2] = Math.max(this.origColors[i+2]-10, 0);            
        }
        this.updateCanvas();
    }

    public makeGrass(start: number) {
        for (let x = start; x < this.width; x += 4) {
            this.cx.beginPath();
            this.cx.moveTo(x, this.height);

            let optionsX = [-5, -3, 3, 5];
            let optionsY = [-5, -4, -3, -2, 0, 2, 3, 4, 5];
            let randX = Math.floor(Math.random() * optionsX.length);
            let randY = Math.floor(Math.random() * optionsY.length);
            this.cx.quadraticCurveTo(x, this.height-10, x + optionsX[randX], this.height-20 + optionsY[randY]);
            this.cx.strokeStyle = '#006400';
            this.cx.stroke();
        }
        this.setColors();
    }

    public setColors() {
        var img = this.cx.getImageData(0, 0, this.width, this.height);
        for (var t = 0; t < img.data.length; t++) {
            this.origColors[t] = img.data[t] / this.currAmbience;
        }
    }

    public updateCanvas() {
        var img = this.cx.getImageData(0, 0, this.width, this.height);
        for (var t = 0; t < this.origColors.length; t += 4) {
            img.data[t] = this.origColors[t] * this.currAmbience;
            img.data[t+1] = this.origColors[t+1] * this.currAmbience;
            img.data[t+2] = this.origColors[t+2] * this.currAmbience;
        }
        this.cx.putImageData(img, 0, 0);
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