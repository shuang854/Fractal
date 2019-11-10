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
    private celeLoops = [ 70000, 30000, 60000 ]; // celestial body movements (sunset, moon rise, none)
    private lerpTime = 20000; // time taken to fade sky colors
    private nextLerpTime = 20000; // waiting time until next fade
    private starDensity = 0.2; // number of stars vs. sky area, value between 0 and 1 recommended

    private cx: CanvasRenderingContext2D;
    private gradient: CanvasGradient;
    private time: number; 
    private celeTime: number; // celestial body time tracker
    private currAmbience: number; // shading/transparency at the current time
    private stars: number[]; // list of star coordinates [star1.x, star1.y, star2.x, star2.y, ...]
    private numStars: number; // number of stars in sky
    private currLerpTime: number; // current time until next sky fade
    private lerpIndex = 0; // start with this sky index
    private celeMotion = 0; // pointer for celeLoops

    // sky colors
    private colors = [[ 0x00, 0x00, 0x3f, 0x00, 0x3f, 0x7f,
                        0x1f, 0x5f, 0xc0, 0x3f, 0xa0, 0xff ],
                      [ 0x00, 0x3f, 0x7f, 0x50, 0x4f, 0x7f, 
                        0xb2, 0x74, 0x82, 0xff, 0x90, 0x00 ],
                      [ 0x00, 0x00, 0x00, 0x00, 0x0f, 0x3f,
                        0x00, 0x28, 0x50, 0x00, 0x1f, 0x3f ],
                      [ 0x1f, 0x00, 0x5f, 0x1f, 0x0f, 0x60,
                        0xa0, 0x1f, 0x1f, 0xff, 0x7f, 0x00 ] ];

    public ngAfterViewInit() {
        const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
        this.cx = canvasEl.getContext('2d');
        canvasEl.width = this.width;
        canvasEl.height = this.height;

        this.time = new Date().getTime();
        this.celeTime = this.celeLoops[this.celeMotion];
        this.stars = [];
        this.currLerpTime = this.nextLerpTime;
        this.numStars = Math.floor((this.width * this.height / 200) * this.starDensity);
        for (let i = 0; i < this.numStars; i++) {
            this.stars.push(Math.floor(Math.random()*(this.width - 10)));
            this.stars.push(Math.floor(Math.random()*(this.height - 10)));
        }
        this.lerp(0, 100);
        setInterval(() => {
            this.skyColoring();
            this.starPaint();
        }, 100);
    }

    // paint gradient of sky colors and sun/moon movement
    public skyColoring() {
        this.cx.fillStyle = this.gradient;
        this.cx.fillRect(0, 0, this.width, this.height);
        var ntime = new Date().getTime();
        var elapsed = ntime - this.time;
        
        // keep track of when to make sky ambience transition
        if (elapsed > this.currLerpTime) {
            if (elapsed - this.currLerpTime > this.lerpTime) {
                this.currLerpTime += this.lerpTime + this.nextLerpTime;
                this.lerpIndex++;
            } else {
                this.lerp(elapsed - this.currLerpTime, this.lerpTime);
            }
            
        }

        // keep track of celestial body movement loops
        let prev = this.celeTime - this.celeLoops[this.celeMotion];
        if (elapsed > this.celeTime) {
            this.celeMotion = (this.celeMotion + 1) % 3;
            this.celeTime += this.celeLoops[this.celeMotion];
            prev = this.celeTime - this.celeLoops[this.celeMotion];
        }

        // paint celestial body movement (sunset or moonrise)
        this.cx.beginPath();
        let total = this.celeLoops[this.celeMotion];
        if (this.celeMotion === 0) { // paint Sun
            let xPos = -60 + (400 * (((elapsed - prev) % total) / total));
            let yPos = 400 + (this.height - 400) * (((elapsed - prev) % total) / total);

            // radial gradient to blur edge of circular Sun
            let grad = this.cx.createRadialGradient(xPos, yPos, 20, xPos, yPos, 50);
            grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
            grad.addColorStop(0.5, 'rgba(255, 255, 255, 1)');
            grad.addColorStop(1, 'rgba(255,255,255,0)');
            this.cx.fillStyle = grad;
            this.cx.fillRect(xPos-50, yPos-50, 150, 150);

        } else if (this.celeMotion === 1) { // paint Moon
            let xPos = this.width+50 - 300 * (((elapsed - prev) % total) / total);
            let yPos = 300 - 350 * (((elapsed - prev) % total) / total);

            // draw two overlapping circles for crescent Moon
            this.cx.beginPath();
            this.cx.arc(xPos+15, yPos+15, 25, 2 * Math.PI, 0, true);
            this.cx.fillStyle = '#CCCCCC';
            this.cx.fill();

            this.cx.beginPath();
            this.cx.arc(xPos, yPos, 30, 2 * Math.PI, 0, true);
            this.cx.fillStyle = this.gradient;
            this.cx.fill();
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