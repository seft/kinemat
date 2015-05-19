//Imaginary javadoc:
//param pos: a paper.js Point
//param radius: a number (lol weak typing)
//param color: a color idk lol
function Joystick(pos, radius, color) {
    this.pos = pos;
    this.radius = radius;
    this.color = color;
    this.setPt = new Point(pos);

    //Drawing unchanging graphical elements
    var bounds = new Path.Circle({
        center: this.pos,
        radius: this.radius,
        strokeColor: 0.8,
        strokeWidth: 5,
        dashArray: [10,4]
    });

    var bulbShadow = new Path.Circle({
        center: this.pos,
        radius: 10,
        fillColor: 0.8
    });

    //Drawing changing graphical elements
    var bulb = new Path.Circle({
        center: pos,
        radius: 10,
        fillColor: this.color
    });

    var xText = new PointText({
        point: [this.pos.x + this.radius + 10,
                this.pos.y - this.radius],
        fontSize: 20,
        fillColor: 0.8
    });

    var yText = new PointText({
        point: [this.pos.x + this.radius + 10,
                this.pos.y - this.radius + 20],
        fontSize: 20,
        fillColor: 0.8
    });

    //Getters and setters
    this.getX = function() {
        var delta = this.pos - bulb.position;
        return -Math.round(delta.x / this.radius * 100);
    };

    this.getY = function() {
        var delta = this.pos - bulb.position;
        return Math.round(delta.y / this.radius * 100);
    };

    this.getDelta = function() {
        return this.pos - bulb.position;
    };

    //Event handling workaround
    this.drag = function(point) {
        var extendedBounds = new Path.Circle(this.pos, this.radius + 50);

        if(bounds.contains(point)) {
            this.setPt = point;
        } else if(extendedBounds.contains(point)) {
            var theta = Math.atan2(point.x-this.pos.x,this.pos.y-point.y);
            var radPoint = new Point({
                x: this.pos.x + this.radius*Math.sin(theta),
                y: this.pos.y - this.radius*Math.cos(theta)
            });
            this.setPt = radPoint;
        } else {
            this.setPt = this.pos;
        }
    };

    this.mouseUp = function(point) {
        this.setPt = this.pos;
    };

    this.frame = function(point) {
        var vector = this.setPt - bulb.position;
        bulb.position += vector / 5;
        xText.content = "x: " + this.getX();
        yText.content = "y: " + this.getY();
    };
}

var XYpos = new Joystick(new Point(110, view.size.height - 110), 80, '#FF4444');
var Zpos = new Joystick(new Point(view.size.width - 150, XYpos.pos.y), 80, "#33B5E5");

var segLen = 200;

var bg = new Layer();

var shoulder = new Point(view.center.x, view.size.height/20);

var range = new Path.Circle({
    center: shoulder,
    layer: bg,
    radius: 2*segLen,
    fillColor: '#000',
    opacity: 0.1,
});

range.removeSegment(1);
range.segments[0].handleOut = [segLen,0];
range.segments[1].handleIn = [-segLen,0];

var wrist = new Path.Circle({
    center: range.bounds.center,
    radius: 10,
    fillColor: '#AA66CC',
    // opacity: 0.5
});

var shoulderpt = new Path.Circle({
    center: shoulder,
    radius: 10,
    fillColor: '#AA66CC',
    // opacity: 0.5
});

var wristcirc = new Path.Circle({
    center: wrist.position,
    radius: segLen,
    //fillColor: '#AAA66CC',
    //opacity: 0.1,
});

var shouldercirc = new Path.Circle({
    center: shoulderpt.position,
    radius: segLen,
    //fillColor: '#AAA66CC',
    //opacity: 0.1
});

var arm = new Path({
    segments: [shoulderpt.position, [0,0], wrist.position],
    strokeColor: 'red',
    strokeWidth: 30,
    strokeJoin: 'round',
    strokeCap: 'round'
});

function onMouseDrag(event) {
    XYpos.drag(event.point);
    Zpos.drag(event.point);
}

function onMouseUp(event) {
    XYpos.mouseUp(event.point);
    Zpos.mouseUp(event.point);
}

function onFrame(event) {
    XYpos.frame(event.point);
    Zpos.frame(event.point);

    if(range.contains(wrist.position - XYpos.getDelta()/5)) {
        wrist.position -= XYpos.getDelta()/5;
    } else {
        wrist.position +=XYpos.getDelta()/1000;
    }

    var elbows = shouldercirc.getIntersections(wristcirc);
    var elbow = elbows[0].point;

    arm.segments[0].point = shoulderpt.position;
    arm.segments[1].point = elbow;
    arm.segments[2].point = wrist.position;

    wristcirc.position = wrist.position;
    shouldercirc.position = shoulder;
}
