import { Component, Input, ElementRef, AfterViewInit, ViewChild } from '@angular/core';

@Component({
    selector: 'sky-canvas',
    template: '<canvas #sky></canvas>',
    styles: ['canvas { border: 1px solid #000; position: absolute; left: 0; top: 0; z-index: 0; }']
})
export class SkyComponent implements AfterViewInit {
    @ViewChild('sky', { static: true }) public canvas: ElementRef;

    @Input() public width = window.innerWidth - 2;
    @Input() public height = window.innerHeight - 2;

    // user parameters
    private ambients = [ 1, 0.35, 0.05, 0.5 ]; // ambient intensities for day, dusk, night, dawn
    private lerpTime = 20000; // time taken to fade sky colors
    private nextLerpTime = 40000; // waiting time until next fade
    private starDensity = 0.2; // number of stars vs. sky area, value between 0 and 1 recommended

    private cx: CanvasRenderingContext2D;
    private gradient: CanvasGradient;
    private time: number; 
    private currAmbience: number; // shading/transparency at the current time
    private stars: number[]; // list of star coordinates [star1.x, star1.y, star2.x, star2.y, ...]
    private numStars: number; // number of stars in sky
    private lerpIndex = 0; // start with this sky index

    // sky colors
    private colors = [[ 0x00, 0x00, 0x3f, 0x00, 0x3f, 0x7f,
                        0x1f, 0x5f, 0xc0, 0x3f, 0xa0, 0xff ],
                      [ 0x00, 0x3f, 0x7f, 0xa0, 0x5f, 0x7f,
                        0xff, 0x90, 0xe0, 0xff, 0x90, 0x00 ],
                      [ 0x00, 0x00, 0x00, 0x00, 0x2f, 0x7f,
                        0x00, 0x28, 0x50, 0x00, 0x1f, 0x3f ],
                      [ 0x1f, 0x00, 0x5f, 0x3f, 0x2f, 0xa0,
                        0xa0, 0x1f, 0x1f, 0xff, 0x7f, 0x00 ] ];

    public ngAfterViewInit() {
        const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
        this.cx = canvasEl.getContext('2d');
        canvasEl.width = this.width;
        canvasEl.height = this.height;

        this.time = new Date().getTime();
        this.lerp(0, 2000);
        this.stars = [];
        this.numStars = Math.floor((this.width * this.height / 200) * this.starDensity);
        for (let i = 0; i < this.numStars; i++) {
            this.stars.push(Math.floor(Math.random()*(this.width - 10)));
            this.stars.push(Math.floor(Math.random()*(this.height - 10)));
        }
        setInterval(() => {
            this.skyColoring();
            this.starPaint();
        }, 200);
    }

    // determine gradient of sky colors and draw
    public skyColoring() {
        this.cx.fillStyle = this.gradient;
        this.cx.fillRect(0, 0, this.width, this.height);
        var ntime = new Date().getTime();
        var elapsed = ntime - this.time;
        
        if (elapsed > this.nextLerpTime) {
            this.lerpIndex = Math.floor((elapsed - this.nextLerpTime) / this.nextLerpTime);
            if ((elapsed - this.nextLerpTime) % this.nextLerpTime < this.lerpTime) {
                this.lerp((elapsed - this.nextLerpTime) % this.nextLerpTime, this.lerpTime);
            }
        }
    }

    // update position of stars and draw on canvas
    public starPaint() {
        // paint stars if ambience is night time
        if (this.currAmbience < 0.3) {

            // modify transparency and intensity of star coloring according to ambience
            this.cx.globalAlpha = 1 - ((this.currAmbience - 0.05) / 0.25);
            var intensity = 1 - (this.currAmbience/2 - 0.05) / 0.25;
            var c = Math.floor(192 * intensity);
            var strc = 'rgb('+c+','+c+','+c+')';
            this.cx.strokeStyle = strc;

            // update position of each star and paint
            for (let i = 0; i < this.numStars; i += 2) {
                let inc = 1; // speed increment in x direction
                if (i % 3 === 0)
                    inc = 2.5;
                else if (i % 23 === 0)
                    inc = 5;
            
                this.stars[i] = (this.stars[i] + 0.1 * inc) % this.width;
                this.cx.strokeRect(this.stars[i], this.stars[i+1], 1, 1);
            }
            this.cx.globalAlpha = 1; // reset transparency
        }
    }
    /**
     * fade sky colors
     * @param time current time
     * @param last how much time taken to fade colors
     */
    public lerp(time: number, last: number) {
        this.gradient = this.cx.createLinearGradient(0,0,0,this.height);
        
        var i0 = this.lerpIndex % this.colors.length;
        var i1 = (this.lerpIndex + 1) % this.colors.length;
        
        for (var i = 0; i < 4; i++)  {
            var rgb = 'rgb(';
            for (var j = 0; j < 3; j++) {
                rgb += Math.floor((this.colors[i1][i*3+j] - this.colors[i0][i*3+j]) * time/last + this.colors[i0][i*3+j]);
                if (j < 2) 
                    rgb+=',';
            }
            rgb += ')';
            this.gradient.addColorStop(i/3, rgb);
        }

        this.currAmbience = (this.ambients[i1] - this.ambients[i0]) * time / last + this.ambients[i0];
    }

    public getAmbience() {
        return this.currAmbience;
    }
}