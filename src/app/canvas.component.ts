import { Component, Input, ElementRef, AfterViewInit, ViewChild } from '@angular/core';
import { fromEvent } from 'rxjs';
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
    private treeH: number; // starting height of tree
    private treeW: number; // starting width of tree
    private rotation: number; // angle between a branch and its trunk
    private isBuilding: boolean; // check if a tree is being built

    public ngAfterViewInit() {
        const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
        this.cx = canvasEl.getContext('2d');
        this.treeH = 200;
        this.treeW = 20;
        this.rotation = 30;
        this.isBuilding = false;        

        canvasEl.width = this.width;
        canvasEl.height = this.height;

        this.cx.lineWidth = 3;
        this.cx.lineCap = 'round';
        this.cx.strokeStyle = '#000';

        this.captureEvents(canvasEl, this.forest);
    }

    // listening for user inputs (Observables)
    private captureEvents(canvasEl: HTMLCanvasElement, forest: ForestComponent) {
        // draws on 'forest-canvas' on every click
        fromEvent(canvasEl, 'click')
            .pipe()
            .subscribe((res: MouseEvent) => {
                const rect = canvasEl.getBoundingClientRect();
                const currentPos = {
                    x: res.clientX - rect.left,
                    y: res.clientY - rect.top
                };
                var start = { x: currentPos.x, y: this.height - this.treeH - 50};

                // build only one tree at a time
                if (!this.isBuilding) {
                    forest.grayTrees();
                    this.isBuilding = true;
                    forest.fillForest(start, { x: start.x, y: this.height - 50 }, this.treeH, 
                        this.treeW, 0, this.rotation);
                    setTimeout(() => { 
                        this.isBuilding = false; 
                    }, forest.resetAnim() );
                }
            });

        // follow mouse movement to keep a tree on cursor's x position
        fromEvent(canvasEl, 'mousemove')
            .pipe()
            .subscribe((res: MouseEvent) => {
                // ignore mouse movement while tree is being built
                if (!this.isBuilding) {
                    const rect = canvasEl.getBoundingClientRect();

                    // current position with the offset
                    const currentPos = {
                        x: res.clientX - rect.left,
                        y: res.clientY - rect.top
                    };

                    // this method allows tree to hover over cursor
                    this.updateCanvas(currentPos, this.treeH, this.treeW);
                }
            });

        // increase/decrease tree height with mouse wheel
        fromEvent(canvasEl, 'wheel')
            .subscribe((res: WheelEvent) => {
                const rect = canvasEl.getBoundingClientRect();
                const currentPos = {
                    x: res.clientX - rect.left,
                    y: res.clientY - rect.top
                }

                if (!this.isBuilding) {
                    if (res.deltaY > 0 && this.treeH >= 100) { this.treeH -= 10; }
                    else if (res.deltaY < 0 && this.treeH <= 300) { this.treeH += 10; }
                    this.updateCanvas(currentPos, this.treeH, this.treeW);
                }
            });
            
    }

    private updateCanvas(currentPos: { x: number, y: number }, h: number, w: number) {
        if (!this.cx) { return; }

        this.cx.clearRect(0, 0, this.width, this.height);
        this.cx.fillRect(currentPos.x-(w/2), this.height-h-50, w, h);
    }
}