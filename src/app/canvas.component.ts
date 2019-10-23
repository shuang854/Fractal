import { Component, Input, ElementRef, AfterViewInit, ViewChild } from '@angular/core';
import { fromEvent } from 'rxjs';
import { pairwise } from 'rxjs/operators'
import { ForestComponent } from './forest.component';

@Component({
    selector: 'tree-canvas',
    template: '<canvas #tree></canvas> <forest-canvas></forest-canvas>',
    styles: ['canvas { border: 1px solid #000; position: absolute; left: 0; top: 0; z-index: 1; }']
})
export class CanvasComponent implements AfterViewInit {

    @ViewChild('tree', {static: true}) public canvas: ElementRef;
    @ViewChild(ForestComponent, {static: true}) public forest: ForestComponent;

    @Input() public width = window.innerWidth-10;
    @Input() public height = window.innerHeight-10;

    private cx: CanvasRenderingContext2D;
    private treeH: number;
    private treeW: number;

    public ngAfterViewInit() {
        const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
        this.cx = canvasEl.getContext('2d');
        this.treeH = 200;
        this.treeW = 20;

        canvasEl.width = this.width;
        canvasEl.height = this.height;

        this.cx.lineWidth = 3;
        this.cx.lineCap = 'round';
        this.cx.strokeStyle = '#000';

        this.captureEvents(canvasEl, this.forest);
    }

    private captureEvents(canvasEl: HTMLCanvasElement, forest: ForestComponent) {
        // this draw on 'forest-canvas' on every click
        fromEvent(canvasEl, 'click')
            .pipe()
            .subscribe((res: MouseEvent) => {
                const rect = canvasEl.getBoundingClientRect();
                const currentPos = {
                    x: res.clientX - rect.left,
                    y: res.clientY - rect.top
                };
                var start = { x: currentPos.x, y: this.height - this.treeH - 50};
                forest.fillForest(start, { x: start.x, y: this.height - 50 }, this.treeH, this.treeW, 0, 20);
            });

        fromEvent(canvasEl, 'mousemove')
            .pipe(pairwise())
            .subscribe((res: [MouseEvent, MouseEvent]) => {
                const rect = canvasEl.getBoundingClientRect();

                // previous and current position with the offset
                const prevPos = {
                    x: res[0].clientX - rect.left,
                    y: res[0].clientY - rect.top
                };

                const currentPos = {
                    x: res[1].clientX - rect.left,
                    y: res[1].clientY - rect.top
                };

                // this method allows tree to hover over cursor
                 this.updateCanvas(currentPos, this.treeH, this.treeW);
            });

        fromEvent(canvasEl, 'wheel')
            .subscribe((res: WheelEvent) => {
                if (res.deltaY > 0 && this.treeH >= 100) { this.treeH -= 10; }
                else if (res.deltaY < 0 && this.treeH <= 300) { this.treeH += 10; }
                
                const rect = canvasEl.getBoundingClientRect();
                const currentPos = {
                    x: res.clientX - rect.left,
                    y: res.clientY - rect.top
                }

                this.updateCanvas(currentPos, this.treeH, this.treeW);
            });
    }

    private updateCanvas(currentPos: { x: number, y: number }, h: number, w: number) {
        if (!this.cx) { return; }

        this.cx.clearRect(0, 0, this.width, this.height);
        this.cx.fillRect(currentPos.x-(w/2), this.height-h-50, w, h);
    }
}